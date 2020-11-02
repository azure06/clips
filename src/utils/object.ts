// https://stackoverflow.com/questions/56415826/is-it-possible-to-precisely-type-invert-in-typescript
// type AllValues<T extends Record<PropertyKey, PropertyKey>> = {
//   [P in keyof T]: { key: P; value: T[P] };
// }[keyof T];

// type InvertResult<T extends Record<PropertyKey, PropertyKey>> = {
//   [P in AllValues<T>['value']]: Extract<AllValues<T>, { value: P }>['key'];
// };

type Dictionary<T> = { [id: string]: T };

export function isObject(item: unknown): boolean {
  return item && typeof item === 'object' && !Array.isArray(item);
}

export function mergeDeep<T>(target: T, source: T): T {
  return Object.entries(source).reduce(
    (acc, [key, value]) => {
      if (isObject(value)) {
        return key in target
          ? (() => {
              acc[key as keyof T] = mergeDeep(target[key as keyof T], value);
              return acc;
            })()
          : Object.assign(acc, { [key]: value });
      } else {
        return Object.assign(acc, { [key]: value });
      }
    },
    { ...target }
  );
}

type StrPropOnly<T> = {
  [K in keyof T]: T[K] extends string ? K : never;
}[keyof T];

export function toDictionary<T extends { id: string }>(
  values: T[]
): Dictionary<T>;
export function toDictionary<T>(
  values: T[],
  key: StrPropOnly<T>
): Dictionary<T>;
export function toDictionary<T>(
  values: T[],
  key?: StrPropOnly<T>
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
