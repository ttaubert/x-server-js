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
        for (var i = 0; i < (vars.requestLength - 3) / 3; i++) {
          this.arc("arcs[]");
        }
      });
  },

  handle: function (data, state) {
    console.log("PolyFillArc: " + JSON.stringify(data));

    var ctx = state.canvas.getContext("2d");
    var gc = state.contexts[data.gc];
    var fg = (gc.foreground || 0);

    var r = (fg & 0x000000ff);
    var g = (fg & 0x0000ff00) >> 8
    var b = (fg & 0x00ff0000) >> 16
    ctx.fillStyle = "rgb(" + r + "," + g + "," + b + ")";

    data.arcs.forEach(function (arc) {
      var aspect = arc.width / arc.height;

      ctx.save();
      ctx.scale(aspect, 1);
      ctx.beginPath();

      var a1 = arc.angle1 / 64 + 90;
      var a2 = arc.angle2 / 64 + a1;

      ctx.arc(
        (arc.x + (arc.width / 2)) / aspect,
        arc.y + (arc.height / 2),
        arc.height / 2,
        (a1 * Math.PI) / 180,
        (a2 * Math.PI) / 180
      );

      ctx.fill();
      ctx.restore();
    });
  }
};
