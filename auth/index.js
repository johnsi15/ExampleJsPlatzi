const LocalStrategy = require('passport-local').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const platzigram = require('platzigramclient');
const jwt = require('jsonwebtoken');
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
      console.log(token)
      return done(null, user);
    })
  })
});

exports.facebookStrategy = new FacebookStrategy({
  clientID: config.auth.facebook.clientID,
  clientSecret: config.auth.facebook.clientSecret,
  callbackURL: config.auth.facebook.callbackURL,
  profileFields: ['id', 'displayName', 'email']
}, function (accessToken, refreshToken, profile, done) {
  var userProfile = {
    username: profile._json.id,
    name: profile._json.name,
    email: profile._json.email,
    facebook: true
  }

  // Find a previous registered user or create a new one
  findOrCreate(userProfile, (err, user) => {
    if (err) return done(err);

    jwt.sign({ userId: user.username }, config.secret, {}, (e, token) => {
      if (e) return done(e)

      user.token = token

      return done(null, user);
    })
  });

  function findOrCreate(user, callback) {
    client.getUser(user.username, (err, usr) => {
      if (err) {
        return client.saveUser(user, callback)
      }

      callback(null, usr);
    })
  }
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
    if (err) return done(err)
    usr.token = user.token;
    // console.log(usr)
    done(null, usr);
  });
}
