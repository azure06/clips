import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Clip } from '../../models/models';
import { ElectronService } from '../electron/electron.service';

@Injectable()
export class GoogleDriveService {
  private driveClipsSubject = new Subject<Clip[]>();

  constructor(private es: ElectronService) {
    this.es.ipcRenderer.on(
      'google-drive-change',
      (event, { data, error }: { data: { clips?: Clip[] }; error: any }) => {
        data
          ? (() => {
            console.error('Drive data: ', data.clips);
            this.driveClipsSubject.next(data.clips);
          })()
          : console.error(error);
      }
    );
  }

  public getDriveChangeAsObservable() {
    return this.driveClipsSubject.asObservable();
  }

  public addToDrive(clip: Clip) {
    this.es.ipcRenderer.send('add-to-drive', clip);
  }
}
