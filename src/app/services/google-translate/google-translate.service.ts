import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import uuidv4 from 'uuid/v4';
import { GoogleTranslateResult } from '../../models/models';
import { ElectronService } from '../electron/electron.service';
@Injectable()
export class GoogleTranslateService {
  constructor(private electronService: ElectronService) {}

  public async translate(
    text: string,
    options?: { from?: string; to: string; raw?: boolean }
  ): Promise<string> {
    return this.electronService.isAvailable
      ? ((): Promise<string> => {
          const ipcRenderer = this.electronService.electron.ipcRenderer;
          return new Promise((resolve, reject) => {
            const eventId = `google-translate-${uuidv4()}`;
            ipcRenderer.once(eventId, (event, translation) => {
              resolve(translation.text);
            });
            ipcRenderer.send('google-translate-query', { eventId, text });
          });
        })()
      : Promise.resolve('');
  }
}
