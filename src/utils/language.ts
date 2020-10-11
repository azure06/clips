export const language = {
  auto: 'Auto',
  en: 'English',
  it: 'Italiano',
  ja: '日本語',
  'zh-CN': '简体中文',
  'zh-TW': '繁體中文',
} as const;

export type Language = typeof language;
