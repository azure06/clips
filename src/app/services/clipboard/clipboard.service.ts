import { Injectable } from '@angular/core';
import { ElectronService } from '../electron/electron.service';

@Injectable()
export class ClipboardService {
  constructor(private electronService: ElectronService) {
    if (this.electronService.isAvailable) {
      const ipcRenderer = this.electronService.electron.ipcRenderer;
      ipcRenderer.on('clipboard-change', (event, data) => {
        console.error(data);
      });
    }
  }

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
