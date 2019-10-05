import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ClipDocType } from '../clipboard/clipboard.models';
import { ElectronService } from '../electron/electron.service';

@Injectable()
export class GoogleDriveService {
  private driveClipsSubject = new Subject<ClipDocType[]>();

  constructor(private es: ElectronService) {
    this.es.ipcRenderer.on(
      'google-drive-change',
      (event, { data, error }: { data: { clips?: ClipDocType[] }; error: any }) => {
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

  // @ts-ignore
  public addToDrive(clip: Omit<ClipDocType, 'id'> & { id?: string }) {
    this.es.ipcRenderer.send('add-to-drive', clip);
  }
}
