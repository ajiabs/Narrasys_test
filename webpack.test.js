
const webpack = require('webpack');
const { resolve, join, sep } = require('path');

const wpConfig =  {
  resolve: {
    extensions: ['.ts', '.js'],
  },
  entry: {
    app: resolve(__dirname, 'app', 'app.ts')
  },
  output: {
    filename: '[name].bundle.js',
    chunkFilename: '[name].bundle.js',
    publicPath: '/',
    path: resolve(__dirname, 'tmp'),
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: [/app\/plugin/, /node_modules/],
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
        exclude: [resolve(__dirname, 'app', 'index.html'), resolve(__dirname, 'app', 'privacy.html')],
        use: [
          {
            loader: 'html-loader',
            options: {
              minimize: false
            }
          }
        ]
      },
      {
        test: /.eot$/,
        loader: 'file-loader',
        options: {
          name:'[name].[ext]'
        }
      },
      {
        test: /\.(otf|ttf|woff|woff2)$/,
        loader: 'url-loader',
        options: {
          limit: 20000,
          name: '[name].[ext]'
        }
      },
      {
        test: /\.(gif|png|jpe?g|svg)$/i,
        loaders: [
          {
            loader: 'file-loader',
            query: {
              name:'images/[name].[ext]'
            }
          },
          {
            loader: 'image-webpack-loader',
            query: {
              bypassObDebug: true
            }
          }
        ]
      },
      {
        test: /\.(css|scss)$/i,
        use: [
          {
            loader: "style-loader" // creates style nodes from JS strings
          },
          {
            loader: "css-loader", // translates CSS into CommonJS
            options: {
              root: join(__dirname, './app/'),
              sourceMap: false
            }
          },
          // {
          //   loader: 'postcss-loader',
          //   options: {
          //     sourceMap: true,
          //     plugins: _ => [require('autoprefixer')({browsers: 'last 2 versions'})]
          //   }
          // },
          {
            loader: "sass-loader", // compiles Sass to CSS
            options: {
              sourceMap: false
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'test'
    })
  ]
};
module.exports = wpConfig;
