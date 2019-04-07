import { Component, OnInit, ViewChild } from '@angular/core';
import { IonInfiniteScroll, NavController } from '@ionic/angular';
import { select, Store } from '@ngrx/store';
import moment from 'moment';
import { Observable } from 'rxjs';
import { delay, filter, first, map } from 'rxjs/operators';
// tslint:disable-next-line: no-submodule-imports
import uuidv4 from 'uuid/v4';
import { Clip } from '../../models/models';
import { GoogleTranslateService } from '../../services/google-translate/google-translate.service';
import { QuillCardsService } from '../../services/quill-cards/quill-cards.service';
import * as fromClips from '../clipboard/store/index';
import { ClipboardService } from './../../services/clipboard/clipboard.service';

@Component({
  selector: 'app-clipboard-history-page',
  templateUrl: './clipboard-history.page.html',
  styleUrls: ['./clipboard-history.page.scss']
})
export class ClipboardHistoryPage {
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;
  clips$: Observable<Clip[]>;
  loading = false;

  constructor(
    private clipboardService: ClipboardService,
    private quillCardsService: QuillCardsService,
    private googleTranslateService: GoogleTranslateService,
    private store: Store<fromClips.State>,
    private navCtrl: NavController
  ) {}

  async ionViewWillEnter(): Promise<void> {
    this.loading = true;
    // Set clips from indexedDB into the state
    await this.clipboardService.getClipsFromIdbAndSetInState({ limit: 15 });
    this.clips$ = this.store.pipe(
      select(fromClips.getClips),
      delay(0),
      map(clips => {
        for (const clip of clips) {
          clip.plainView = clip.plainText.substring(0, 255);
          clip.dateFromNow = moment(clip.updatedAt).fromNow();
        }
        this.loading = false;
        return clips;
      })
    );
  }

  async loadMore(event): Promise<void> {
    this.clipboardService.loadNext({ limit: 20 });
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

  async editClip(clip: Clip) {
    await this.quillCardsService.addQuillCard({
      id: uuidv4(),
      title: '',
      contents: { ops: [{ insert: clip.plainText }] },
      label: '',
      displayOrder: -1,
      updatedAt: new Date().getTime(),
      createdAt: new Date().getTime()
    });
    this.navCtrl.navigateForward('clipboard/editor');
  }

  modifyClip(clip: Clip) {
    this.clipboardService.modifyClip(clip);
  }

  removeClip(clip: Clip) {
    this.clipboardService.removeClip(clip);
  }

  copyToClipboard(data) {
    this.clipboardService.copyToClipboard(data);
  }

  async translateText(clip: Clip): Promise<void> {
    this.modifyClip({
      ...clip,
      translationView: await this.googleTranslateService.translate(
        clip.plainText
      )
    });
  }
}
