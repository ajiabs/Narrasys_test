const {resolve, join} = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');


module.exports = (env) => {
  return {
    resolve: {
      extensions: ['.ts', '.js']
    },
    entry: {
      app: resolve(__dirname, 'app', 'scripts', 'app.ts')
    },
    output: {
      filename: env.prod ? '[name]-[hash].min.js' : '[name].bundle.js',
      publicPath: '/',
      path: resolve(__dirname, 'dist')
    },
    devtool: env.prod ? 'source-map' : 'eval',
    module: {
      rules: [
        {
          test: /\.ts$/,
          exclude: [/app\/scripts\/plugin/, /node_modules/],
          use: [
            {
              loader: 'ts-loader',
              options: {
                transpileOnly: true
              }
            }
          ]
        },
        {
          test: /\.html$/,
          exclude: resolve(__dirname, 'app', 'index.html'),
          use: [
            {
              loader: 'ngtemplate-loader',
              options: {
                relativeTo: join(__dirname, './app/'),
              },
            },
            {
              loader: 'html-loader'
            }
          ]
        },
        {
          test: /\.scss$/i,
          use: [
            {
              loader: "style-loader" // creates style nodes from JS strings
            },
            {
              loader: "css-loader", // translates CSS into CommonJS
              options: {
                root: join(__dirname, './app/')
              }
            },
            {
              loader: "sass-loader" // compiles Sass to CSS
            }
          ]
        },
        {
          test: /\.(eot|otf|ttf|woff|woff2)$/,
          loader: 'url-loader',
          options: {
            limit: 10000
          }
        },
        {
          test: /\.(gif|png|jpe?g|svg)$/i,
          loaders: [
            {
              loader: 'file-loader',
              query: {
                name: 'images/[name]-[hash].[ext]'
              }
            },
            {
              loader: 'image-webpack-loader',
              query: {
                bypassObDebug: true,
                mozjpeg: {
                  progressive: true,
                },
                gifsicle: {
                  interlaced: false,
                },
                optipng: {
                  optimizationLevel: 4,
                },
                pngquant: {
                  quality: '75-90',
                  speed: 3,
                },
              }
            }
          ]
        }
      ]
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './app/index.html',
        inject: 'body',
        hash: false
      }),
      new webpack.ProvidePlugin({
        $: "jquery",
        jQuery: "jquery",
        'window.jQuery': 'jquery'
      }),
      new webpack.LoaderOptionsPlugin({
        options: {
          htmlLoader: {
            root: join(__dirname, 'app')
          },
        }
      }),
      env.prod ? new webpack.optimize.CommonsChunkPlugin({
        name: 'vendor',
        minChunks: function (module) {
          // this assumes your vendor imports exist in the node_modules directory
          return module.context && module.context.indexOf('node_modules') !== -1;
        }
      }) : undefined,
      // new webpack.ProvidePlugin({
      //   'angular': 'angular'
      // })
    ].filter(p => !!p)
  }
};
