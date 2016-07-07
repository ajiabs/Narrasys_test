// Generated on 2013-10-24 using generator-angular 0.5.1
'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function (grunt) {
	require('load-grunt-tasks')(grunt);
	require('time-grunt')(grunt);

	grunt.loadNpmTasks('grunt-ngdocs');

	grunt.initConfig({
		yeoman: {
			// configurable paths
			app: require('./bower.json').appPath || 'app',
			dist: 'dist'
		},
		ngdocs: {
			options: {
				dest: 'docs/ng-docs',
				html5Mode: false,
				scripts: [
					'<%= yeoman.app %>/bower_components/angular/angular.js',
					'<%= yeoman.app %>/bower_components/angular-animate/angular-animate.js'
				]
			},
			all: {
				src: '<%= yeoman.app %>/scripts/**/*.js'
			}
		},
		ngtemplates: {
			"com.inthetelling.story": { // this subtask name becomes the module name that is created
				cwd: '<%= yeoman.app %>',
				src: 'templates/**/*.html',
				dest: '<%= yeoman.app %>/scripts/templates.js',
				options: {
					/*
					 collapseWhitespace does save some space, and works corretly here (though not as part of the base htmlmin rule)
					 but it has visible side effects, making server and server:dist appear different.
					 */
					htmlmin: {
						collapseBooleanAttributes: true,
						collapseWhitespace: true, // Safe in templates, not in base html
						// removeAttributeQuotes: true,  // Disabled for Instructure (they theorize this somehow causes their iframe to load at the wrong size)
						removeCommentsFromCDATA: true,
						removeComments: true,
						removeEmptyAttributes: true,
						// removeOptionalTags: true, // Disabled for Instructure (they theorize this somehow causes their iframe to load at the wrong size)
						removeRedundantAttributes: true,
						useShortDoctype: true,
					}
					/* we are not using bootstrap
					 ,
					 url: function(url) {
					 // modify the template id/url for any bootstrap
					 // templates so that angular-bootstrap can find them
					 if (url.search('templates/bootstrap/') !== -1) {
					 return url.replace('templates/bootstrap/', 'template/');
					 }
					 return url;
					 },
					 bootstrap: function(module, script) {
					 var output = "'use strict';\n\n";
					 output += "// Auto-generated by grunt from contents of app/templates/*\n";
					 output += "// Direct edits to this file will be overwritten!!!\n";
					 output += "angular.module('" + module + "').run(['$templateCache', function($templateCache) {\n\n" + script + "\n\n}]);";
					 return output;
					 }
					 */
				}
			}
		},
		watch: {
			styles: {
				files: ['<%= yeoman.app %>/styles/{,*/}*.css'],
				tasks: ['copy:styles', 'autoprefixer']
			},
			templates: {
				files: ['<%= yeoman.app %>/templates/**/*.html'],
				tasks: ['ngtemplates']
			}
			//livereload: {
			//	options: {
			//		livereload: '<%= connect.options.livereload %>'
			//	},
			//	files: [
			//		'<%= yeoman.app %>/**/*.html',
			//		'.tmp/styles/{,*/}*.css',
			//		'{.tmp,<%= yeoman.app %>}/scripts/**/*.js',
			//		'<%= yeoman.app %>/server-mock/**/*.{html,json}',
			//		'<%= yeoman.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg,eot,ttf,woff}'
			//	]
			//}
		},
		autoprefixer: {
			options: ['last 2 versions'],
			dist: {
				files: [{
					expand: true,
					cwd: '.tmp/styles/',
					src: '{,*/}*.css',
					dest: '.tmp/styles/'
				}]
			}
		},
		connect: {
			options: {
				port: 9000,
				// Change this to '0.0.0.0' to access the server from outside.
				hostname: '0.0.0.0',
				livereload: 35729
			},
			livereload: {
				options: {
					open: true,
					base: [
						'.tmp',
						'<%= yeoman.app %>'
					]
				}
			},
			test: {
				options: {
					port: 9001,
					base: [
						'.tmp',
						'test',
						'<%= yeoman.app %>'
					]
				}
			},
			docs: {
				options: {
					hostname: 'localhost',
					port: 6969,
					base: 'docs/ng-docs',
					keepalive: true
				}
			},
			dist: {
				options: {
					base: '<%= yeoman.dist %>'
				}
			}
		},
		clean: {
			dist: {
				files: [{
					dot: true,
					src: [
						'.tmp',
						'<%= yeoman.dist %>/*',
						'!<%= yeoman.dist %>/.git*'
					]
				}]
			},
			server: '.tmp',
			docs: 'docs/ng-docs/*'
		},
		jshint: {
			options: {
				jshintrc: '.jshintrc'
			},
			all: [
				'Gruntfile.js',
				'<%= yeoman.app %>/scripts/{controllers/,directives/,filters/,services/,app}*.js'
			]
		},
		rev: {
			dist: {
				files: {
					src: [
						'<%= yeoman.dist %>/scripts/{,*/}*.js',
						'<%= yeoman.dist %>/styles/{,*/}*.css' //,
						//'<%= yeoman.dist %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
						//'<%= yeoman.dist %>/styles/font/*'
					]
				}
			}
		},
		useminPrepare: {
			html: '<%= yeoman.app %>/index.html',
			options: {
				dest: '<%= yeoman.dist %>'
			}
		},
		usemin: {
			html: ['<%= yeoman.dist %>/{,*/}*.html'],
			css: ['<%= yeoman.dist %>/styles/{,*/}*.css'],
			options: {
				dirs: ['<%= yeoman.dist %>']
			}
		},
		imagemin: {
			dist: {
				files: [{
					expand: true,
					cwd: '<%= yeoman.app %>/images',
					src: '{,*/}*.{png,jpg,jpeg}',
					dest: '<%= yeoman.dist %>/images'
				}]
			}
		},
		svgmin: {
			dist: {
				files: [{
					expand: true,
					cwd: '<%= yeoman.app %>/images',
					src: '{,*/}*.svg',
					dest: '<%= yeoman.dist %>/images'
				}]
			}
		},
		cssmin: {
			// By default, your `index.html` <!-- Usemin Block --> will take care of
			// minification. This option is pre-configured if you do not wish to use
			// Usemin blocks.
			// dist: {
			//	 files: {
			//		 '<%= yeoman.dist %>/styles/main.css': [
			//			 '.tmp/styles/{,*/}*.css',
			//			 '<%= yeoman.app %>/styles/{,*/}*.css'
			//		 ]
			//	 }
			// }
		},
		htmlmin: {
			dist: {
				options: {
					removeCommentsFromCDATA: true,
					//collapseWhitespace: true, // https://github.com/yeoman/grunt-usemin/issues/44
					collapseBooleanAttributes: true,
					// removeAttributeQuotes: true, // Disabled for Instructure (they theorize this somehow causes their iframe to load at the wrong size)
					removeRedundantAttributes: true,
					useShortDoctype: true,
					removeEmptyAttributes: true,
					// removeOptionalTags: true     // Disabled for Instructure (they theorize this somehow causes their iframe to load at the wrong size)
				},
				files: [{
					expand: true,
					cwd: '<%= yeoman.app %>',
					// src: ['*.html', 'views/*.html'],
					src: ['[^_]*.html'],
					dest: '<%= yeoman.dist %>'
				}]
			}
		},
		// Put files not handled in other tasks here
		copy: {
			dist: {
				files: [{
					expand: true,
					dot: true,
					cwd: '<%= yeoman.app %>',
					dest: '<%= yeoman.dist %>',
					src: [
						'[^_]*.{ico,png,txt}',
						'images/{,*/}*.{png,jpg,jpeg,gif,webp,svg,eot,ttf,otf,woff}',
						'styles/font/*',
						'config.js',
						'iosFrameHack.js'
					]
				}, {
					expand: true,
					cwd: '.tmp/images',
					dest: '<%= yeoman.dist %>/images',
					src: [
						'generated/*'
					]
				}]
			},
			serverDist: {
				expand: true,
				dot: true,
				cwd: '<%= yeoman.app %>',
				dest: '<%= yeoman.dist %>',
				src: 'server-mock/**/*.{html,json}'
			},
			styles: {
				expand: true,
				cwd: '<%= yeoman.app %>/styles',
				dest: '.tmp/styles/',
				src: '{,*/}*.css'
			}
		},
		concurrent: {
			server: [
				'copy:styles'
			],
			test: [
				'copy:styles'
			],
			dist: [
				'copy:styles',
				'imagemin',
				'svgmin',
				'htmlmin'
			]
		},
		karma: {
			unit: {
				configFile: 'karma.conf.js',
				singleRun: true,
			},
			continuous: {
				configFile: 'karma.conf.js',
				singleRun: false,
				reporters: ['progress', 'growler']
			}
		},
		ngAnnotate: {
			dist: {
				files: [{
					expand: true,
					cwd: '<%= yeoman.dist %>/scripts',
					src: '*.js',
					dest: '<%= yeoman.dist %>/scripts'
				}]
			}
		},
		uglify: {
			options: {
				compress: {
					unsafe: true,
					drop_console: true
				}

			},
			build: {
				files: [{
					expand: true,
					src: '**/*.js',
					dest: '<%= yeoman.dist %>/scripts',
					cwd: '<%= yeoman.dist %>/scripts',
					ext: '.min.js'
				}]
			}
		},
		browserSync: {
			dev: {
				bsFiles: {
					src : ['<%= yeoman.app %>/styles/**/*.css', '<%= yeoman.app %>/scripts/**/*.js']
				},
				options: {
					port:'3333',
					proxy: "https://localhost.inthetelling.com",
					watchTask: true
				}
			},
			docs: {
				options: {
					port: 6969, //heh
					startPath: '/#/api/iTT'	,
					server: {
						baseDir: './docs/ng-docs'
					}
				}
			}
		}

	});

	grunt.loadNpmTasks('grunt-browser-sync');

	grunt.registerTask('server', function (target) {
		if (target === 'dist') {
			return grunt.task.run([
				'build',
				'copy:serverDist',
				'connect:dist:keepalive'
			]);
		}

		grunt.task.run([
			'clean:server',
			'ngtemplates',
			'concurrent:server',
			'autoprefixer',
			'connect:livereload',
			'watch'
		]);
	});

	grunt.registerTask('test', [
		'clean:server',
		'ngtemplates',
		'concurrent:test',
		'autoprefixer',
		'connect:test',
		'karma:unit'
	]);

	grunt.registerTask('dev', [
		'karma:continuous'
	]);

	grunt.registerTask('build', [
		'jshint',
		'test',
		'clean:dist',
		'ngtemplates',
		'useminPrepare',
		'concurrent:dist',
		'autoprefixer',
		'concat',
		'copy:dist',
		'ngAnnotate',
		'cssmin',
		'uglify',
		'rev',
		'usemin',
		'clean:docs',
		'ngdocs'
	]);

	grunt.registerTask('doWork', [
		'clean:server',
		'ngtemplates',
		'autoprefixer',
		'browserSync:dev',
		'watch'
	]);

	grunt.registerTask('docGen', [
		'clean:docs',
		'ngdocs',
		'browserSync:docs'
	]);

};
