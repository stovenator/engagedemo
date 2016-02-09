// gulp
var gulp = require('gulp');

// plugins
var connect = require('gulp-connect');
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');
var clean = require('gulp-clean');
var runSequence = require('run-sequence');
var source = require('vinyl-source-stream');
var browserify = require('browserify');

var paths = {
  public:   ['app/public/'],
  scripts:  ['app/js/**/*.js', 'app/js/*.js']
};

// tasks
gulp.task('browserify', function() {
    // Grabs the app.js file
    return browserify('./app/js/main.js')
        // bundles it and creates a file called main.js
        .bundle()
        .pipe(source('bundle.js'))
        // saves it the public/js/ directory
        .pipe(gulp.dest('./app/public/js/'));
});
gulp.task('clean', function() {
    return gulp.src('./dist/*', {read: false})
      .pipe(clean());
});
gulp.task('copy-bower-components', function () {
  gulp.src('./app/bower_components/**')
    .pipe(gulp.dest('dist/bower_components'));
});
gulp.task('copy-html-files', function () {
  gulp.src('./app/**/*.html')
    .pipe(gulp.dest('dist/'));
});
gulp.task('connect', function () {
  connect.server({
    root: 'app/',
    port: 8888
  });
});

gulp.task('watch', function() {
  // Watch less files
  gulp.watch(paths.scripts, ['build']);
});

// default task
gulp.task('default', function(){
    runSequence(
        ['build', 'connect', 'watch']
    );
});
gulp.task('build', function() {
  runSequence(
    'clean',
    ['browserify', 'copy-html-files', 'copy-bower-components']
  );
});
