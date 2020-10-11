import { Language } from '../language';

import { en } from './english';
import { ja } from './japanese';
import { it } from './italian';
import { chinese } from './chinese';

export const translations: {
  [T in keyof Omit<Language, 'auto'>]: any;
} = {
  en,
  ja,
  it,
  'zh-CN': chinese['zh-CN'],
  'zh-TW': chinese['zh-TW'],
};
