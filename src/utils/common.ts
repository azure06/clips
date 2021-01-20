export type Language = typeof language;
export type Dictionary<T> = { [id: string]: T };
export type StringProp<T> = {
  [K in keyof T]: T[K] extends string ? K : never;
}[keyof T];

export const language = {
  auto: 'Auto',
  en: 'English',
  it: 'Italiano',
  ja: '日本語',
  'zh-CN': '简体中文',
  'zh-TW': '繁體中文',
} as const;

/**
 * String
 */
export function replace(
  template: string,
  data: { [key: string]: string | number }
): string {
  const pattern = /{\s*(\w+?)\s*}/g;
  return template.replace(pattern, (_, target) => '' + data[target] || '');
}

/**
 * Dictionary
 */
export function toDictionary<T extends { id: string }>(
  values: T[]
): Dictionary<T>;
export function toDictionary<T>(values: T[], key: StringProp<T>): Dictionary<T>;
export function toDictionary<T>(
  values: T[],
  key?: StringProp<T>
): Dictionary<T> {
  return values.reduce((acc, value) => {
    if (key !== undefined) {
      acc['' + value[key]] = value;
    } else if ('id' in value) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      acc[(value as any).id] = value;
    }
    return acc;
  }, {} as Dictionary<T>);
}

// https://stackoverflow.com/questions/56415826/is-it-possible-to-precisely-type-invert-in-typescript
// type AllValues<T extends Record<PropertyKey, PropertyKey>> = {
//   [P in keyof T]: { key: P; value: T[P] };
// }[keyof T];

// type InvertResult<T extends Record<PropertyKey, PropertyKey>> = {
//   [P in AllValues<T>['value']]: Extract<AllValues<T>, { value: P }>['key'];
// };
