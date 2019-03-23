import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import uuidv4 from 'uuid/v4';
import { GoogleTranslateResult } from '../../models/models';
import { ElectronService } from '../electron/electron.service';
import { PreferencesService } from '../preferences/preferences.service';
@Injectable()
export class GoogleTranslateService {
  constructor(
    private es: ElectronService,
    private preferencesService: PreferencesService
  ) {}

  public async translate(
    text: string,
    options?: { from?: string; to: string; raw?: boolean }
  ): Promise<string> {
    const eventId = `google-translate-${uuidv4()}`;
    this.es.ipcRenderer.send('google-translate-query', {
      eventId,
      text,
      options: options || this.preferencesService.getAppSettings().translate
    });
    const translation = (await this.es.ipcRenderer.once(eventId)).data;
    return translation.text;
  }
}
