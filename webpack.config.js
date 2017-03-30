const {resolve} = require('path');
const webpack = require('webpack');

module.exports = (env) => {
  return {
    resolve: {
      extensions: ['.ts', '.js']
    },
    entry: {

    },
    output: {

    },
    module: {
      loaders: [
        {
          test: require.resolve('angular'),
          loader: 'exports?window.angular'
        },
        {
          test: /\.ts$/,
          exclude: [/app\/scripts\/plugin/, /node_modules/],
          loader: 'awesome-typescript-loader'
        }
      ]
    },
    plugins: [
      new webpack.ProvidePlugin({
        $: "jquery",
        jQuery: "jquery",
        'window.jQuery': 'jquery'
      }),
      new webpack.ProvidePlugin({
        'angular': 'angular'
      })
    ]
  }
};
