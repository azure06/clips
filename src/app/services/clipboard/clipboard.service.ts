import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Clip } from '../../models/models';
import { AddClip } from '../../pages/clipboard/store/actions/clipboard.actions';
import * as fromClips from '../../pages/clipboard/store/index';
import { ElectronService } from '../electron/electron.service';

@Injectable()
export class ClipboardService {
  constructor(
    private electronService: ElectronService,
    private store: Store<fromClips.State>
  ) {
    if (this.electronService.isAvailable) {
      const ipcRenderer = this.electronService.electron.ipcRenderer;
      ipcRenderer.on(
        'clipboard-text-change',
        (
          event,
          {
            availableFormats,
            htmlText,
            plainText
          }: {
            availableFormats: string[];
            plainText: string;
            htmlText?: string;
          }
        ) => {
          console.error(plainText, htmlText);
          this.addClip({
            htmlText,
            plainText,
            types: availableFormats,
            updatedAt: new Date(),
            createdAt: new Date()
          });
        }
      );
    }
  }

  addClip(clip: Clip) {
    this.store.dispatch(new AddClip(clip));
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
