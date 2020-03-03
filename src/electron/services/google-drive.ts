import { GaxiosResponse } from 'gaxios';
import { OAuth2Client } from 'google-auth-library';
import { drive_v3, google } from 'googleapis';
import { from, EMPTY, Subject, merge, of, zip } from 'rxjs';
import { scan, tap, expand, takeWhile } from 'rxjs/operators';
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

  private async getStartPageToken() {
    return (await this.drive.changes.getStartPageToken()).data.startPageToken;
  }

  public async getUserInfo() {
    const { data } = await this.drive.about.get({ fields: 'user' });
    return data.user;
  }

  public setPageToken(pageToken: string) {
    this.pageToken = pageToken;
    this.pageTokenSubject.next(pageToken);
  }

  public pageTokenAsObservable() {
    return this.pageTokenSubject.asObservable();
  }

  public async addFile(json: Array<{ [any: string]: any }>) {
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

  public async listFiles() {
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
      .pipe(expand(([token, { data }]) => (data.nextPageToken ? list(data.nextPageToken) : EMPTY)))
      .pipe(
        scan(
          (acc, [token, { data }]) => ({ ...acc, [token]: data.changes! }),
          {} as { [token: string]: drive_v3.Schema$Change[] }
        )
      )
      .toPromise();
  }

  public retrieveFile(fileId: string) {
    const bufferChunks = [] as Uint8Array[];
    return new Promise(async (resolve, reject) => {
      return this.drive.files
        .get({ fileId, alt: 'media' }, { responseType: 'stream' })
        .then((response) => {
          (response.data as any)
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
            .on('error', (error: any) => {
              reject(error);
            })
            .on('data', (data: Uint8Array) => bufferChunks.push(data));
        })
        .catch(reject);
    });
  }
}
