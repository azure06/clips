import { Translation } from './types';
import { en } from './english';
import { ja } from './japanese';
import { it } from './italian';
import { chinese } from './chinese';
import { Language } from '..';

export const translations: {
  [T in keyof Omit<Language, 'auto'>]: Translation;
} = {
  en,
  ja,
  it,
  'zh-CN': chinese['zh-CN'],
  'zh-TW': chinese['zh-TW'],
};
