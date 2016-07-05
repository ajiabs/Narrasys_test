/**
 * Created by githop on 3/14/16.
 */
var webpack = require('webpack');
var path    = require('path');
var config  = require('./webpack.config');

config.devtool = 'inline-source-map';
config.entry = {
	app: './app/scripts/app.ts'
};
config.output = {
	filename: '[name].bundle.js',
	publicPath: '/',
	path: '/webpack-dist'
};

config.module.loaders = config.module.loaders.concat([
	{
		test: /\.css$/,
		loader: 'style-loader!css-loader'
	},
	{
		test: /\.scss$/,
		loader: 'style!css!sass'
	}
]);

module.exports = config;
