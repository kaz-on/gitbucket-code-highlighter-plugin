import {hljsThemeList} from './generated/hljs-theme-list';
import pluginCssText from '../../styles/css/code-highlighter.css';


// Global variables
const defaultThemeHLjs = 'github'; // Default theme of highlight.js
const defaultThemeGCP = 'github-v2'; // Default theme of google-code-prettify


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

function addCssText(cssText: string): void {
  const styleElem = document.createElement('style');
  styleElem.textContent = cssText;
  addCssElement(styleElem);
}

function addCssLink(url: string): void {
  const linkElem = document.createElement('link');
  linkElem.rel = 'stylesheet';
  linkElem.href = url;
  addCssElement(linkElem);
}

function changeCssLink(path: string, fileName: string): void {
  const url = path + fileName;
  const linkElem = document.querySelector<HTMLLinkElement>(`link[rel="stylesheet"][href^="${path}"]`);
  if(linkElem) {
    linkElem.href = url;
  } else {
    addCssLink(url);
  }
}


//
// Color Theme Loader
//

class Theme {
  public readonly name: string;

  constructor(themeName?: string) {
    this.name =
      (themeName && hljsThemeList.includes(themeName)) ? themeName : defaultThemeHLjs;
  }

  loadTheme(): void {
    changeCssLink(`${codeHighlighterAssetsPath}/highlightjs/styles/`, `${this.name}.min.css`);
  }
}

class PageTheme extends Theme {
  constructor() {
    super(PageTheme.getName());
  }

  private static getName(): string | undefined {
    const linkElem = document.querySelector<HTMLLinkElement>('link[rel="stylesheet"][href*="/color-themes-for-google-code-prettify/"]');
    const match = linkElem?.href.match(/\/color-themes-for-google-code-prettify\/([^.]+)\.min\.css/);
    return match?.[1];
  }
}


//
// Theme Selector Patcher
//

function initializeThemeSelector(pageTheme: PageTheme): void {
  // Get the 'select' element of the theme selector if it exists
  const selectElem = document.querySelector<HTMLSelectElement>('select#highlighterTheme');
  if(!selectElem) {
    return;
  }

  // Remove existing themes
  selectElem.textContent = '';

  // Add all themes included in highlight.js
  for(const hljsTheme of hljsThemeList) {
    const optionElem = document.createElement('option');
    optionElem.value = (hljsTheme === defaultThemeHLjs) ? defaultThemeGCP : hljsTheme;
    optionElem.text = 'highlight.js :' +
      hljsTheme.replace(/(?:^|[-/])(.)/g, (_, lead: string) => ' ' + lead.toUpperCase());
    optionElem.selected = (hljsTheme === pageTheme.name);
    selectElem.appendChild(optionElem);
  }

  // Register an event listener
  selectElem.addEventListener('change', function() {
    const selectedTheme = new Theme(this.value);
    selectedTheme.loadTheme();
  });

  // Add language class for better preview
  const preElem = document.querySelector('pre.prettyprint');
  preElem?.classList.add('lang-cs');
}


//
// Export
//

export function initializeTheme(): void {
  addCssText(pluginCssText);

  const pageTheme = new PageTheme();
  pageTheme.loadTheme();

  initializeThemeSelector(pageTheme);
}
