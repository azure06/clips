import { Component, ViewChild } from '@angular/core';
import { IonInfiniteScroll } from '@ionic/angular';
import { select, Store } from '@ngrx/store';
import moment = require('moment');
import { Observable } from 'rxjs';
import { delay, filter, first, map } from 'rxjs/operators';
import { ClipDocType } from '../../services/clipboard/clipboard.models';
import { ClipboardService } from '../../services/clipboard/clipboard.service';
import { ElectronService } from '../../services/electron/electron.service';
import { GoogleTranslateService } from '../../services/google-translate/google-translate.service';
import * as fromClips from '../clipboard/store/index';

@Component({
  selector: 'app-clipboard-images',
  templateUrl: './clipboard-images.page.html',
  styleUrls: ['./clipboard-images.page.scss']
})
export class ClipboardImagesPage {
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;
  clips$: Observable<ClipDocType[]>;
  loading: boolean;

  constructor(
    private clipboardService: ClipboardService,
    private googleTranslateService: GoogleTranslateService,
    private es: ElectronService,
    private store: Store<fromClips.State>
  ) {}

  async ionViewWillEnter() {
    this.loading = true;
    await this.clipboardService.findClipsAndSetInState({
      limit: 15,
      sort: '-updatedAt',
      field: 'type',
      clip: { type: 'image' }
    });
    this.clips$ = this.store.pipe(
      select(fromClips.getClips),
      delay(0),
      map(clips => {
        // We need to filter the clipboard item added manually to the state (since they are not filtered by category)
        this.loading = false;
        return clips.reduce(
          (
            acc: Array<
              ClipDocType & { compactText: string; dateFromNow: string }
            >,
            clip: ClipDocType & { compactText: string; dateFromNow: string }
          ) => {
            if (clip.type === 'image') {
              clip.compactText = clip.plainText.substring(0, 255);
              clip.dateFromNow = moment(clip.updatedAt).fromNow();
              acc.push(clip);
            }
            return acc;
          },
          []
        );
      })
    );
  }

  async loadMore(event): Promise<void> {
    this.clipboardService.loadNext({
      limit: 5
      // index: 'type',
      // keyRange: IDBKeyRange.upperBound(['image', ''])
    });
    const isLoadingNext = await this.store
      .pipe(
        select(fromClips.isLoadingNext),
        filter(value => !value),
        first()
      )
      .toPromise();
    event.target.complete();
    // if (this.data.length === 1000) {
    // event.target.disabled = true;
    // }
  }

  async downloadClip(clip: ClipDocType) {
    const { fileName } = await this.es.mainWindow.showSaveDialog({
      defaultPath: 'Untitled',
      filters: [{ name: 'Images', extensions: ['png'] }]
    });

    if (fileName) {
      this.es.ipcRenderer.send('download-image-file', fileName, clip);
    }
  }

  modifyClip(clip: ClipDocType) {
    this.clipboardService.modifyClip(clip);
  }

  removeClip(clip: ClipDocType) {
    this.clipboardService.removeClip(clip);
  }
}
