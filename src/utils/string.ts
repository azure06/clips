export function replace(
  template: string,
  data: { [key: string]: string | number }
): string {
  const pattern = /{\s*(\w+?)\s*}/g;
  return template.replace(pattern, (_, target) => '' + data[target] || '');
}
