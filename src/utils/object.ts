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
