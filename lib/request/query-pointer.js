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
    console.log("QueryPointer: " + JSON.stringify(data));

    return binary.pack({lsb: state.lsb})
      .uint8(1) // reply
      .uint8(1) // same screen
      .uint16(state.sequence) // sequence
      .uint32(0) // reply length
      .uint32(0x00000026) // root window
      .uint32(data.window) // child window
      .int16(state.cursorX) // root x
      .int16(state.cursorY) // root y
      .int16(state.cursorX) // win x
      .int16(state.cursorY) // win y
      .uint16(0) // key + button mask
      .skip(6);
  }
};
