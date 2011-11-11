
/**
 * Module dependencies.
 */

var express = require('express');

var app = module.exports = express.createServer();

var io = require('socket.io').listen(app);

var logger = require('socket.io/lib/logger');

var log = new logger();


// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.set('view options', { layout : false });
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

// Routes

app.get('/', function(req, res){
  res.render('index', {
    title: 'html5.so - zfkun',
    author: 'zfkun',
    email: 'zfkun@msn.com'
  });
});

app.get('/html5', function(req, res){
  res.render('html5', {
    title: 'html5.so - zfkun',
    author: 'zfkun',
    email: 'zfkun@msn.com'
  });
});

app.get('/ppt', function(req, res){
  res.render('ppt', {
    title: 'Node.js - PPT',
    author: 'zfkun'
  });
});

app.get('/controller', function(req, res){
  res.render('controller', {
    title: 'Node.js PPT - Controller',
    author: 'zfkun'
  });
});


// Sockets

io.sockets.on('connection', function(socket){
  log.info('new client connected!!');
  
  socket.on('set name', function(name, callback){
    log.info('#' + socket.name, '-> request set name to "', name, '"');
    socket.name = name;
    if (typeof callback === 'function') {
        callback(name);
    }
  });

  socket.on('ppt', function(cmd, args){
    log.info('#' + socket.name, '-> message(ppt) :', cmd, ',', args);
    var d = {};
    if (cmd) {
        d['command'] = cmd;
    }
    if (args && args.length > 0) {
        d['args'] = args;
    }
    socket.broadcast.emit('ppt', d);
  });

  socket.on('disconnect', function(){
    log.info(socket.name, ' disconnected!!');
  });
  
  // for test
  socket.on('message', function(msg){
    log.debug('#' + socket.name, '-> message(raw) :', msg);
    var data = JSON.parse(msg);
    log.debug('#' + socket.name, '-> message(json) :', data);
    if (data) {
        log.debug('broadcast(@ppt) before :', data.command, ',', data.args);
        var d = {};
        if (cmd) {
            d['command'] = data.command;
        }
        if (data.args && data.args.length > 0) {
            d['args'] = data.args;
        }
        socket.broadcast.emit('ppt', d);
        log.debug('broadcast(@ppt) after :', data.command, ',', data.args);
    }
  });
  
});

// Sockets configure
io.configure('production', function(){
    io.enable('browser client minification');  // send minified client
    io.enable('browser client etag');          // apply etag caching logic based on version number
    io.set('log level', 1);                    // reduce logging
    io.set('transports', ['websocket', 'flashsocket', 'htmlfile', 'xhr-polling', 'jsonp-polling']);
});

io.configure('development', function(){
    io.enable('browser client etag');
    io.set('log level', 1);
});


app.listen(80);

console.log("'Node.js PPT' server listening on port %d in %s mode", app.address().port, app.settings.env);
