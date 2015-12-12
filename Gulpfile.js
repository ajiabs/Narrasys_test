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
	watch       = require('gulp-watch'),
	serve       = require('browser-sync');

var root = 'client';


var pathHelper = function(resolvePath) {
	return function(glob) {
		glob = glob || '';
		return path.resolve(path.join(root, resolvePath, glob));
	};
};

var appPath = pathHelper('app');

var paths = {
	html: [
		appPath('**/*.html'),
		path.join(root, 'index.html')
	],
	css: appPath('**/*.css'),
	scripts: appPath('**/*.js'),
	dist: path.join(__dirname + 'dist/')
};

gulp.task('serve', function(){
	require('chokidar-socket-emitter')({port: 8081, path: 'client/app', relativeTo: 'client/app'})
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
		proxy: 'localhost.inthetelling.com',
	});
});

gulp.task('lint', function() {
	return gulp.src(['app/scripts/**/*.js', '!app/scripts/templates.js'])
		.pipe(jshint('.jshintrc'))
		.pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('templates', function () {
	return gulp.src('app/templates/**/*.html')
		.pipe(template('templates.js', {module: 'com.inthetelling.story'}))
		.pipe(gulp.dest('app/scripts'));
});

gulp.task('templateCache', function() {
	gulp.watch('**/*.html', ['templates']);
});

gulp.task('jsHint', function() {
	gulp.watch('**/*.js', ['lint']);
});

gulp.task('build', function() {
	var dist = path.join(paths.dist + 'app.js');
	rimraf.sync(path.join(paths.dist, '*'));
	// Use JSPM to bundle our app
	return jspm.bundleSFX(resolveToApp('app'), dist, {})
		.then(function() {
			// Also create a fully annotated minified copy
			return gulp.src(dist)
				.pipe(ngAnnotate())
				.pipe(uglify())
				.pipe(rename('app.min.js'))
				.pipe(gulp.dest(paths.dist));
		})
		.then(function() {
			// Inject minified script into index
			return gulp.src('client/index.html')
				.pipe(htmlreplace({
					'js': 'app.min.js'
				}))
				.pipe(gulp.dest(paths.dist));
		});
});
