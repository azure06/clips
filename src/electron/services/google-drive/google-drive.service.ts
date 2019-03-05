import { EventEmitter } from 'events';
import * as fs from 'fs';
import { OAuth2Client } from 'google-auth-library';
// tslint:disable-next-line: no-submodule-imports
import { drive_v3, google } from 'googleapis';
import * as os from 'os';
import * as path from 'path';

export default class GoogleDriveService extends EventEmitter {
  private drive: drive_v3.Drive;
  constructor(private googleOAuth2Client: OAuth2Client) {
    super();
    this.drive = google.drive({ version: 'v3', auth: googleOAuth2Client });
    this.init();
  }

  private async init() {
    const fileMetadata = {
      name: 'config.json',
      parents: ['appDataFolder']
    };
    const media = {
      mimeType: 'application/json',
      body: fs.createReadStream('./tsconfig.json')
    };

    // this.drive.files.create(
    //   ({
    //     resource: fileMetadata,
    //     media,
    //     fields: 'id'
    //   } as unknown) as any,
    //   (err, file) => {
    //     if (err) {
    //       // Handle error
    //       console.error(err);
    //     } else {
    //       console.log('Folder Id:', file.data.id);
    //       this.drive.files.list(
    //         {
    //           spaces: 'appDataFolder',
    //           fields: 'nextPageToken, files(id, name)',
    //           pageSize: 100
    //         },
    //         // tslint:disable-next-line: no-shadowed-variable
    //         (err, res) => {
    //           if (err) {
    //             // Handle error
    //             console.error(err);
    //           } else {
    //             console.error(res.data.files);
    //             const dest = fs.createWriteStream(
    //               path.join(os.tmpdir(), 'hello23')
    //             );
    //             // tslint:disable-next-line: no-shadowed-variable
    //             res.data.files.forEach(async file => {
    //               console.log('Found file:', file.name, file.id);

    //               const res2 = await this.drive.files.get(
    //                 { fileId: file.id, alt: 'media' },
    //                 { responseType: 'stream' }
    //               );

    //               (res2.data as any)
    //                 .on('end', () => {
    //                   console.log('Done downloading file.');
    //                 })
    //                 .on('error', err => {
    //                   console.error('Error downloading file.');
    //                 })
    //                 .on('data', d => {})
    //                 .pipe(dest);
    //             });
    //           }
    //         }
    //       );
    //     }
    //   }
    // );
  }
}
