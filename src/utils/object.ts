// https://stackoverflow.com/questions/56415826/is-it-possible-to-precisely-type-invert-in-typescript
type AllValues<T extends Record<PropertyKey, PropertyKey>> = {
  [P in keyof T]: { key: P; value: T[P] };
}[keyof T];

type InvertResult<T extends Record<PropertyKey, PropertyKey>> = {
  [P in AllValues<T>['value']]: Extract<AllValues<T>, { value: P }>['key'];
};

type Tuple<T extends Record<PropertyKey, PropertyKey>> = {
  [P in keyof T]: [string, T[P]];
}[keyof T];

export function isObject(item: any) {
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

export function pair<T1 extends Record<PropertyKey, PropertyKey>>(
  obj: T1
): Tuple<T1> {
  return Object.entries(obj) as any;
}
