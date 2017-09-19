
const { basename } = require('path');
const gulp = require('gulp');
const replace = require('gulp-replace');
const autoprefixer = require('gulp-autoprefixer');
const sass = require('gulp-sass');
const tap = require('gulp-tap');

const EPISODE_TEMPLATE_CSS_CLASS = 'episode-template';
const EPISODE_IMAGE_PATH = 'https://s3.amazonaws.com/narrasys.static.uploads/production/customer/';
const BG_URL_REGEX = /url\((.*?)\)/g;
/*
  for this to work there must be a convention where the file name is the same
  as the customer css class namespace in the css file.
  eg. file: episode-columbia.scss  css class: .episode-columbia {}
*/
gulp.task('legacy-sass', () => {
  return gulp.src('./legacy-styles/*.scss')
    .pipe(tap((file) => {
      const fileName = basename(file.path);
      const replaceCssClass = fileName.split('.')[0];
      return gulp.src(`./legacy-styles/${fileName}`)
        .pipe(replace(replaceCssClass, EPISODE_TEMPLATE_CSS_CLASS))
        .pipe(replace(BG_URL_REGEX, (match) => {
          const fileName = match.slice(match.lastIndexOf('/') + 1, -2);
          return `url("${EPISODE_IMAGE_PATH + fileName}")`
        }))
        .pipe(autoprefixer({
          browsers: ['last 2 versions'],
          cascade: false
        }))
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(gulp.dest('./css'));
    }))
});

