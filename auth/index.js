const LocalStrategy = require('passport-local').Strategy;
const platzigram = require('platzigramclient');
const config = require('../config');

const client = platzigram.createClient(config.client);

exports.localStrategy = new LocalStrategy((username, password, done) => {
  // El token es el que nos envia JWT
  client.auth(username, password, (err, token) => {
    if (err) {
      return done(null, false, { message: 'username and password not found' });
    }

    client.getUser(username, (err, user) => {
      if (err) {
        return done(null, false, { message: `an error ocurred: ${err.message}` });
      }

      user.token = token;
      return done(null, user);
    })
  })
});

exports.serializeUser = function (user, done) {
  // en este caso solo mandamos el username y el token que se va necesitar para poder validar que si es un usuario correcto para hacer las peticiones a la api.
  // En conclucion el token de JWT se usa para validar las peticiones de mi API
  done(null, {
    username: user.username,
    token: user.token
  });
}

exports.deserializeUser = function (user, done) {
  client.getUser(user.username, (err, usr) => {
    usr.token = user.token;
    done(err, usr);
  });
}
