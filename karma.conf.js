'use strict';

// Karma configuration
// http://karma-runner.github.io/0.10/config/configuration-file.html

module.exports = function (config) {
	config.set({
		// base path, that will be used to resolve files and exclude
		basePath: '',

		// testing framework to use (jasmine/mocha/qunit/...)
		frameworks: ['jasmine'],

		// list of files / patterns to load in the browser
		files: [
			'app/bower_components/angular/angular.min.js',
			'app/bower_components/angular-mocks/angular-mocks.js',
			'app/bower_components/jquery/dist/jquery.min.js',
			'app/bower_components/angular-animate/angular-animate.min.js',
			'app/bower_components/angular-route/angular-route.min.js',
			'app/bower_components/angular-sanitize/angular-sanitize.min.js',

			'app/bower_components/flot/jquery.flot.js',
			'app/bower_components/flot/jquery.flot.pie.js',
			'app/scripts/plugin/newrelic.js',
			'app/bower_components/textAngular/dist/textAngular.min.js',
			'app/bower_components/textAngular/dist/textAngular-sanitize.min.js',
			// 'app/bower_components/textAngular/dist/textAngular-rangy.min.js',
			'app/bower_components/textAngularRangyFake.js', // the real one throws errors we don't care about.
			'app/bower_components/angular-ui-tree/dist/angular-ui-tree.min.js',

			'app/config.js',
			'app/scripts/*.js',
			'app/scripts/**/*.js',
			'test/mock/*.json',
			'test/spec/**/*.js',
      // 'test/spec/services/kalturaUrlService.js'
		],

		// list of files / patterns to exclude
		exclude: [],

		// web server port
		port: 8080,

		// level of logging
		// possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
		logLevel: config.LOG_INFO,

		// enable / disable watching file and executing tests whenever any file changes
		autoWatch: true,

		// Start these browsers, currently available:
		// - Chrome
		// - ChromeCanary
		// - Firefox
		// - Opera
		// - Safari (only Mac)
		// - PhantomJS
		// - IE (only Windows)
		browsers: ['PhantomJS'],

		// Continuous Integration mode
		// if true, it capture browsers, run tests and exit
		singleRun: true
	});
};
