//
// Generate highlight.js color theme list
//


import fs = require('fs');
import path = require('path');


class FileList {
  public readonly files: string[];

  constructor(dirPath: string, filterRegExp?: RegExp) {
    this.files = [];
    this.listFiles(dirPath, '', filterRegExp);
    this.files.sort();
  }

  toString(): string {
    return JSON.stringify(this.files, null, 2);
  }

  private listFiles(dirPath: string, subPath: string, filterRegExp: RegExp | undefined): void {
    const dirents = fs.readdirSync(dirPath, {withFileTypes: true});
    for(const dirent of dirents) {
      if(dirent.isFile()) {
        const fileName = FileList.filterFile(dirent.name, filterRegExp);
        if(fileName) {
          this.files.push(subPath + fileName);
        }
      }
      if(dirent.isDirectory()) {
        const subDir = subPath + dirent.name + '/';
        this.listFiles(dirPath + subDir, subDir, filterRegExp);
      }
    }
  }

  private static filterFile(fileName: string, filterRegExp: RegExp | undefined): string | undefined {
    if(!filterRegExp) {
      return fileName;
    }

    const match = fileName.match(filterRegExp);
    if(!match) {
      return; // undefined
    }

    return match[1] ?? fileName;
  }
}


const hljsCdnAssets = require.resolve('@highlightjs/cdn-assets/highlight.js');
const themePath = path.dirname(hljsCdnAssets) + '/styles/';
const themeFiles = new FileList(themePath, /^(.+?)\.min\.css$/);

// Output TypeScript code
process.stdout.write('// ** DO NOT MODIFY **\n');
process.stdout.write('// This file is auto-generated.\n');
process.stdout.write('// To generate this file, type `npm run generate` in a terminal.\n');
process.stdout.write('\n');
process.stdout.write('export const hljsThemeList: string[] = ');
process.stdout.write(themeFiles.toString());
process.stdout.write(';');
