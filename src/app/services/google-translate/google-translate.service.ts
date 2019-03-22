import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import uuidv4 from 'uuid/v4';
import { GoogleTranslateResult } from '../../models/models';
import { ElectronService } from '../electron/electron.service';
import { PreferencesService } from '../preferences/preferences.service';
@Injectable()
export class GoogleTranslateService {
  constructor(
    private electronService: ElectronService,
    private preferencesService: PreferencesService
  ) {}

  public async translate(
    text: string,
    options?: { from?: string; to: string; raw?: boolean }
  ): Promise<string> {
    const eventId = `google-translate-${uuidv4()}`;
    this.electronService.send('google-translate-query', {
      eventId,
      text,
      options: options || this.preferencesService.getTranslateOptions()
    });
    const translation = (await this.electronService.once(eventId)).data;
    return translation.text;
  }
}
