const express = require('express');
const Twit = require('twit');
const bodyParser = require('body-parser');
const config = require('./config.js');

const app = express();

app.set('view engine', 'pug');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));



app.set('port', process.env.PORT || 3000);
app.listen(app.get('port'));

var twitterAPI = new Twit({
  consumer_key:         config.consumer_key,
  consumer_secret:      config.consumer_secret,
  access_token:         config.access_token,
  access_token_secret:  config.access_token_secret,
  timeout_ms:           config.timeout_ms
});


//**************************Middleware**************************************

app.use((req, res, next) => {
  twitterAPI.get('statuses/user_timeline', { count: 5 }, function (err, data, response) {
    req.timeline = data;
    next();
  });
});

app.use((req, res, next) => {
  twitterAPI.get('friends/list', { count: 5 }, function (err, data, response) {
    req.friends = data;
    next();
  });
});

app.use((req, res, next) => {
  twitterAPI.get('direct_messages/events/list', { count: 5 }, function (err, data, response) {
    req.messages = data;
    next();
  });
});

app.use((req, res, next) => {
  twitterAPI.get('account/verify_credentials', { skip_status: true }, function(err, data, response) {
    req.user = data;
    next();
  });
});

app.get('/', (req, res) => {
  const user = req.user;
  const timeline = req.timeline;
  const friends = req.friends;
  const messages = req.messages;
  res.render('layout', { user, timeline, friends, messages });
});
