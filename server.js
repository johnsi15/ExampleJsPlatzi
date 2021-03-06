var express = require('express');
var app = express();//Creamos el objeto app 

var multer  = require('multer');
var ext = require('file-extension');

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads')
  },
  filename: function (req, file, cb) {
    cb(null, +Date.now() + '.' + ext(file.originalname))
  }
})

var upload = multer({ storage: storage }).single('picture');//el name del type file

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

app.get('/signin', function (req, res){
  res.render('index', { title: 'Platzigram - Signin' });
});

app.get('/api/pictures', function (req, res){
  var pictures = [
    {
      user:{
        username: 'jandrey15',
        avatar: 'https://scontent.fctg1-1.fna.fbcdn.net/v/t1.0-1/c0.0.160.160/p160x160/15349616_10209463857771052_551131432001784378_n.jpg?oh=1e1f97f7fa7d6ca6f737e154a6f4f135&oe=58BCB08F'
      },
      url: 'office.jpg',
      likes: 0,
      liked: false,
      createdAt: new Date().getTime()
    },
    {
      user:{
        username: 'andrea',
        avatar: 'https://scontent.fctg1-1.fna.fbcdn.net/v/t1.0-1/p160x160/15726718_756667517823351_7430823139806751045_n.jpg?oh=4bfea11ff4391f268b2cf6afe0c387c3&oe=58F18998'
      },
      url: 'office.jpg',
      likes: 1,
      liked: true,
      createdAt: new Date().setDate(new Date().getDate() - 10)
    }
  ];
  // setTimeout(function (){
  //   res.send(pictures);//express por defecto le indica que es un objeto de tipo json
  // }, 2000);
  setTimeout(() => res.send(pictures), 2000);//express por defecto le indica que es un objeto de tipo json
});

app.post('/api/pictures', function(req, res){
  // console.log(res);
  // console.log(req);
  upload(req, res, function(err){
    if(err){
      return res.send(500, 'Error uploading file');
    }
    res.send('File upload');
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

app.get('/:username', function (req, res){
  res.render('index', { title: `Platzigram - ${req.params.username}` });
});

//Este get es para mostrar las imagenes en el modal del user 
app.get('/:username/:id', function (req, res) {
  res.render('index', { title: `Platzigram - ${req.params.username}` });
})

app.listen(3000, function (err){
  if (err) return console.log('Hubo un error'), process.exit(1);//Devolvemos un mensaje si existe algun error

  console.log('Escuchando en el puerto 3000');
});