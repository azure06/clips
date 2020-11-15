import { language, replace } from '.';
import { translations } from './translations';
import { Translation } from './translations/types';
import { SettingsState } from '@/store/types';
import { Getter } from 'vuex-class';
import { Vue, Component } from 'vue-property-decorator';

type Language = typeof language[keyof typeof language];

export class BaseVue extends Vue {
  public $toLanguageCode(lang: Language): keyof typeof language {
    switch (lang) {
      case 'Auto':
        return 'auto';
      case 'English':
        return 'en';
      case 'Italiano':
        return 'it';
      case '日本語':
        return 'ja';
      case '简体中文':
        return 'zh-CN';
      case '繁體中文':
        return 'zh-TW';
    }
  }

  public $replacer(
    template: string,
    data: { [key: string]: string | number }
  ): string {
    return replace(template, data);
  }
}

@Component
export class ExtendedVue extends BaseVue {
  @Getter('settings', { namespace: 'settings' })
  public settings!: SettingsState;

  public get $language(): Language {
    return this.settings.system.language;
  }

  public get $translations(): Translation {
    const alphanumeric = this.$toLanguageCode(this.$language);
    const auto = () => {
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
    return alphanumeric === 'auto' ? auto() : translations[alphanumeric];
  }
}
