const webpackMerge            = require('webpack-merge');
const {AngularCompilerPlugin} = require('@ngtools/webpack');
const UglifyJsPlugin          = require('uglifyjs-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const cssnano                 = require('cssnano');

const commonConfig            = require('./webpack.common');
const helpers                 = require('./helpers');
const DefinePlugin = require('webpack/lib/DefinePlugin');
const CompressionPlugin = require('compression-webpack-plugin');

const buildOptimizer = {
    loader: '@angular-devkit/build-optimizer/webpack-loader',
    options: {
        sourceMap: true
    }
};

module.exports = function(metadata) {
    return webpackMerge(commonConfig(metadata), {
        mode: 'production',
        output: {
            path: helpers.root('dist'),
            publicPath: '/',
            filename: '[name].[chunkhash].js',
            sourceMapFilename: '[file].map',
            chunkFilename: '[id].[chunkhash].chunk.js'
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
                    use: [
                        buildOptimizer,
                        '@ngtools/webpack'
                    ]
                },
                {
                    test: /\.js$/,
                    use: [buildOptimizer]
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
            new AngularCompilerPlugin({
                tsConfigPath: helpers.root('tsconfig.webpack.json'),
                entryModule: helpers.root('src/app/app.module#AppModule'),
                sourceMap: true,
                skipCodeGeneration: false,
                discoverLazyRoutes: true
            }),
            new CompressionPlugin({
                filename: '[path].br[query]',
                algorithm: 'brotliCompress',
                test: /\.(js|css|html|svg)$/,
                compressionOptions: { level: 11 },
                threshold: 10240,
                minRatio: 0.8,
                deleteOriginalAssets: false,
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

