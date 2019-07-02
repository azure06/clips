import log from 'electron-log';
import { GaxiosResponse } from 'gaxios';
import { OAuth2Client } from 'google-auth-library';
// tslint:disable-next-line: no-submodule-imports
import { drive_v3, google } from 'googleapis';
import { BehaviorSubject, combineLatest, from, interval, Subject } from 'rxjs';
import {
  bufferTime,
  concatMap,
  delay,
  filter,
  map,
  scan,
  startWith,
  tap
} from 'rxjs/operators';
import * as stream from 'stream';
import { Clip } from './../../models/models';

const BUFFER_TIME = 60000;

const createStream = (str: string) => {
  const readableStream = new stream.Readable();
  readableStream.push(str);
  readableStream.push(null);
  return readableStream;
};

// tslint:disable: max-classes-per-file
export class DriveHandler {
  private get driveHandler() {
    return DriveHandler._driveHandler;
  }

  public get drive() {
    return DriveHandler._drive;
  }
  private static _driveHandler = new DriveHandler();
  private static _drive: drive_v3.Drive;
  private pageTokenBehaviorSubject: BehaviorSubject<
    string
  > = new BehaviorSubject<string>('');

  public setDrive(googleOAuth2Client: OAuth2Client) {
    DriveHandler._drive = google.drive({
      version: 'v3',
      auth: googleOAuth2Client
    });
  }

  public setPageToken(pageToken: string) {
    // 842652
    this.driveHandler.pageTokenBehaviorSubject.next(pageToken);
  }
  public async getStartPageToken() {
    return (await this.driveHandler.drive.changes.getStartPageToken({})).data
      .startPageToken;
  }

  public pageTokenAsObservable() {
    return this.driveHandler.pageTokenBehaviorSubject.asObservable();
  }

  /**
   * Watches for changes in appDataFolder
   *
   * @return Changes and new page token
   */
  public getDriveAsObservable() {
    let changeCount = 0;
    return this.driveHandler.pageTokenBehaviorSubject.asObservable().pipe(
      tap(() => console.log('Watching for changes...', (changeCount += 1))),
      concatMap(pageToken =>
        from(
          this.driveHandler.drive.changes
            .list({
              spaces: 'appDataFolder',
              pageToken,
              fields: '*'
            })
            .then(
              ({ data: { newStartPageToken, nextPageToken, changes } }) => ({
                changes,
                pageToken: nextPageToken || newStartPageToken
              })
            )
            .catch(error => {
              console.error('Unable to listen for changes: ', error);
              return { changes: [], pageToken };
            })
        )
      ),
      delay(BUFFER_TIME),
      tap(({ pageToken }) =>
        this.driveHandler.pageTokenBehaviorSubject.next(pageToken)
      ),
      tap(({ changes }) =>
        console.log('Emit if new files are more then 0: ', changes.length)
      ),
      filter(({ changes }) => changes.length > 0)
    );
  }
}

export default class GoogleDriveService {
  private clipSubject = new Subject<Clip>();
  constructor(private driveHandler: DriveHandler) {}

  private observeFileAdder() {
    return this.clipSubject.asObservable().pipe(
      bufferTime(BUFFER_TIME),
      filter(clip => clip.length > 0),
      concatMap(clips => {
        const clipMap = clips.reduce(
          (acc: { [key: string]: Clip }, currentClip) => {
            acc[currentClip.id] = currentClip;
            return acc;
          },
          {}
        );
        const fileMetadata = {
          name: 'clips.json',
          parents: ['appDataFolder']
        };
        const media = {
          mimeType: 'application/json',
          body: createStream(JSON.stringify(clipMap))
        };

        console.log('Adding file to Drive');
        return this.driveHandler.drive.files
          .create({
            resource: fileMetadata,
            media,
            fields: 'id'
          } as any)
          .catch(error => {
            log.error('Could not add to drive: ', error);
            console.error('Could not add to drive: ', error);
            return {};
          });
      }),
      filter(res => Object.keys(res).length > 0),
      scan(
        (
          acc: { [id: string]: GaxiosResponse<drive_v3.Schema$File> },
          curr: GaxiosResponse<drive_v3.Schema$File>
        ): { [id: string]: GaxiosResponse<drive_v3.Schema$File> } => {
          acc[curr.data.id] = curr;
          return acc;
        },
        {}
      )
    );
  }

  private getStream(fileId: string): Promise<{ [key: string]: Clip }> {
    const bufferChunks = [];
    return new Promise(async (resolve, reject) => {
      return this.driveHandler.drive.files
        .get({ fileId, alt: 'media' }, { responseType: 'stream' })
        .then(res => {
          (res.data as any)
            .on('end', () => {
              console.log('Done downloading file');
              try {
                const data =
                  bufferChunks.length > 0
                    ? Buffer.concat(bufferChunks).toString('utf8')
                    : '{}';
                resolve(JSON.parse(data));
              } catch (err) {
                reject(err);
              }
            })
            .on('error', err => {
              reject(err);
            })
            .on('data', data => bufferChunks.push(data));
        });
    });
  }

  public async addClipToDrive(clip: Clip) {
    this.clipSubject.next(clip);
  }

  public async getUserInfo() {
    return this.driveHandler.drive.about.get({ fields: 'user' });
  }

  public listenForChanges() {
    const driveObservable = this.driveHandler
      .getDriveAsObservable()
      .pipe(startWith({ changes: [], token: '' }));
    const fileAdderObservable = this.observeFileAdder().pipe(startWith({}));

    return combineLatest(driveObservable, fileAdderObservable).pipe(
      tap(([{ changes }, addedFiles]) => {
        console.log(
          'Drive changes: ',
          changes.length,
          ', Files from current device: ',
          Object.keys(addedFiles)
        );
      }),
      filter(([drive, addedFiles]) => drive.changes.length > 0),
      concatMap(async ([drive, addedFiles]) => {
        const clips = await Promise.all(
          drive.changes
            .filter(
              change =>
                !change.removed &&
                !Object.keys(addedFiles).find(id => id === change.fileId)
            )
            .map(change =>
              this.getStream(change.fileId)
                .catch(err => {
                  console.error('Error during download: ', err);
                  log.error('Error during download: ', err);
                  return {};
                })
                .then(clip => Object.values(clip))
            )
        );
        return clips.reduce((acc, val) => [...acc, ...val], []);
      }),
      tap(clips => {
        console.log(
          clips.length > 0
            ? `New updates found: ${clips.length}.`
            : '...Nothing new found'
        );
      }),
      filter(clips => clips.length > 0)
    );
  }
}

// private async listClipboardFiles() {
//   const result = await this.drive.files.list({
//     spaces: 'appDataFolder',
//     fields: 'nextPageToken, files(id, name)',
//     pageSize: 100
//   });
//   return result.data.files;
// }
