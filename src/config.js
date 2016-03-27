System.config({
  baseURL: "/",
  defaultJSExtensions: true,
  // transpiler: "typescript",
  // babelOptions: {
  //   "optional": [
  //     "runtime",
  //     "optimisation.modules.system"
  //   ]
  // },
  paths: {
    "npm:*": "jspm_packages/npm/*",
    "github:*": "jspm_packages/github/*",
    "app": "/"
  },

  packages: {
    "@angular2-material/core": {
      "format": "cjs",
      "defaultExtension": "js",
      "main": "core.js"
    },
    "@angular2-material/toolbar": {
      "format": "cjs",
      "defaultExtension": "js",
      "main": "toolbar.js"
    },
    "app": {
      "main": "/admin/app/main",
      "format": "cjs",
      "defaultExtension": "js"
    }
  },

  map: {
    "@angular2-material/core": "npm:@angular2-material/core@2.0.0-alpha.1",
    "@angular2-material/toolbar": "npm:@angular2-material/toolbar@2.0.0-alpha.1",
    "angular2": "npm:angular2@2.0.0-beta.12",
    "babel": "npm:babel-core@5.8.38",
    "babel-runtime": "npm:babel-runtime@5.8.38",
    "core-js": "npm:core-js@1.2.6",
    "es6-shim": "npm:es6-shim@0.35.0",
    "reflect-metadata": "npm:reflect-metadata@0.1.2",
    "rxjs": "npm:rxjs@5.0.0-beta.2",
    "zone.js": "npm:zone.js@0.6.6",
    "github:jspm/nodelibs-assert@0.1.0": {
      "assert": "npm:assert@1.3.0"
    },
    "github:jspm/nodelibs-buffer@0.1.0": {
      "buffer": "npm:buffer@3.6.0"
    },
    "github:jspm/nodelibs-path@0.1.0": {
      "path-browserify": "npm:path-browserify@0.0.0"
    },
    "github:jspm/nodelibs-process@0.1.2": {
      "process": "npm:process@0.11.2"
    },
    "github:jspm/nodelibs-util@0.1.0": {
      "util": "npm:util@0.10.3"
    },
    "npm:@angular2-material/core@2.0.0-alpha.1": {
      "angular2": "npm:angular2@2.0.0-beta.12"
    },
    "npm:@angular2-material/toolbar@2.0.0-alpha.1": {
      "angular2": "npm:angular2@2.0.0-beta.12"
    },
    "npm:angular2@2.0.0-beta.12": {
      "reflect-metadata": "npm:reflect-metadata@0.1.3",
      "rxjs": "npm:rxjs@5.0.0-beta.2",
      "zone.js": "npm:zone.js@0.5.15"
    },
    "npm:assert@1.3.0": {
      "util": "npm:util@0.10.3"
    },
    "npm:babel-runtime@5.8.38": {
      "process": "github:jspm/nodelibs-process@0.1.2"
    },
    "npm:buffer@3.6.0": {
      "base64-js": "npm:base64-js@0.0.8",
      "child_process": "github:jspm/nodelibs-child_process@0.1.0",
      "fs": "github:jspm/nodelibs-fs@0.1.2",
      "ieee754": "npm:ieee754@1.1.6",
      "isarray": "npm:isarray@1.0.0",
      "process": "github:jspm/nodelibs-process@0.1.2"
    },
    "npm:core-js@1.2.6": {
      "fs": "github:jspm/nodelibs-fs@0.1.2",
      "path": "github:jspm/nodelibs-path@0.1.0",
      "process": "github:jspm/nodelibs-process@0.1.2",
      "systemjs-json": "github:systemjs/plugin-json@0.1.0"
    },
    "npm:es6-shim@0.35.0": {
      "process": "github:jspm/nodelibs-process@0.1.2"
    },
    "npm:inherits@2.0.1": {
      "util": "github:jspm/nodelibs-util@0.1.0"
    },
    "npm:path-browserify@0.0.0": {
      "process": "github:jspm/nodelibs-process@0.1.2"
    },
    "npm:process@0.11.2": {
      "assert": "github:jspm/nodelibs-assert@0.1.0"
    },
    "npm:reflect-metadata@0.1.2": {
      "assert": "github:jspm/nodelibs-assert@0.1.0",
      "process": "github:jspm/nodelibs-process@0.1.2"
    },
    "npm:rxjs@5.0.0-beta.2": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.0",
      "process": "github:jspm/nodelibs-process@0.1.2"
    },
    "npm:util@0.10.3": {
      "inherits": "npm:inherits@2.0.1",
      "process": "github:jspm/nodelibs-process@0.1.2"
    },
    "npm:zone.js@0.6.6": {
      "process": "github:jspm/nodelibs-process@0.1.2"
    }
  }
});
