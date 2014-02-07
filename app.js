
/**
 * Module dependencies.
 */

var express = require('express')
  , https = require('https')
  , path = require('path')
  , fs = require('fs')
  , PeerServer = require('peer').PeerServer;

var app = express();

var options = {
  key: fs.readFileSync('keys/key.pem'),
  cert: fs.readFileSync('keys/cert.pem')
};

// all environments
app.set('port', process.env.PORT || 3443);
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// start https server
https.createServer(options, app).listen(app.get('port'), function(){
  console.log('Express tls server listening on port ' + app.get('port'));
});

// start peer server
var peer_server = new PeerServer({
  port: 9000,
  key: 'peerjs',
  ssl: {
    key: fs.readFileSync('keys/key.pem'),
    cert: fs.readFileSync('keys/cert.pem')
  }
});
