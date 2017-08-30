const snoowrap = require('snoowrap');
const newspaper = require("./newspaper.js");
const async = require("async");

class redditStream{
  constructor(data){
    this.username = data.username;
    this.password = data.password;
    this.key = data.key;
    this.secret = data.secret;
    this.interval = (data.interval) ? data.interval*1000*60 : 5*1000*60;

    this.reddit = new snoowrap({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36',
      clientId: this.key,
      clientSecret: this.secret,
      username: this.username,
      password: this.password
    }); 
  }

  init(){
    console.log("Initiating");
    this.loadPosts();
  }

  loadPosts(){

    console.log("Loading New Posts");

    this.reddit.getMe()
    
      .then((result) => {
        console.log('Connected in Reddit as /u/' + result.name);
        return this.reddit.getNew('vzla');
      })

      .then((posts) => {
        return newspaper.proccessPosts(posts.slice(0,10));
      })

      .then((markdowns) => {
        if(markdowns === "empty") return console.log("Not new posts to finish");

        async.eachSeries(markdowns, (markdown, cb) => {
          this.commentPost("6wz164", markdown, (err) => {
            if(err) console.log(err);
            cb();
          });
        }, () => {
          console.log("Finished");
        });

      });

    setTimeout(this.loadPosts.bind(this), this.interval);
  }

  commentPost(id, markdown, callback){
    this.reddit.getSubmission(id).reply(markdown.content)
      .then(() => callback("Done"))
      .catch((err) => console.log(err));
  }
}

module.exports = redditStream;