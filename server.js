var express = require('express');

var multer  = require('multer');
var ext = require('file-extension');
var aws = require('aws-sdk');
var multerS3 = require('multer-s3');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const expressSession = require('express-session');
const passport = require('passport');
const platzigram = require('platzigramclient');
const auth = require('./auth');
var config = require('./config');
const port = process.env.PORT || 3000;

const client = platzigram.createClient(config.client);

var s3 = new aws.S3({
  accessKeyId: config.aws.accessKey,
  secretAccessKey: config.aws.secretKey
});

var storage = multerS3({
  s3: s3,
  bucket: 'platzigram-andrey',
  acl: 'public-read',
  metadata: function (req, file, cb) {
    cb(null, { fieldName: file.fieldname })
  },
  key: function (req, file, cb) {
    cb(null, +Date.now() + '.' + ext(file.originalname))
  }
});

// var storage = multer.diskStorage({
  //   destination: function (req, file, cb) {
    //     cb(null, './uploads')
    //   },
    //   filename: function (req, file, cb) {
      //     cb(null, +Date.now() + '.' + ext(file.originalname))
//   }
// })

var upload = multer({ storage: storage }).single('picture');//el name del type file
var app = express();//Creamos el objeto app

app.set(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(expressSession({
  secret: config.secret,
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(auth.localStrategy);
passport.use(auth.facebookStrategy);
passport.deserializeUser(auth.deserializeUser);
passport.serializeUser(auth.serializeUser);

app.set('view engine', 'pug');//Indicamos a express que vamos a usar views basadas en pug -> jade

app.use(express.static('public'));//Indicamos a express donde estan los archivos static 

//Tener en cuenta el orden que se generan las rutas por lo reneral se dejan de ultimas las de api y de params
app.get('/', function (req, res){
  // res.send('Hola mundo!');
  res.render('index', { title: 'Platzigram' });//Rendereamos al archivos index que se encuentra en una carpeta views
});

app.get('/signup', function (req, res){
  res.render('index', { title: 'Platzigram - Signup' });
});

app.post('/signup', function (req, res){
  const user = req.body;
  client.saveUser(user, function (err, usr) {
    if (err) return res.status(500).send(err.message);

    res.redirect('/signin');
  })
});

app.get('/signin', function (req, res){
  res.render('index', { title: 'Platzigram - Signin' });
});

// app.post('/login', passport.authenticate('local', {
//   successRedirect: '/',
//   failureRedirect: '/signin'
// }))

app.post('/login', passport.authenticate('local', { failureRedirect: '/signin' }),
  function (req, res) {
    res.redirect('/');
});

app.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/');
});

function ensureAuth(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.status(401).send({ error: 'not athenticated' })
}

app.get('/auth/facebook', passport.authenticate('facebook', { scope: 'email' }));

app.get('/auth/facebook/callback', passport.authenticate('facebook', {
  successRedirect: '/',
  failureRedirect: '/signin'
}));

app.get('/api/pictures', function (req, res, next) {
  client.listPictures(function (err, pictures) {
    if (err) return res.send([]);

    res.send(pictures);
  })
});

app.post('/api/pictures', ensureAuth, function(req, res){
  upload(req, res, function (err) {
    if (err) {
      return res.status(500).send(`Error uploading file: ${err.message}`);
    }

    var user = req.user
    var token = req.user.token;
    var username = req.user.username;
    var src = req.file.location

    client.savePicture({
      src: src,
      userId: username,
      user: {
        username: username,
        avatar: user.avatar,
        name: user.name
      }
    }, token, function (err, img) {
      if (err) {
        return res.status(500).send(err.message)
      }

      res.send(`File uploaded: ${req.file.location}`);
    })
  })
});

app.get('/api/user/:username', (req, res) => {
  var username = req.params.username;

  client.getUser(username, function (err, user) {
    if (err) return res.status(404).send({ error: 'user not found ' })

    res.send(user);
  });
})

app.get('/whoami', function (req, res) {
  if (req.isAuthenticated()) {
    return res.json(req.user)
  }

  res.json({ auth: false })
})

app.get('/:username', function (req, res){
  res.render('index', { title: `Platzigram - ${req.params.username}` });
});

//Este get es para mostrar las imagenes en el modal del user 
app.get('/:username/:id', function (req, res) {
  res.render('index', { title: `Platzigram - ${req.params.username}` });
})

app.listen(port, function (err){
  if (err) return console.log('Hubo un error'), process.exit(1);//Devolvemos un mensaje si existe algun error

  console.log(`Escuchando en el puerto ${port}`);
});