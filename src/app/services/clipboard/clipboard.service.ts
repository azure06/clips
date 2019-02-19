import { Injectable } from '@angular/core';
import { GoogleOAuth2Service } from './../google-oauth2/google-oauth2.service';

@Injectable()
export class ClipboardService {
  constructor(private googleOAtuh2Service: GoogleOAuth2Service) {}

  listFiles() {
    // const drive = google.drive({
    //   version: 'v3',
    //   auth: this.googleOAtuh2Service.getOAuth2Client()
    // });
    // drive.files.list(
    //   {
    //     pageSize: 10,
    //     fields: 'nextPageToken, files(id, name)'
    //   },
    //   (err, res) => {
    //     if (err) {
    //       return console.log('The API returned an error: ' + err);
    //     }
    //     const files = res.data.files;
    //     if (files.length) {
    //       console.log('Files:');
    //       files.map(file => {
    //         console.log(`${file.name} (${file.id})`);
    //       });
    //     } else {
    //       console.log('No files found.');
    //     }
    //   }
    // );
  }
}
