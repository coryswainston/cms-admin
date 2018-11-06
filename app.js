const express = require('express');
const app = express();
const FirebaseHelper = require('./firebase-helper.js');

var config = {
  apiKey: "AIzaSyCgfX5y0dhdUa_UIFAauKuJcqslV4yb0NA",
  authDomain: "consider-me-spiritual.firebaseapp.com",
  databaseURL: "https://consider-me-spiritual.firebaseio.com",
  storageBucket: "consider-me-spiritual.appspot.com",
}
var firebaseHelper = new FirebaseHelper(config);

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
  .post('/deleteSubmission', deleteSubmission)
  .post('/approveSubmission', approveSubmission)
  .post('/undoDelete', undoDelete)
  .post('/undoApprove', undoApprove)
  .get('*', send404)
  .listen(app.get('port'), () => console.log('Listening on ' + app.get('port')));

function checkForAuthentication(req, res, next) {
  if (firebaseHelper.getCurrentUser() == null) {
    console.log("there is no user. redirecting to login")
    return res.redirect('/login');
  }
  next();
}

function getSubmissionFromBody(body) {
  var quote = body['quote-text'];
  var author = body['quote-author'];
  var isScripture = body['quote-is-scripture'] != undefined;
  var id = body['quote-id'];
  return {
    quote: quote,
    author: author,
    id: id,
    scripture: isScripture
  }
}

function deleteSubmission(req, res) {
  var submission = getSubmissionFromBody(req.body);

  firebaseHelper.deleteQuote(submission, (err) => {
    return res.send({success: err == null});
  });
}

function undoDelete(req, res) {
  var id = req.body['quote-id'];

  firebaseHelper.undoDelete(id, (err) => {
    return res.send({success: err == null});
  });
}

function approveSubmission(req, res) {
  var submission = getSubmissionFromBody(req.body);

  firebaseHelper.submitQuote(submission, (err) => {
    return res.send({success: err == null});
  });
}

function undoApprove(req, res) {
  var id = req.body['quote-id'];

  firebaseHelper.undoSubmit(id, (err) => {
    return res.send({success: err == null});
  });
}

function main(req, res) {
  firebaseHelper.clearCache();
  firebaseHelper.retrieveAllNewQuotes((quotes) => {
    res.render('pages/index', {quotes: quotes});
  });
}

function logout(req, res) {
  firebaseHelper.signOut((err) => {
    if (err) {
      console.log(err);
    }
    res.redirect('/login');
  });
}

function login(req, res) {
  if (req.method === "POST" && req.body.email && req.body.password) {
    const email = req.body.email;
    const password = req.body.password;
    firebaseHelper.signIn(email, password, (err, user) => {
      if (err) {
        return res.redirect('/login?authMsg=true');
      } else {
        console.log("there is a user. redirecting")
        return res.redirect('/');
      }
    });
  } else {
    if (firebaseHelper.getCurrentUser() != null) {
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
