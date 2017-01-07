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
var NormalModuleReplacementPlugin = require('webpack/lib/NormalModuleReplacementPlugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ForkCheckerPlugin = require('awesome-typescript-loader').ForkCheckerPlugin;
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var ContextReplacementPlugin = require('webpack/lib/ContextReplacementPlugin');

/**
 * Webpack configuration
 *
 * See: http://webpack.github.io/docs/configuration.html#cli
 */
module.exports = function (metadata) {
  return {

    // Static metadata for index.html
    //
    // See: (custom attribute)
    // metadata: METADATA,

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
      extensions: ['.ts', '.js'],

      // Make sure root is src
      modules: [
        helpers.root('src'),
        helpers.root('node_modules')
      ]

    },
    module: {
      rules: [

        // Typescript loader support for .ts and Angular 2 async routes via .async.ts
        //
        // See: https://github.com/s-panferov/awesome-typescript-loader
        {
          test: /\.ts$/,
          use: [
            'awesome-typescript-loader?{configFileName: "tsconfig.webpack.json"}',
            'angular2-template-loader',
            {
              loader: 'ng-router-loader',
              options: {
                loader: 'async-system',
                genDir: '.',
                aot: false // TODO: add flag based option
              }
            }
          ],
          exclude: [/\.(spec|e2e)\.ts$/]
        },
        // Raw loader support for *.css files
        // Returns file content as string
        //
        // See: https://github.com/webpack/raw-loader
        {
          test: /\.css$/,
          use: 'raw-loader'
        },

        // Raw loader support for *.html
        // Returns file content as string
        //
        // See: https://github.com/webpack/raw-loader
        {
          test: /\.html$/,
          use: 'raw-loader',
          exclude: [helpers.root('src/index.html')]
        },

        // Less loader support for *.less
        // See https://github.com/webpack/less-loader
        {
          test: /ng2-semantic\.less$/,
          loader: ExtractTextPlugin.extract({
            fallbackLoader: 'style-loader',
            loader: [
              'css-loader',
              'less-loader'
            ]
          })
        },
        {
          test: /\.less$/,
          exclude: /ng2-semantic\.less$/,
          use: [
            'style-loader',
            'css-loader',
            'less-loader'
          ]
        },
        {
          test: /\.(png|jpg)$/,
          use: 'file-loader?name=images/[name].[hash].[ext]'
        },
        {
          test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
          use: 'file-loader?name=fonts/[name].[hash].[ext]&mimetype=application/font-woff'
        },
        {
          test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
          use: 'file-loader?name=fonts/[name].[hash].[ext]&mimetype=application/font-woff'
        },
        {
          test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
          use: 'file-loader?name=fonts/[name].[hash].[ext]&mimetype=application/octet-stream'
        },
        {
          test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
          use: 'file-loader?name=fonts/[name].[hash].[ext]'
        },
        {
          test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
          use: 'file-loader?name=images/[name].[hash].[ext]&mimetype=image/svg+xml'
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
        helpers.root('src'), // location of your src
        {
          // your Angular Async Route paths relative to this root directory
        }
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
        title: metadata.TITLE,
        chunksSortMode: 'dependency',
        metadata: metadata,
        inject: 'body'
      }),

      new ExtractTextPlugin({
        filename: '[name].[hash].css',
        disable: false,
        allChunks: true
      }),
      // Fix Angular 2
      new NormalModuleReplacementPlugin(
        /facade(\\|\/)async/,
        helpers.root('node_modules/@angular/core/src/facade/async.js')
      ),
      new NormalModuleReplacementPlugin(
        /facade(\\|\/)collection/,
        helpers.root('node_modules/@angular/core/src/facade/collection.js')
      ),
      new NormalModuleReplacementPlugin(
        /facade(\\|\/)errors/,
        helpers.root('node_modules/@angular/core/src/facade/errors.js')
      ),
      new NormalModuleReplacementPlugin(
        /facade(\\|\/)lang/,
        helpers.root('node_modules/@angular/core/src/facade/lang.js')
      ),
      new NormalModuleReplacementPlugin(
        /facade(\\|\/)math/,
        helpers.root('node_modules/@angular/core/src/facade/math.js')
      ),
    ],

    // Include polyfills or mocks for various node stuff
    // Description: Node configuration
    //
    // See: https://webpack.github.io/docs/configuration.html#node
    node: {
      global: true,
      crypto: 'empty',
      module: false,
      clearImmediate: false,
      setImmediate: false
    },
  };
};
