const path = require('path')
const DllPlugin = require('webpack/lib/DllPlugin')

module.exports = {
  entry: {
    vue: ['vue', 'vuex']
  },
  output: {
    filename: '[name].dll.js',
    path: path.resolve(__dirname, 'dll'),
    library: '[name]'
  },
  plugins: [
    new DllPlugin({
      context: __dirname,
      name: '[name]',
      path: path.join(__dirname, 'dll', '[name].manifest.json')
    })
  ]
}
