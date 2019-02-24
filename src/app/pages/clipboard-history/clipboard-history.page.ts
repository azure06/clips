import { Component, OnInit, ViewChild } from '@angular/core';
import { IonInfiniteScroll } from '@ionic/angular';
import { select, Store } from '@ngrx/store';
import moment from 'moment';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { Clip } from '../../models/models';
import { AddClip } from '../clipboard/store/actions/clipboard.actions';
import * as fromClips from '../clipboard/store/index';
import { ClipboardService } from './../../services/clipboard/clipboard.service';

interface ClipDetails extends Clip {
  fromNow: string;
  isHtmlView: boolean;
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

  constructor(
    private clipboardService: ClipboardService,
    private store: Store<fromClips.State>
  ) {}

  ngOnInit(): void {
    const clipsObservable = this.store.pipe(select(fromClips.getClips));

    const infiniteScrollCountObservable = this.infiniteScrollSubject.asObservable();
    this.clips$ = combineLatest(
      clipsObservable,
      infiniteScrollCountObservable
    ).pipe(
      delay(0),
      map(([clips, count]) =>
        clips.reduce((acc: ClipDetails[], clip: ClipDetails, index) => {
          if (index < count) {
            // expression-has-changed-after-it-was-checked
            clip.fromNow = moment(clip.updatedAt).fromNow();
            acc.push(clip);
          }
          return acc;
        }, [])
      )
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

  addClip(clip: Clip): void {
    this.store.dispatch(new AddClip({ clip }));
  }
}
