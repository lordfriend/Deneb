/**
 * @author: @AngularClass
 */
/**
 The MIT License (MIT)

 Copyright (c) 2015-2016 AngularClass LLC

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.
 */

var helpers = require('./helpers');
var webpackMerge = require('webpack-merge'); //Used to merge webpack configs
var commonConfig = require('./webpack.common.js'); //The settings that are common to prod and dev

/**
 * Webpack Plugins
 */
var DefinePlugin = require('webpack/lib/DefinePlugin');

/**
 * Webpack Constants
 */
const ENV = process.env.ENV = process.env.NODE_ENV = 'development';
const HMR = helpers.hasProcessFlag('hot');
const METADATA = webpackMerge(commonConfig({env: ENV}).metadata, {
  host: '0.0.0.0',
  port: 3000,
  ENV: ENV,
  HMR: HMR
});

var PROXY_SETTINGS;
try {
  PROXY_SETTINGS = require('./dev.proxy');
} catch(e) {
  PROXY_SETTINGS = {
    '/api/*': {
      target: 'http://localhost:5000'
    },
    '/pic/*': {
      target: 'http://localhost:8000'
    },
    '/video/*': {
      target: 'http://localhost:8000'
    }
  };

  console.log(e);
}


/**
 * Webpack configuration
 *
 * See: http://webpack.github.io/docs/configuration.html#cli
 */
module.exports = function(options) {
  return webpackMerge(commonConfig({env: ENV}), {
    // Switch loaders to debug mode.
    //
    // See: http://webpack.github.io/docs/configuration.html#debug
    debug: true,

    // Developer tool to enhance debugging
    //
    // See: http://webpack.github.io/docs/configuration.html#devtool
    // See: https://github.com/webpack/docs/wiki/build-performance#sourcemaps
    devtool: 'source-map',

    // Options affecting the output of the compilation.
    //
    // See: http://webpack.github.io/docs/configuration.html#output
    output: {

      // The output directory as absolute path (required).
      //
      // See: http://webpack.github.io/docs/configuration.html#output-path
      path: helpers.root('dist'),

      // Specifies the name of each output file on disk.
      // IMPORTANT: You must not specify an absolute path here!
      //
      // See: http://webpack.github.io/docs/configuration.html#output-filename
      filename: '[name].bundle.js',

      // The filename of the SourceMaps for the JavaScript files.
      // They are inside the output.path directory.
      //
      // See: http://webpack.github.io/docs/configuration.html#output-sourcemapfilename
      sourceMapFilename: '[name].map',

      // The filename of non-entry chunks as relative path
      // inside the output.path directory.
      //
      // See: http://webpack.github.io/docs/configuration.html#output-chunkfilename
      chunkFilename: '[id].chunk.js',

      // library: 'ac_[name]',
      // libraryTarget: 'var',
    },

    plugins: [
      // Plugin: DefinePlugin
      // Description: Define free variables.
      // Useful for having development builds with debug logging or adding global constants.
      //
      // Environment helpers
      //
      // See: https://webpack.github.io/docs/list-of-plugins.html#defineplugin
      // NOTE: when adding more properties make sure you include them in custom-typings.d.ts
      new DefinePlugin({
        'ENV': JSON.stringify(METADATA.ENV),
        'HMR': METADATA.HMR,
        'SITE_TITLE': JSON.stringify(METADATA.title)
      }),
    ],

    // Static analysis linter for TypeScript advanced options configuration
    // Description: An extensible linter for the TypeScript language.
    //
    // See: https://github.com/wbuchwalter/tslint-loader
    tslint: {
      emitErrors: false,
      failOnHint: false,
      resourcePath: 'src'
    },

    // Webpack Development Server configuration
    // Description: The webpack-dev-server is a little node.js Express server.
    // The server emits information about the compilation state to the client,
    // which reacts to those events.
    //
    // See: https://webpack.github.io/docs/webpack-dev-server.html
    devServer: {
      port: METADATA.port,
      host: METADATA.host,
      historyApiFallback: true,
      watchOptions: {
        aggregateTimeout: 300,
        poll: 1000
      },
      proxy: PROXY_SETTINGS,
      outputPath: helpers.root('dist')
    },

    node: {
      global: 'window',
      crypto: 'empty',
      process: true,
      module: false,
      clearImmediate: false,
      setImmediate: false
    }
  });
};
