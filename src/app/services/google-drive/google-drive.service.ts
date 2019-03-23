import { Injectable } from '@angular/core';
import { Clip } from '../../models/models';
import { ElectronService } from '../electron/electron.service';

@Injectable()
export class GoogleDriveService {
  constructor(private es: ElectronService) {
    this.es.ipcRenderer.on(
      'google-drive-change',
      (event, { data, error }: { data: { clips?: Clip[] }; error: any }) => {
        console.error(data ? data.clips : error);
      }
    );
  }

  public addToDrive(clip: Clip) {
    this.es.ipcRenderer.send('add-to-drive', clip);
  }
}
