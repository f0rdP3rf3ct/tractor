const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
    entry: './src/game.ts',
    mode: "production",
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js'
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
        new CopyPlugin({
                patterns: [
                    {from: 'assets/**/*', to: ''}
                ]
            }
        ),
    ],
    resolve: {
        extensions: ['.ts', '.js']
    }
};
