/**
 * Created by githop on 3/12/16.
 */

var gulp = require('gulp'),
	template = require('gulp-angular-templatecache'),
	webpack = require('webpack'),
	webpackHotMiddleware = require('webpack-hot-middleware'),
	webpackDevMiddleware = require('webpack-dev-middleware'),
	colorsSupported = require('supports-color'),
	gutil = require('gulp-util'),
	serve = require('browser-sync');

var paths = {
	templates: './app/templates/**/*.html'
};

gulp.task('templates', function () {
	return gulp.src(paths.templates)
		.pipe(template('templates.js', {moduleSystem: 'ES6', module:'iTT.templates', root: 'templates', standalone: true}))
		.pipe(gulp.dest('app/scripts'));
});

gulp.task('templateCache', function() {
	gulp.watch('**/*.html', ['templates']);
});

gulp.task('serve', ['templateCache'], function() {
	var wpConfig = require('./webpack.dev.config');
	var wpCompiler = webpack(wpConfig);

	serve({
		proxy: 'https://localhost.inthetelling.com',
		middleware: [
			webpackDevMiddleware(wpCompiler, {
				stats: {
					colors: colorsSupported,
					chunks: false,
					modules: false
				},
				publicPath: wpConfig.output.publicPath
			}),
			webpackHotMiddleware(wpCompiler)
		]
	});
});

gulp.task('build', ['templates'], function(cb) {
	var wpConfig = require('./webpack.prod.config');
	webpack(wpConfig, function(err, stats) {
		if(err)  {
			throw new gutil.PluginError("webpack", err);
		}

		gutil.log("[webpack]", stats.toString({
			colors: colorsSupported,
			chunks: false,
			errorDetails: true
		}));
	});
	cb();
});
