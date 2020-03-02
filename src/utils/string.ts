export function replace(template: string, data: { [key: string]: string | number }) {
  const pattern = /{\s*(\w+?)\s*}/g;
  return template.replace(pattern, (_, target) => '' + data[target] || '');
}
