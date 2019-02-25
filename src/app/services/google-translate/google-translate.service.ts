import { Injectable } from '@angular/core';
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

      this.translate('Ciaos ono un genio');
    }
  }

  public translate(
    text: string,
    options?: { from?: string; to: string; raw?: boolean }
  ) {
    const ipcRenderer = this.electronService.electron.ipcRenderer;
    ipcRenderer.send('google-translate-query', { text });
  }
}
