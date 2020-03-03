import { Vue, Component } from 'vue-property-decorator';
import { Getter } from 'vuex-class';
import { SettingsState } from '@/store/types';
import { language } from './language';
import { invert } from './object';
import { translations } from './translations';
import { Translation } from './translations/types';
import { replace } from './string';
@Component
export class BaseVue extends Vue {
  @Getter('settings', { namespace: 'settings' })
  public settings!: SettingsState;

  public get $language() {
    return this.settings.system.language;
  }

  public get $invertedLanguage() {
    return invert(language);
  }

  public get $translations(): Translation {
    const inverted = this.$invertedLanguage[this.$language];
    const fromAuto = () => {
      const language = window.navigator.language;
      const slicedLang = language.slice(0, 2);
      switch (language) {
        case 'zh-CN':
          return translations[language];
        case 'zh-TW':
          return translations[language];
        default:
          switch (slicedLang) {
            case 'en':
              return translations[slicedLang];
            case 'ja':
              return translations[slicedLang];
            case 'it':
              return translations[slicedLang];
            default:
              return translations.en;
          }
      }
    };
    return inverted === 'auto' ? fromAuto() : translations[inverted];
  }

  public $replacer(template: string, data: { [key: string]: string | number }) {
    return replace(template, data);
  }
}
