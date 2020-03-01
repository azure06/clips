import { Language } from './language';

interface Translation {
  account: string;
}

export const translations: {
  [T in keyof Omit<Language, 'auto'>]: Translation;
} = {
  en: {
    account: 'Account',
  },
  'zh-CN': {
    account: '',
  },
  ja: {
    account: '',
  },
  ru: { account: '' },
  'zh-TW': { account: '' },
  it: { account: '' },
};
