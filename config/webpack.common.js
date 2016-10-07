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
var webpack = require('webpack');
var helpers = require('./helpers');
var fs = require('fs');

/**
 * Webpack Plugins
 */
var CopyWebpackPlugin = require('copy-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ForkCheckerPlugin = require('awesome-typescript-loader').ForkCheckerPlugin;
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var ContextReplacementPlugin = require('webpack/lib/ContextReplacementPlugin');

/**
 * check custom login style exists
 */

var loginStyleExsits;
try {
  loginStyleExsits = fs.statSync(helpers.root('src/assets/css/login.css')).isFile();
  console.log('login style file existence: ' + loginStyleExsits);
} catch (e) {
  console.error(e);
  loginStyleExsits = false;
}

/**
 * Webpack Constants
 */
const METADATA = {
  title: 'Deneb',
  baseUrl: '/',
  GA: process.env.GA || '',
  customLoginStyle: loginStyleExsits
};

/**
 * Webpack configuration
 *
 * See: http://webpack.github.io/docs/configuration.html#cli
 */
module.exports = function(options) {
  return {

    // Static metadata for index.html
    //
    // See: (custom attribute)
    metadata: METADATA,

    // Cache generated modules and chunks to improve performance for multiple incremental builds.
    // This is enabled by default in watch mode.
    // You can pass false to disable it.
    //
    // See: http://webpack.github.io/docs/configuration.html#cache
    // cache: false,

    // The entry point for the bundle
    // Our Angular.js app
    //
    // See: http://webpack.github.io/docs/configuration.html#entry
    entry: {

      'polyfills': './src/polyfills.ts',
      'vendor': './src/vendor.ts',
      'main': './src/main.browser.ts',

    },

    // Options affecting the resolving of modules.
    //
    // See: http://webpack.github.io/docs/configuration.html#resolve
    resolve: {

      // An array of extensions that should be used to resolve modules.
      //
      // See: http://webpack.github.io/docs/configuration.html#resolve-extensions
      extensions: ['', '.ts', '.js'],

      // Make sure root is src
      root: [
        helpers.root('src'),
        helpers.root('node_modules')
      ]

    },

    // Options affecting the normal modules.
    //
    // See: http://webpack.github.io/docs/configuration.html#module
    module: {

      // An array of applied pre and post loaders.
      //
      // See: http://webpack.github.io/docs/configuration.html#module-preloaders-module-postloaders
      preLoaders: [
        {
          test: /\.ts$/,
          loader: 'string-replace-loader',
          query: {
            search: '(System|SystemJS)(.*[\\n\\r]\\s*\\.|\\.)import\\((.+)\\)',
            replace: '$1.import($3).then(mod => (mod.__esModule && mod.default) ? mod.default : mod)',
            flags: 'g'
          },
          include: [helpers.root('src')]
        }
      ],

      // An array of automatically applied loaders.
      //
      // IMPORTANT: The loaders here are resolved relative to the resource which they are applied to.
      // This means they are not resolved relative to the configuration file.
      //
      // See: http://webpack.github.io/docs/configuration.html#module-loaders
      loaders: [

        // Typescript loader support for .ts and Angular 2 async routes via .async.ts
        //
        // See: https://github.com/s-panferov/awesome-typescript-loader
        {
          test: /\.ts$/,
          loader: [
            'awesome-typescript-loader',
            'angular2-template-loader'
          ],
          exclude: [/\.(spec|e2e)\.ts$/]
        },

        // Json loader support for *.json files.
        //
        // See: https://github.com/webpack/json-loader
        {
          test: /\.json$/,
          loader: 'json-loader'
        },

        // Raw loader support for *.css files
        // Returns file content as string
        //
        // See: https://github.com/webpack/raw-loader
        {
          test: /\.css$/,
          loader: 'raw-loader'
        },

        // Raw loader support for *.html
        // Returns file content as string
        //
        // See: https://github.com/webpack/raw-loader
        {
          test: /\.html$/,
          loader: 'raw-loader',
          exclude: [helpers.root('src/index.html')]
        },

        // Less loader support for *.less
        // See https://github.com/webpack/less-loader
        {
          test: /ng2-semantic\.less$/,
          loader: ExtractTextPlugin.extract({fallbackLoader: 'style', loader: 'css-loader!less-loader!'})
        },
        {
          test: /\.less$/,
          exclude: /ng2-semantic\.less$/,
          loader: 'style-loader!css-loader!less-loader'
        },
        { test: /\.(png|jpg)$/, loader: 'file?name=images/[name].[hash].[ext]' },
        { test: /\.woff(\?v=\d+\.\d+\.\d+)?$/, loader: 'file?name=fonts/[name].[hash].[ext]&mimetype=application/font-woff'},
        { test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,loader: 'file?name=fonts/[name].[hash].[ext]&mimetype=application/font-woff'},
        { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: 'file?name=fonts/[name].[hash].[ext]&mimetype=application/octet-stream'},
        { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: 'file?name=fonts/[name].[hash].[ext]'},
        { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: 'file?name=images/[name].[hash].[ext]&mimetype=image/svg+xml' }
      ],

      postLoaders: [
        {
          test: /\.js$/,
          loader: 'string-replace-loader',
          query: {
            search: 'var sourceMappingUrl = extractSourceMappingUrl\\(cssText\\);',
            replace: 'var sourceMappingUrl = "";',
            flags: 'g'
          }
        }
      ]

    },

    // Add additional plugins to the compiler.
    //
    // See: http://webpack.github.io/docs/configuration.html#plugins
    plugins: [

      // Plugin: ForkCheckerPlugin
      // Description: Do type checking in a separate process, so webpack don't need to wait.
      //
      // See: https://github.com/s-panferov/awesome-typescript-loader#forkchecker-boolean-defaultfalse
      new ForkCheckerPlugin(),

      // Plugin: CommonsChunkPlugin
      // Description: Shares common code between the pages.
      // It identifies common modules and put them into a commons chunk.
      //
      // See: https://webpack.github.io/docs/list-of-plugins.html#commonschunkplugin
      // See: https://github.com/webpack/docs/wiki/optimization#multi-page-app
      new webpack.optimize.CommonsChunkPlugin({
        name: ['polyfills', 'vendor'].reverse()
      }),

      /**
       * Plugin: ContextReplacementPlugin
       * Description: Provides context to Angular's use of System.import
       *
       * See: https://webpack.github.io/docs/list-of-plugins.html#contextreplacementplugin
       * See: https://github.com/angular/angular/issues/11580
       */
      new ContextReplacementPlugin(
        // The (\\|\/) piece accounts for path separators in *nix and Windows
        /angular(\\|\/)core(\\|\/)(esm(\\|\/)src|src)(\\|\/)linker/,
        helpers.root('src') // location of your src
      ),

      // Plugin: CopyWebpackPlugin
      // Description: Copy files and directories in webpack.
      //
      // Copies project static assets.
      //
      // See: https://www.npmjs.com/package/copy-webpack-plugin
      new CopyWebpackPlugin([{
        from: 'src/assets',
        to: 'assets'
      }]),

      // Plugin: HtmlWebpackPlugin
      // Description: Simplifies creation of HTML files to serve your webpack bundles.
      // This is especially useful for webpack bundles that include a hash in the filename
      // which changes every compilation.
      //
      // See: https://github.com/ampedandwired/html-webpack-plugin
      new HtmlWebpackPlugin({
        template: 'src/index.html',
        chunksSortMode: 'dependency'
      }),

      new ExtractTextPlugin({
        filename: '[name].[hash].css',
        disable: false,
        allChunks: true
      })

    ],

    // Include polyfills or mocks for various node stuff
    // Description: Node configuration
    //
    // See: https://webpack.github.io/docs/configuration.html#node
    node: {
      global: 'window',
      crypto: 'empty',
      module: false,
      clearImmediate: false,
      setImmediate: false
    },
  };
};
