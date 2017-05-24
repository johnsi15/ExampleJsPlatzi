//Esto es un Polyfill
if(!window.Intl){
  window.Intl = require('intl');
  require('intl/locale-data/jsonp/en-US.js');
  require('intl/locale-data/jsonp/es.js');
}

var IntlRelativeFormat = window.IntlRelativeFormat = require('intl-relativeformat');
var IntlMessageFormat = require('intl-messageformat');

require('intl-relativeformat/dist/locale-data/en.js');
require('intl-relativeformat/dist/locale-data/es.js');

var es = require('./es');
var en = require('./en-US');

var MESSAGE = {};
MESSAGE.es = es;
MESSAGE['en-US'] = en;//de esta forma se pasa valores con variables con - en el medio

var locale = localStorage.locale || 'es';

module.exports = {
  message: function (text, opts){
    opts = opts || {};
    var msg = new IntlMessageFormat(MESSAGE[locale][text], locale, null);// el tercer valor es el format puede ir null 
    return msg.format(opts);
  },

  date: new IntlRelativeFormat(locale)
}
