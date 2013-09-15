// https://github.com/ttaubert/x-server-js
// (c) 2013 Tim Taubert <tim@timtaubert.de>
// x-server.js may be freely distributed under the MIT license.

"use strict";

var binary = require("../util/binary.js");

module.exports = {
  parse: function (data, state) {
    return binary.unpack(data, {lsb: state.lsb, offset: 1})
      .uint8("exposures")
      .uint16("requestLength")
      .uint32("window")
      .int16("x")
      .int16("y")
      .uint16("width")
      .uint16("height");
  },

  handle: function (data, state) {
    console.log("ClearArea: " + JSON.stringify(data));

    if (data.exposures) {
      // fire expose event
      return binary.pack({lsb: state.lsb})
        .uint8(12) // code
        .skip(1) // unused
        .uint16(state.sequence) // sequence
        //.uint32(0x00200009/*data.window*/) // window
        .uint32(data.window) // window
        .uint16(data.x) // x
        .uint16(data.y) // y
        .uint16(data.width) // width
        .uint16(data.height) // height
        .uint16(0) // count
        .skip(14);
    }
  }
};
