/****************Required Packages and files**********************************/
const express = require('express');
const Twit = require('twit');
const moment = require('moment');
const bodyParser = require('body-parser');
const config = require('./config.js');

/**************************App creation and settings**************************/
const app = express();

app.set('view engine', 'pug');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));

/*****************************Port: 3000**************************************/
app.set('port', process.env.PORT || 3000);
app.listen(app.get('port'));

/********************Twit - twitter API initialisation************************/
var twitterAPI = new Twit({
  consumer_key:         config.consumer_key,
  consumer_secret:      config.consumer_secret,
  access_token:         config.access_token,
  access_token_secret:  config.access_token_secret,
  timeout_ms:           config.timeout_ms
});


/**************************Twitter API calls**********************************/
//Get the 5 most recent tweets
app.use((req, res, next) => {
  twitterAPI.get('statuses/user_timeline', { count: 5 }, function (err, data, response) {
    req.timeline = data;
    next();
  });
});

//Get the 5 most trecent friends
app.use((req, res, next) => {
  twitterAPI.get('friends/list', { count: 5 }, function (err, data, response) {
    req.friends = data;
    next();
  });
});

//Get the 5 most recent messages received
app.use((req, res, next) => {
  twitterAPI.get('direct_messages', { count: 5 }, function (err, data, response) {
    req.messages = data;
    next();
  });
});

//Verify and get user info
app.use((req, res, next) => {
  twitterAPI.get('account/verify_credentials', { skip_status: true }, function(err, data, response) {
    req.user = data;
    next();
  });
});


/*****************************Root GET route**********************************/
app.get('/', (req, res) => {
  const user = req.user;
  const timeline = req.timeline;
  const friends = req.friends;
  const messages = req.messages;
  const messages_sent = req.messages_sent;
  res.render('layout', { user, timeline, friends, messages, moment });
});

/**********************Root POST route to send a tweet************************/
app.post('/', (req, res) => {
  twitterAPI.post('statuses/update', { status: req.body.tweet }, function(err, data, response) {
    console.log('You tweeted!');
  });
  res.redirect('/');
});
