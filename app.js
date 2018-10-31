const express = require('express');
const app = express();
const session = require('express-session');

app.set('port', (process.env.PORT || 8000))
  .use(express.static(__dirname + '/public'))
  .use(express.urlencoded({extended:true}))
  .use(express.json())
  .use(session({
    secret: 'not a secret anymore',
    resave: false,
    saveUninitialized: true,
  }))
  .set('views', __dirname + '/views')
  .set('view engine', 'ejs')
  .get('/', main)
  .listen(app.get('port'), () => console.log('Listening on ' + app.get('port')));

function main(req, res) {
  res.render('pages/index');
}
