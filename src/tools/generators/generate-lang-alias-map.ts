//
// Generate mappings from highlight.js language IDs or aliases to language IDs
//


import hljs from 'highlight.js';


function listLanguageIdTypes(): string {
  return hljs.listLanguages().map(x => `  "${x}"`).join(' |\n');
}


class LanguageAliasMap {
  private readonly langMap: Record<string, string | string[]>;

  constructor() {
    this.langMap = Object.create(null);
    this.addLanguages();
  }

  public toString(): string {
    return JSON.stringify(this.langMap, null, 2);
  }

  private addLanguages(): void {
    const languages = hljs.listLanguages();
    languages.sort();

    for(const langId of languages) {
      this.addLanguageAliases(langId);
    }
  }

  private addLanguageAliases(langId: string): void {
    const langObj = hljs.getLanguage(langId);
    if(!langObj) {
      return;
    }

    // Set the language ID as an alias
    this.addAlias(langId, langId);

    if(!langObj.aliases) {
      return;
    }

    const aliases = langObj.aliases;
    aliases.sort();

    for(const alias of aliases) {
      this.addAlias(langId, alias);
    }
  }

  private addAlias(langId: string, alias: string): void {
    const aliasLower = alias.toLowerCase();
    const existingLangId = this.langMap[aliasLower];
    if(existingLangId && existingLangId !== langId) {
      process.stderr.write(`Duplicate language alias '${alias}'\n`);
      if(Array.isArray(existingLangId)) {
        existingLangId.push(langId);
      } else {
        this.langMap[aliasLower] = [existingLangId, langId];
      }
    } else {
      this.langMap[aliasLower] = langId;
    }
  }
}


type UnknownObject = { [key: string]: unknown };

function isUnknownObject(x: unknown): x is UnknownObject {
  return (typeof x === 'object' && x !== null);
}

function isUnknownArray(x: unknown): x is unknown[] {
  return Array.isArray(x);
}


const propertySearchDepth = 20;

class PropertyStrings {
  public readonly strings: Set<string>;

  constructor(obj: unknown, key: string) {
    this.strings = new Set();
    this.addPropertyStrings(obj, key);
  }

  private addPropertyStrings(obj: unknown, key: string, depth?: number): void {
    depth = (typeof depth === 'number') ? depth + 1 : 0;
    if(depth > propertySearchDepth) {
      return;
    }

    if(isUnknownArray(obj)) {
      this.addPropertyArray(obj, key, depth);
    } else if(isUnknownObject(obj)) {
      this.addPropertyObj(obj, key, depth);
    }
  }

  private addPropertyArray(arr: unknown[], key: string, depth: number): void {
    for(const elem of arr) {
      this.addPropertyStrings(elem, key, depth);
    }
  }

  private addPropertyObj(obj: UnknownObject, key: string, depth: number): void {
    const properties = Object.getOwnPropertyNames(obj);
    for(const property of properties) {
      if(property === key) {
        this.addStrings(obj[property]);
      } else {
        this.addPropertyStrings(obj[property], key, depth);
      }
    }
  }

  private addStrings(value: unknown | unknown[]): void {
    const array = isUnknownArray(value) ? value : [value];
    for(const elem of array) {
      if(typeof elem === 'string') {
        this.strings.add(elem);
      }
    }
  }
}


class SubLanguageMap {
  private readonly subLangMap: Record<string, string[]>;

  constructor() {
    this.subLangMap = Object.create(null);
    this.addSubLanguages('subLanguage');
  }

  public toString(): string {
    return JSON.stringify(this.subLangMap, null, 2);
  }

  private addSubLanguages(key: string): void {
    const languages = hljs.listLanguages();
    languages.sort();

    for(const langId of languages) {
      const langObj = hljs.getLanguage(langId);
      if(!langObj) {
        continue;
      }
      const props = new PropertyStrings(langObj, key);
      props.strings.delete(langId);
      if(props.strings.size > 0) {
        this.subLangMap[langId] = [...props.strings];
      }
    }
  }
}


const langMap = new LanguageAliasMap();
const subLangMap = new SubLanguageMap();

// Output TypeScript code
process.stdout.write('// ** DO NOT MODIFY **\n');
process.stdout.write('// This file is auto-generated.\n');
process.stdout.write('// To generate this file, type `npm run generate` in a terminal.\n');
process.stdout.write('\n');
process.stdout.write('export type HljsLangID =\n');
process.stdout.write(listLanguageIdTypes());
process.stdout.write(';\n');
process.stdout.write('\n');
process.stdout.write('export const hljsLangAliasMap: Record<string, HljsLangID | HljsLangID[]> = ');
process.stdout.write(langMap.toString());
process.stdout.write(';\n');
process.stdout.write('\n');
process.stdout.write('export const hljsSubLangMap: Record<string, HljsLangID[]> = ');
process.stdout.write(subLangMap.toString());
process.stdout.write(';\n');
