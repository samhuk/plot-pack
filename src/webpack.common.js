const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const path = require('path')

const isProduction = process.env.NODE_ENV === 'production'
const fileNameTemplate = ext => (isProduction
  ? `[name].[chunkhash].min.${ext}`
  : `[name].${ext}`)

const fileLoaderFileNameTemplate = () => (isProduction
  ? 'content/[name].[hash].[ext]'
  : 'content/[name].[ext]')

const SRC_DIR = __dirname
const CLIENT_BUILD_DIR = path.resolve(__dirname, '../dist/client')
const CLIENT_DIR = path.resolve(SRC_DIR, 'test/client')

module.exports = {
  mode: isProduction ? 'production' : 'development',
  devtool: 'inline-source-map',
  devServer: { historyApiFallback: true },
  entry: [
    path.resolve(CLIENT_DIR, 'main.tsx'),
  ],
  output: {
    path: CLIENT_BUILD_DIR,
    filename: fileNameTemplate('js'),
    publicPath: '/',
  },
  resolve: { extensions: ['.js', '.ts', '.tsx', '.scss'] },
  plugins: [
    new webpack.EnvironmentPlugin({ NODE_ENV: 'development' }),
    new HtmlWebpackPlugin({
      template: path.resolve(CLIENT_DIR, 'index.html'),
      filename: 'index.html',
      inject: 'body',
      // favicon: path.resolve(CLIENT_DIR, '_content/favicon.ico'),
    }),
    new MiniCssExtractPlugin(),
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        include: [SRC_DIR],
        loader: 'babel-loader',
        options: { envName: 'client' },
      },
      {
        test: /\.(css)/,
        loader: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
        test: /\.(scss)$/,
        loader: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
      },
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'file-loader?mimetype=image/svg+xml',
        options: { name: fileLoaderFileNameTemplate() },
      },
      {
        test: /\.woff(2)?(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'file-loader?mimetype=application/font-woff',
        options: { name: fileLoaderFileNameTemplate() },
      },
      {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'file-loader?mimetype=application/octet-stream',
        options: { name: fileLoaderFileNameTemplate() },
      },
      {
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'file-loader',
        options: { name: fileLoaderFileNameTemplate() },
      },
    ],
  },
}
