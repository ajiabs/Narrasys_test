/**
 * Created by githop on 3/12/16.
 */
var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');

console.log(path.resolve(__dirname, 'app'));

module.exports = {
	module: {
		loaders: [
			{
				test: /\.js$/,
				exclude: [/app\/scripts\/plugin/, /node_modules/],
				loader: 'ng-annotate!babel-loader'
			},
			{
				test: /\.css$/,
				loader: 'style-loader!css-loader'
			},
			{
				test: /\.scss$/,
				loader: 'style!css!sass'
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
			minChunks: function (module, count) {
				return module.resource && module.resource.indexOf(path.resolve(__dirname, 'app')) === -1;
			}
		})
	]

};
