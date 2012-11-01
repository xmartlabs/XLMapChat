var fs = require('fs'),
  url = require('url'),
  http = require('http'),
  path = require('path'),
  mime = require('mime'),
  io = require('socket.io');

fs.exists = fs.exists || require('path').exists;

httpServer = http.createServer(function(request, response) {
  var pathname = url.parse(request.url).pathname;
  if(pathname == "/") pathname = "index.html";
  var filename = path.join(process.cwd(), 'public', pathname);

  fs.exists(filename, function(exists) {
    if(!exists) {
      response.writeHead(404, {
        "Content-Type": "text/plain"
      });
      response.write("404 Not Found");
      response.end();
      return;
    }

    response.writeHead(200, {
      'Content-Type': mime.lookup(filename)
    });
    fs.createReadStream(filename, {
      'flags': 'r',
      'encoding': 'binary',
      'mode': 0666,
      'bufferSize': 4 * 1024
    }).addListener("data", function(chunk) {
      response.write(chunk, 'binary');
    }).addListener("close", function() {
      response.end();
    });
  });
});

var webSocket = io.listen(httpServer);

var connectedUsers = new Object();

webSocket.sockets.on('connection', function(socket) {

  socket.on('register', function(userInfo) {
    var userkey = Date.now();
    socket.set('userkey', userkey);
    connectedUsers[userkey] = userInfo;
    console.log('User ', userInfo.username, ' has logged in. Key = ', userkey);
  });

  socket.on('message', function(msg) {
    socket.get('userkey', function(err, key) {
      var user = connectedUsers[key];
      if(user) {
        var data = new Object();
        data.sender = user.username;
        data.message = msg;
        socket.broadcast.emit('chat',data);
      }
    });
  });

  socket.on("request locations", function() {
      socket.emit("all locations",connectedUsers);
  });

  socket.on("location update", function(data) {
    socket.get('userkey', function(err, key) {
      var user = connectedUsers[key];
      if(user) {
        user.lat = data.lat;
        user.lng = data.lng;

        data.userKey = key;
        data.username = user.name;
        socket.broadcast.emit("location", data);
      }
    });
  });

  socket.on('disconnect', function() {
    socket.get('userkey', function(err, key) {
      var userInfo = connectedUsers[key];
      if(userInfo) {
        console.log('User ', userInfo.username, ' has disconnected. Key = ', key);
        delete connectedUsers[key];        
        socket.broadcast.emit("user disconnected", key);
      }
    });
  });

  socket.on('android', function(data) {
    console.log('Android says: ', data);
    socket.broadcast.emit('android', data);
  });
});

httpServer.listen(process.env.PORT || 8080, "0.0.0.0");
console.log('Server running at 8080');