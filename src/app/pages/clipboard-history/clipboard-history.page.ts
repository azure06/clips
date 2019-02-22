import { Component, OnInit, ViewChild } from '@angular/core';
import { IonInfiniteScroll } from '@ionic/angular';
import { select, Store } from '@ngrx/store';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Clip } from '../../models/models';
import { AddClip } from '../clipboard/store/actions/clipboard.actions';
import * as fromClips from '../clipboard/store/index';
import { ClipboardService } from './../../services/clipboard/clipboard.service';

@Component({
  selector: 'app-clipboard-history-page',
  templateUrl: './clipboard-history.page.html',
  styleUrls: ['./clipboard-history.page.scss']
})
export class ClipboardHistoryPage implements OnInit {
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;
  clips$: Observable<Clip[]>;
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
      map(([clips, count]) => clips.filter((clip, index) => index < count))
    );

    this.clips$.subscribe(item => {
      console.error(item);
    });
    this.showMore();
  }

  loadData(event): void {
    setTimeout(() => {
      event.target.complete();
      this.showMore();
      // if (this.data.length === 1000) {
      // event.target.disabled = true;
      // }
    }, 200);
  }

  showMore(): void {
    this.ionicInfiniteScrollCount += 10;
    this.infiniteScrollSubject.next(this.ionicInfiniteScrollCount);
  }

  addClip(clip: Clip): void {
    this.store.dispatch(new AddClip(clip));
  }
}
