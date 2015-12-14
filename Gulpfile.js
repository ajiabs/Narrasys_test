/**
 * Created by githop on 12/11/15.
 */
'use strict';
var gulp        = require('gulp'),
	path        = require('path'),
	jspm        = require('jspm'),
	jshint      = require('gulp-jshint'),
	stylish     = require('jshint-stylish'),
	rename      = require('gulp-rename'),
	template    = require('gulp-angular-templatecache'),
	uglify      = require('gulp-uglify'),
	htmlreplace = require('gulp-html-replace'),
	ngAnnotate  = require('gulp-ng-annotate'),
	rimraf      = require('rimraf'),
	rev         = require('gulp-rev'),
	runSequence = require('run-sequence'),
	serve       = require('browser-sync'),
	Server      = require('karma').Server;

var root = 'client';


var pathHelper = function(resolvePath) {
	return function(glob) {
		glob = glob || '';
		return path.resolve(path.join(resolvePath, glob));
	};
};


var appPath = pathHelper('app');

var paths = {
	html: [
		appPath('**/*.html'),
		path.join(root, 'index.html')
	],
	misc: [
		appPath('apple-touch-icon.png'),
		appPath('apple-touch-icon-72.png'),
		appPath('apple-touch-icon-114.png'),
		appPath('config.js'),
		appPath('iosFrameHack.js'),
		appPath('privacy.html'),

	],
	templates: appPath('templates/**/*.html'),
	images: appPath('images/**/*.{png,jpg,jpeg,gif,webp,svg,eot,ttf,woff}'),
	css: appPath('**/*.css'),
	scripts: appPath('**/*.js'),
	dist: path.join(__dirname + '/dist')
};

console.log('PATHS', paths);

gulp.task('serve', ['templateCache'], function(){
	require('chokidar-socket-emitter')({port: 8081, path: 'app', relativeTo: 'app'})
	serve({
		//port: process.env.PORT || 3000,
		//open: false,
		//files: [].concat(
		//	[paths.css],
		//	paths.html
		//),
		//server: {
		//	baseDir: root,
		//	// serve our jspm dependencies with the client folder
		//	routes: {
		//		'/jspm.config.js': './jspm.config.js',
		//		'/jspm_packages': './jspm_packages'
		//	}
		//},
		//or use your own proxy url below
		proxy: 'localhost.inthetelling.com'
	});
});

gulp.task('lint', function() {
	return gulp.src([paths.scripts, '!app/scripts/templates.js', '!app/jspm_packages/**/*.js', '!app/jspm.config.js'])
		.pipe(jshint('.jshintrc'))
		.pipe(jshint.reporter('jshint-stylish'))
		.pipe(jshint.reporter('fail'));
});

gulp.task('templates', function () {
	return gulp.src(paths.templates)
		.pipe(template('templates.js', {moduleSystem: 'ES6', module:'iTT.templates', standalone: true}))
		.pipe(gulp.dest('app/scripts'));
});

gulp.task('templateCache', function() {
	gulp.watch('**/*.html', ['templates']);
});

gulp.task('jsHint', function() {
	gulp.watch('**/*.js', ['lint']);
});

gulp.task('images', function() {
	return gulp.src(paths.images)
		.pipe(gulp.dest(paths.dist +'/images'));
});

gulp.task('cleanDist', function() {
	rimraf.sync(path.join(paths.dist, '*'));
});

gulp.task('bundle', function() {
	var dist = path.join(paths.dist + 'app.js');
	// Use JSPM to bundle our app
	return jspm.bundleSFX('scripts/app', dist, {})
		.then(function() {
			// Also create a fully annotated minified copy
			return gulp.src(dist)
				.pipe(ngAnnotate())
				.pipe(uglify())
				.pipe(rename('app.min.js'))
				.pipe(rev())
				.pipe(gulp.dest(paths.dist + '/scripts'));
		})
		.then(function() {
			// Inject minified script into index
			return gulp.src('app/index.html')
				.pipe(htmlreplace({
					'js': 'app.min.js'
				}))
				.pipe(gulp.dest(paths.dist));
		});
});

gulp.task('misc', function() {
	return gulp.src(paths.misc)
	.pipe(gulp.dest(paths.dist));
});

gulp.task('test', function (done) {
	new Server({
		configFile: __dirname + '/karma.conf.js',
		singleRun: true
	}, done).start();
});

gulp.task('build', function() {
	return runSequence(
		'lint',
		'cleanDist',
		['templates', 'images', 'misc'],
		'bundle'
	);
});
