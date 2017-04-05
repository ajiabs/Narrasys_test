const {resolve, join, sep} = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WebpackChunkHash = require('webpack-chunk-hash');
const InlineManifestWebpackPlugin = require('inline-manifest-webpack-plugin');
const nodeModulesDir = join(__dirname, './node_modules');

const deps = [
  'angular-ui-tree/dist/angular-ui-tree.min.js',
  'textangular/dist/textAngular-sanitize.min.js',
  'textangular/dist/textAngular.min.js'
];

function configWp(env) {
  const wpConfig =  {
    resolve: {
      extensions: ['.ts', '.js'],
    },
    entry: {
      app: resolve(__dirname, 'app', 'scripts', 'app.ts')
    },
    output: {
      filename: env.prod ? '[name].[chunkHash].min.js' : '[name].bundle.js',
      publicPath: '/',
      path: resolve(__dirname, 'dist')
    },
    devtool: env.prod ? 'source-map' : 'eval',
    externals: {
      'angular': 'angular'
    },
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
          test: /\.(css|scss)$/i,
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
              loader: 'postcss-loader',
              options: {
                plugins: _ => [require('autoprefixer')({browsers: 'last 2 versions'})]
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
            limit: 1000
          }
        },
        {
          test: /\.(gif|png|jpe?g|svg)$/i,
          loaders: [
            {
              loader: 'file-loader',
              query: {
                name: env.prod ?  'images/[name].[hash].[ext]' : 'images/[name].[ext]'
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
      new webpack.LoaderOptionsPlugin({
        options: {
          htmlLoader: {
            root: join(__dirname, 'app')
          },
        }
      }),
      env.prod ? new webpack.optimize.UglifyJsPlugin({
        beautify: false,
        mangle: {
          screw_ie8: true,
          keep_fnames: true
        },
        compress: {
          drop_console: true,
          screw_ie8: true
        },
        comments: false,
        sourceMap: true
      }) : undefined,
      env.prod ? new webpack.optimize.CommonsChunkPlugin({
        name: 'vendor',
        minChunks: function (module) {
          // this assumes your vendor imports exist in the node_modules directory
          return module.context && module.context.indexOf('node_modules') !== -1;
        }
      }) : undefined,
      env.prod ? new webpack.HashedModuleIdsPlugin() : undefined,
      env.prod ? new webpack.optimize.CommonsChunkPlugin({
        name: 'manifest',
        minChunks: Infinity
      }): undefined,
      env.prod ? new WebpackChunkHash({algorithm: 'md5'}) : undefined,
      env.prod ? 	new InlineManifestWebpackPlugin({
        name: 'webpackManifest'
      }) : undefined
    ].filter(p => !!p)
  };

  if (env.dev) {
    wpConfig.resolve.alias = {};
    wpConfig.module.noParse = [];
    deps.forEach((dep) => {
      const depPath = resolve(nodeModulesDir, dep);
      wpConfig.resolve.alias[dep.split(sep)[0]] = depPath;
      wpConfig.module.noParse.push(depPath);
    });
  }

  return wpConfig
}


module.exports = (env) => configWp(env);
