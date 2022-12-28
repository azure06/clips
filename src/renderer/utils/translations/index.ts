import { Language } from '@/utils/common';

import { chinese } from './chinese';
import { en } from './english';
import { it } from './italian';
import { ja } from './japanese';
import { Translation } from './types';

export const translations: {
  [T in keyof Omit<Language, 'auto'>]: Translation;
} = {
  en,
  ja,
  it,
  'zh-CN': chinese['zh-CN'],
  'zh-TW': chinese['zh-TW'],
};
