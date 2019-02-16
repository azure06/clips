import { Component, ViewChild } from '@angular/core';
import { IonInfiniteScroll } from '@ionic/angular';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Clip } from '../../models/models';
import {
  AddClip,
  ClipActions
} from '../clipboard/store/actions/clipboard.actions';
import * as fromClips from '../clipboard/store/index';

@Component({
  selector: 'app-clipboard-history-page',
  templateUrl: './clipboard-history.page.html',
  styleUrls: ['./clipboard-history.page.scss']
})
export class ClipboardHistoryPage {
  clips$: Observable<Clip[]>;
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;

  constructor(private store: Store<fromClips.State>) {
    // ClipActions.AddClip
    this.clips$ = store.pipe(select(fromClips.getClips));

    this.clips$.subscribe(items => {
      console.error(items);
    });
  }

  loadData(event) {
    setTimeout(() => {
      console.log('Done');
      event.target.complete();
      // App logic to determine if all data is loaded
      // and disable the infinite scroll
      this.addClip({
        content: 'rondom1234',
        type: 'super'
      });
      // if (this.data.length === 1000) {
      // event.target.disabled = true;
      // }
    }, 500);
  }

  addClip(clip: Clip) {
    this.store.dispatch(new AddClip(clip));
  }
}
