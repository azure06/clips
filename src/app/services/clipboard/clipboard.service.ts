import { Injectable, NgZone } from '@angular/core';
import { EffectNotification } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import { Clip } from '../../models/models';
import { AddClip } from '../../pages/clipboard/store/actions/clipboard.actions';
import * as fromClips from '../../pages/clipboard/store/index';
import { ElectronService } from '../electron/electron.service';
import { first, take, tap, last } from 'rxjs/operators';

@Injectable()
export class ClipboardService {
  constructor(
    private electronService: ElectronService,
    private store: Store<fromClips.State>,
    private ngZone: NgZone
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
    console.error('Add Clip - Clipboard Service', clip);
    this.ngZone.run(() => {
      this.store.dispatch(new AddClip(clip));
    });
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

  async storeState({ effect }: { effect: EffectNotification }) {
    const clips = await this.store
      .pipe(select(fromClips.getClips))
      .pipe(last())
      .toPromise();
    this.electronService.electron.ipcRenderer.send('clips-renewed', clips);
    console.error('clips', clips);
  }
}
