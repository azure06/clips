import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GoogleTraslateResult } from '../../models/models';
import { ElectronService } from '../electron/electron.service';

@Injectable()
export class GoogleTranslateService {
  constructor(private electronService: ElectronService) {
    if (this.electronService.isAvailable) {
      const ipcRenderer = this.electronService.electron.ipcRenderer;
      ipcRenderer.on(
        'google-translate-result',
        (event, result: GoogleTraslateResult) => console.error(result)
      );
    }
  }

  public async translate(
    text: string,
    options?: { from?: string; to: string; raw?: boolean }
  ): Promise<string> {
    const ipcRenderer = this.electronService.electron.ipcRenderer;
    return new Promise((resolve, reject) => {
      ipcRenderer.once('google-translate-result', (event, translation) => {
        resolve(translation.text);
      });
      ipcRenderer.send('google-translate-query', { text });
    });
  }
}
