
const nodemon = require('nodemon');
//var livereload = require('gulp-livereload');

const connect = require('gulp-connect');
const gulp = require('gulp');
const debug = require('gulp-debug');
const stripDebug = require('gulp-strip-debug');
const gif = require('gulp-if');

const uglify = require('gulp-uglify');
const cssmin = require('gulp-cssmin');

const path = require('path');
const browserify = require('browserify');
const tsify = require('tsify');
const tsconfig = require('./tsconfig.json').compilerOptions;
const source = require('vinyl-source-stream'); // Used to stream bundle for further handling
const buffer = require('vinyl-buffer');

const sourcemaps = require('gulp-sourcemaps');
const concat = require('gulp-concat');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
var embedTemplates = require('gulp-angular-embed-templates');

const svgstore = require('gulp-svg-ngmaterial');
const svgmin = require('gulp-svgmin');
var babelify = require('babelify');

//===============================================
const isrelease = false;
const livereloadGlobs = [
        'wwwroot/**/*.js',
        'wwwroot/**/*.html',
        'wwwroot/**/*.css',
        'wwwroot/**/*.svg',
        'wwwroot/**/*.json'
];
//================================================

gulp.task('build', ['prints', 'svgstore', 'lib', 'assets', 'index', 'script', 'sass']);

gulp.task('default', ['livereload']);

gulp.task('prints', function () {
    console.log('source folder: ' + path.join(process.cwd(), './src'));
    console.log('target folder: ' + path.join(process.cwd(), 'wwwroot'));
    console.log('is release build: ' + isrelease);
    console.log('versions: ', process.versions);
});

// ================================
// STATIC SERVER
// ================================
gulp.task('server', ['build'], function () {
    //livereload.listen();

    return connect.server({
        name: 'NG',
        root: ['wwwroot'],
        host: 'localhost',
        port: 3000,
        livereload: true,
        https: false
    })
    .server.on("listening", function (socket) {
        console.log('livereload:all');
        //livereload();
        connect.reload();
     });
});

gulp.task('livereload', ['watch'], function () {
    gulp.watch(livereloadGlobs, function (file) {
        console.log('livereload', file);
        //livereload();
        connect.reload();
    });
});

// ================================
// WATCH
// ================================

gulp.task('watch', ['server'], function () {
    gulp.watch(['./src/lib/**/*.*'], ['lib']);
    gulp.watch(['./src/app/**/*.scss'], ['sass']);
    gulp.watch(['./src/app/index.html'], ['index']);
    gulp.watch(['./src/app/assets/**/*.*', '!./src/app/assets/svg/**/*.svg'], ['assets']);
    gulp.watch(['./src/app/**/*.ts', './src/app/**/*.tsx', './src/app/**/*.html', '!./src/**/index.html'], ['script']);
    gulp.watch(['./src/app/assets/svg/**/*.svg'], ['svgstore']);
});

// ================================
// BUILD
// ================================

gulp.task('index', function () {
    return gulp.src('./src/app/index.html')
        .pipe(gulp.dest('wwwroot'));
});

gulp.task('lib', function () {
    return gulp.src('./src/lib/**/*.*')
        .pipe(gulp.dest('wwwroot/lib'));
});

gulp.task('assets', function () {
    return gulp.src(['./src/app/assets/**/*.*', '!./src/app/assets/svg/**/*.svg'])
        .pipe(gulp.dest('wwwroot/assets'));
});

gulp.task('sass', function () {
    return gulp.src('./src/app/**/*.scss')
        .pipe(gif(!isrelease, sourcemaps.init({ loadMaps: true })))
        .pipe(sass().on('error', sass.logError))
        .pipe(concat('all.css'))
        .pipe(autoprefixer(['last 4 versions', 'ie >= 9']))
        .pipe(gif(isrelease, buffer()))
        .pipe(gif(isrelease, cssmin()))
        .pipe(gif(!isrelease, sourcemaps.write('./')))
        .pipe(debug({ title: 'sass:' }))
        .pipe(gulp.dest('wwwroot/css'));
});

gulp.task('svgstore', function () {
    return gulp.src('./src/app/assets/svg/**/*.svg')
        .pipe(gif(isrelease,
            svgmin(function (file) {
                return { plugins: [{ cleanupIDs: { minify: true } }] }
            })
        ))
        .pipe(svgstore())
        .pipe(concat('all.svg'))
        .pipe(debug({ title: 'svgstore:' }))
        .pipe(gulp.dest('wwwroot/svg'));
});

gulp.task('script', function () {
    return gulp.src('src/app/**/*.ts') // also can use *.js files 
        .pipe(embedTemplates({ sourceType: 'ts' }))
        .pipe(debug({ title: 'tmpl:' }))
        .pipe(gulp.dest('./build/app'))
        .on('end', function () {
            var dev = browserify('./build/app/app.ts', { debug: !isrelease })
                .plugin(tsify, tsconfig)
                .transform(babelify, { extensions: ['.tsx', '.ts'] })
                .on('error', function (error) {
                    console.error('tsify error: ' + error.toString());
                    this.emit("end");
                })
                .bundle()
                    .pipe(source('app.js'))
                    .pipe(buffer())
                    .pipe(gif(isrelease, stripDebug()))
                    .pipe(gif(!isrelease, sourcemaps.init({ loadMaps: true })))
                    .pipe(gif(isrelease, buffer()))
                    .pipe(gif(isrelease, uglify({ compress: { drop_console: true } })))
                    .pipe(gif(!isrelease, sourcemaps.write('./')))
                    .pipe(debug({ title: 'script:' }))
                    .pipe(gulp.dest('wwwroot/js'));

            return dev;
        });
});