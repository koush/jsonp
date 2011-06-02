
/**
 * Module dependencies.
 */

var express = require('express');

var app = module.exports = express.createServer();
url = require('url');
http = require('http');
dirty = require('./dirty');

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

ajax = function(urlStr, callback) {
  u = url.parse(urlStr);
  http.get({ host: u.host, port: u.port, path: u.pathname},
    function(res) {
      var data = '';
      res.on('data', function(chunk) {
        data += chunk;
      });
      res.on('end', function() {
        try {
          callback(null, dirty.parse(data));
        }
        catch (err) {
          callback(err);
        }
      });
    }).on('error', function(e) {
      callback(e);
    });
}

// Routes

app.get('/', function(req, res){
  res.render('index', {
    title: 'Express'
  });
});

app.get('/clean/:url', function(req, res) {
  ajax(req.params.url,
    function(err, data) {
        if (err) {
          data = { error: err };
        }
        
        var callback = req.query.callback;
        if (callback)
            res.send(callback + "(" + JSON.stringify(data) + ")")
        else
            res.send(data);
    });
});

var listenPort = process.env.PORT == null ? 3000 : parseInt(process.env.PORT);
app.listen(listenPort);
console.log("Express server listening on port %d", app.address().port);
