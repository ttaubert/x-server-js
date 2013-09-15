// https://github.com/ttaubert/x-server-js
// (c) 2013 Tim Taubert <tim@timtaubert.de>
// x-server.js may be freely distributed under the MIT license.

"use strict";

var binary = require("../util/binary.js");

var FMT_BITMAP = 0;
var FMT_XY_PIXMAP = 1;
var FMT_Z_PIXMAP = 2;

module.exports = {
  parse: function (data, state) {
    return binary.unpack(data, {lsb: state.lsb, offset: 1})
      .uint8("format")
      .uint16("requestLength")
      .uint32("drawable")
      .uint32("gc")
      .uint16("width")
      .uint16("height")
      .int16("dst-x")
      .int16("dst-y")
      .uint8("leftPad")
      .uint8("depth")
      .skip(2)
      .tap(function (vars) {
        this.skip((vars.requestLength - 6) * 4); // image + padding
      });
  },

  handle: function (data, state) {
    console.log("PutImage: " + JSON.stringify(data));
  }
};
