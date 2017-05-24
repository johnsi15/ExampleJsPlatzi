var gulp = require('gulp');
var sass = require('gulp-sass');//gulp para manejar fields de sass
var rename = require('gulp-rename');//gulp para renombrar fields
var babel = require('babelify');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var watchify = require('watchify');
// var watch = require('gulp-watch'); No es necesario esta libreria 

//Preparamos una task with name styles 
gulp.task('styles', function (){
  gulp
    .src('index.scss')//Indicamos donde esta nuestro field de sass
    .pipe(sass())//Ejecutamos sass 
    .pipe(rename('app.css'))//Renombramos el archivo que nos devuelve sass
    .pipe(gulp.dest('public'));//Indicamos en que carpeta debe guardar el archivo que nos devuelve sass
});

gulp.task('assets', function (){
  gulp
    .src('assets/*')//Indicamos que tome todos los archivos del folder assets 
    .pipe(gulp.dest('public'));// y que los envie a public
});

function compile(watch){
  var bundle = browserify('src/index.js', {debug: true});

  if(watch){
    bundle = watchify(bundle)
    bundle.on('update', function (){
      console.log('--> Bundling...');
      rebundle();
    });
  }

  function rebundle(){
    bundle
      .transform(babel, { presets: [ 'es2015' ], plugins: [ 'syntax-async-functions', 'transform-regenerator' ] })//Con babel vamos a usar Ecmascript 6 y Transformamos ese archivo a ES5 para que pueda funcionar en cualquier navegador
      .bundle()//Con bundle compilamos ese archivo.
      .on('error', function (err){ console.log(err); this.emit('end'); })
      .pipe(source('index.js'))//Volvemos hacer un tipo de conversion para que gulp me pueda reconocer el archivo y usar pipe
      .pipe(rename('app.js'))//Lo que hicimos con source es poder usar los pipe de rename y gulp.dest
      .pipe(gulp.dest('public'));
  }

  rebundle();
}

gulp.task('build', function (){ return compile(); });

gulp.task('watch', function (){ return compile(true); });

//Sustituimos esto por la funcion compile para ver siempre cambios.
// gulp.task('scripts', function (){
//   browserify('src/index.js')//Indicamos nuestro archivo package blander, Browserify nos permite escribir código JavaScript del cliente, como si estuviésemos programando en Node.js
//     .transform(babel)//Con babel vamos a usar Ecmascript 6 y Transformamos ese archivo a ES5 para que pueda funcionar en cualquier navegador
//     .bundle()//Con bundle compilamos ese archivo.
//     .pipe(source('index.js'))//Volvemos hacer un tipo de conversion para que gulp me pueda reconocer el archivo y usar pipe
//     .pipe(rename('app.js'))//Lo que hicimos con source es poder usar los pipe de rename y gulp.dest
//     .pipe(gulp.dest('public'));    
// });

gulp.task('watchsass', function(){
  gulp.watch(['./index.scss'], ['styles']);//Escuchamos los cambios del index.scss
})

gulp.task('default', ['styles', 'assets', 'build', 'watchsass'])//Indicamos que task queremos que se run por default