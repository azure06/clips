import { Component, OnInit, ViewChild } from '@angular/core';
import { IonInfiniteScroll } from '@ionic/angular';
import { select, Store } from '@ngrx/store';
import moment from 'moment';
import { Observable } from 'rxjs';
import { delay, filter, first, map } from 'rxjs/operators';
import { Clip } from '../../models/models';
import { GoogleTranslateService } from '../../services/google-translate/google-translate.service';
import * as fromClips from '../clipboard/store/index';
import { ClipboardService } from './../../services/clipboard/clipboard.service';

@Component({
  selector: 'app-clipboard-bookmark',
  templateUrl: './clipboard-bookmark.page.html',
  styleUrls: ['./clipboard-bookmark.page.scss']
})
export class ClipboardBookmarkPage implements OnInit {
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;
  clips$: Observable<Clip[]>;

  constructor(
    private clipboardService: ClipboardService,
    private googleTranslateService: GoogleTranslateService,
    private store: Store<fromClips.State>
  ) {}

  async ngOnInit(): Promise<void> {
    await this.clipboardService.getClipsFromIdbAndSetInState({
      limit: 15,
      index: 'category',
      keyRange: IDBKeyRange.upperBound(['starred', ''])
    });
    this.clips$ = this.store.pipe(
      select(fromClips.getClips),
      delay(0),
      map(clips => {
        return clips.reduce((acc: Clip[], clip) => {
          if (clip.category === 'starred' && clip.type === 'text') {
            clip.plainView = clip.plainText.substring(0, 255);
            clip.dateFromNow = moment(clip.updatedAt).fromNow();
            acc.push(clip);
          }
          return acc;
        }, []);
      })
    );
  }

  async loadMore(event): Promise<void> {
    this.clipboardService.loadNext({
      limit: 10,
      index: 'type',
      keyRange: IDBKeyRange.upperBound(['text', ''])
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

  modifyClip(clip: Clip) {
    this.clipboardService.modifyClip(clip);
  }

  removeClip(clip: Clip) {
    this.clipboardService.removeClip(clip);
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
