const path = require('path')
// 抽离和处理
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const DllReferencePlugin = require('webpack/lib/DllReferencePlugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin
const { VueLoaderPlugin } = require('vue-loader')
const mode = process.env.NODE_ENV

module.exports = {
  mode,
  context: path.resolve(__dirname, 'src'),
  entry: './main.js',
  output: {
    filename: '[name].js',
    publicPath: '/dist/',
    path: path.resolve(__dirname, 'dist'),
    library: 'lib',
    libraryTarget: 'window'
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.css$/,
        use: [
          mode !== 'production' ? 'style-loader' : MiniCssExtractPlugin.loader,
          'css-loader'
        ]
      },
      {
        test: /\.styl(us)?$/,
        use: [
          mode !== 'production' ? 'style-loader' : MiniCssExtractPlugin.loader,
          'css-loader',
          'stylus-loader'
        ]
      },
      {
        test: /\.s[ac]ss$/,
        use: [
          mode !== 'production' ? 'style-loader' : MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader'
        ]
      },
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            // cacheDirectory: true
          }
        },
        include: [path.resolve(__dirname, 'src')]
      }
    ]
  },
  devServer: {
    // inline: false,
    hot: true,
    injectHot: true,
    open: true,
    overlay: {
      warnings: true,
      errors: true
    }
  },
  resolve: {
    alias: {
      '@': path.resolve('src')
      // vue$: path.resolve(
      //   __dirname,
      //   'node_modules',
      //   'vue/dist/vue.runtime.common.js'
      // )
    },
    extensions: ['.vue', '.js']
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css'
    }),
    new HtmlWebpackPlugin({
      title: '标题',
      // scriptLoading: 'blocking',
      chunks: ['main']
      // favicon:'',
      // filename: 'index.[contenthash].html'
    }),
    // new DllReferencePlugin({
    //   // 描述 react 动态链接库的文件内容
    //   context: __dirname, // 必须指定，且与 DllPlugin 的 context 一致，否则还是会把第三方包打入
    //   manifest: require('./dll/vue.manifest.json')
    // }),
    new VueLoaderPlugin()
  ],
  // watch: true,
  devtool: mode === 'development' ? 'source-map' : false,
  target: 'web'
}

if (mode === 'production') {
  module.exports.plugins.push(new BundleAnalyzerPlugin())
}
