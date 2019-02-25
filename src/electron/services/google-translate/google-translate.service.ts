import { EventEmitter } from 'events';
import { Languages } from './languages';
const translate = require('@vitalets/google-translate-api');

export default class GoogleTranslate extends EventEmitter {
  private options: { from?: Languages; to: Languages; raw?: boolean } = {
    to: Languages.en
  };
  constructor() {
    super();
  }

  public setOptions(
    options: { from?: Languages; to: Languages; raw?: boolean } = {
      to: Languages.en
    }
  ) {
    this.options = options;
  }

  /**
   * Translation result
   *
   * @param text The text to be translated
   * @param options
   *
   * @returns tranlation result
   */
  public async translate(
    text: string,
    options?: { from?: Languages; to: Languages; raw?: boolean }
  ): Promise<{
    text: string;
    from: {
      language: {
        didYouMean: boolean;
        iso: string;
      };
      text: {
        autoCorrected: boolean;
        value: string;
        didYouMean: boolean;
      };
      raw: string;
    };
  }> {
    return translate(text, options || this.options);
  }
}
