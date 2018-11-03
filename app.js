const express = require('express');
const app = express();
const firebase = require('firebase');
var config = {
  apiKey: "AIzaSyCgfX5y0dhdUa_UIFAauKuJcqslV4yb0NA",
  authDomain: "consider-me-spiritual.firebaseapp.com",
  databaseURL: "https://consider-me-spiritual.firebaseio.com",
  storageBucket: "consider-me-spiritual.appspot.com",
}
firebase.initializeApp(config);

app.set('port', (process.env.PORT || 8000))
  .use(express.static(__dirname + '/public'))
  .use(express.urlencoded({extended:true}))
  .use(express.json())
  .set('views', __dirname + '/views')
  .set('view engine', 'ejs')
  .get('/', checkForAuthentication, main)
  .get('/login', login)
  .post('/login', login)
  .post('/logout', logout)
  .get('*', send404)
  .listen(app.get('port'), () => console.log('Listening on ' + app.get('port')));

function checkForAuthentication(req, res, next) {
  if (firebase.auth().currentUser == null) {
    console.log("there is no user. redirecting to login")
    return res.redirect('/login');
  }
  next();
}

function main(req, res) {
  var database = firebase.database();
  database.ref('/NewQuotes').once('value').then((snapshot) => {
    res.render('pages/index', {quotes: snapshot.val()});
  });
}

function logout(req, res) {
  firebase.auth().signOut().then(() => {
    res.redirect('/login');
  }).catch((err) => {
    console.log(err);
  })
}

function login(req, res) {
  if (req.method === "POST" && req.body.email && req.body.password) {
    const email = req.body.email;
    const password = req.body.password;
    firebase.auth().signInWithEmailAndPassword(email, password).catch((err) => {
      return res.redirect('/login?authMsg=true');
    });
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        console.log("there is a user. redirecting")
        return res.redirect('/');
      }
    });
  } else {
    if (firebase.auth().currentUser != null) {
      console.log("already logged in. Redirecting");
      res.redirect('/');
    } else {
      console.log("just taking you to the login page");
      res.render('pages/login', {authMsg: req.query.authMsg});
    }
  }
}

function send404(req, res) {
  res.render('pages/404');
}
