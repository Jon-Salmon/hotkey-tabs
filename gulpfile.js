var gulp = require('gulp'),
  slim = require("gulp-slm");

var slimSources = ['app/**/*.slim'];

gulp.task('copy', function() {
  gulp.src([
      './app/**/*.js',
      './app/**/*.css',
      './app/**/*.json',
      './app/**/*.html'
    ], {
      base: './app/'
    })
    .pipe(gulp.dest('build'));
});

gulp.task('slim', function() {
  gulp.src(slimSources)
    .pipe(slim({
      pretty: true
    }))
    .pipe(gulp.dest("build/"));
});

gulp.task('img', function() {
  gulp.src('img/*')
    .pipe(gulp.dest('build/img/'))
});

gulp.task('css', function() {
  gulp.src('app/css/*.scss')
    .pipe(sass({
      outputStyle: 'compressed'
    }).on('error', sass.logError))
    .pipe(concat('style.css'))
    .pipe(gulp.dest('build/css'));
});

gulp.task('watch', function() {
  gulp.watch([
    './app/**/*.js',
    './app/**/*.css',
    './app/**/*.json',
    './app/**/*.html'
  ], ['copy']);
  gulp.watch('app/img/*', ['img']);
  gulp.watch(slimSources, ['slim']);
})

gulp.task('build', ['copy', 'slim', 'img']);
gulp.task('default', ['copy', 'slim', 'img', 'watch']);