import {addCssText,changeCssLink} from './css-loader';
import {hljsThemeList} from './generated/hljs-theme-list';
import pluginCssText from '../../styles/css/code-highlighter.css';


// Global variables
const defaultThemeHLjs = 'github'; // Default theme of highlight.js
const defaultThemeGCP = 'github-v2'; // Default theme of google-code-prettify


//
// Color Theme Loader
//

class Theme {
  public readonly name: string;

  constructor(themeName?: string) {
    this.name =
      (themeName && hljsThemeList.includes(themeName)) ? themeName : defaultThemeHLjs;
  }

  load(): void {
    changeCssLink(`${codeHighlighterHljsPath}/styles/`, `${this.name}.min.css`);
  }
}

function getPageThemeName(): string | undefined {
  const linkElem = document.querySelector<HTMLLinkElement>('link[rel="stylesheet"][href*="/color-themes-for-google-code-prettify/"]');
  const match = linkElem?.href.match(/\/color-themes-for-google-code-prettify\/([^.]+)\.min\.css/);
  return match?.[1];
}


//
// Theme Selector Patcher
//

function initializeThemeSelector(pageTheme: Theme): void {
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
    selectedTheme.load();
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

  const pageTheme = new Theme(getPageThemeName());
  pageTheme.load();

  initializeThemeSelector(pageTheme);
}
