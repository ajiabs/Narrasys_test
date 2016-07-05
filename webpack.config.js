/**
 * Created by githop on 3/12/16.
 */
var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
	resolve: {
		extensions: ['', '.ts', '.js']
	},
	module: {
		loaders: [
			{
				test: /\.ts$/,
				exclude: [/app\/scripts\/plugin/, /node_modules/],
				loader: 'ts-loader'
			},
			{
				test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
				loader: 'url-loader?limit=10000&mimetype=application/font-woff'
			},
			{
				test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
				loader: 'file-loader'
			},
			{
				test: /\.(jpg|gif)$/,
				exclude: /node_modules/,
				loader: 'file'
			},
			{
				test: '\.png$',
				exclude: /node_modules/,
				loader: 'url'
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
		new webpack.optimize.CommonsChunkPlugin({
			name: 'vendor',
			minChunks: module => /node_modules/.test(module.resource)
		})
	]

};
