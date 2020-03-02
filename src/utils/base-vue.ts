import { Vue, Component } from 'vue-property-decorator';
import { Getter } from 'vuex-class';
import { SettingsState } from '@/store/types';
import { language } from './language';
import { invert } from './object';
import { translations } from './translations';
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

  public get $translations() {
    const lang = this.$invertedLanguage[this.$language];
    return lang === 'auto' ? translations.en : translations[lang];
  }

  public $replacer(template: string, data: { [key: string]: string | number }) {
    return replace(template, data);
  }
}
