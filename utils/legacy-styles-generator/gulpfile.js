
const { resolve } = require('path');
const gulp = require('gulp');
const replace = require('gulp-replace');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const sass = require('gulp-sass');
const argv = require('yargs').argv;

const cssFileName = argv.css;
const replaceCssClass = argv.replace;
const stylesDir = resolve('../../app/styles');
const EPISODE_TEMPLATE_CSS_CLASS = 'episode-template';

/*
  example: ./node_modules/.bin/gulp legacy-css --replace episode-purdue --css episode-purdue.css
 */
gulp.task('legacy-css', () => {

  if (cssFileName == null || replaceCssClass == null) {
    throw '-css and --replace flags are required';
    return;
  }

  gulp.src(`./css/${cssFileName}`)
    .pipe(replace(replaceCssClass, EPISODE_TEMPLATE_CSS_CLASS))
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(gulp.dest('./css'));
});

gulp.task('legacy-sass', () => {
  return gulp.src('./legacy-styles/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./css'));
});

