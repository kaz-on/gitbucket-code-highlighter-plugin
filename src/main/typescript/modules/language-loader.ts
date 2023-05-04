import {getPathName, getFileName, getRecordValue, getFileExtension} from './helpers';
import {HljsLangID, hljsLangAliasMap, hljsSubLangMap} from './generated/hljs-lang-alias-map';
import {fileNameMap, langNameMap} from './language-map';


// highlight.js
import hljs from 'highlight.js/lib/core';
export {hljs};


// Global flags
const prioritizeFileName = true; // Give priority to file names over language names
const autoDetectWhenNoLanguage = true; // Auto-detection when no language is specified
const autoDetectWhenNoExtension = true; // Auto-detection for files with no extension
const autoDetectWhenUnknownLanguage = true; // Auto-detection when unknown language


//
// Dynamic Synchronous Highlight.js Language Loader
//

function loadHljsLanguageSync(langId: HljsLangID): void {
  const pathName = getPathName(`${codeHighlighterHljsPath}/languages/${langId}.min.js`);

  const xhr = new XMLHttpRequest();
  xhr.open('GET', pathName, false);
  xhr.send();
  if(xhr.readyState === xhr.DONE && xhr.status === 200) {
    Function('hljs', '"use strict";' + xhr.responseText)(hljs);
  }
}


//
// Language Loader
//

function autoDetect(code: string, enable: boolean): HljsLangID | HljsLangID[] {
  // Auto-detection in Hightlight.js often takes a long time,
  // so use the plugin's own auto-detection

  if(!enable) {
    return 'plaintext';
  }

  if(code.startsWith('<')) {
    return 'xml';
  }

  if(code.startsWith('{')) {
    return 'json';
  }

  return [
    'bash',
    'ini',
    'javascript',
  ];
}

function getLanguageId(code: string, langName: string | undefined, fileNameOrUrl: string | undefined): HljsLangID | HljsLangID[] {
  const useFileName = prioritizeFileName || !langName;

  if(useFileName && fileNameOrUrl) {
    let fileName = getFileName(fileNameOrUrl);

    console.info(`Code Highlighter: Detected file name '${fileName}'`)

    fileName = fileName.toLowerCase();

    const langId = getRecordValue(fileNameMap, fileName);
    if(langId) {
      return langId;
    }

    langName = getFileExtension(fileName);
    if(!langName) {
      return autoDetect(code, autoDetectWhenNoExtension);
    }
  }

  if(!langName) {
    return autoDetect(code, autoDetectWhenNoLanguage);
  }

  console.info(`Code Highlighter: Detected language name '${langName}'`)

  langName = langName.toLowerCase();

  const langId = getRecordValue(langNameMap, langName) ?? getRecordValue(hljsLangAliasMap, langName);
  if(langId) {
    return langId;
  }

  return autoDetect(code, autoDetectWhenUnknownLanguage);
}

function loadLanguageWithSubLang(langId: HljsLangID): void {
  if(hljs.getLanguage(langId)) {
    return;
  }

  console.info(`Code Highlighter: Loading language '${langId}'`);
  loadHljsLanguageSync(langId);

  if(!hljs.getLanguage(langId)) {
    console.error(`Code Highlighter: Failed to load language '${langId}'`);
    return;
  }

  const subLangs = getRecordValue(hljsSubLangMap, langId);
  if(subLangs) {
    for(const subLang of subLangs) {
      console.info(`Code Highlighter: Detected sub-language ID '${subLang}'`);
      loadLanguageWithSubLang(subLang);
    }
  }
}


//
// Language Class
//

export class Language {
  public readonly id: HljsLangID | HljsLangID[];

  constructor(code:string, langName?: string, fileNameOrUrl?: string) {
    this.id = getLanguageId(code, langName, fileNameOrUrl);
    this.apply(id =>
      console.info(`Code Highlighter: Detected language ID '${id}'`)
    );
  }

  load(): void {
    this.apply(loadLanguageWithSubLang);
  }

  private apply(func: (id: HljsLangID) => void): void {
    const ids = Array.isArray(this.id) ? this.id : [this.id];
    ids.forEach(func);
  }
}
