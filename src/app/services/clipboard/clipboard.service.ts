import { Injectable, NgZone } from '@angular/core';
import { EffectNotification } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import { scan } from 'rxjs/operators';
import { Clip } from '../../models/models';
import {
  AddClip,
  SetClips
} from '../../pages/clipboard/store/actions/clipboard.actions';
import * as fromClips from '../../pages/clipboard/store/index';
import { ElectronService } from '../electron/electron.service';

@Injectable()
export class ClipboardService {
  constructor(
    private electronService: ElectronService,
    private store: Store<fromClips.State>,
    private ngZone: NgZone
  ) {
    if (this.electronService.isAvailable) {
      this.onElectronStoreChange();
    }
  }

  observeState() {
    this.store.pipe(select(fromClips.getClips)).subscribe(items => {
      console.error(items);
    });
  }

  updateState() {}

  addClip(clip: Clip) {
    this.ngZone.run(() => {
      this.store.dispatch(new AddClip({ clip }));
    });
  }

  onElectronStoreChange() {
    const ipcRenderer = this.electronService.electron.ipcRenderer;
    ipcRenderer.on('clipboard-change', (event, clips: Clip[]) => {
      this.ngZone.run(() => {
        this.store.dispatch(new SetClips({ clips }));
      });
    });
  }

  async updateElectronStore(effect: EffectNotification) {
    // this.electronService.electron.ipcRenderer.send('clips-renewed', clips);
  }
}
