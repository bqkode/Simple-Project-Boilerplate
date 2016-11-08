const   gulp         = require('gulp'),
        rename       = require('gulp-rename'),
        browserSync  = require('browser-sync'),
        stylus       = require('gulp-stylus'),
        rupture      = require('rupture'),
        autoprefixer = require('autoprefixer-stylus'),
        cleanCSS     = require('gulp-clean-css'),
        rimraf       = require('gulp-rimraf'),
        del          = require('del'),
        uglify       = require('gulp-uglify'),
        runSequence  = require('run-sequence'),
        sourcemaps   = require('gulp-sourcemaps'),
        source       = require('vinyl-source-stream'),
        vinylPaths   = require('vinyl-paths'),
        es           = require('event-stream'),
        browserify   = require('browserify'),
        gutil        = require('gulp-util'),
        print        = require('gulp-print'),
        notify       = require('gulp-notify'),
        babel        = require('babelify'),
        clear        = require('clear'),
        args         = require('yargs').argv,
        paths = {
                src: 'src/',
                dest: 'build/'
            };


/* JS handling */

gulp.task('browserify', () => {

    var appBundler = browserify({
        entries: paths.src+'js/main.js',
        debug: true
    })

    return appBundler
        // transform ES6 and JSX to ES5 with babelify
        .transform("babelify", {presets: ["es2015"]})
        .bundle()
        .on('error', notifyError)
        .pipe(source('js/scripts.js'))
        .pipe(gulp.dest(paths.dest));

});

gulp.task('js', (callback) => {
    args.deletePaths = paths.dest + 'js/*.*';
    runSequence('clean', 'browserify', 'uglify', callback);
});

gulp.task('uglify', () => {

    if (!args.isBuilding)
        return;

    return gulp.src(paths.dest + 'js/*.js')
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .on('error', notifyError)
        .pipe(rename({suffix: '.min'}))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.dest + 'js'))
});



/* Styles handling */

gulp.task('styles', (callback) => {
    args.deletePaths = paths.dest + 'css/*.*';
    runSequence('clean', 'stylus', 'minify-css', callback);
});

gulp.task('stylus', () =>
    gulp.src(paths.src + 'styl/style.styl')
        .pipe(sourcemaps.init())
        .pipe(stylus({
            use: [rupture(), autoprefixer({ browsers: ['last 2 versions'], cascade: false })]
        }))
        .on('error', notifyError)
        .pipe(rename({basename: 'styles'}))
        .pipe(gulp.dest(paths.dest + 'css/'))
);

gulp.task('minify-css', () => {

    if (!args.isBuilding)
        return;

    return gulp.src(paths.dest + 'css/*.css')
        .pipe(sourcemaps.init())
        .pipe(cleanCSS({compatibility: '*'}))
        .on('error', notifyError)
        .pipe(rename({suffix: '.min'}))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.dest + '/css'))
});


/* Other tasks */

gulp.task('browser-sync', () => {
    clear();
    browserSync({
        server: {
            baseDir: 'build'
        },
        ui: {
            port: 3002
        },
        files: [paths.dest + '/css/*.css'],
        ghostMode: {
            clicks: false,
            location: true,
            forms: false,
            scroll: false
        },
        open: false
    });
});

gulp.task('clean', () => {

    //clear the console
    if (!args.isBuilding)
        clear();

    var paths = args.deletePaths;

    if (!paths)
        return;

    args.deletePaths = null;

    return gulp.src(paths)
        .pipe(print((filepath) => { return 'Delete: '+ filepath }))
        .pipe(vinylPaths(del))

});


gulp.task('default', ['dev']);

gulp.task('dev', ['setDev', 'browser-sync'], (callback) => {
    args.isBuilding = false;

    args.deletePaths = [paths.dest + 'css/*.*', paths.dest + 'js/*.*'];
    runSequence('clean', 'styles', 'js', callback);

    gulp.watch('**/*.html', {cwd: paths.build}).on('change', browserSync.reload);
    gulp.watch('styl/**/*.styl', {cwd: paths.src}, ['styles']).on(['add', 'unlink'], browserSync.reload);

    gulp.watch(['js/**/*.js'], {cwd: paths.src}, ['js']).on(['add', 'unlink'], browserSync.reload);
    gulp.watch(['js/**/*.js'], {cwd: paths.dest}).on('change', browserSync.reload);
});

gulp.task('build', (callback) => {
    args.isBuilding = true;
    args.deletePaths = [paths.dest + 'css/*.*', paths.dest + 'js/*.*'];
    runSequence('clean', 'styles', 'js', callback);
});

gulp.task('setDev', () => {
    args.isDev = true;
});


/* Helper Fns */

var notifyError = function(err) {
    var sep = gutil.colors.yellow('------------------------------------------------');

    gutil.log(sep);
    notify().write(err);
    gutil.log(sep);

    // we dont want it to break if we´re in dev. But we´d sure like it if building!
    if (args.isDev)
        this.emit('end');
}