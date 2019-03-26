import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ElectronService } from 'src/app/services/electron/electron.service';
import { PreferencesService } from '../../services/preferences/preferences.service';

@Component({
  selector: 'app-system',
  templateUrl: './system.page.html',
  styleUrls: ['./system.page.scss']
})
export class SystemPage {
  // tslint:disable: no-use-before-declare
  public languages = Object.keys(Languages).map(key => ({
    physicalNm: key,
    logicalNm: Languages[key]
  }));
  public targetLanguages = Object.keys(Languages)
    .filter(key => key !== 'auto')
    .map(key => ({ physicalNm: key, logicalNm: Languages[key] }));

  public general: {
    startup: boolean;
    hideTitleBar: boolean;
    closeOnBlur: boolean;
  };

  public translate: {
    from: string;
    to: string;
    raw?: string;
  };

  public hotkeys: {
    open: string;
  };

  constructor(
    public router: Router,
    public es: ElectronService,
    public preferencesService: PreferencesService
  ) {
    this.general = preferencesService.getAppSettings().general;
    this.translate = preferencesService.getAppSettings().translate;
    this.hotkeys = preferencesService.getAppSettings().hotkeys;
  }

  setGeneralSettings(value?: 'close-on-blur') {
    if (value === 'close-on-blur') {
      this.es.mainWindow.setSkipTaskbar(this.general.closeOnBlur);
    }
    this.preferencesService.setAppSettings({ general: this.general });
  }

  setGoogleTranslateOptions() {
    this.preferencesService.setAppSettings({ translate: this.translate });
  }

  setHotkeys() {
    this.preferencesService.setAppSettings({ hotkeys: this.hotkeys });
  }
}

enum Languages {
  auto = 'Automatic',
  af = 'Afrikaans',
  sq = 'Albanian',
  am = 'Amharic',
  ar = 'Arabic',
  hy = 'Armenian',
  az = 'Azerbaijani',
  eu = 'Basque',
  be = 'Belarusian',
  bn = 'Bengali',
  bs = 'Bosnian',
  bg = 'Bulgarian',
  ca = 'Catalan',
  ceb = 'Cebuano',
  ny = 'Chichewa',
  'zh-cn' = 'Chinese Simplified',
  'zh-tw' = 'Chinese Traditional',
  co = 'Corsican',
  hr = 'Croatian',
  cs = 'Czech',
  da = 'Danish',
  nl = 'Dutch',
  en = 'English',
  eo = 'Esperanto',
  et = 'Estonian',
  tl = 'Filipino',
  fi = 'Finnish',
  fr = 'French',
  fy = 'Frisian',
  gl = 'Galician',
  ka = 'Georgian',
  de = 'German',
  el = 'Greek',
  gu = 'Gujarati',
  ht = 'Haitian Creole',
  ha = 'Hausa',
  haw = 'Hawaiian',
  iw = 'Hebrew',
  hi = 'Hindi',
  hmn = 'Hmong',
  hu = 'Hungarian',
  is = 'Icelandic',
  ig = 'Igbo',
  id = 'Indonesian',
  ga = 'Irish',
  it = 'Italian',
  ja = 'Japanese',
  jw = 'Javanese',
  kn = 'Kannada',
  kk = 'Kazakh',
  km = 'Khmer',
  ko = 'Korean',
  ku = 'Kurdish (Kurmanji)',
  ky = 'Kyrgyz',
  lo = 'Lao',
  la = 'Latin',
  lv = 'Latvian',
  lt = 'Lithuanian',
  lb = 'Luxembourgish',
  mk = 'Macedonian',
  mg = 'Malagasy',
  ms = 'Malay',
  ml = 'Malayalam',
  mt = 'Maltese',
  mi = 'Maori',
  mr = 'Marathi',
  mn = 'Mongolian',
  my = 'Myanmar (Burmese)',
  ne = 'Nepali',
  no = 'Norwegian',
  ps = 'Pashto',
  fa = 'Persian',
  pl = 'Polish',
  pt = 'Portuguese',
  ma = 'Punjabi',
  ro = 'Romanian',
  ru = 'Russian',
  sm = 'Samoan',
  gd = 'Scots Gaelic',
  sr = 'Serbian',
  st = 'Sesotho',
  sn = 'Shona',
  sd = 'Sindhi',
  si = 'Sinhala',
  sk = 'Slovak',
  sl = 'Slovenian',
  so = 'Somali',
  es = 'Spanish',
  su = 'Sundanese',
  sw = 'Swahili',
  sv = 'Swedish',
  tg = 'Tajik',
  ta = 'Tamil',
  te = 'Telugu',
  th = 'Thai',
  tr = 'Turkish',
  uk = 'Ukrainian',
  ur = 'Urdu',
  uz = 'Uzbek',
  vi = 'Vietnamese',
  cy = 'Welsh',
  xh = 'Xhosa',
  yi = 'Yiddish',
  yo = 'Yoruba',
  zu = 'Zulu'
}
