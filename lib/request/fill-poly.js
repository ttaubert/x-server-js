// https://github.com/ttaubert/x-server-js
// (c) 2013 Tim Taubert <tim@timtaubert.de>
// x-server.js may be freely distributed under the MIT license.

"use strict";

var binary = require("../util/binary.js");

var SHAPE_COMPLEX = 0;
var SHAPE_NONCONVEX = 1;
var SHAPE_CONVEX = 2;

var COORD_MODE_ORIGIN = 0;
var COORD_MODE_PREVIOUS = 1;

module.exports = {
  parse: function (data, state) {
    return binary.unpack(data, {lsb: state.lsb, offset: 2})
      .uint16("requestLength")
      .uint32("drawable")
      .uint32("gc")
      .uint8("shape")
      .uint8("coordinateMode")
      .skip(2)
      .tap(function (vars) {
        for (var i = 0; i < (vars.requestLength - 4); i++) {
          this.point("points[]");
        }
      });
  },

  handle: function (data, state) {
    console.log("FillPoly: " + JSON.stringify(data));

    var ctx = state.canvas.getContext("2d");
    var gc = state.contexts[data.gc];
    var fg = (gc.foreground || 0);

    var r = (fg & 0x000000ff);
    var g = (fg & 0x0000ff00) >> 8
    var b = (fg & 0x00ff0000) >> 16
    ctx.fillStyle = "rgb(" + r + "," + g + "," + b + ")";

    ctx.beginPath();
    var start = data.points[0];
    ctx.moveTo(start.x, start.y);

    data.points.slice(1).forEach(function (point) {
      ctx.lineTo(point.x, point.y);
    });

    ctx.fill();
  }
};
