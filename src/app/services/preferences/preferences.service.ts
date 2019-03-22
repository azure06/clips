import { Injectable } from '@angular/core';

interface GeneralSettings {
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

@Injectable()
export class PreferencesService {
  public getGeneralSettings(): GeneralSettings {
    return (
      JSON.parse(localStorage.getItem('general-settings'), null) || {
        startup: true,
        hideTitleBar: false
      }
    );
  }
  public setGeneralSettings(generalSettings: GeneralSettings) {
    localStorage.setItem('general-settings', JSON.stringify(generalSettings));
  }

  public getTranslateOptions(): TranslateOptions {
    return (
      JSON.parse(localStorage.getItem('google-translate-options'), null) || {
        from: 'auto',
        to: 'en'
      }
    );
  }
  public setTranslateOptions(translateOptions: TranslateOptions) {
    localStorage.setItem(
      'google-translate-options',
      JSON.stringify(translateOptions)
    );
  }

  public getHotkeys(): Hotkeys {
    return (
      JSON.parse(localStorage.getItem('hotkeys'), null) || {
        open: 'V'
      }
    );
  }

  public setHotkeys(hotkeys: Hotkeys) {
    localStorage.setItem('hotkeys', JSON.stringify(hotkeys));
  }
}
