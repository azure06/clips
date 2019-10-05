import { Component, ViewChild } from '@angular/core';
import { IonInfiniteScroll, IonSearchbar, NavController } from '@ionic/angular';
import { select, Store } from '@ngrx/store';
import moment from 'moment';
import { fromEvent, Observable, Subscription } from 'rxjs';
import { delay, filter, first, map, tap, withLatestFrom } from 'rxjs/operators';
import { ClipDocType } from '../../services/clipboard/clipboard.models';
import { GoogleTranslateService } from '../../services/google-translate/google-translate.service';
import * as fromClips from '../clipboard/store/index';
import { ClipboardService } from './../../services/clipboard/clipboard.service';

export enum KEY_CODE {
  LEFT_ARROW = 37,
  UP_ARROW = 38,
  RIGHT_ARROW = 39,
  DOWN_ARROW = 40,
  ENTER = 13
}

@Component({
  selector: 'app-clipboard-history-page',
  templateUrl: './clipboard-history.page.html',
  styleUrls: ['./clipboard-history.page.scss']
})
export class ClipboardHistoryPage {
  @ViewChild(IonSearchbar) ionSearchbar: IonSearchbar;
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;
  clips$: Observable<ClipDocType[]>;
  subscription: Subscription;
  focusIndex = -1;
  loading = false;

  constructor(
    private clipboardService: ClipboardService,
    private googleTranslateService: GoogleTranslateService,
    private store: Store<fromClips.State>,
    private navCtrl: NavController
  ) {}

  public async ionViewWillEnter(): Promise<void> {
    this.loading = true;
    await this.clipboardService.findClipsAndSetInState({
      limit: 15,
      sort: '-updatedAt'
    });
    this.clips$ = this.store.pipe(
      select(fromClips.getClips),
      delay(0),
      map(
        (
          clips: Array<
            ClipDocType & { compactText: string; dateFromNow: string }
          >
        ) => {
          for (const clip of clips) {
            clip.compactText = clip.plainText
              ? clip.plainText.substring(0, 255)
              : '';
            clip.dateFromNow = moment(clip.updatedAt).fromNow();
          }
          return clips;
        }
      ),
      tap(() => {
        this.loading = false;
      })
    );

    this.subscription = fromEvent(document, 'keydown')
      .pipe(
        withLatestFrom(this.clips$),
        tap(
          ([event, clips]: [
            KeyboardEvent,
            Array<ClipDocType & { translation?: string }>
          ]) => {
            if (event.keyCode === KEY_CODE.UP_ARROW && this.focusIndex > 0) {
              this.focusIndex -= 1;
            } else if (
              event.keyCode === KEY_CODE.DOWN_ARROW &&
              this.focusIndex < clips.length
            ) {
              this.focusIndex += 1;
            } else if (
              event.keyCode === KEY_CODE.ENTER &&
              this.focusIndex <= clips.length &&
              this.focusIndex >= 0
            ) {
              const { type, dataURI, translation, plainText } = clips[
                this.focusIndex
              ];
              // FIXME modify children method instead
              this.copyToClipboard({
                type,
                content: type === 'text' ? translation || plainText : dataURI
              });
            }
          }
        )
      )
      .subscribe();
  }

  public ionViewDidEnter() {
    this.ionSearchbar.setFocus();
  }

  public ionViewDidLeave(): void {
    this.focusIndex = -1;
    this.subscription.unsubscribe();
  }

  public async search(event): Promise<void> {
    const searchQuery = event.target.value;
    const clips =
      searchQuery && searchQuery.trim() !== ''
        ? await this.clipboardService.findClipsWithRegex({
            plainText: { $regex: new RegExp(`.*${searchQuery}.*`) }
          })
        : await this.clipboardService.findClips({
            limit: 15,
            sort: '-updatedAt'
          });

    this.clipboardService.setClips(clips);

    // this.ionicInfiniteScrollAmount = 10;
    // this.infiniteScrollSubject.next(this.ionicInfiniteScrollAmount);
    // this.clipsSubject.next(clips);
  }

  public async loadMore(event): Promise<void> {
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

  public async editClip(clip: ClipDocType) {

  }

  public modifyClip(clip: ClipDocType & { translationText?: string }) {
    this.clipboardService.modifyClip(clip);
  }

  public removeClip(clip: ClipDocType) {
    this.clipboardService.removeClip(clip);
  }

  public copyToClipboard(data: { type: 'text' | 'image'; content: string }) {
    this.clipboardService.copyToClipboard(data);
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
