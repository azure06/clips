import { Injectable } from '@angular/core';
import { Clip } from '../../models/models';
import { ClipboardService } from '../clipboard/clipboard.service';
import { ElectronService } from '../electron/electron.service';

@Injectable()
export class GoogleDriveService {
  constructor(
    private es: ElectronService,
    private clipboardService: ClipboardService
  ) {
    this.es.ipcRenderer.on(
      'google-drive-change',
      (event, { data, error }: { data: { clips?: Clip[] }; error: any }) => {
        data
          ? data.clips.forEach(clip => clipboardService.addClip(clip))
          : console.error(error);
      }
    );
  }

  public addToDrive(clip: Clip) {
    this.es.ipcRenderer.send('add-to-drive', clip);
  }
}
