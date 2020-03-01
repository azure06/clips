import { Vue, Component } from 'vue-property-decorator';

@Component
export class BaseVue extends Vue {
  public get $language() {
    const { query } = this.$route || { query: { lang: 'en' } };
    return query.lang === 'ja' ? query.lang : 'en';
  }

  //   public get $translations() {
  //     return translations[this.$language];
  //   }
}
