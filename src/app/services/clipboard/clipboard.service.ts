import { Injectable, NgZone } from '@angular/core';
import { EffectNotification } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import { first, scan } from 'rxjs/operators';
// tslint:disable-next-line: no-submodule-imports
import uuidv4 from 'uuid/v4';
import { Clip } from '../../models/models';
import {
  AddClip,
  ModifyClip,
  RemoveClip,
  SetClips
} from '../../pages/clipboard/store/actions/clipboard.actions';
import * as fromClips from '../../pages/clipboard/store/index';
import { ElectronService } from '../electron/electron.service';
import { IndexedDBService } from '../indexed-db/indexed-db.service';

@Injectable()
export class ClipboardService {
  constructor(
    private electronService: ElectronService,
    private indexDBService: IndexedDBService,
    private store: Store<fromClips.State>,
    private ngZone: NgZone
  ) {
    if (electronService.isAvailable) {
      this.init();
    }
  }

  private async init() {
    const clips = await this.indexDBService.getClips();
    this.setState(clips);
    const ipcRenderer = this.electronService.electron.ipcRenderer;
    ipcRenderer.on('clipboard-change', (event, clip: Clip) => {
      this.handleEvent(clip);
    });
  }

  /**
   * Handle Clipboard events. If the target item is already in the clipboard an update request will be performed,
   * otherwise the target item will be added.
   *
   * @param clip Clipboard Item
   */
  private async handleEvent(clip: Clip) {
    const currentClips = await this.store
      .pipe(
        select(fromClips.getClips),
        first()
      )
      .toPromise();

    const oldClip = currentClips.find(
      targetClip => targetClip.plainText === clip.plainText
    );

    oldClip
      ? this.modifyClip(
          {
            ...oldClip,
            updatedAt: new Date().getTime()
          },
          true
        )
      : this.addClip(clip);
  }

  private setState(clips: Clip[]) {
    this.ngZone.run(() => {
      this.store.dispatch(new SetClips({ clips }));
    });
  }

  public addClip(clip: Clip) {
    clip = { ...clip, id: uuidv4() };
    this.ngZone.run(() => {
      this.store.dispatch(new AddClip({ clip }));
    });

    // Add to IndexedDB
    this.indexDBService.addClip(clip);
  }

  public modifyClip(clip: Clip, sort?: boolean) {
    this.ngZone.run(() => {
      this.store.dispatch(new ModifyClip({ clip, sort }));
    });

    this.indexDBService.modifyClip(clip);
  }

  public removeClip(clip: Clip) {
    this.ngZone.run(() => {
      this.store.dispatch(new RemoveClip({ clip }));
    });

    this.indexDBService.removeClip(clip);
  }
}
