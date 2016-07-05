/**
 * Created by githop on 3/12/16.
 */

var gulp = require('gulp'),
	template = require('gulp-angular-templatecache'),
	webpack = require('webpack'),
	webpackDevMiddleware = require('webpack-dev-middleware'),
	colorsSupported = require('supports-color'),
	autoprefixer = require('gulp-autoprefixer'),
	path = require('path'),
	runSequence = require('run-sequence'),
	rimraf = require('rimraf'),
	gutil = require('gulp-util'),
	serve = require('browser-sync');

var paths = {
	templates: './app/templates/**/*.html',
	webpackDist: './webpack-dist',
	images: './app/images/**/*',
	entry: './app/scripts/app.ts',
	output: './dev/',
	misc: [
		'./app/apple-touch-icon.png',
		'./app/apple-touch-icon-72.png',
		'./app/apple-touch-icon-114.png',
		'./app/config.js',
		'./app/favicon.ico',
		'./app/iosFrameHack.js',
		'./app/privacy.html',
		'./app/version.txt'
	]
};

var lastStats;

gulp.task('templates', function () {
	return gulp.src(paths.templates)
		.pipe(template('templates.ts', {moduleSystem: 'ES6', module:'iTT.templates', root: 'templates', standalone: true}))
		.pipe(gulp.dest('app/scripts'));
});

gulp.task('templateCache', ['templates'], function() {
	gulp.watch('**/*.html', ['templates']);
});

gulp.task('serve', ['templateCache'], function() {
	var wpConfig = require('./webpack.dev.config');
	var wpCompiler = webpack(wpConfig);
	wpCompiler.plugin('done', serve.reload);
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
			})
		]
	});
});

gulp.task('build', function(cb) {
	var wpConfig = require('./webpack.prod.config');
	webpack(wpConfig, function(err, stats) {
		if(err)  {
			throw new gutil.PluginError("webpack", err);
		}

		lastStats = stats;
		cb();
	});
});

gulp.task('clean', function() {
	rimraf.sync(path.join(paths.webpackDist, '*'));
});

gulp.task('copy-images', function() {
	return gulp.src(paths.images)
		.pipe(gulp.dest(paths.webpackDist + '/images'))
});

gulp.task('copy-misc', function() {
	return gulp.src(paths.misc)
		.pipe(gulp.dest(paths.webpackDist));
});

gulp.task('copy-assets', ['copy-misc', 'copy-images']);

gulp.task('prefix-css', function () {
	return gulp.src(paths.webpackDist + '/app.css')
		.pipe(autoprefixer({
			browsers: ['last 2 versions'],
			cascade: false
		}))
		.pipe(gulp.dest(paths.webpackDist))
});

gulp.task('prod', function() {
	return runSequence(
		['clean', 'templates'],
		'build',
		['copy-images', 'copy-misc', 'prefix-css'],
		'print-log'
	);
});

gulp.task('print-log', function(done) {
	gutil.log("[webpack]", lastStats.toString({
		colors: colorsSupported,
		chunks: false,
		errorDetails: true
	}));
	done();
});
