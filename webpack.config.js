const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: './src/game.ts',
  devtool: 'source-map',
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
        options: { exposes: { globalName: 'Phaser', override: true } }
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({ DEBUG: JSON.stringify(true) })
  ],
  devServer: {
    static: path.resolve(__dirname, './'),
    host: 'localhost',
    port: 5555,
    open: false
  },
  resolve: {
    extensions: ['.ts', '.js']
  }
};
