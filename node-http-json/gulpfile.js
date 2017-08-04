
const nodemon = require('nodemon');
//var livereload = require('gulp-livereload');

const connect = require('gulp-connect');
const gulp = require('gulp');
const debug = require('gulp-debug');
const stripDebug = require('gulp-strip-debug');
const gif = require('gulp-if');
const uglify = require('gulp-uglify');
const browserify = require('browserify');
const tsify = require('tsify');
const tsconfig = require('./tsconfig.json').compilerOptions;
const source = require('vinyl-source-stream'); // Used to stream bundle for further handling
const buffer = require('vinyl-buffer');
const sourcemaps = require('gulp-sourcemaps');
const zip = require('gulp-zip');

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

gulp.task('default', ['watch-express']);

gulp.task('prints', function () {
    console.log('current folder: ' + process.cwd());
    console.log('is release build: ' + isrelease);
    console.log('versions: ', process.versions);
});

// ================================
// EXPRESS SERVER
// ================================
gulp.task('server-express', ['build'], function () {
    //livereload.listen();

    nodemon({
        script: 'wwwroot/app-express.js',
        watch: livereloadGlobs,
        verbose: true
    //...add nodeArgs: ['--debug=5858'] to debug 
    //..or nodeArgs: ['--debug-brk=5858'] to debug at server start
    }).on('start', function () {
        console.log('node: start');
        //livereload();
        connect.reload();
    });
});

gulp.task('watch-express', ['server-express'], function () {
    gulp.watch(['./server/**/*.ts'], ['build']);
});

gulp.task('build', ['prints'], function () {
    gulp.src('./server/db/users.json')
        .pipe(gulp.dest('wwwroot'));
		
	gulp.src(['./server/sslcert/server.key', './server/sslcert/server.crt', './server/sslcert/ca.crt'])
        .pipe(gulp.dest('wwwroot/sslcert'));

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
              .pipe(gulp.dest('wwwroot'));

    return dev;
});

gulp.task('zip', ['build'], function () {
    return gulp.src('wwwroot/**/*')
		.pipe(zip('dist.zip'))
		.pipe(gulp.dest('./wwwroot'));
});
