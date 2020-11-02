import { OAuth2Client } from 'google-auth-library';
import { drive_v3, google } from 'googleapis';
import { from, EMPTY, Subject, of, zip, Observable } from 'rxjs';
import { scan, expand } from 'rxjs/operators';
import * as stream from 'stream';

const createStream = (arg: string) => {
  const readableStream = new stream.Readable();
  readableStream.push(arg);
  readableStream.push(null);
  return readableStream;
};

export class GoogleDriveService {
  private drive: drive_v3.Drive;
  private pageToken?: string;
  private pageTokenSubject = new Subject<string>();

  constructor(googleOAuth2Client: OAuth2Client) {
    this.drive = google.drive({
      version: 'v3',
      auth: googleOAuth2Client,
    });
  }

  public async getStartPageToken(): Promise<string | null | undefined> {
    return (await this.drive.changes.getStartPageToken()).data.startPageToken;
  }

  public async getUserInfo(): Promise<drive_v3.Schema$User | undefined> {
    const { data } = await this.drive.about.get({ fields: 'user' });
    return data.user;
  }

  public setPageToken(pageToken: string): void {
    this.pageToken = pageToken;
    this.pageTokenSubject.next(pageToken);
  }

  public pageTokenAsObservable(): Observable<string> {
    return this.pageTokenSubject.asObservable();
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public addFile(json: Array<{ [any: string]: unknown }>) {
    return this.drive.files.create({
      requestBody: {
        name: 'clips.json',
        parents: ['appDataFolder'],
      },
      media: {
        mimeType: 'application/json',
        body: createStream(JSON.stringify(json)),
      },
      fields: 'id',
    });
  }

  public async listFiles(): Promise<{
    [token: string]: drive_v3.Schema$Change[];
  }> {
    const list = (token: string) =>
      zip(
        of(token),
        from(
          this.drive.changes.list({
            spaces: 'appDataFolder',
            pageToken: token,
            fields: '*',
          })
        )
      );

    if (!this.pageToken) {
      const pageToken = await this.getStartPageToken();
      if (pageToken) this.setPageToken(pageToken);
    }

    return list(this.pageToken || '')
      .pipe(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        expand(([token, { data }]) =>
          data.nextPageToken ? list(data.nextPageToken) : EMPTY
        )
      )
      .pipe(
        scan(
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          (acc, [token, { data }]) => ({ ...acc, [token]: data.changes! }),
          {} as { [token: string]: drive_v3.Schema$Change[] }
        )
      )
      .toPromise();
  }

  public retrieveFile(fileId: string): Promise<unknown> {
    const bufferChunks = [] as Uint8Array[];
    return new Promise((resolve, reject) => {
      return this.drive.files
        .get({ fileId, alt: 'media' }, { responseType: 'stream' })
        .then((response) => {
          response.data
            .on('end', () => {
              try {
                const data =
                  bufferChunks.length > 0
                    ? JSON.parse(Buffer.concat(bufferChunks).toString('utf8'))
                    : [];
                resolve(data);
              } catch (error) {
                reject(error);
              }
            })
            .on('error', (error: unknown) => {
              reject(error);
            })
            .on('data', (data: Uint8Array) => bufferChunks.push(data));
        })
        .catch(reject);
    });
  }
}
