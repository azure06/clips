import { EventEmitter } from 'events';
import * as fs from 'fs';
import { GaxiosResponse } from 'gaxios';
import { OAuth2Client } from 'google-auth-library';
// tslint:disable-next-line: no-submodule-imports
import { drive_v3, google } from 'googleapis';
import * as os from 'os';
import * as path from 'path';
import {
  BehaviorSubject,
  combineLatest,
  from,
  interval,
  ObservableInput,
  of,
  Subject,
  throwError
} from 'rxjs';
import {
  buffer,
  catchError,
  filter,
  mergeMap,
  scan,
  tap
} from 'rxjs/operators';
import * as stream from 'stream';
import { Clip } from './../../models/models';

const createStream = (str: string) => {
  const readableStream = new stream.Readable();
  readableStream.push(str);
  readableStream.push(null);
  return readableStream;
};

// tslint:disable: max-classes-per-file
class DriveHandler {
  private static _driveHandler = new DriveHandler();
  private pageTokenBehaviorSubject: BehaviorSubject<
    string
  > = new BehaviorSubject<string>('');
  private drive: drive_v3.Drive;

  get driveHandler() {
    return DriveHandler._driveHandler;
  }
  /**
   * Set drive options before start watching
   *
   */
  public setDriveOptions({
    drive,
    pageToken
  }: {
    drive: drive_v3.Drive;
    pageToken: string;
  }) {
    this.driveHandler.drive = drive;
    this.driveHandler.pageTokenBehaviorSubject.next(pageToken);
  }

  /**
   * Watches for changes in appDataFolder
   *
   * @return Changes and new page token
   */
  public getDriveAsObservable() {
    return this.driveHandler.pageTokenBehaviorSubject.asObservable().pipe(
      mergeMap(async _pageToken => {
        const {
          newStartPageToken,
          nextPageToken,
          changes
        } = (await this.driveHandler.drive.changes.list({
          spaces: 'appDataFolder',
          pageToken: _pageToken,
          fields: '*'
        })).data;

        setTimeout(
          () =>
            this.driveHandler.pageTokenBehaviorSubject.next(
              nextPageToken || newStartPageToken
            ),
          10000
        );

        console.error('\n\n\n\n');
        console.error('token-next', nextPageToken);
        console.error('newStartPageToken', newStartPageToken);
        console.error('changes', changes.length);
        console.error('\n\n\n\n');
        return { changes, pageToken: nextPageToken || newStartPageToken };
      }),
      filter(({ changes }) => changes.length > 0)
    );
  }
}

export default class GoogleDriveService {
  private drive: drive_v3.Drive;
  private clipSubject = new Subject<Clip>();

  constructor(private googleOAuth2Client: OAuth2Client) {
    this.drive = google.drive({ version: 'v3', auth: googleOAuth2Client });
  }

  private driveFileAdder() {
    const addFileToDrive = async (
      clips: Clip[]
    ): Promise<GaxiosResponse<drive_v3.Schema$File>> => {
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

      console.log('Connecting... Adding file to Drive');
      return this.drive.files.create(({
        resource: fileMetadata,
        media,
        fields: 'id'
      } as unknown) as any);
    };

    return this.clipSubject.asObservable().pipe(
      buffer(interval(10000)),
      filter(clip => clip.length > 0),
      mergeMap(clips => from(addFileToDrive(clips))),
      scan(
        (
          acc: { [id: string]: GaxiosResponse<drive_v3.Schema$File> },
          curr: GaxiosResponse<drive_v3.Schema$File>
        ) => {
          acc[curr.data.id] = curr;
          return acc;
        },
        {}
      )
    );
  }

  private downloadFile(fileId: string): Promise<string> {
    return new Promise(async (resolve, reject) => {
      const filePath = path.join(os.tmpdir(), `${fileId}.json`);
      const dest = fs.createWriteStream(filePath);

      try {
        const response = await this.drive.files.get(
          { fileId, alt: 'media' },
          { responseType: 'stream' }
        );
        (response.data as any)
          .on('end', () => {
            console.log('Done downloading file.');
            // File needs some more time to be created
            setTimeout(() => resolve(filePath), 0);
          })
          .on('error', err => {
            console.error('Error downloading file.');
            reject(err);
          })
          .on('data', d => {})
          .pipe(dest);
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Observe drive changes
   *
   */
  private observeDriveChanges(pageToken: string) {
    const driveHandler = new DriveHandler();
    driveHandler.setDriveOptions({
      drive: this.drive,
      pageToken
    });
    return driveHandler.getDriveAsObservable();
  }

  /**
   * Add clip to drive
   *
   */
  public async addClipToDrive(clip: Clip) {
    this.clipSubject.next(clip);
  }

  public async getStartPageToken() {
    return (await this.drive.changes.getStartPageToken({})).data.startPageToken;
  }

  public listenForChanges(pageToken: string) {
    const driveObservable = this.observeDriveChanges(pageToken);
    const fileAdderEffect = this.driveFileAdder();
    return combineLatest(driveObservable, fileAdderEffect).pipe(
      filter(([drive, addedFiles]) => drive.changes.length > 0),
      mergeMap(async ([drive, addedFiles]) => {
        const filePaths = await Promise.all(
          drive.changes
            .filter(change => !change.removed)
            .map(change => this.downloadFile(change.fileId))
        );

        const reducedClips = filePaths.reduce(
          (acc: { [key: string]: Clip }, filePath) => {
            const _clips: { [key: string]: Clip } = JSON.parse(
              fs.readFileSync(filePath, 'utf8') || 'null'
            );

            Object.entries(_clips).forEach(([key, clip]) => {
              acc[key] =
                acc[key] && acc[key].updatedAt > clip.updatedAt
                  ? acc[key]
                  : clip;
            });
            return acc;
          },
          {}
        );
        const clips: Clip[] = Object.values(reducedClips);
        filePaths.forEach(_path => {
          fs.unlink(_path, err => {
            if (err) {
              throw err;
            }
            console.log(`${_path} was deleted`);
          });
        });
        return clips;
      }),
      catchError(error => of({ error }))
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
