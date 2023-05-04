//
// Helper Functions
//


// Type

export type UnknownObject = { [key: string]: unknown };

export function isUnknownObject(x: unknown): x is UnknownObject {
  return (typeof x === 'object' && x !== null);
}

export function isUnknownArray(x: unknown): x is unknown[] {
  return Array.isArray(x);
}

export function getRecordValueOr<K extends PropertyKey, V, D>(record: Record<K, V>, key: K, defaultValue: D): V | D {
  return Object.prototype.hasOwnProperty.call(record, key) ? record[key] : defaultValue;
}

export function getRecordValue<K extends PropertyKey, V>(record: Record<K, V>, key: K): V | undefined {
  return getRecordValueOr(record, key, undefined);
}


// URL

export function getURL(path: string): URL {
  return new URL(path, location.href);
}

export function getPathName(path: string): string {
  return getURL(path).pathname;
}

export function getPageUrl(path: string): string {
  const url = getURL(path);
  return url.origin + url.pathname + url.search;
}


// Filename

export function separateFileName(url: string): [string, string] {
  const index = url.lastIndexOf('/');
  const path = url.substring(0, index);
  const fileName = url.substring(index + 1);
  return [path, fileName];
}

export function getFileName(url: string): string {
  return separateFileName(url)[1];
}

export function getFileExtension(fileName: string): string {
  const index = fileName.lastIndexOf('.');
  return (index < 0) ? '' : fileName.substring(index + 1);
}


// Prefix / Suffix

function removePrefixOr<T>(text: string, prefix: string, notFound: T): string | T {
  return text.startsWith(prefix) ? text.substring(prefix.length) : notFound;
}

export function removePrefix(text: string, prefix: string): string {
  return removePrefixOr(text, prefix, text);
}

export function checkAndRemovePrefix(text: string, prefix: string): string | undefined {
  return removePrefixOr(text, prefix, undefined);
}

function removeSuffixOr<T>(text: string, suffix: string, notFound: T): string | T {
  return text.endsWith(suffix) ? text.substring(0, text.length - suffix.length) : notFound;
}

export function removeSuffix(text: string, suffix: string): string {
  return removeSuffixOr(text, suffix, text);
}

export function checkAndRemoveSuffix(text: string, suffix: string): string | undefined {
  return removeSuffixOr(text, suffix, undefined);
}


// HTML

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function unescapeHtml(html: string): string {
  const doc = new DOMParser().parseFromString('<!DOCTYPE html><body>' + html, 'text/html');
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return doc.body.textContent!; // 'textContent' of 'body' is not null
}


// Text

export function capitalizeFirstLetter(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function truncateChars(text: string, length: number): string {
  const ellipsis = '...';
  const textChars = [...text];
  if(textChars.length > length + ellipsis.length)
    return textChars.slice(0, length).join('') + ellipsis;
  else
    return text;
}

export function truncateLines(text: string, length: number): string {
  const ellipsis = '...';
  const textLines = text.split(/\n|\r\n?/g);
  if(textLines.length > length + 1)
    return textLines.slice(0, length).concat(ellipsis).join('\n');
  else
    return text;
}


// Color

export function fontColor(backgroundColor: string): string {
  const r = backgroundColor.substring(0, 2);
  const g = backgroundColor.substring(2, 4);
  const b = backgroundColor.substring(4, 6);

  if(parseInt(r, 16) + parseInt(g, 16) + parseInt(b, 16) > 408)
    return '000000';
  else
    return 'ffffff';
}
