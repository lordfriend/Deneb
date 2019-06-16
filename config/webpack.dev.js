const webpackMerge = require('webpack-merge');

const commonConfig = require('./webpack.common');
const helpers      = require('./helpers');
const chalk = require('chalk');
/**
 * Webpack Plugins
 */
const DefinePlugin = require('webpack/lib/DefinePlugin');

let PROXY_SETTINGS;
try {
    PROXY_SETTINGS = require('./dev.proxy');
} catch (e) {
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

    console.log(chalk.bold.yellow('cannot find config/dev.proxy.js use default proxy settings'));
}
console.log(chalk.cyan('proxy setting is'));
console.log('================================================');
Object.keys(PROXY_SETTINGS).forEach(function (urlPatten) {
    console.log(chalk.green(urlPatten) + '->' + chalk.bold.white(PROXY_SETTINGS[urlPatten].target));
});
console.log('================================================');

module.exports = function(metadata) {
    return webpackMerge(commonConfig(metadata), {
        mode: 'development',

        devtool: 'cheap-module-eval-source-map',

        output: {
            path: helpers.root('dist'),
            // publicPath: '/',
            filename: '[name].bundle.js',
            chunkFilename: '[id].chunk.js'
        },

        optimization: {
            noEmitOnErrors: true
        },

        module: {
            rules: [
                {
                    test: /\.ts$/,
                    loaders: [
                        {
                            loader: 'ts-loader',
                            options: {
                                configFile: helpers.root('tsconfig.json'),
                                transpileOnly: true
                            }
                        },
                        'angular2-template-loader',
                        'angular-router-loader'
                    ],
                    exclude: [/node_modules/]
                }
            ]
        },
        plugins: [
            new DefinePlugin({
                'ENV': JSON.stringify(metadata.ENV),
                'HMR': metadata.HMR,
                'SITE_TITLE': JSON.stringify(metadata.title),
                'CHROME_EXTENSION_ID': JSON.stringify(metadata.chrome_extension_id),
                'FIREFOX_EXTENSION_ID': JSON.stringify(metadata.firefox_extension_id),
                'EDGE_EXTENSION_ID': JSON.stringify(metadata.edge_extension_id),
                'FIREFOX_EXTENSION_URL': JSON.stringify(metadata.firefox_extension_url)
            }),
        ],
        devServer: {
            port: metadata.port,
            host: metadata.host,
            historyApiFallback: true,
            watchOptions: {
                aggregateTimeout: 300,
                poll: 1000
            },
            proxy: PROXY_SETTINGS,
            disableHostCheck: true
        },

        node: {
            global: true,
            crypto: 'empty',
            process: true,
            module: false,
            clearImmediate: false,
            setImmediate: false
        }
    });
};

// var webpack = require('webpack');
// var helpers = require('./helpers');
// var webpackMerge = require('webpack-merge'); //Used to merge webpack configs
// var commonConfig = require('./webpack.common.js'); //The settings that are common to prod and dev
//
// var chalk = require('chalk');
//
// /**
//  * Webpack Plugins
//  */
// var DefinePlugin = require('webpack/lib/DefinePlugin');
//
// var PROXY_SETTINGS;
// try {
//     PROXY_SETTINGS = require('./dev.proxy');
// } catch (e) {
//     PROXY_SETTINGS = {
//         '/api/*': {
//             target: 'http://localhost:5000'
//         },
//         '/pic/*': {
//             target: 'http://localhost:8000'
//         },
//         '/video/*': {
//             target: 'http://localhost:8000'
//         }
//     };
//
//     console.log(chalk.bold.yellow('cannot find config/dev.proxy.js use default proxy settings'));
// }
// console.log(chalk.cyan('proxy setting is'));
// console.log('================================================');
// Object.keys(PROXY_SETTINGS).forEach(function (urlPatten) {
//     console.log(chalk.green(urlPatten) + '->' + chalk.bold.white(PROXY_SETTINGS[urlPatten].target));
// });
// console.log('================================================');
//
// /**
//  * Webpack configuration
//  *
//  * See: http://webpack.github.io/docs/configuration.html#cli
//  */
// module.exports = function (metadata) {
//     return webpackMerge(commonConfig(metadata), {
//
//         // Developer tool to enhance debugging
//         //
//         // See: http://webpack.github.io/docs/configuration.html#devtool
//         // See: https://github.com/webpack/docs/wiki/build-performance#sourcemaps
//         devtool: 'source-map',
//
//         // Options affecting the output of the compilation.
//         //
//         // See: http://webpack.github.io/docs/configuration.html#output
//         output: {
//
//             // The output directory as absolute path (required).
//             //
//             // See: http://webpack.github.io/docs/configuration.html#output-path
//             path: helpers.root('dist'),
//
//             // Specifies the name of each output file on disk.
//             // IMPORTANT: You must not specify an absolute path here!
//             //
//             // See: http://webpack.github.io/docs/configuration.html#output-filename
//             filename: '[name].bundle.js',
//
//             // The filename of the SourceMaps for the JavaScript files.
//             // They are inside the output.path directory.
//             //
//             // See: http://webpack.github.io/docs/configuration.html#output-sourcemapfilename
//             sourceMapFilename: '[name].map',
//
//             // The filename of non-entry chunks as relative path
//             // inside the output.path directory.
//             //
//             // See: http://webpack.github.io/docs/configuration.html#output-chunkfilename
//             chunkFilename: '[id].chunk.js',
//
//             library: 'ac_[name]',
//             libraryTarget: 'var',
//         },
//
//         plugins: [
//             // Plugin: DefinePlugin
//             // Description: Define free variables.
//             // Useful for having development builds with debug logging or adding global constants.
//             //
//             // Environment helpers
//             //
//             // See: https://webpack.github.io/docs/list-of-plugins.html#defineplugin
//             // NOTE: when adding more properties make sure you include them in custom-typings.d.ts
//             new DefinePlugin({
//                 'ENV': JSON.stringify(metadata.ENV),
//                 'HMR': metadata.HMR,
//                 'SITE_TITLE': JSON.stringify(metadata.title),
//                 'CHROME_EXTENSION_ID': JSON.stringify(metadata.chrome_extension_id),
//                 'FIREFOX_EXTENSION_ID': JSON.stringify(metadata.firefox_extension_id),
//                 'EDGE_EXTENSION_ID': JSON.stringify(metadata.edge_extension_id),
//                 'FIREFOX_EXTENSION_URL': JSON.stringify(metadata.firefox_extension_url)
//             }),
//
//             // Plugin: LoaderOptionsPlugin
//             // https://gist.github.com/sokra/27b24881210b56bbaff7#loader-options--minimize
//             new webpack.LoaderOptionsPlugin({
//                 // switch loader to debug mode
//                 debug: true,
//                 options: {
//                     // Static analysis linter for TypeScript advanced options configuration
//                     // Description: An extensible linter for the TypeScript language.
//                     //
//                     // See: https://github.com/wbuchwalter/tslint-loader
//                     tslint: {
//                         emitErrors: false,
//                         failOnHint: false,
//                         resourcePath: 'src'
//                     }
//                 }
//             })
//         ],
//
//         // Webpack Development Server configuration
//         // Description: The webpack-dev-server is a little node.js Express server.
//         // The server emits information about the compilation state to the client,
//         // which reacts to those events.
//         //
//         // See: https://webpack.github.io/docs/webpack-dev-server.html
//         devServer: {
//             port: metadata.port,
//             host: metadata.host,
//             historyApiFallback: true,
//             watchOptions: {
//                 aggregateTimeout: 300,
//                 poll: 1000
//             },
//             proxy: PROXY_SETTINGS,
//             disableHostCheck: true
//         },
//
//         node: {
//             global: true,
//             crypto: 'empty',
//             process: true,
//             module: false,
//             clearImmediate: false,
//             setImmediate: false
//         }
//     });
// };
