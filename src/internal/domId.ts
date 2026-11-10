export function domIdSuffix(value: string): string {
  return Array.from({ length: value.length }, (_, index) => value.charCodeAt(index).toString(16)).join("-");
}
