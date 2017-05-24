var yo = require('yo-yo');
// var moment = require('moment'); // ya no lo usamos porque format js es mejor pero moment sirve mas para hacer calculos de fechas
var translate = require('../translate');

module.exports = function pictureCard(pic){
  var el;

  function render(picture){//con esto le decimos que si picture.liked es true nos agregue una clase liked si no que no haga nada
    return yo`<div class="card ${picture.liked ? 'liked' : ''}">
      <div class="card-image">
        <img class="activator" src="${picture.url}" ondblclick=${like.bind(null, null, true)} />
        <i class="fa fa-heart like-heart ${ picture.likedHeart ? 'liked' : '' }"></i>
      </div>
      <div class="card-content">
        <a href="/${picture.user.username}" class="card-title">
          <img src="${picture.user.avatar}" class="avatar" />
          <span class="username">${picture.user.username}</span>
        </a>
        <small class="right time">${translate.date.format(picture.createdAt)}</small>
        <p>
          <a class="left" href="#" onclick=${like.bind(null, true)}><i class="fa fa-heart-o heart-o" aria-hidden="true"></i></a>
          <a class="left" href="#" onclick=${like.bind(null, false)}><i class="fa fa-heart heart" aria-hidden="true"></i></a>
          <span class="left likes">${translate.message('likes', { likes: picture.likes })}</span>
        </p>
      </div>
    </div>`;
  }

/*<small class="right time">${moment(picture.createdAt).fromNow()}</small>
Esta linea fue la que usamos con moment y la cambiamos por formatjs que es mejor.
*/

  function like(liked, dblclick){
    if(dblclick){
      pic.likedHeart = pic.liked = !pic.liked;
      liked = pic.liked;
    }else{
      pic.liked = liked;
    }

    pic.likes += liked ? 1 : -1;// Si liked es true le sumamos 1 y si no le restamos 1
    function doRender(){ 
      var newEl = render(pic);//mandamos todo lo que este en el objeto pic
      yo.update(el, newEl);//cambios el antiguo render con el nuevo actualizamos
    }

    doRender();

    setTimeout(function (){
      pic.likedHeart = false;
      doRender();
    }, 1000);

    return false;//Con esto indicamos que termine su proceso con false, el cual seria no agregar el # en la barra de direccion
  }

  // function dislike(){
  //   pic.liked = false;
  //   pic.likes--;
  //   var newEl = render(pic);
  //   yo.update(el, newEl);//cambios el antiguo render con el nuevo actualizamos 
  //   return false;//Con esto indicamos que termine su proceso con false, el cual seria no agregar el # en la barra de direccion
  // }

  el = render(pic);//ejecutamos la funcion mandamos todo el html que nos muestra las picture card
  return el;
}