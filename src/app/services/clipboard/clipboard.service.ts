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
import { GoogleDriveService } from '../google-drive/google-drive.service';
import { IndexedDBService } from '../indexed-db/indexed-db.service';

@Injectable()
export class ClipboardService {
  constructor(
    private electronService: ElectronService,
    private indexDBService: IndexedDBService,
    private googleDriveService: GoogleDriveService,
    private store: Store<fromClips.State>,
    private ngZone: NgZone
  ) {
    this.electronService.ipcRenderer.on('clipboard-change', (event, clip) => {
      this.handleClipboardChangeEvent(clip, true);
    });

    this.googleDriveService
      .getDriveChangeAsObservable()
      .subscribe(clips =>
        clips.forEach(clip => this.handleClipboardChangeEvent(clip, false))
      );
  }

  /**
   * Handle Clipboard events. If the target item is already in the clipboard an update request will be performed,
   * otherwise the target item will be added.
   *
   * @param clip Clipboard Item
   */
  private async handleClipboardChangeEvent(clip: Clip, addToDrive: boolean) {
    const _clip = { ...clip, id: clip.id || uuidv4() };
    const targetClip = await this.indexDBService.findClip(clip);
    targetClip
      ? this.modifyClip(
          {
            ...targetClip,
            updatedAt: new Date().getTime()
          },
          true
        )
      : this.addClip(_clip);

    if (addToDrive) {
      this.googleDriveService.addToDrive(_clip);
    }
  }

  public async getClipsFromIdbAndSetInState({
    limit,
    index,
    keyRange
  }: {
    limit?: number;
    index?: 'plainText' | 'type' | 'category' | 'updatedAt' | 'createdAt';
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

  public async getClipsFromIdb(
    options: {
      limit?: number;
      index?: 'plainText' | 'type' | 'category' | 'updatedAt' | 'createdAt';
      keyRange?: IDBKeyRange;
    } = {}
  ) {
    return this.indexDBService.getClips({
      upperBound: options.limit,
      keyRange: options.keyRange,
      index: options.index
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
    index?: 'plainText' | 'type' | 'category' | 'updatedAt' | 'createdAt';
    keyRange?: IDBKeyRange;
  }) {
    this.ngZone.run(() => {
      this.store.dispatch(new LoadNext({ limit, index, keyRange }));
    });
  }

  public async addClip(clip: Clip) {
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

  public async copyToClipboard(data: {
    type: 'text' | 'image';
    content: string;
  }) {
    this.electronService.ipcRenderer.send('copy-to-clipboard', data);
  }
}
