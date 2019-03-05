import { EventEmitter } from 'events';
import * as fs from 'fs';
import { OAuth2Client } from 'google-auth-library';
// tslint:disable-next-line: no-submodule-imports
import { drive_v3, google } from 'googleapis';

export default class GoogleDriveService extends EventEmitter {
  private drive: drive_v3.Drive;
  constructor(private googleOAuth2Client: OAuth2Client) {
    super();
    this.drive = google.drive({ version: 'v3', auth: googleOAuth2Client });
    this.init();
  }

  private async init() {
    const fileMetadata = {
      name: 'infiniti-clips',
      parents: ['appDataFolder'],
      mimeType: 'application/vnd.google-apps.folder'
    };
    // const media = {
    //   mimeType: 'application/json',
    //   body: JSON.stringify({ app: 'Hello World ' })
    // };
    // this.googleOAuth2Client.projectId
    this.drive.files.create(
      {
        resource: fileMetadata,
        // media,
        fields: 'id'
      },
      (err, file) => {
        if (err) {
          // Handle error
          console.error(err);
        } else {
          console.log('Folder Id:', file.data.id);
          this.drive.files.list(
            {
              spaces: 'appDataFolder',
              fields: 'nextPageToken, files(id, name)',
              pageSize: 100
            },
            (err, res) => {
              if (err) {
                // Handle error
                console.error(err);
              } else {
                console.error(res.data.files);
                res.data.files.forEach(file => {
                  console.log('Found file:', file.name, file.id);
                });
              }
            }
          );
        }
      }
    );
  }
}
