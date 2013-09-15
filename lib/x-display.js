// https://github.com/ttaubert/x-server-js
// (c) 2013 Tim Taubert <tim@timtaubert.de>
// x-server.js may be freely distributed under the MIT license.

"use strict";

var binary = require("./util/binary.js");
var dispatch = require("./request/dispatcher.js");

var WebSocket = window.WebSocket || window.MozWebSocket;

function createXDisplay(canvas, url) {
  var conn = new WebSocket(url);
  conn.binaryType = "arraybuffer";

  var state = {
    ready: false,
    lsb: false,
    sequence: 0,
    pixmaps: {},
    resources: {},
    contexts: {},
    canvas: canvas
  };

  var ctx = canvas.getContext("2d");
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  /*this.resources[0x00000022] = new x_types.ColorMap(
      0x00000022
    , function (rgb, type) {
        rgb = [
            (rgb & 0x000000ff)
          , (rgb & 0x0000ff00) >> 8
          , (rgb & 0x00ff0000) >> 16
        ];
        switch (type) {
          case 'hex':
            return rgb.reduce(function (str, v) { v = v.toString(16); return str + (v.length < 2 ? '0' : '') + v }, '');
          default:
            return rgb;
        }
      }
  );
  this.resources[0x00000026] = this.root = new x_types.Window(
      this
    , 0x00000026
    , 0x18 // depth 24
    , 0, 0
    , this.screen.width(), this.screen.height()
    , 0, 1, 0
  );*/

  conn.onopen = function () {
    console.log("XDisplay connected to " + url);
  };

  conn.onerror = function (error) {
    console.log("XDisplay error: " + error);
  };

  conn.onmessage = function (msg) {
    dispatch(msg.data, state, conn.send.bind(conn));
  };

  return {};
}

window.XDisplay = {
  create: createXDisplay
};
