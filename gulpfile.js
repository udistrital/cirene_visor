/**
 * Comentanto funciones usando estilo JSDoc http://usejsdoc.org/
 * gulp - Automatizador flujo de trabajo en el front-End
 * webserver -  https://www.npmjs.com/package/gulp-webserver
 */
var gulp = require('gulp')
var webserver = require('gulp-webserver')
var minify = require('gulp-minifier')
//var babel = require('gulp-babel')
//var merge = require('merge-stream')
const tar = require('gulp-tar')
const gzip = require('gulp-gzip')
var rm = require('gulp-rm')

var jshint = require('gulp-jshint')
const jshintConfig = require('./jshitn.conf.json')

var webserverConfig = {
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
  },{
    source: '/proxy',
    target: 'http://localhost:12345/',
    options: {
      headers: {
        'WebSite': 'https://github.com/juusechec/goresource-proxy'
      }
    }
  }]
};

gulp.task('webserver', function() {
  gulp.src('app').pipe(webserver(webserverConfig))
})

gulp.task('webserver:dist', function() {
  gulp.src('dist/app').pipe(webserver(webserverConfig))
})

/*
// https://www.youtube.com/watch?v=TGiBG6II6Jk
gulp.task('watch', ['sass'], function (){
  gulp.watch('./sass/**\/*.css', ['sass'])
});
*/
gulp.task('minify', function() {
  var allfiles = gulp.src(['app/**/*']).pipe(minify({
    minify: true,
    collapseWhitespace: true,
    conservativeCollapse: true,
    minifyJS: true,
    minifyCSS: true,
    getKeptComment: function(content, filePath) {
      var m = content.match(/\/\*![\s\S]*?\*\//img)
      return m && m.join('\n') + '\n' || ''
    }
  })).pipe(gulp.dest('dist/app'))
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

gulp.task('pack', () =>
  gulp.src('dist/app/**/*')
  .pipe(tar('pack.tar'))
  .pipe(gzip())
  .pipe(gulp.dest('build'))
)

gulp.task('clean', ['clean:dist', 'clean:build'], function() {
  // place code for your default task here
})

gulp.task('clean:dist', function() {
  return gulp.src('dist/**/*', {
      read: false
    })
    .pipe(rm())
})

gulp.task('clean:build', function() {
  return gulp.src('build/**/*', {
      read: false
    })
    .pipe(rm())
})

// configure the jshint task
gulp.task('jshint', function() {
  console.log('jshintConfig', jshintConfig);
  return gulp.src(['app/**/*.js', '!app/lib/**/*'])
    .pipe(jshint(jshintConfig))
    .pipe(jshint.reporter('default'))
})

//https://github.com/andresvia/go-angular-drone/blob/master/.drone.yml
gulp.task('default', ['webserver'], function() {
  // place code for your default task here
})
