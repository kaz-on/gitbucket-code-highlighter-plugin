const ESLintPlugin = require('eslint-webpack-plugin');

module.exports = {
  mode: 'production', //'development',
  devtool: 'source-map',
  entry: './src/main/typescript/entry.ts',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  plugins: [
    new ESLintPlugin({
      extensions: ['ts', 'js']
    })
  ],
};
