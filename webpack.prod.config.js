/**
 * Created by githop on 3/14/16.
 */
var webpack = require('webpack');
var path    = require('path');
var config  = require('./webpack.config');
var fs = require('fs');
var versionTxt = fs.readFileSync(path.resolve(__dirname, 'app', 'version.txt'), 'utf8');

//add source maps
config.entry = {
	app: './app/scripts/app.ts'
};

config.output = {
	filename: '[name].'+ versionTxt +'.[hash].js',
	path: './webpack-dist'
};

config.plugins = config.plugins.concat([
	new webpack.optimize.UglifyJsPlugin({
		mangle: {

			// You can specify all variables that should not be mangled.
			// For example if your vendor dependency doesn't use modules
			// and relies on global variables. Most of angular modules relies on
			// angular global variable, so we should keep it unchanged
			except: ['$super', '$', 'exports', 'require', 'angular']
		}
	})
]);

module.exports = config;
