
const gulp = require('gulp');
const debug = require('gulp-debug');
const stripDebug = require('gulp-strip-debug');
const gif = require('gulp-if');
const uglify = require('gulp-uglify-es').default;
const browserify = require('browserify');
const tsify = require('tsify');
const tsconfig = require('./tsconfig.json');
const source = require('vinyl-source-stream'); // Used to stream bundle for further handling
const buffer = require('vinyl-buffer');
const sourcemaps = require('gulp-sourcemaps');

//===============================================
const isrelease = false;
//================================================

gulp.task('default', function () {
    var dev = browserify('./src/main.ts', {
        debug: !isrelease,
        builtins: false,
        commondir: false,
        fullPaths: false,
        standalone:       'lambda',
        browserField:     false,  // Setup for node app (copy logic of --node in bin/args.js)
        ignoreMissing:    true,  // Do not fail on missing optional dependencies
        detectGlobals:    true,  // We don't care if its slower, we want more mods to work
        insertGlobalVars: {      // Handle process https://github.com/substack/node-browserify/issues/1277
            global: undefined,
            'Buffer.isBuffer': undefined,
            Buffer: undefined,
            process: undefined
            //process: function() {},
        }})
        .plugin(tsify, tsconfig)
        .on('error', function (error) {
            console.error('tsify error: ' + error.toString());
            this.emit("end");
        })
        .external('aws-sdk')
        .external('mongoose')
        .bundle()
            .pipe(source('app.js'))
            .pipe(buffer())
            .pipe(gif(isrelease, stripDebug()))
            .pipe(gif(!isrelease, sourcemaps.init({ loadMaps: true })))
            .pipe(gif(isrelease, uglify({ compress: { drop_console: true } })))
            .on('error', function (error) {
                console.error('tsify error: ' + error.toString());
                this.emit("end");
            })
            .pipe(gif(!isrelease, sourcemaps.write('./')))
            .pipe(debug({ title: 'script:' }))
            .pipe(gulp.dest('build'));

    return dev;
});
