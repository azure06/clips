import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { PreferencesService } from 'src/app/services/preferences/preferences.service';
import { GoogleTranslateService } from '../../services/google-translate/google-translate.service';

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
    public preferencesService: PreferencesService
  ) {
    this.general = preferencesService.getGeneralSettings();
    this.translate = preferencesService.getTranslateOptions();
    this.hotkeys = preferencesService.getHotkeys();
  }

  setGeneralSettings() {
    this.preferencesService.setGeneralSettings(this.general);
  }

  setGoogleTranslateOptions(value: string) {
    this.preferencesService.setTranslateOptions(this.translate);
  }

  setHotkeys() {
    this.preferencesService.setHotkeys(this.hotkeys);
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
