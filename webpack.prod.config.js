/**
 * Created by githop on 3/14/16.
 */
var webpack = require('webpack');
var path    = require('path');
var config  = require('./webpack.config');
var fs = require('fs');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var versionTxt = fs.readFileSync(path.resolve(__dirname, 'app', 'version.txt'), 'utf8');

//add source maps
config.entry = {
	app: './app/scripts/app.ts'
	// ng: ['angular', 'angular-animate', 'angular-route', 'angular-sanitize'],
	// vendor: ['jquery', 'flot-charts', 'textAngular', 'angular-ui-tree']
};

config.output = {
	filename: '[name].'+ versionTxt +'.[hash].js',
	path: './webpack-dist'
};

config.module.loaders = config.module.loaders.concat([
	{
		test: /\.(scss|css)$/,
		loader: ExtractTextPlugin.extract({fallbackLoader: 'style-loader', loader: ['css-loader', 'sass-loader']})
	}
]);

config.plugins = config.plugins.concat([
	new ExtractTextPlugin('app.'+ versionTxt +'.[hash].css'),
	new webpack.optimize.DedupePlugin(),
	new webpack.optimize.UglifyJsPlugin({
		compress: {
			drop_console: true,
			warnings: true,
			dead_code: true,
			unused: true
		},
		mangle: {
			except: ['$super', '$', 'exports', 'require']
		},
		sourceMap: true
	})
]);

module.exports = config;
