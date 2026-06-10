const path = require('path');
const webpack = require('webpack');
const CopyPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ZipPlugin = require('zip-webpack-plugin');

module.exports = {
    entry: './src/game.ts',
    mode: "production",
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js',
        clean: true
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                include: path.resolve(__dirname, 'src'),
                loader: 'ts-loader'
            },
            {
                test: require.resolve('Phaser'),
                loader: 'expose-loader',
                options: {exposes: {globalName: 'Phaser', override: true}}
            }
        ]
    },
    plugins: [
        new webpack.DefinePlugin({ DEBUG: JSON.stringify(false) }),
        new HtmlWebpackPlugin({
            filename: "index.html",
            template: './src/index.html',
            minify: {
                removeAttributeQuotes: false,
                collapseWhitespace: false,
                html5: false,
                minifyCSS: false,
                minifyJS: false,
                minifyURLs: false,
                removeComments: false,
                removeEmptyAttributes: false
            },
            hash: false

        }),
        new CopyPlugin({
                patterns: [
                    {from: 'assets/**/*', to: '', globOptions: {ignore: ['**/less/**', '**/cartDebug*.png']}},
                    {from: 'src/manifest.json', to: ''}, // PWA
                    {from: 'src/sw.js', to: ''} // PWA
                ]
            }
        ),
        new ZipPlugin({
            path: path.resolve(__dirname, 'dist'),
            filename: 'game.zip',

        })
    ],
    resolve: {
        extensions: ['.ts', '.js']
    }
};
