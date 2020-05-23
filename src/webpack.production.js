const path = require('path')
const merge = require('webpack-merge')
const webpack = require('webpack')
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const CompressionWebpackPlugin = require('compression-webpack-plugin')
const common = require('./webpack.common.js')

const SRC_DIR = __dirname
const ENTRY_DIR = path.resolve(SRC_DIR, 'app')
const ENTRY_FILE = 'main.ts'

module.exports = merge(common, {
  devtool: '',
  entry: [
    path.resolve(ENTRY_DIR, ENTRY_FILE),
  ],
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /node_modules/,
          chunks: 'initial',
          name: 'vendor',
          enforce: true,
        },
      },
    },
  },
  plugins: [
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    new webpack.optimize.ModuleConcatenationPlugin(),
    new webpack.optimize.AggressiveMergingPlugin(),
    new OptimizeCssAssetsPlugin({
      cssProcessorOptions: {
        safe: true,
        discardComments: { removeAll: true },
      },
    }),
    new CompressionWebpackPlugin({
      test: /\.(js|css|html|svg)$/,
      filename: '[path].gz[query]',
      algorithm: 'gzip',
      threshold: 8192,
      minRatio: 0.8,
    }),
  ],
})
