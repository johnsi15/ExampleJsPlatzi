var page = require('page');//Gracias a Browserify
var empty = require('empty-element');
var template = require('./template');
var title = require('title');

page('/signup', function (ctx, next){
  title('Platzigram - Signup');
  var main = document.getElementById('main-container');
  empty(main).appendChild(template);
});