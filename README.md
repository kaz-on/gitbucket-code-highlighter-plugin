# GitBucket Code Highlighter Plugin

This is a [GitBucket](https://gitbucket.github.io/) plugin that enhances code syntax highlighting with [highlight.js](https://highlightjs.org/).


## Features

* Code syntax highlighting with automatic language detection using [highlight.js](https://highlightjs.org/).  
  Check out the [highlight.js demo](https://highlightjs.org/static/demo/) page.
* Language detection from file name in blob view.
* (GitBucket 4.35.0 or later) All themes included in highlight.js can be selected in the account settings.  
  ⚠️ The following themes will become unavailable after installing this plugin.
  - `Hemisu Dark`, `Hemisu Light`, `Vibrant Ink`


## Installation

Download jar file from the [Releases page](https://github.com/kaz-on/gitbucket-code-highlighter-plugin/releases) and put into `GITBUCKET_HOME/plugins`.


## Operating requirements

* GitBucket 4.32.0 or later.
* Web browsers that support ES2016 features.  
  The latest version of Chrome or Firefox is recommended.


## Build from source

1. Install Node.js, npm, sbt, and JDK 8
2. Clone this repository
3. Run `npm ci`
4. Run `sbt assembly`
