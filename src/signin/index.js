var page = require('page');
var empty = require('empty-element');//Nos limpia el elemento que le indicamos en el dom
var template = require('./template');
var title = require('title');

page('/signin', function (ctx, next){
  title('Platzigram - Signin');
  var main = document.getElementById('main-container');
  empty(main).appendChild(template);
});