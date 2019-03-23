import { Injectable } from '@angular/core';
import { Subject, timer } from 'rxjs';
import { debounce } from 'rxjs/operators';
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

interface Bounds {
  height: number;
  width: number;
  x: number;
  y: number;
}

interface AppSettings {
  general: General;
  translate: TranslateOptions;
  hotkeys: Hotkeys;
  language: Language;
  bounds: Bounds;
}

@Injectable()
export class PreferencesService {
  constructor(private es: ElectronService) {
    es.ipcRenderer.send('app-settings', {
      newSettings: this.getAppSettings()
    });

    es.mainWindow
      .onMove()
      .pipe(debounce(() => timer(1000)))
      .subscribe(obj => {
        const bounds: Bounds = obj.sender.getBounds();
        this.setAppSettings({ bounds });
      });

    const { x, y, height, width } = this.getAppSettings().bounds;

    if (x > 0 && y > 0) {
      es.mainWindow.setPosition(x, y, true);
    }
    console.error(height, width);
    es.mainWindow.setSize(height, width);
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
      language: {},
      bounds: settings.bounds || {
        height: 800,
        width: 540,
        x: -1,
        y: -1
      }
    };
  }

  public setAppSettings(partialSettings: Partial<AppSettings>) {
    const oldSettings = this.getAppSettings();
    const newSettings = { ...oldSettings, ...partialSettings };
    localStorage.setItem('app-settings', JSON.stringify(newSettings));
    this.es.ipcRenderer.send('app-settings', {
      oldSettings,
      newSettings
    });
  }
}
