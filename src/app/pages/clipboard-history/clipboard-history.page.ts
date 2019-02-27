import { Component, OnInit, ViewChild } from '@angular/core';
import { IonInfiniteScroll } from '@ionic/angular';
import { select, Store } from '@ngrx/store';
import moment from 'moment';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { GoogleTranslateService } from 'src/app/services/google-translate/google-translate.service';
import { Clip } from '../../models/models';
import { AddClip } from '../clipboard/store/actions/clipboard.actions';
import * as fromClips from '../clipboard/store/index';
import { ClipboardService } from './../../services/clipboard/clipboard.service';

interface ClipDetails extends Clip {
  fromNow: string;
  snippet: string;
  translation: string;
}

@Component({
  selector: 'app-clipboard-history-page',
  templateUrl: './clipboard-history.page.html',
  styleUrls: ['./clipboard-history.page.scss']
})
export class ClipboardHistoryPage implements OnInit {
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;
  clips$: Observable<ClipDetails[]>;
  ionicInfiniteScrollCount = 0;
  infiniteScrollSubject = new BehaviorSubject(this.ionicInfiniteScrollCount);
  translationSubject: BehaviorSubject<
    Partial<ClipDetails>
  > = new BehaviorSubject({});

  constructor(
    private clipboardService: ClipboardService,
    private googleTranslateService: GoogleTranslateService,
    private store: Store<fromClips.State>
  ) {}

  ngOnInit(): void {
    const clipsObservable = this.store.pipe(select(fromClips.getClips));
    const infiniteScrollCountObservable = this.infiniteScrollSubject.asObservable();
    const translationSubectObservable = this.translationSubject.asObservable();

    this.clips$ = combineLatest(
      clipsObservable,
      infiniteScrollCountObservable,
      translationSubectObservable
    ).pipe(
      delay(0),
      map(([clips, count, translatedClip]) => {
        const filteredClips = clips.reduce(
          (acc: ClipDetails[], clip: ClipDetails, index) => {
            if (index < count) {
              // expression-has-changed-after-it-was-checked
              clip.snippet = (clip.plainText || '').substring(0, 240);
              clip.fromNow = moment(clip.updatedAt).fromNow();
              acc.push(clip);
            }
            return acc;
          },
          []
        );

        const index = translatedClip.id
          ? filteredClips.findIndex(clip => clip.id === translatedClip.id)
          : undefined;

        if (index !== undefined) {
          console.error(index, translatedClip.translation);
          filteredClips[index].translation = translatedClip.translation;
        }

        return filteredClips;
      })
    );

    this.showMore();
  }

  loadData(event): void {
    setTimeout(() => {
      event.target.complete();
      this.showMore();
      // if (this.data.length === 1000) {
      // event.target.disabled = true;
      // }
    }, 0);
  }

  showMore(): void {
    this.ionicInfiniteScrollCount += 10;
    this.infiniteScrollSubject.next(this.ionicInfiniteScrollCount);
  }

  modifyClip(clip: ClipDetails) {
    this.clipboardService.modifyClip(clip);
  }

  removeClip(clip: ClipDetails) {
    this.clipboardService.removeClip(clip);
  }

  async translateText(clip: ClipDetails): Promise<void> {
    const translation = await this.googleTranslateService.translate(
      clip.plainText
    );

    this.translationSubject.next({
      ...clip,
      translation
    });
  }
}
