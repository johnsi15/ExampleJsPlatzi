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
  const user = {
    username: 'platzi',
    avatar: 'https://igcdn-photos-b-a.akamaihd.net/hphotos-ak-xpa1/t51.2885-19/11351571_102153813463801_2062911600_a.jpg',
    pictures: [
      {
        id: 1,
        src: 'https://igcdn-photos-e-a.akamaihd.net/hphotos-ak-xaf1/t51.2885-15/s640x640/sh0.08/e35/c135.0.810.810/13129218_1692859530968044_751360067_n.jpg?ig_cache_key=MTI0MjIzMTY4MzQ5NzU1MTQxOQ%3D%3D.2.c',
        likes: 3
      },
      {
        id: 2,
        src: 'https://igcdn-photos-d-a.akamaihd.net/hphotos-ak-xaf1/t51.2885-15/e35/13126768_259576907723683_861119732_n.jpg?ig_cache_key=MTIzODYzMjE4NDk1NDk3MTY5OQ%3D%3D.2',
        likes: 1
      },
      {
        id: 3,
        src: 'https://igcdn-photos-d-a.akamaihd.net/hphotos-ak-xfa1/t51.2885-15/s640x640/sh0.08/e35/13118139_1705318183067891_1113349381_n.jpg?ig_cache_key=MTI0MTQwNzk1ODEyODc0ODQ5MQ%3D%3D.2',
        likes: 10
      },
      {
        id: 4,
        src: 'https://igcdn-photos-g-a.akamaihd.net/hphotos-ak-xaf1/t51.2885-15/e35/12940327_1784772678421526_1500743370_n.jpg?ig_cache_key=MTIyMzQxODEwNTQ4MzE5MjE4OQ%3D%3D.2',
        likes: 0
      },
      {
        id: 5,
        src: 'https://igcdn-photos-a-a.akamaihd.net/hphotos-ak-xpt1/t51.2885-15/e35/11934723_222119064823256_2005955609_n.jpg?ig_cache_key=MTIyMzQwOTg2OTkwODU2NzY1MA%3D%3D.2',
        likes: 23
      },
      {
        id: 6,
        src: 'https://igcdn-photos-a-a.akamaihd.net/hphotos-ak-xaf1/t51.2885-15/e35/12904985_475045592684864_301128546_n.jpg?ig_cache_key=MTIyMzQwNjg2NDA5NDE2MDM5NA%3D%3D.2',
        likes: 11
      }
    ]
  }

  res.send(user);
});

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