// var page = require('page');
import page from 'page'//esta es una nueva forma de importar librerias
// var empty = require('empty-element');//Nos limpia el elemento que le indicamos en el dom
import empty from 'empty-element'
// var template = require('./template');
import template from './template'//es necesario ponerle el punto 
// var title = require('title');
import title from 'title'
// var header = require('../header');
import header from '../header'

//Si definimos esta ruta con page funcionan mientras nevegamos pero si vamos a la ruta como tal la busca en el server.js
//ej: http://localhost:3000/jandrey15 pegamos en el navegador y damos enter eso nos arroja error porque no esta definidad en el server
page('/:username',  header, loadUser, function (ctx, next) {
  var main = document.getElementById('main-container');
  title(`Platzigram - ${ctx.params.username}`);
  empty(main).appendChild(template(ctx.user));
});

page('/:username/:id', header, loadUser, function (ctx, next) {
  var main = document.getElementById('main-container');
  title(`Platzigram - ${ctx.user.username}`);
  empty(main).appendChild(template(ctx.user));//Creo que no es necesario

  $('.modal').modal({
    dismissible: true, // Modal can be dismissed by clicking outside of the modal
    complete: function (){
      page(`/${ctx.user.username}`);
    }
  });

  $(`#modal${ctx.params.id}`).modal('open');
});

async function loadUser (ctx, next) {
  try {
    ctx.user = await fetch(`/api/user/${ctx.params.username}`).then(res => res.json());
    next();
  } catch (err) {
    console.log(err);
  }
}