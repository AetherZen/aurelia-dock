var gulp = require('gulp');
var runSequence = require('run-sequence');
var changed = require('gulp-changed');
var plumber = require('gulp-plumber');
var babel = require('gulp-babel');
var sourcemaps = require('gulp-sourcemaps');
var assign = Object.assign || require('object.assign');
var del = require('del');
var vinylPaths = require('vinyl-paths');
var tar = require('gulp-tar');
var gzip = require('gulp-gzip');
var fs = require('fs');
var sass = require('gulp-sass');
var nodemon = require('gulp-nodemon');

/*
  Task to clean up dist-server
  directories
 */
gulp.task('clean', function() {
  return gulp.src(['dist-server', 'dist-client', 'dist-package', 'dist-usrlib',
                   'stage', 'stage-control', 'stage-data', 'stage-compressed'])
    .pipe(vinylPaths(del));
});

/*
  Task to compile server js code with babel
 */

gulp.task('build-server-js', function () {
  var compilerOptions = {
    modules: 'common',
    moduleIds: false,
    comments: false,
    compact: false,
    stage:2,
    optional: ["es7.decorators", "es7.classProperties"]
  };
  return gulp.src('src-server/**/*.js')
    .pipe(plumber())
    .pipe(changed('dist-server/', {extension: '.js'}))
    .pipe(sourcemaps.init())
    .pipe(babel(assign({}, compilerOptions, {modules:'common'})))
    .pipe(sourcemaps.write({includeContent: false, sourceRoot: '/src-server/' }))
    .pipe(gulp.dest('dist-server/'));
});

/*
  Task to compile client js code with babel
 */
gulp.task('build-client-js', function () {
  var compilerOptions = {
    modules: 'system',
    moduleIds: false,
    comments: false,
    compact: false,
    stage:2,
    optional: ["es7.decorators", "es7.classProperties"]
  };
  return gulp.src('src-client/**/*.js')
    .pipe(plumber())
    .pipe(changed('dist-client/', {extension: '.js'}))
    .pipe(sourcemaps.init())
    .pipe(babel(assign({}, compilerOptions, {modules:'system'})))
    .pipe(sourcemaps.write({includeContent: false, sourceRoot: '/src-client/' }))
    .pipe(gulp.dest('dist-client/'));
});

/*
  Task to compile usrlib js code with babel
 */
gulp.task('build-usrlib-js', function () {
  var compilerOptions = {
    modules: 'system',
    moduleIds: false,
    comments: false,
    compact: false,
    stage:2,
    optional: ["es7.decorators", "es7.classProperties"]
  };
  return gulp.src('src-usrlib/**/*.js')
    .pipe(plumber())
    .pipe(changed('dist-usrlib/', {extension: '.js'}))
    .pipe(sourcemaps.init())
    .pipe(babel(assign({}, compilerOptions, {modules:'system'})))
    .pipe(sourcemaps.write({includeContent: false, sourceRoot: '/src-usrlib/' }))
    .pipe(gulp.dest('dist-usrlib/'));
});


/*
  Compile sass into CSS
 */
gulp.task('sass', function() {
    return gulp.src("scss/*.scss")
        .pipe(sass())
        .pipe(gulp.dest("assets/css"));
});

/*
  Task to copy client html files from src to dist
 */
gulp.task('build-client-html', function () {
  return gulp.src('src-client/**/*.html')
    .pipe(changed('dist-client/', {extension: '.html'}))
    .pipe(gulp.dest('dist-client/'));
});


/*
  Task to copy usrlib html files from src to dist
 */
gulp.task('build-usrlib-html', function () {
  return gulp.src('src-usrlib/**/*.html')
    .pipe(changed('dist-usrlib/', {extension: '.html'}))
    .pipe(gulp.dest('dist-usrlib/'));
});

/*
  Task to clean and build the entire application
 */
gulp.task('build', function(callback) {
  return runSequence('clean',
    ['build-server-js', 'build-usrlib-js', 'build-usrlib-html', 'sass', 'build-client-js', 'build-client-html'],
    callback);
});

/*
    Stage the client files for distribution
 */
gulp.task('stage-client', ['build'], function() {
  var pkg = JSON.parse(fs.readFileSync('./package.json'));
  return gulp.src(['dist-client/**/*', 'assets/**/*'])
   .pipe(gulp.dest('stage/apps/client/' + pkg.name + '/' + pkg.version));
});

/*
    Stage the usrlib files for distribution
 */
gulp.task('stage-usrlib', ['build'], function() {
  var pkg = JSON.parse(fs.readFileSync('./package.json'));
  return gulp.src(['dist-usrlib/**/*', 'assets/**/*'])
   .pipe(gulp.dest('stage/usr/lib/' + pkg.name + '/' + pkg.version));
});

/*
  Stage the server files for distribution
 */
 gulp.task('stage-server', ['build'], function() {
   var pkg = JSON.parse(fs.readFileSync('./package.json'));
   return gulp.src('dist-server/**/*')
    .pipe(gulp.dest('stage/apps/server/' + pkg.name + '/' + pkg.version));
 })

/*
    Stage into the data archive
 */
gulp.task('stage-data', ['stage-server', 'stage-client', 'stage-usrlib'], function() {
  var pkg = JSON.parse(fs.readFileSync('./package.json'));
  return gulp.src('stage/**/*')
    .pipe(tar('data.tar'))
    .pipe(gzip())
    .pipe(gulp.dest('stage-compressed'));
})

/*
    Copy config file(s) to stage-control
 */
gulp.task('stage-config', ['stage-data'], function() {
  return gulp.src('package.json')
    .pipe(gulp.dest('stage-control'));
})

/*
    Stage into the control archive
    TODO Also need to create the md5 checksums
 */
gulp.task('stage-control', ['stage-config'], function() {
  var pkg = JSON.parse(fs.readFileSync('./package.json'));
  return gulp.src('stage-control/**/*')
    .pipe(tar('control.tar'))
    .pipe(gzip())
    .pipe(gulp.dest('stage-compressed'));
})

/*
  Package the files for distribution
 */
gulp.task('package', ['stage-control', 'stage-data'], function() {
  var pkg = JSON.parse(fs.readFileSync('./package.json'));
  return gulp.src('stage-compressed/**/*')
    .pipe(tar(pkg.name + '-' + pkg.version + '-aether-es5.tar'))
    .pipe(gzip())
    .pipe(gulp.dest('dist-package'));
});

/*
    Install into Aethernet / AethOS
 */
gulp.task('install', ['package'], function() {
  // For now, just install directly into Aethernet and bypass processing
  // the package.
  var config = JSON.parse(fs.readFileSync('./aetherconfig.json'));

  return gulp.src('stage/**/*')
    .pipe(gulp.dest(config.shared));
});

gulp.task('dev', ['install'], function() {
  nodemon({
    watch: ['./src-client', './src-server', './src-usrlib', 'scss'],
    ext: 'js,html,scss',
    script: './dist-server/init.js',
    tasks: ['install'],
    env: { 'DEBUG' : 'aether:*,server,express:*' }
  });
})

/*
  Point default task to build
 */
gulp.task('default', ['build']);
