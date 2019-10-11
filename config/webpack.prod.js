const webpackMerge = require('webpack-merge');
const {AngularCompilerPlugin} = require('@ngtools/webpack');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
// const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const cssnano = require('cssnano');
// const ClosurePlugin           = require('closure-webpack-plugin');
const { InjectManifest, GenerateSW } = require('workbox-webpack-plugin');

const commonConfig = require('./webpack.common');
const helpers = require('./helpers');
const DefinePlugin = require('webpack/lib/DefinePlugin');
const CompressionPlugin = require('compression-webpack-plugin');
const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer');

const buildOptimizer = {
    loader: '@angular-devkit/build-optimizer/webpack-loader',
    options: {
        sourceMap: false
    }
};

module.exports = function (metadata) {
    return webpackMerge(commonConfig(metadata), {
        mode: 'production',
        output: {
            path: helpers.root('dist'),
            publicPath: '/',
            filename: '[name].[chunkhash].bundle.js',
            sourceMapFilename: '[file].map',
            chunkFilename: '[name].[chunkhash].chunk.js',
        },

        optimization: {
            noEmitOnErrors: true,
            splitChunks: {
                chunks: 'all'
            },
            runtimeChunk: 'single',
            minimizer: [
                new TerserPlugin({
                    cache: false,
                    parallel: true,
                    sourceMap: false,
                    extractComments: true,
                    terserOptions: {
                        ecma: 6,
                        module: true,
                        toplevel: true
                    }
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
                        {
                            loader: '@ngtools/webpack',
                            options: {
                                tsConfigPath: helpers.root('tsconfig.webpack.json'),
                            }
                        }

                    ],
                    exclude: [/[\/\\]src[\/\\]service-worker[\/\\]/]
                },
                {
                    test: /\.js$/,
                    use: [buildOptimizer],
                    exclude: [/[\/\\]src[\/\\]service-worker[\/\\]/]
                }
            ]
        },

        plugins: [
            new DefinePlugin({
                'ENV': JSON.stringify(metadata.ENV),
                'ngDevMode': false,
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
                sourceMap: false,
                skipCodeGeneration: false,
                discoverLazyRoutes: true
            }),
            new CompressionPlugin({
                filename: '[path].br[query]',
                algorithm: 'brotliCompress',
                test: /\.(js|css|html|svg)$/,
                compressionOptions: {level: 11},
                threshold: 10240,
                minRatio: 0.8,
                deleteOriginalAssets: false,
            }),
            new CompressionPlugin({
                test: /\.(js|css|html|svg)$/,
                threshold: 10240,
                minRatio: 0.8,
                deleteOriginalAssets: false,
            }),
            new BundleAnalyzerPlugin({
                analyzerMode: 'static',
                reportFilename: helpers.root('report', 'bundle-report.html'),
                openAnalyzer: false
            }),
            new GenerateSW({
                swDest: helpers.root('dist', 'sw.js'),
                importWorkboxFrom: 'local'
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

