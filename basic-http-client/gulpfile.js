
const nodemon = require('nodemon');
//var livereload = require('gulp-livereload');

const connect = require('gulp-connect');
const gulp = require('gulp');
const debug = require('gulp-debug');
const stripDebug = require('gulp-strip-debug');
const gif = require('gulp-if');
const zip = require('gulp-zip');
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
const html2js = require('gulp-ng-html2js');
const minifyHtml = require("gulp-minify-html");

const svgstore = require('gulp-svg-ngmaterial');
const svgmin = require('gulp-svgmin');


//===============================================
const isrelease = process.env.PROJ_RELEASE || false;
const livereloadGlobs = [
        'wwwroot/**/*.js',
        'wwwroot/**/*.html',
        'wwwroot/**/*.css',
        'wwwroot/**/*.svg',
        'wwwroot/**/*.json'
];
//================================================

gulp.task('build', ['prints', 'svgstore', 'lib', 'assets', 'html2js', 'index', 'script', 'sass']);

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

    connect.server({
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
    gulp.watch(['./src/app/**/*.ts', './src/app/**/*.tsx'], ['script']);
    gulp.watch(['./src/app/**/*.html', '!./src/**/index.html'], ['html2js']);
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
    gulp.src('./src/lib/**/*.js')
		.pipe(concat('lib.js'))
		.pipe(gulp.dest('wwwroot/js'));
		
	gulp.src('./src/lib/**/*.css')
		.pipe(concat('lib.css'))
		.pipe(gulp.dest('wwwroot/css'));
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

gulp.task('html2js', function () {
    return gulp.src(['./src/app/**/*.html', '!./src/**/index.html'])
        .pipe(gif(isrelease, minifyHtml()))
        .pipe(html2js({
            moduleName: 'app.templates',
            useStrict: true
        }))
        .pipe(concat('templates.js'))
        .pipe(gif(isrelease, buffer()))
        .pipe(gif(isrelease, uglify({ compress: { drop_console: true } })))
        .pipe(debug({ title: 'html2js:' }))
        .pipe(gulp.dest('wwwroot/js'));
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
    var dev = browserify('./src/app/app.ts', { debug: !isrelease })
        .plugin(tsify, tsconfig)
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

gulp.task('zip', ['build'], function () {
    return gulp.src('wwwroot/**/*')
		.pipe(zip('dist.zip'))
		.pipe(gulp.dest('./wwwroot'));
});
