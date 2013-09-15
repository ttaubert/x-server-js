// https://github.com/ttaubert/x-server-js
// (c) 2013 Tim Taubert <tim@timtaubert.de>
// x-server.js may be freely distributed under the MIT license.

"use strict";

var binary = require("../util/binary.js");

module.exports = {
  parse: function (data, state) {
    return binary.unpack(data, {lsb: state.lsb, offset: 2})
      .uint16("requestLength")
      .uint32("drawable")
      .uint32("gc")
      .tap(function (vars) {
        for (var i = 0; i < (vars.requestLength - 3) / 2; i++) {
          this.rectangle("rectangles[]");
        }
      });
  },

  handle: function (data, state) {
    console.log("PolyFillRectangle: " + JSON.stringify(data));

    var ctx = state.canvas.getContext("2d");
    var gc = state.contexts[data.gc];
    var fg = (gc.foreground || 0);

    var r = (fg & 0x000000ff);
    var g = (fg & 0x0000ff00) >> 8
    var b = (fg & 0x00ff0000) >> 16
    ctx.fillStyle = "rgb(" + r + "," + g + "," + b + ")";

    data.rectangles.forEach(function (rect) {
      ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
    });
  }
};
