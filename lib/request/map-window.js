// https://github.com/ttaubert/x-server-js
// (c) 2013 Tim Taubert <tim@timtaubert.de>
// x-server.js may be freely distributed under the MIT license.

"use strict";

var binary = require("../util/binary.js");

module.exports = {
  parse: function (data, state) {
    return binary.unpack(data, {lsb: state.lsb, offset: 4})
      .uint32("window");
  },

  handle: function (data, state) {
    console.log("MapWindow: " + JSON.stringify(data));

    // fire expose event
    return binary.pack({lsb: state.lsb})
      .uint8(12) // code
      .skip(1) // unused
      .uint16(state.sequence) // sequence
      .uint32(0x00200009/*data.window*/) // window
      .uint16(0) // x
      .uint16(0) // y
      .uint16(100) // width
      .uint16(100) // height
      .uint16(0) // count
      .skip(14);
  }
};
