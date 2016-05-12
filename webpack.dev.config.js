/**
 * Created by githop on 3/14/16.
 */
var webpack = require('webpack');
var path    = require('path');
var config  = require('./webpack.config');

config.devtool = 'inline-source-map';
config.entry = {
	app: [
		'webpack-hot-middleware/client?reload=true',
		'./app/scripts/app.ts'
	]
};
config.output = {
	filename: '[name].bundle.js',
	publicPath: '/',
	path: '/webpack-dist'
};

config.plugins = config.plugins.concat([
	new webpack.HotModuleReplacementPlugin()
]);

module.exports = config;
