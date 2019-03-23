import { Injectable } from '@angular/core';
import { language } from 'googleapis/build/src/apis/language';
import { Subject } from 'rxjs';
import { ElectronService } from '../electron/electron.service';

interface General {
  startup: boolean;
  hideTitleBar: boolean;
}
interface TranslateOptions {
  from: string;
  to: string;
  raw?: string;
}
interface Hotkeys {
  open: string;
}
interface Language {}

interface AppSettings {
  general: General;
  translate: TranslateOptions;
  hotkeys: Hotkeys;
  language: Language;
}

@Injectable()
export class PreferencesService {
  constructor(private electronService: ElectronService) {
    this.electronService.send('app-settings', {
      newSettings: this.getAppSettings()
    });
  }

  public getAppSettings(): AppSettings {
    const settings: Partial<AppSettings> =
      JSON.parse(localStorage.getItem('app-settings') || null) || {};

    return {
      general: settings.general || {
        startup: true,
        hideTitleBar: false
      },
      translate: settings.translate || {
        from: 'auto',
        to: 'en'
      },
      hotkeys: settings.hotkeys || {
        open: 'V'
      },
      language: {}
    };
  }

  public setAppSettings(partialSettings: Partial<AppSettings>) {
    const oldSettings = this.getAppSettings();
    const newSettings = { ...oldSettings, ...partialSettings };
    localStorage.setItem('app-settings', JSON.stringify(newSettings));
    this.electronService.send('app-settings', {
      oldSettings,
      newSettings
    });
  }
}
