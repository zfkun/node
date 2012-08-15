// Inits
var express = require('express'),
    app     = express(),
    server  = app.listen(8080, function() {
        log.info("PPT server listening on port %d in %s mode", app);
    }),
    io      = require('socket.io').listen(server),
    logger  = require('socket.io/lib/logger'),
    log     = new logger(),

    AUTHOR  = 'zfkun',
    EMAIL   = EMAIL;


// Configuration
app.configure(function() {
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
    res.render('index', { title: 'index', author: AUTHOR, email: EMAIL });
});

app.get('/html5', function(req, res){
    res.render('html5', { title: 'html5', author: AUTHOR, email: EMAIL });
});

app.get('/ppt', function(req, res){
    res.render('ppt', { title: 'PPT - Viewer', author: AUTHOR });
});

app.get('/controller', function(req, res){
    res.render('controller', { title: 'PPT - Controller', author: AUTHOR });
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
    socket.on('message', function(msg) {
        var data, d;
        
        log.debug('#' + socket.name, '-> message(raw) :', msg);
        data = JSON.parse(msg);
        log.debug('#' + socket.name, '-> message(json) :', data);
        
        if (data) {
            log.debug('broadcast(@ppt) before :', data.command, ',', data.args);
            
            d = {};
            if (cmd) d['command'] = data.command;
            if (data.args && data.args.length > 0) d['args'] = data.args;
            
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
