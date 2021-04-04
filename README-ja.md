# GitBucket Code Highlighter Plugin

[highlight.js](https://highlightjs.org/) を使用して [GitBucket](https://gitbucket.github.io/) のシンタックスハイライトを強化するプラグインです。

![highlighting](screenshots/highlighting.png)


## 特徴

* [highlight.js](https://highlightjs.org/) による自動言語検出付きのコード構文強調表示。  
  highlight.js が対応する全ての言語が利用できます。  
  対応言語は [highlight.js のデモページ](https://highlightjs.org/static/demo/) をご覧ください。
* blob 表示ではファイル名から言語検出を行います。
* (GitBucket 4.35.0 以降) アカウント設定で highlight.js に含まれるすべてのテーマを選択できます。  
  ⚠️ 以下のテーマはこのプラグインのインストール後に利用できなくなります。
  - `Hemisu Dark`, `Hemisu Light`, `Vibrant Ink`


## インストール

[リリースページ](https://github.com/kaz-on/gitbucket-code-highlighter-plugin/releases) から jar ファイルをダウンロードして `GITBUCKET_HOME/plugins` に置いてください。


## 動作要件

* GitBucket 4.32.0 以降
* ES2016 に対応した Web ブラウザ  
  最新版の Chrome または Firefox を推奨します。


## ビルド手順

1. Install Node.js, npm, sbt, and JDK 8
2. Clone this repository
3. Run `npm ci`
4. Run `sbt assembly`
