var yo = require('yo-yo');
var translate = require('../translate');

//Tener en cuenta que con yo-yo no se pueden tener dos div padres, solo cuando se tengas mas de un hijo
/*return yo`<div>
    <div class="content">
      ${content}
    </div>
  </div>`; Eso estaria mal porque solo hay un hijo y no es necesario el padre*/

//Revisar para que es que usamos layout
module.exports = function layout(content){
  return yo`<div class="content">
      ${content}
    </div>`;
}