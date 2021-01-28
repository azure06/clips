import { OAuth2Client } from 'google-auth-library';
import { drive_v3, google } from 'googleapis';
import { from, EMPTY, Subject, of, zip, Observable } from 'rxjs';
import { scan, expand } from 'rxjs/operators';
import * as stream from 'stream';
import { GaxiosPromise } from 'gaxios';
import { Clip } from '@/store/types';

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

  public async getStartPageToken(): GaxiosPromise<
    drive_v3.Schema$StartPageToken
  > {
    return await this.drive.changes.getStartPageToken();
  }
  public async getUserInfo(): GaxiosPromise<drive_v3.Schema$About> {
    return this.drive.about.get({ fields: 'user' });
  }

  public setPageToken(pageToken: string): void {
    this.pageToken = pageToken;
    this.pageTokenSubject.next(pageToken);
  }

  public pageTokenAsObservable(): Observable<string> {
    return this.pageTokenSubject.asObservable();
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public addFile(clips: Clip[]) {
    return this.drive.files.create({
      requestBody: {
        name: 'clips.json',
        parents: ['appDataFolder'],
      },
      media: {
        mimeType: 'application/json',
        body: createStream(JSON.stringify(clips)),
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
      const { data } = await this.getStartPageToken();
      if (data.startPageToken) this.setPageToken(data.startPageToken);
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

  public retrieveFile(fileId: string): Promise<Clip[]> {
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
