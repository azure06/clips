import { Injectable, NgZone } from '@angular/core';
import { EffectNotification } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import { first, scan } from 'rxjs/operators';
// tslint:disable-next-line: no-submodule-imports
import uuidv4 from 'uuid/v4';
import { Clip } from '../../models/models';
import {
  AddClip,
  SetClips
} from '../../pages/clipboard/store/actions/clipboard.actions';
import * as fromClips from '../../pages/clipboard/store/index';
import { ElectronService } from '../electron/electron.service';
import { IndexDBService } from '../index-db/index-db.service';

@Injectable()
export class ClipboardService {
  constructor(
    private electronService: ElectronService,
    private indexDBService: IndexDBService,
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

  private async handleEvent(clip: Clip) {
    const currentClips = await this.store
      .pipe(
        select(fromClips.getClips),
        first()
      )
      .toPromise();

    const targetClip = currentClips.find(
      _clip => clip.plainText === _clip.plainText
    );

    targetClip ? this.modifyClip(targetClip) : this.addClip(clip);
  }

  private setState(clips: Clip[]) {
    this.ngZone.run(() => {
      this.store.dispatch(new SetClips({ clips }));
    });
  }

  public modifyClip(clip: Clip) {}

  public addClip(clip: Clip) {
    clip = { ...clip, id: uuidv4() };
    this.ngZone.run(() => {
      this.store.dispatch(new AddClip({ clip }));
    });

    // Update Index DB
    this.indexDBService.addClip(clip);
  }
}
