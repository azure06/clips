import { Component, OnInit, ViewChild } from '@angular/core';
import { IonInfiniteScroll } from '@ionic/angular';
import { select, Store } from '@ngrx/store';
import moment from 'moment';
import { Observable } from 'rxjs';
import { delay, filter, first, map } from 'rxjs/operators';
import { Clip } from '../../models/models';
import { ClipboardService } from '../../services/clipboard/clipboard.service';
import { GoogleTranslateService } from '../../services/google-translate/google-translate.service';
import * as fromClips from '../clipboard/store/index';

@Component({
  selector: 'app-clipboard-images',
  templateUrl: './clipboard-images.page.html',
  styleUrls: ['./clipboard-images.page.scss']
})
export class ClipboardImagesPage implements OnInit {
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;
  clips$: Observable<Clip[]>;

  constructor(
    private clipboardService: ClipboardService,
    private googleTranslateService: GoogleTranslateService,
    private store: Store<fromClips.State>
  ) {}

  async ngOnInit() {
    await this.clipboardService.getClipsFromIdbAndSetInState({
      limit: 5,
      index: 'type',
      keyRange: IDBKeyRange.upperBound(['image', ''])
    });
    this.clips$ = this.store.pipe(
      select(fromClips.getClips),
      delay(0),
      map(clips => {
        // We need to filter the clipboard item added manually to the state (since they are not filtered by category)
        return clips.reduce((acc: Clip[], clip) => {
          if (clip.type === 'image') {
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
      limit: 5,
      index: 'type',
      keyRange: IDBKeyRange.upperBound(['image', ''])
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
}
