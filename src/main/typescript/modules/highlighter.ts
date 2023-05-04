import {removePrefix, unescapeHtml} from './helpers';
import {hljs, Language} from './language-loader';


// Original prettyPrint function
let originalPrettyPrint: typeof prettyPrint;


//
// HTML Line by Line Splitter
//

function splitHtmlTagsLineByLine(html: string): string[] {
  const openedTags: string[] = [];
  const closingTags: string[] = [];

  let index = 0;
  let unclosedTags = '';
  const lines: string[] = [];

  const re = new RegExp(/<\/?(\w+)[^>]*>|\n|\r\n?/g);
  let match;

  while((match = re.exec(html))) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const matched = match[0]!; // 'match[0]' is always defined

    if(matched.charAt(0) === '<') {
      if(matched.charAt(1) === '/') {
        // Closing tag
        console.assert(closingTags.length > 0, 'splitHtmlTagsLineByLine: Too many closing tags');
        openedTags.pop();
        closingTags.shift();
      }
      else {
        // Opening tag
        openedTags.push(matched);
        closingTags.unshift(`</${match[1]}>`);
      }
    }
    else {
      // End of the line
      lines.push(unclosedTags + html.substring(index, match.index) + closingTags.join(''));
      index = re.lastIndex;
      unclosedTags = openedTags.join('');
    }
  }

  // Last line
  lines.push(unclosedTags + html.substring(index));

  console.assert(closingTags.length === 0, 'splitHtmlTagsLineByLine: Too few closing tags');

  return lines;
}


//
// Line Number Class
//

class LineNumber {
  public readonly enable: boolean;
  public readonly start: number;

  constructor(numLines?: number | boolean) {
    if(typeof numLines === 'number') {
      this.enable = true;
      this.start = numLines;
    }
    else {
      this.enable = !!numLines;
      this.start = 1;
    }
  }
}


//
// Highlighter Core
//

function hljsHighlight(code: string, lang: Language): string {
  lang.load();

  try {
    let result;
    let type;
    if(Array.isArray(lang.id)) {
      result = hljs.highlightAuto(code, lang.id);
      type = 'Auto-highlighted';
    }
    else {
      result = hljs.highlight(code, {
        language: lang.id,
        ignoreIllegals: true
      });
      type = 'Highlighted';
    }
    const langName = result.language ?? 'plaintext';
    console.info(`Code Highlighter: ${type} language ID '${langName}'`);
    return result.value;
  }
  catch(err) {
    if(err instanceof Error) {
      console.error(`Code Highlighter: ${err.message}`);
    }
    return code;
  }
}

function addHighlightRelatedTags(code: string, lineNum: LineNumber, avoidSpan?: boolean): string {
  if(avoidSpan) {
    // Replace 'span' tags with 'div' tags because GitBucket doesn't like
    // nested 'span' tags when processing code comments in the diff view
    code = code.replace(/<(\/?)span\b/g, '<$1div');
  }

  // Wrapping the code in 'hljs' class
  code = `<span class="hljs">${code}</span>`;

  if(!lineNum.enable) {
    return code;
  }

  // Split HTML tags
  const lines = splitHtmlTagsLineByLine(code);

  // Add 'ol' and 'li' tags (Imitate google-code-prettify)

  code = lines.reduce( (prevLine, currLine, index) => {
    const lineValue = (lineNum.start !== 1 && index === 0) ? `value="${lineNum.start}"` : '';
    return prevLine + `<li id="L${index + 1}" class="L${index % 10}" ${lineValue}>${currLine}</li>`;
  }, '');

  return `<ol class="linenums">${code}</ol>`;
}

function doHighlight(code: string, lang: Language, lineNum: LineNumber, avoidSpan?: boolean): string {
  // Apply highlighting
  code = hljsHighlight(code, lang);

  return addHighlightRelatedTags(code, lineNum, avoidSpan);
}


//
// Language Detector
//

function detectLanguage(elem: HTMLElement): string | undefined {
  // Get the language from the class name
  return elem.className.match(/\blang(?:uage)?-([^\s:]+)/)?.[1];
}

function detectFileNameOrUrl(elem: HTMLElement): string | undefined {
  // Get the filename from the class name
  // * This behavior is currently disabled
  //const match = elem.className.match(/\blang(?:uage)?-[^\s:]*:(\S+)/);
  //if(match) {
  //  return match[1];
  //}

  // Get the filename from dataset
  const fileNameOrUrl = elem.dataset['filename'] ?? elem.dataset['fileName'];
  if(fileNameOrUrl) {
    return fileNameOrUrl;
  }

  // In the blob view, get the filename from the pathname
  if(elem.classList.contains('blob')) {
    return decodeURIComponent(location.pathname);
  }

  return; // undefined
}

function detectLanguageId(code: string, elem: HTMLElement): Language {
  return new Language(code, detectLanguage(elem), detectFileNameOrUrl(elem));
}


//
// Line Number Detector
//

function detectLineNumber(elem: HTMLElement): LineNumber {
  // Get line number from the class name
  const lineNumsMatch = elem.className.match(/\blinenums\b(?::(\d+))?/);
  if(lineNumsMatch?.[1]) {
    return new LineNumber(+lineNumsMatch[1]);
  }
  return new LineNumber(lineNumsMatch ? true : false);
}


//
// Code Block Highlighter
//

function highlightElement(elem: HTMLElement): void {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const code = elem.textContent!; // 'textContent' of 'Element' is not null
  elem.innerHTML = doHighlight(code, detectLanguageId(code, elem), detectLineNumber(elem));
  elem.classList.add('prettyprinted', 'hljs'); // Prevent re-highlighting and apply highlight.js themes
}

function highlightCodeBlocks(root: HTMLElement | Document): void {
  const isSearchResults = document.querySelector('form input[type="submit"][value="Search"]');
  if(isSearchResults) {
    // If it is a search results page, call original prettyPrint function
    // This is to preserve HTML tags and perform loose auto-detection
    originalPrettyPrint(undefined, root);
  }
  else {
    const codeBlocks = root.querySelectorAll<HTMLPreElement>('pre.prettyprint:not(.prettyprinted)');
    for(const codeBlock of codeBlocks) {
      highlightElement(codeBlock);
    }
  }
}


//
// Override Google Code Prettify Functions
//

function overrideFunctions(): void {
  prettyPrintOne = (sourceCodeHtml: string, opt_langExtension?: string, opt_numberLines?: number | boolean): string => {
    // Cancel adding a leading newline in gitbucket.js
    sourceCodeHtml = removePrefix(sourceCodeHtml, '\n');
    // Cancel HTML-encoding in gitbucket.js
    sourceCodeHtml = unescapeHtml(sourceCodeHtml);

    return doHighlight(sourceCodeHtml, new Language(sourceCodeHtml, opt_langExtension), new LineNumber(opt_numberLines), true);
  }

  originalPrettyPrint = prettyPrint;

  prettyPrint = (opt_whenDone?: () => void, opt_root?: HTMLElement | Document): void => {
    const root = opt_root || document;
    highlightCodeBlocks(root);

    if(opt_whenDone) {
      opt_whenDone();
    }
  }
}


//
// Export
//

export function initializeHighlighting(): void {
  overrideFunctions();

  // Perform highlighting in the initialization process
  // This is because in Firefox, Gitbucket's 'updateHighlighting' function is called before 'prettyPrint' function is called
  highlightCodeBlocks(document);
}
