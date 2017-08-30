const read = require('node-readability');
const toMarkdown = require('to-markdown');
const async = require('async');

function escapeHtml (string) {
  return string.replace(/<(?:.|\n)*?>/gm, '');
}

function getMarkdown(url, callback){

  let markdown;
  
  read(url, function(err, article) {

    if(err) return callback(err);
    if(!article.content) return callback({"message": "Failed load"});
    
    markdown = {
      "title": article.title,
      "content":  escapeHtml(toMarkdown(article.content))
    };

    article.close();

    callback(null, markdown);
  });
}

let proccesedPosts = [];
let blacklist = ["self.vzla", "twitter.com", "youtu.be", "i.imgur.com"];

function filterPosts(post){
  return (!blacklist.includes(post.domain) && !proccesedPosts.includes(post.id));
}

function proccessPosts(page){

  return new Promise(function(resolve){

    let posts = page.filter(filterPosts);
    let markdowns = [];

    async.eachSeries(posts, (function(post, cb){
      console.log("Getting Markdown for: "+post.title);
      proccesedPosts.push(post.id);

      getMarkdown(post.url, function(err, markdown){
        if(err) markdown = {"failed": err};
        markdown.id = post.id;
        markdowns.push(markdown);
        cb();
      });

    }), function(){
      resolve(markdowns);
    });
  });
}

exports.proccessPosts = proccessPosts;