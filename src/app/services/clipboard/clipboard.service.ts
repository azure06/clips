import { Injectable, NgZone } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { first, scan } from 'rxjs/operators';
// tslint:disable-next-line: no-submodule-imports
import uuidv4 from 'uuid/v4';
import { Clip } from '../../models/models';
import {
  AddClip,
  LoadNext,
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
      const ipcRenderer = this.electronService.electron.ipcRenderer;
      ipcRenderer.on('clipboard-change', (event, clip: Clip) => {
        this.handleClipboardChangeEvent(clip);
        console.error(clip);
      });
    }
  }

  /**
   * Handle Clipboard events. If the target item is already in the clipboard an update request will be performed,
   * otherwise the target item will be added.
   *
   * @param clip Clipboard Item
   */
  private async handleClipboardChangeEvent(clip: Clip) {
    const result = await this.indexDBService.findClip(clip);
    result
      ? this.modifyClip(
          {
            ...result,
            updatedAt: new Date().getTime()
          },
          true
        )
      : this.addClip(clip);
  }

  public async getClipsFromIdbAndSetInState({
    limit,
    index,
    keyRange
  }: {
    limit?: number;
    index?: 'text' | 'type' | 'categories' | 'updatedAt' | 'createdAt';
    keyRange?: IDBKeyRange;
  }) {
    const clips = await this.indexDBService.getClips({
      upperBound: limit,
      keyRange,
      index
    });
    this.ngZone.run(() => {
      this.store.dispatch(new SetClips({ clips }));
    });
  }

  public getClipsFromState(): Promise<Clip[]> {
    return this.store
      .pipe(
        select(fromClips.getClips),
        first()
      )
      .toPromise();
  }

  public loadNext({
    limit,
    index,
    keyRange
  }: {
    limit?: number;
    index?: 'text' | 'type' | 'categories' | 'updatedAt' | 'createdAt';
    keyRange?: IDBKeyRange;
  }) {
    this.ngZone.run(() => {
      this.store.dispatch(new LoadNext({ limit, index, keyRange }));
    });
  }

  public async addClip(clip: Clip) {
    // Add to IndexedDB
    clip = { ...clip, id: uuidv4() };
    await this.indexDBService.addClip(clip);
    this.ngZone.run(() => {
      this.store.dispatch(new AddClip({ clip }));
    });
  }

  public async modifyClip(clip: Clip, sort?: boolean) {
    await this.indexDBService.modifyClip(clip);
    this.ngZone.run(() => {
      this.store.dispatch(new ModifyClip({ clip, sort }));
    });
  }

  public async removeClip(clip: Clip) {
    await this.indexDBService.removeClip(clip);
    this.ngZone.run(() => {
      this.store.dispatch(new RemoveClip({ clip }));
    });
  }
}
