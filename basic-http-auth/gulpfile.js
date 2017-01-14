
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
const html2js = require('gulp-ng-html2js');
const minifyHtml = require("gulp-minify-html");

const svgstore = require('gulp-svg-ngmaterial');
const svgmin = require('gulp-svgmin');


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

gulp.task('build', ['prints', 'svgstore', 'lib', 'assets', 'html2js', 'index', 'script', 'sass']);

gulp.task('default', ['livereload']);
gulp.task('express', ['watch-express']);

gulp.task('prints', function () {
    console.log('source folder: ' + path.join(process.cwd(), './client'));
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
// EXPRESS SERVER
// ================================
gulp.task('server-express', ['build', 'script-express'], function () {
    //livereload.listen();

    nodemon({
        script: 'wwwroot/server/app-express.js',
        watch: livereloadGlobs,
        vebose: true
    //...add nodeArgs: ['--debug=5858'] to debug 
    //..or nodeArgs: ['--debug-brk=5858'] to debug at server start
    }).on('start', function () {
        console.log('node: start');
        //livereload();
        connect.reload();
    });
});

gulp.task('watch-express', ['server-express'], function () {
    gulp.watch(['./client/lib/**/*.*'], ['lib']);
    gulp.watch(['./client/app/**/*.scss'], ['sass']);
    gulp.watch(['./client/app/index.html'], ['index']);
    gulp.watch(['./client/app/assets/**/*.*', '!./client/app/assets/svg/**/*.svg'], ['assets']);
    gulp.watch(['./client/app/**/*.ts', './client/app/**/*.tsx'], ['script']);
    gulp.watch(['./client/app/**/*.html', '!./client/**/index.html'], ['html2js']);
    gulp.watch(['./client/app/assets/svg/**/*.svg'], ['svgstore']);

    gulp.watch(['./server/**/*.ts'], ['script-express']);
});

gulp.task('script-express', function () {
    gulp.src('./server/db/users.json')
        .pipe(gulp.dest('wwwroot/server'));

    var dev = browserify('./server/app.ts', {
            debug: true,
            browserField: false,
            builtins: false,
            commondir: false,
            insertGlobalVars: {
                process: undefined,
                global: undefined,
                'Buffer.isBuffer': undefined,
                Buffer: undefined
            }
        })
        .plugin(tsify, tsconfig)
        .on('error', function (error) { console.log(error.toString()); this.end(); })
        .bundle()
              .pipe(source('app-express.js'))
              .pipe(buffer())
              .pipe(gif(isrelease, stripDebug()))
              .pipe(gif(!isrelease, sourcemaps.init({ loadMaps: true })))
              .pipe(gif(isrelease, buffer()))
              .pipe(gif(isrelease, uglify({ compress: { drop_console: true } })))
              .pipe(gif(!isrelease, sourcemaps.write('./')))
              .pipe(debug({ title: 'script:' }))
              .pipe(gulp.dest('wwwroot/server'));

    return dev;
});

// ================================
// WATCH
// ================================

gulp.task('watch', ['server'], function () {
    gulp.watch(['./client/lib/**/*.*'], ['lib']);
    gulp.watch(['./client/app/**/*.scss'], ['sass']);
    gulp.watch(['./client/app/index.html'], ['index']);
    gulp.watch(['./client/app/assets/**/*.*', '!./client/app/assets/svg/**/*.svg'], ['assets']);
    gulp.watch(['./client/app/**/*.ts', './client/app/**/*.tsx'], ['script']);
    gulp.watch(['./client/app/**/*.html', '!./client/**/index.html'], ['html2js']);
    gulp.watch(['./client/app/assets/svg/**/*.svg'], ['svgstore']);
});

// ================================
// BUILD
// ================================

gulp.task('index', function () {
    return gulp.src('./client/app/index.html')
        .pipe(gulp.dest('wwwroot'));
});

gulp.task('lib', function () {
    return gulp.src('./client/lib/**/*.*')
        .pipe(gulp.dest('wwwroot/lib'));
});

gulp.task('assets', function () {
    return gulp.src(['./client/app/assets/**/*.*', '!./client/app/assets/svg/**/*.svg'])
        .pipe(gulp.dest('wwwroot/assets'));
});

gulp.task('sass', function () {
    return gulp.src('./client/app/**/*.scss')
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
    return gulp.src(['./client/app/**/*.html', '!./client/**/index.html'])
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
    return gulp.src('./client/app/assets/svg/**/*.svg')
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
    var dev = browserify('./client/app/app.ts', { debug: !isrelease })
        .plugin(tsify, tsconfig)
        .on('error', function (error) { console.log(error.toString()); this.end(); })
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
