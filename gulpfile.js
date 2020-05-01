var gulp = require('gulp');
var ts = require('gulp-typescript');
var concat = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var tsProject = ts.createProject('tsconfig.json');

gulp.task('default', () => {
    var tsResult = tsProject
        .src()
        // .pipe(sourcemaps.init())
        .pipe(tsProject());

    return (
        tsResult
            // .pipe(sourcemaps.write())
            .pipe(gulp.dest('./build/'))
    );
});

gulp.task('minify', () => {
    return gulp
        .src(['build/**/*.js'])
        .pipe(uglify())
        .pipe(gulp.dest('./build/'));
});
