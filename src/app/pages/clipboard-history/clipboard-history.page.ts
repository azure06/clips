import { Component, ViewChild } from '@angular/core';
import { IonInfiniteScroll } from '@ionic/angular';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Clip } from '../../models/models';
import { AddClip } from '../clipboard/store/actions/clipboard.actions';
import * as fromClips from '../clipboard/store/index';

@Component({
  selector: 'app-clipboard-history-page',
  templateUrl: './clipboard-history.page.html',
  styleUrls: ['./clipboard-history.page.scss']
})
export class ClipboardHistoryPage {
  clips$: Observable<Clip[]> = this.store.pipe(select(fromClips.getClips));
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;

  constructor(private store: Store<fromClips.State>) {
    console.error('here');
    this.clips$.subscribe(item => {
      console.error(item);
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
