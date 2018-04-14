var page = require('page');
var empty = require('empty-element');//Nos limpia el elemento que le indicamos en el dom
var template = require('./template');
var title = require('title');
var request = require('superagent');
var header = require('../header');
var picture = require('../picture-card');
var axios = require('axios');
var io = require('socket.io-client');
var utils = require('../utils');

var socket = io.connect('http://localhost:5151') // use envify

page('/', utils.loadAuth, header, loading, asyncLoad, function (ctx, next){
  title('Platzigram');
  var main = document.getElementById('main-container');

  empty(main).appendChild(template(ctx.pictures));

  const picturePreview = document.getElementById('picture-preview')
  const camaraInput = document.getElementById('camara-input')
  const cancelPicture = $('#cancelPicture');
  const shootButton = $('#shoot');
  const uploadButton = $('#uploadButton');

  function reset() {
    picturePreview.classList.add('hide');
    camaraInput.classList.remove('hide');
    cancelPicture.addClass('hide');
    shootButton.removeClass('hide');
    uploadButton.addClass('hide');
  }

  cancelPicture.click(reset);

  $('.modal').modal({
    ready: function(){ // Callback for Modal open. Modal and trigger parameters available.
      webcam.attach( '#camara-input' );
      shootButton.click(() => {
        webcam.snap((data_uri) => {
          picturePreview.innerHTML = `<img src="${data_uri}"/>`;
          picturePreview.classList.remove('hide');
          camaraInput.classList.add('hide');
          cancelPicture.removeClass('hide');
          shootButton.addClass('hide');
          uploadButton.removeClass('hide')
          uploadButton.off('click')
          uploadButton.click(() => {
            const pic = {
              url: data_uri,
              likes: 0,
              liked: false,
              createdAt: +new Date(),
              user: {
                avatar: "https://scontent-atl3-1.xx.fbcdn.net/hphotos-xpa1/v/t1.0-9/11031148_10153448564292612_2579019413701631604_n.jpg?oh=d83cdd0687c87c91b247a42375fc5a57&oe=57B12767",
                username: "slifszyc"
              }
            }
            $('#picture-cards').prepend(picture(pic));
            reset();
            $('#modalCamara').modal('close');
          });
        });
      })
    },
    complete: function(){
      webcam.reset();
      reset()
    } // Callback for Modal close
  });
});

socket.on('image', function (image) {
  var picturesEl = document.getElementById('pictures-container')
  var first = picturesEl.firstChild;
  var img = picture(image);
  picturesEl.insertBefore(img, first); // me gusto esta forma de agregar un elemento al inicio.
})

//con el ctx podemos ir pasando datos entre middleware
function loading(ctx, next){
  var el = document.createElement('div');
  el.classList.add('loader');
  var main = document.getElementById('main-container').appendChild(el);
  next();
}

//Esto es un middleware 
// function loadPictures(ctx, next){
//   request
//     .get('/api/pictures')
//     .end(function (err, res){
//       if (err) return console.log(err);//si devuelve null nos da false y pasa normal

//       ctx.pictures = res.body;//le compartimos los datos a ctx para poder pasarlos al siguiente middleware
//       next();
//     })
// }

function loadPicturesAxios(ctx, next){
  axios
    .get('/api/pictures')
    .then(function (res){
      ctx.pictures = res.data;//le compartimos los datos a ctx para poder pasarlos al siguiente middleware
      next();
    })
    .catch(function(err){
      console.log(err);
    })
}

function loadPicturesFetch(ctx, next){
  fetch('/api/pictures')
    .then(function (res){
      return res.json();
    })
    .then(function (pictures){
      ctx.pictures = pictures;
      next()
    })
    .catch(function (err){
      console.log(err);
    })
}

async function asyncLoad(ctx, next){
  try{
    // en el then mandamos una funcion con ES 15 
    //no es necesario encerrarla en pararentecis ni llaves ni return porque estamos devolviendo un solo valor
    ctx.pictures = await fetch('/api/pictures').then(res => res.json())
    next();
  }catch(err){
    return console.log(err);
  }
}