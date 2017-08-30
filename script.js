const Reddit = require('./app/reddit.js');

const config = {
  username : "username",
  password : "pass",
  key : "appkey",
  secret : "appsecret",
  interval : 2
};

const redditBot = new Reddit(config);

redditBot.init();
