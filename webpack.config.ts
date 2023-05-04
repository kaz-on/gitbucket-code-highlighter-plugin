import webpack from 'webpack';
import ESLintPlugin from 'eslint-webpack-plugin';


const config: webpack.Configuration = {
  mode: 'production', //'development',
  devtool: 'source-map',
  entry: './src/main/typescript/entry.ts',
  output: {
    devtoolModuleFilenameTemplate: 'source-map/[resource-path]?[loaders]',
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
      },
      {
        test: /\.(s[ac]ss|css)$/i,
        use: [
          'sass-to-string',
          {
            loader: 'sass-loader',
            options: {
              sassOptions: {
                outputStyle: 'compressed',
              },
            },
          },
        ],
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


export default config;
