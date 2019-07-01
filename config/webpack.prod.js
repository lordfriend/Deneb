const webpackMerge            = require('webpack-merge');
const ngw                     = require('@ngtools/webpack');
const UglifyJsPlugin          = require('uglifyjs-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const cssnano                 = require('cssnano');

const commonConfig            = require('./webpack.common');
const helpers                 = require('./helpers');
const DefinePlugin = require('webpack/lib/DefinePlugin');
// const CompressionPlugin = require('compression-webpack-plugin');

module.exports = function(metadata) {
    return webpackMerge(commonConfig, {
        mode: 'production',

        output: {
            path: helpers.root('dist'),
            publicPath: '/',
            filename: '[hash].js',
            chunkFilename: '[id].[hash].chunk.js'
        },

        optimization: {
            noEmitOnErrors: true,
            splitChunks: {
                chunks: 'all'
            },
            runtimeChunk: 'single',
            minimizer: [
                new UglifyJsPlugin({
                    cache: true,
                    parallel: true
                }),

                new OptimizeCSSAssetsPlugin({
                    cssProcessor: cssnano,
                    cssProcessorOptions: {
                        discardComments: {
                            removeAll: true
                        }
                    },
                    canPrint: false
                })
            ]
        },

        module: {
            rules: [
                {
                    test: /(?:\.ngfactory\.js|\.ngstyle\.js|\.ts)$/,
                    loader: '@ngtools/webpack'
                }
            ]
        },

        plugins: [
            new DefinePlugin({
                'ENV': JSON.stringify(metadata.ENV),
                'HMR': metadata.HMR,
                'SITE_TITLE': JSON.stringify(metadata.title),
                'process.env': {
                    'ENV': JSON.stringify(metadata.ENV),
                    'NODE_ENV': JSON.stringify(metadata.ENV),
                    'HMR': metadata.HMR,
                },
                'CHROME_EXTENSION_ID': JSON.stringify(metadata.chrome_extension_id),
                'FIREFOX_EXTENSION_ID': JSON.stringify(metadata.firefox_extension_id),
                'EDGE_EXTENSION_ID': JSON.stringify(metadata.edge_extension_id),
                'FIREFOX_EXTENSION_URL': JSON.stringify(metadata.firefox_extension_url)
            }),
            new ngw.AngularCompilerPlugin({
                tsConfigPath: helpers.root('tsconfig.aot.json'),
                entryModule: helpers.root('src', 'app', 'app.module#AppModule')
            })
        ],
        node: {
            global: true,
            crypto: 'empty',
            process: false,
            module: false,
            clearImmediate: false,
            setImmediate: false
        }
    });
};

