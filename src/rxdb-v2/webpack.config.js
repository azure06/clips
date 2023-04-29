/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './src/index.ts',
  mode: 'production',
  target: 'node',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      // {
      //   test: /\.node$/,
      //   loader: 'node-loader',
      // },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    // fallback: {
    //   // 👇️👇️👇️ add this 👇️👇️👇️
    //   fs: false,
    //   os: false,
    //   path: false,
    // },
  },
  context: path.resolve(__dirname),
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist/src'),
    // globalObject: 'this',
  },
  optimization: {
    minimize: false,
  },
  node: {
    // global: true,
    __dirname: false,
    __filename: false,
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'node_modules/leveldown/prebuilds'),
          to: path.resolve(__dirname, 'dist/src/prebuilds'),
        },
      ],
    }),
  ],
};
