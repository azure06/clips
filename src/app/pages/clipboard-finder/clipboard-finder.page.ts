import { Component, OnInit, ViewChild } from '@angular/core';
import { IonInfiniteScroll } from '@ionic/angular';
import { select, Store } from '@ngrx/store';
import moment from 'moment';
import { BehaviorSubject, combineLatest, Observable, Subject } from 'rxjs';
import { delay, filter, first, map } from 'rxjs/operators';
import { Clip } from '../../models/models';
import { GoogleTranslateService } from '../../services/google-translate/google-translate.service';
import * as fromClips from '../clipboard/store/index';
import { ClipboardService } from './../../services/clipboard/clipboard.service';

@Component({
  selector: 'app-clipboard-finder-page',
  templateUrl: './clipboard-finder.page.html',
  styleUrls: ['./clipboard-finder.page.scss']
})
export class ClipboardFinderPage implements OnInit {
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;
  ionicInfiniteScrollAmount = 0;
  infiniteScrollSubject = new BehaviorSubject(this.ionicInfiniteScrollAmount);
  clipsSubject = new Subject<Clip[]>();
  clips$: Observable<Clip[]>;
  allClips: Clip[] = [];
  loading = true;

  constructor(
    private clipboardService: ClipboardService,
    private googleTranslateService: GoogleTranslateService
  ) {}

  async ngOnInit(): Promise<void> {
    // Set clips from indexedDB into the state
    this.allClips = await this.clipboardService.getClipsFromIdb();
    this.loading = false;
    this.clips$ = combineLatest(
      this.clipsSubject.asObservable(),
      this.infiniteScrollSubject.asObservable()
    ).pipe(
      delay(0),
      map(([clips, scrollAmount]) =>
        clips.reduce((acc: Clip[], clip, index) => {
          if (index < scrollAmount) {
            clip.plainView = clip.plainText.substring(0, 255);
            clip.dateFromNow = moment(clip.updatedAt).fromNow();
            acc.push(clip);
          }
          return acc;
        }, [])
      )
    );
  }

  async loadMore(event): Promise<void> {
    event.target.complete();
    this.ionicInfiniteScrollAmount += 10;
    this.infiniteScrollSubject.next(this.ionicInfiniteScrollAmount);
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

  onInput(event): void {
    const searchQuery = event.target.value;
    const clips =
      searchQuery && searchQuery.trim() !== ''
        ? this.allClips.filter(clip => clip.plainText.includes(searchQuery))
        : [];

    this.ionicInfiniteScrollAmount = 10;
    this.infiniteScrollSubject.next(this.ionicInfiniteScrollAmount);
    this.clipsSubject.next(clips);
  }
}
