import { Component, OnInit, ViewChild } from '@angular/core';
import { IonInfiniteScroll, NavController } from '@ionic/angular';
import { select, Store } from '@ngrx/store';
import moment from 'moment';
import { Observable } from 'rxjs';
import { delay, filter, first, map, tap } from 'rxjs/operators';
import { ClipDocType } from '../../services/clipboard/clipboard.models';
import { GoogleTranslateService } from '../../services/google-translate/google-translate.service';
import * as fromClips from '../clipboard/store/index';
import { ClipboardService } from './../../services/clipboard/clipboard.service';

@Component({
  selector: 'app-clipboard-bookmark',
  templateUrl: './clipboard-bookmark.page.html',
  styleUrls: ['./clipboard-bookmark.page.scss']
})
export class ClipboardBookmarkPage {
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;
  clips$: Observable<ClipDocType[]>;
  loading: boolean;

  constructor(
    private clipboardService: ClipboardService,
    private googleTranslateService: GoogleTranslateService,
    private store: Store<fromClips.State>,
    private navCtrl: NavController
  ) {}

  async ionViewWillEnter(): Promise<void> {
    this.loading = true;
    await this.clipboardService.findClipsAndSetInState({
      limit: 15,
      sort: '-updatedAt',
      field: 'category',
      clip: { category: 'starred' }
    });
    this.clips$ = this.store.pipe(
      select(fromClips.getClips),
      delay(0),
      map(clips => {
        return clips.reduce(
          (
            acc: Array<
              ClipDocType & { compactText: string; dateFromNow: string }
            >,
            clip: ClipDocType & { compactText: string; dateFromNow: string }
          ) => {
            if (clip.category === 'starred') {
              clip.compactText = clip.plainText.substring(0, 255);
              clip.dateFromNow = moment(clip.updatedAt).fromNow();
              acc.push(clip);
            }
            return acc;
          },
          []
        );
      }),
      tap(() => (this.loading = false))
    );
  }

  async loadMore(event): Promise<void> {
    this.clipboardService.loadNext({
      limit: 10,
      sort: '-updatedAt',
      field: 'category',
      clip: { category: 'starred' }
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

  async editClip(clip: ClipDocType) {}

  copyToClipboard(data) {
    this.clipboardService.copyToClipboard(data);
  }

  public modifyClip(clip: ClipDocType & { translationText?: string }) {
    this.clipboardService.modifyClip(clip);
  }

  removeClip(clip: ClipDocType) {
    this.clipboardService.removeClip(clip);
  }

  async translateText(
    clip: ClipDocType & { translationView: string }
  ): Promise<void> {
    this.modifyClip({
      ...clip,
      translationText: await this.googleTranslateService.translate(
        clip.plainText
      )
    });
  }
}
