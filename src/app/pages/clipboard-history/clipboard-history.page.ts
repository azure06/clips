import { Component, OnInit, ViewChild } from '@angular/core';
import { IonInfiniteScroll } from '@ionic/angular';
import { select, Store } from '@ngrx/store';
import moment from 'moment';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { Clip } from '../../models/models';
import { GoogleTranslateService } from '../../services/google-translate/google-translate.service';
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
    const translationSubectObservable = this.translationSubject.asObservable();

    this.clips$ = combineLatest(
      clipsObservable,
      translationSubectObservable
    ).pipe(
      delay(0),
      map(([clips, translatedClip]: [ClipDetails[], ClipDetails]) => {
        for (const clip of clips) {
          clip.snippet = (clip.plainText || '').substring(0, 240);
          clip.fromNow = moment(clip.updatedAt).fromNow();
        }

        // const index = translatedClip.id
        //   ? _clips.findIndex(clip => clip.id === translatedClip.id)
        //   : undefined;

        // if (index !== undefined) {
        //   console.error(index, translatedClip.translation);
        //   _clips[index].translation = translatedClip.translation;
        // }
        return clips;
      })
    );
  }

  loadData(event): void {
    this.clipboardService.loadNext(10);
    setTimeout(() => {
      event.target.complete();
      // if (this.data.length === 1000) {
      // event.target.disabled = true;
      // }
    }, 700);
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
