import { Injectable } from '@angular/core';
import { Clip } from '../../models/models';
import { ElectronService } from '../electron/electron.service';

@Injectable()
export class GoogleDriveService {
  constructor(private electronService: ElectronService) {
    const { ipcRenderer } = this.electronService.electron;
    ipcRenderer.on('google-drive-change', (event, data) => {
      console.error(data);
    });
  }

  public addToDrive(clip: Clip) {
    if (this.electronService.isAvailable) {
      const { ipcRenderer } = this.electronService.electron;
      ipcRenderer.send('add-to-drive', clip);
    } else {
      console.warn('Electron not available');
    }
  }
}
