/**
 * Comentanto funciones usando estilo JSDoc http://usejsdoc.org/
 * gulp - Automatizador flujo de trabajo en el front-End
 * webserver -  https://www.npmjs.com/package/gulp-webserver
 */
var gulp = require('gulp')
var webserver = require('gulp-webserver')
var minify = require('gulp-minifier')
//var babel = require('gulp-babel')
var merge = require('merge-stream')

gulp.task('webserver', function() {
    gulp.src('app')
        .pipe(webserver({
            host: 'localhost',
            port: 3000,
            livereload: true,
            directoryListing: false,
            open: true,
            proxies: [{
              source: '/geoserver',
              target: 'http://sig.udistrital.edu.co:8080/geoserver',
              options: {
                headers: {
                  'DEVELOPER': 'juusechec'
                }
              }
            }]
        }))
})

/*
// https://www.youtube.com/watch?v=TGiBG6II6Jk
gulp.task('watch', ['sass'], function (){
  gulp.watch('./sass/**\/*.css', ['sass'])
});
*/
gulp.task('minify', function() {
    var allfiles = gulp.src(['app/**/*'])
        .pipe(minify({
            minify: true,
            collapseWhitespace: true,
            conservativeCollapse: true,
            minifyJS: true,
            minifyCSS: true,
            getKeptComment: function(content, filePath) {
                var m = content.match(/\/\*![\s\S]*?\*\//img);
                return m && m.join('\n') + '\n' || '';
            }
        }))
        .pipe(gulp.dest('dist/app'))
    // http://stackoverflow.com/questions/34398338/uglification-failed-unexpected-character
    // var jsfiles = gulp.src(['app/**/*.js', '!app/vendor/**/*', '!app/js/mustache-dojo.js'])
    //     .pipe(babel({
    //         presets: ['es2015']
    //     }))
    //     .pipe(minify({
    //         minify: true,
    //         collapseWhitespace: true,
    //         conservativeCollapse: true,
    //         minifyJS: true,
    //         minifyCSS: true,
    //         getKeptComment: function(content, filePath) {
    //             var m = content.match(/\/\*![\s\S]*?\*\//img);
    //             return m && m.join('\n') + '\n' || '';
    //         }
    //     }))
    //     .pipe(gulp.dest('dist/app'))

    // var vendorfiles = gulp.src(['app/vendor/**/*'])
    //     .pipe(gulp.dest('dist/app/vendor'))

    // var exeptionfiles = gulp.src(['app/js/mustache-dojo.js'])
    //     .pipe(gulp.dest('dist/app/js'))

    // https://github.com/gulpjs/gulp/blob/master/docs/recipes/using-multiple-sources-in-one-task.md
    //return merge(allfiles, vendorfiles)
    return allfiles
})

//https://github.com/andresvia/go-angular-drone/blob/master/.drone.yml
gulp.task('default', ['webserver'], function() {
    // place code for your default task here
})
