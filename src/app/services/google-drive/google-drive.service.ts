import { Injectable } from '@angular/core';
import { Clip } from '../../models/models';
import { ElectronService } from '../electron/electron.service';

@Injectable()
export class GoogleDriveService {
  constructor(private electronService: ElectronService) {
    this.electronService.on('google-drive-change', (event, data: Clip[]) => {
      console.error(data);
    });
  }

  public addToDrive(clip: Clip) {
    this.electronService.send('add-to-drive', clip);
  }
}
