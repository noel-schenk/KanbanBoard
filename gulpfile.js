const   gulp = require('gulp'),
        del = require('del'),
        sass = require('gulp-sass'),
        chokidar = require('chokidar'),
        cp = require('child_process');
        
sass.compiler = require('node-sass');

function bClean(){
    return del(['./dist/**','!./dist']); //https://www.npmjs.com/package/del !The glob pattern ** matches all children and the parent. You have to explicitly ignore the parent directories too:
}
function fCss(){
    return gulp.src('./src/scss/*.scss', {base:'./src/scss'}).pipe(sass().on('error', () => {throw "Error while compiling scss files."} )).pipe(gulp.dest('./dist/css'));
}
function fHtml(){
    return gulp.src('./src/html/**', {base:'./src/html'}).pipe(gulp.dest('./dist/html'));
}
function fJs(){
    return gulp.src('./src/js/**', {base:'./src/js'}).pipe(gulp.dest('./dist/js'));
}
function fIcon(){
    return gulp.src('./src/icon/**', {base:'./src/icon'}).pipe(gulp.dest('./dist/icon'));
}
function autoReload(){
return chokidar.watch('.', {ignored:/.*\/node_modules.*/}).on('change', (event, path) => {
  console.log('file changed');
  exports.default();
});
}

function run(cb){
    let child = cp.exec('node ./index.js'); 
    child.stdout.setEncoding('utf8'); 
    child.stdout.on('data', function(data) {
      console.log(data.toString()); 
    });
    child.stderr.setEncoding('utf8');
    child.stderr.on('data', function(data) {
      console.log(data.toString()); 
    });
    child.on('close', function() {
      cb();
    });
  }

exports.runFirst = gulp.series(bClean, fCss, fHtml, fJs, fIcon, gulp.parallel(run, autoReload));
exports.default = gulp.series(bClean, fCss, fHtml, fJs, fIcon);