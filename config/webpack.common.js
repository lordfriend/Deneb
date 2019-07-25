const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const helpers = require('./helpers');

module.exports = function (metadata) {
    const isDev = metadata.ENV === 'development';
    return {
        entry: {
            polyfills: './src/polyfills.browser.ts',
            main: './src/main.browser.ts'
        },

        resolve: {
            extensions: ['.ts', '.js'],
            modules: [
                helpers.root('src'),
                helpers.root('node_modules')
            ]
        },

        module: {
            rules: [
                {
                    test: /\.less$/,
                    use: [
                        {
                            loader: MiniCssExtractPlugin.loader,
                            options: {
                                hmr: process.env.NODE_ENV === 'development'
                            }
                        },
                        'css-loader',
                        {
                            loader: 'semantic-ui-less-module-loader',
                            // you can also add specific options:
                            options: {
                                siteFolder: helpers.root('src/assets/site'),
                                themePath: helpers.root('src/assets/site/theme.less')
                            }
                        }
                    ],
                    include: [
                        /[\/\\]node_modules[\/\\]semantic-ui-less[\/\\]/
                    ]
                },
                // Raw loader support for *.css files
                // Returns file content as string
                {
                    test: /\.css$/,
                    use: ['to-string-loader', 'css-loader']
                },

                // Raw loader support for *.html
                // Returns file content as string
                //
                // See: https://github.com/webpack/raw-loader
                {
                    test: /\.html$/,
                    use: 'html-loader',
                    exclude: [helpers.root('src/index.html')]
                },
                {
                    test: /.less$/,
                    use: [
                        'to-string-loader',
                        'css-loader',
                        'less-loader'
                    ],
                    include: [/src[\/\\]app[\/\\]/]
                },
                {
                    test: /.less$/,
                    use: [
                        'style-loader',
                        'css-loader',
                        'less-loader'
                    ],
                    exclude: [
                        /[\/\\]node_modules[\/\\]/,
                        /src[\/\\]app[\/\\]/]
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

        plugins: [
            new MiniCssExtractPlugin({
                filename: isDev ? '[name].bundle.css' : '[name].[chunkhash].bundle.css',
                chunkFilename: isDev ? '[name].chunk.css' : '[name].[chunkhash].chunk.css'
            }),
            new CopyWebpackPlugin([{
                from: 'src/assets',
                to: 'assets'
            }]),
            new CleanWebpackPlugin(
                helpers.root('dist'), {root: helpers.root(), verbose: true}),
            new HtmlWebpackPlugin({
                template: 'src/index.html',
                title: metadata.title,
                chunksSortMode: function (a, b) {
                    const entryPoints = ["inline","polyfills","sw-register","styles","vendor","main"];
                    return entryPoints.indexOf(a.names[0]) - entryPoints.indexOf(b.names[0]);
                },
                metadata: metadata,
                inject: 'body'
            }),
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
        }
    };
};
