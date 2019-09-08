const webpackMerge = require('webpack-merge');

const commonConfig = require('./webpack.common');
const helpers      = require('./helpers');
const chalk = require('chalk');
/**
 * Webpack Plugins
 */
const DefinePlugin = require('webpack/lib/DefinePlugin');
const { AngularCompilerPlugin } = require('@ngtools/webpack');

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
            chunkFilename: '[name].chunk.js'
        },

        optimization: {
            noEmitOnErrors: true
        },

        module: {
            rules: [
                {
                    test: /(?:\.ngfactory\.js|\.ngstyle\.js|\.ts)$/,
                    use: '@ngtools/webpack',
                    exclude: [/src[\/\\]service-worker[\/\\]/]
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
            new AngularCompilerPlugin({
                tsConfigPath: helpers.root('tsconfig.json'),
                entryModule: helpers.root('src/app/app.module#AppModule'),
                sourceMap: true,
                skipCodeGeneration: false,
                discoverLazyRoutes: true
            })
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
