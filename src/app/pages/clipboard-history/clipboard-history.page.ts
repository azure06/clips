import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { IonInfiniteScroll, NavController } from '@ionic/angular';
import { select, Store } from '@ngrx/store';
import moment from 'moment';
import { Observable, fromEvent, combineLatest } from 'rxjs';
import { delay, filter, first, map, tap } from 'rxjs/operators';
// tslint:disable-next-line: no-submodule-imports
import uuidv4 from 'uuid/v4';
import { Clip } from '../../models/models';
import { GoogleTranslateService } from '../../services/google-translate/google-translate.service';
import { QuillCardsService } from '../../services/quill-cards/quill-cards.service';
import * as fromClips from '../clipboard/store/index';
import { ClipboardService } from './../../services/clipboard/clipboard.service';

export enum KEY_CODE {
  LEFT_ARROW = 37,
  UP_ARROW = 38,
  RIGHT_ARROW = 39,
  DOWN_ARROW = 40
}

@Component({
  selector: 'app-clipboard-history-page',
  templateUrl: './clipboard-history.page.html',
  styleUrls: ['./clipboard-history.page.scss']
})
export class ClipboardHistoryPage {
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;
  clips$: Observable<Clip[]>;
  focusIndex = -1;
  loading = false;

  constructor(
    private clipboardService: ClipboardService,
    private quillCardsService: QuillCardsService,
    private googleTranslateService: GoogleTranslateService,
    private store: Store<fromClips.State>,
    private navCtrl: NavController
  ) {}

  async ionViewWillEnter(): Promise<void> {
    // window.ang = this;
    this.loading = true;
    // Set clips from indexedDB into the state
    await this.clipboardService.getClipsFromIdbAndSetInState({ limit: 15 });
    this.clips$ = this.store.pipe(
      select(fromClips.getClips),
      delay(0),
      map(clips => {
        for (const clip of clips) {
          clip.textView = clip.plainText.substring(0, 255);
          clip.dateFromNow = moment(clip.updatedAt).fromNow();
        }
        return clips;
      }),
      tap(() => {
        this.loading = false;
      })
    );

    combineLatest(fromEvent(document, 'keydown'), this.clips$)
      .pipe(
        tap(([event, clips]: [KeyboardEvent, Clip[]]) => {
          if (
            event.keyCode === KEY_CODE.UP_ARROW &&
            this.focusIndex < clips.length
          ) {
            this.focusIndex += 1;
          }
          if (event.keyCode === KEY_CODE.DOWN_ARROW && this.focusIndex > 0) {
            this.focusIndex -= 1;
          }
        })
      )
      .subscribe();
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
      title: '',
      contents: { ops: [{ insert: clip.plainText }] },
      label: '',
      plainText: clip.plainText,
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
