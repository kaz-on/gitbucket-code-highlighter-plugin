//
// Dynamic CSS Loader
//

function addCssElement(elem: HTMLLinkElement | HTMLStyleElement): void {
  // Insert a link element before the style element in the document head
  // When there is no style element in the head, it is inserted at the end of the head
  // This enables overrides with user-defined CSS
  const styleElem = document.head.querySelector<HTMLStyleElement>('style[type="text/css"]');
  document.head.insertBefore(elem, styleElem);
}

export function addCssText(cssText: string): void {
  const styleElem = document.createElement('style');
  styleElem.textContent = cssText;
  addCssElement(styleElem);
}

export function addCssLink(url: string): void {
  const linkElem = document.createElement('link');
  linkElem.rel = 'stylesheet';
  linkElem.href = url;
  addCssElement(linkElem);
}

export function changeCssLink(path: string, fileName: string): void {
  const url = path + fileName;
  const linkElem = document.querySelector<HTMLLinkElement>(`link[rel="stylesheet"][href^="${path}"]`);
  if(linkElem) {
    linkElem.href = url;
  } else {
    addCssLink(url);
  }
}
