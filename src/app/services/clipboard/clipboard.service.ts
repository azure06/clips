import { Injectable, NgZone } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { first } from 'rxjs/operators';
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
import { PreferencesService } from '../preferences/preferences.service';
import { ClipDocType } from './clipboard.models';
import { ClipsRxDbService } from './clipboard.rxdb';

@Injectable()
export class ClipboardService {
  private clipsRxDbService = new ClipsRxDbService();

  constructor(
    private electronService: ElectronService,
    private googleDriveService: GoogleDriveService,
    private preferencesService: PreferencesService,
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
  private async handleClipboardChangeEvent(
    // @ts-ignore
    clip: Omit<ClipDocType, 'id'> & { id?: string },
    addToDrive: boolean
  ) {
    const [targetClip] = await this.clipsRxDbService.findClips({
      clip,
      field: 'plainText'
    });
    targetClip
      ? this.modifyClip(
          {
            ...targetClip,
            updatedAt: new Date().getTime()
          },
          true
        )
      : this.addClip(clip);

    if (addToDrive) {
      this.googleDriveService.addToDrive(clip);
    }
  }

  public async findClips(args: {
    limit?: number;
    skip?: number;
    field?: 'id' | 'plainText' | 'type' | 'category';
    clip?: Partial<ClipDocType>;
    sort?:
      | 'plainText'
      | 'type'
      | 'category'
      | 'updatedAt'
      | 'createdAt'
      | '-plainText'
      | '-type'
      | '-category'
      | '-updatedAt'
      | '-createdAt';
  }) {
    return this.clipsRxDbService.findClips(args);
  }

  public async findClipsWithRegex(
    query: { [P in keyof Partial<ClipDocType>]: { $regex: RegExp } }
  ) {
    return this.clipsRxDbService.findWithRegex(query);
  }

  public async findClipsAndSetInState(args: {
    limit?: number;
    skip?: number;
    field?: 'id' | 'plainText' | 'type' | 'category';
    clip?: Partial<ClipDocType>;
    sort?:
      | 'plainText'
      | 'type'
      | 'category'
      | 'updatedAt'
      | 'createdAt'
      | '-plainText'
      | '-type'
      | '-category'
      | '-updatedAt'
      | '-createdAt';
  }) {
    const clips = await this.findClips(args);
    this.ngZone.run(() => {
      this.store.dispatch(new SetClips({ clips }));
    });
  }

  public getClipsFromState(): Promise<ClipDocType[]> {
    return this.store
      .pipe(
        select(fromClips.getClips),
        first()
      )
      .toPromise();
  }

  public loadNext(args: {
    limit?: number;
    skip?: number;
    field?: 'id' | 'plainText' | 'type' | 'category';
    clip?: Partial<ClipDocType>;
    sort?:
      | 'plainText'
      | 'type'
      | 'category'
      | 'updatedAt'
      | 'createdAt'
      | '-plainText'
      | '-type'
      | '-category'
      | '-updatedAt'
      | '-createdAt';
  }) {
    this.ngZone.run(() => {
      this.store.dispatch(new LoadNext(args));
    });
  }

  public async setClips(clips: ClipDocType[]) {
    this.ngZone.run(() => {
      this.store.dispatch(new SetClips({ clips }));
    });
  }

  // @ts-ignore
  public async addClip(_clip: Omit<ClipDocType, 'id'> & { id?: string }) {
    const clip = await this.clipsRxDbService.insertClip(_clip);
    this.ngZone.run(() => {
      this.store.dispatch(new AddClip({ clip }));
    });
  }

  public async modifyClip(clip: ClipDocType, sort?: boolean) {
    await this.clipsRxDbService.upsertClip(clip);
    this.ngZone.run(() => {
      this.store.dispatch(new ModifyClip({ clip, sort }));
    });
  }

  public async removeClip(clip: ClipDocType, sort?: boolean) {
    await this.clipsRxDbService.removeClip(clip);
    this.ngZone.run(() => {
      this.store.dispatch(new RemoveClip({ clip }));
    });
  }

  public async removeAllClips() {
    return this.clipsRxDbService.removeAllClips();
  }

  public async copyToClipboard(data: {
    type: 'text' | 'image';
    content: string;
  }) {
    this.electronService.ipcRenderer.send('copy-to-clipboard', data);
    const { closeOnBlur } = this.preferencesService.getAppSettings().general;
    if (this.electronService.mainWindow.isVisible() && closeOnBlur) {
      this.electronService.mainWindow.hide();
    }
  }
}
