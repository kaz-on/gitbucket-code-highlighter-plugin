// Mapping from file names to highlight.js language names
export const fileNameMap: Record<string, string> = {
  // Keys and values must not contain any uppercase letters
  "changelog": "plaintext",
  "cmakelists.txt": "cmake",
  "copying": "plaintext",
  "dockerfile": "dockerfile",
  "gemfile": "ruby",
  "httpd.conf": "apache",
  "license": "plaintext",
  "makefile": "makefile",
  "nginx.conf": "nginx",
  "pf.conf": "pf",
  "rakefile": "ruby",
  "readme": "plaintext"
};

// Mapping from language names (file extensions, etc.) to highlight.js language names
export const langNameMap: Record<string, string> = {
  // Keys and values must not contain any uppercase letters
  "gitattributes": "plaintext",
  "gitignore": "plaintext",
  "hgignore": "plaintext",
  "npmignore": "plaintext",
  "htm": "html",
  "sbt": "scala",
  "sdc": "tcl",
  "vhd": "vhdl",
  "xdc": "tcl"
};
