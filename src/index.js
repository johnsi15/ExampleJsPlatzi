/*Ejemplo Ecmascript v6 -> (Abreviado como ES6 o ES2015)
var numeros = [400, 200, 5, -25 ];
var suma = numeros.map(n => n  + 1);
console.log(suma);*/

require('babel-polyfill');
//Nota: se puede tener los require de las librerías o package en este index el principal sin nececidad de repetirlo en los demas index.js
var page = require('page');//Gracias a Browserify
// var yo = require('yo-yo');
// var empty = require('empty-element');//Nos limpia el elemento que le indicamos en el dom

/*Se uso antes para las fechas pero lo cambiomos por formatjs que es mejor para este caso.
var moment = require('moment');
require('moment/locale/es');//Idioma de las fechas de las publicaciones
moment.locale('es');*/

require('./homepage');//Tener en cuenta el orden de los require
require('./signup');
require('./signin');
require('./user');
require('./footer');

page();