// https://github.com/ttaubert/x-server-js
// (c) 2013 Tim Taubert <tim@timtaubert.de>
// x-server.js may be freely distributed under the MIT license.

"use strict";

var net = require("net");
var http = require("http");
var WebSocketServer = require("websocket").server;

var server = http.createServer(function (request, response) {
  // TODO
});

server.listen(1337, function () {
  // TODO
});

var wsServer = new WebSocketServer({
  httpServer: server
});

var conn;
var socket;

wsServer.on("request", function (request) {
  conn = request.accept(null, request.origin); // TODO
  console.log("New WebSocket client");

  conn.on("message", function (msg) {
    if (msg.type === "binary") {
      socket.write(msg.binaryData, undefined, function () {
        var id = socket.remoteAddress + ":" + socket.remotePort;
        console.log("[%s] Forwarded message from WebSocket to XClient", id);
        //console.log(msg.binaryData.toString());
        //console.log(msg.binaryData.toJSON());
      });
    }
  });

  conn.on("close", function (conn) {
    // TODO
  });
});

var server = net.createServer(function (sock) {
  socket = sock
  var id = socket.remoteAddress + ":" + socket.remotePort;

  //conn.sendUTF("NEW " + id);
  console.log("[%s] XClient accepted", id);

  socket.on("data", function (data) {
    console.log("[%s] Received data", id);
    /*var buffer = new Buffer(data.length + id.length + 1);
    buffer.writeUInt8(id.length, 0);
    buffer.write(id, 1, null, "ascii");
    data.copy(buffer, id.length + 1);*/

    console.log("[%s] Forwarding message from XClient to WebSocket", id);
    conn.sendBytes(data);
  });

  socket.on("close", function () {
    //conn.sendUTF("END " + id);
    console.log("[%s] XClient is gone", id);
  });
})

server.listen(6000 + 1, null, null, function () {
  console.log("XServer listening on %j", server.address());
});
