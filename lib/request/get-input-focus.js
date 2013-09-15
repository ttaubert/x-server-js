// https://github.com/ttaubert/x-server-js
// (c) 2013 Tim Taubert <tim@timtaubert.de>
// x-server.js may be freely distributed under the MIT license.

"use strict";

var binary = require("../util/binary.js");

module.exports = {
  parse: function (data, state) {
    return binary.unpack(data, {lsb: state.lsb, offset: 4});
  },

  handle: function (data, state) {
    console.log("GetInputFocus: " + JSON.stringify(data));

    return binary.pack({lsb: state.lsb})
      .uint8(1) // reply
      .uint8(0) // revert to
      .uint16(state.sequence) // sequence number
      .uint32(0) // reply length
      .uint32(0) // focus
      .skip(20); // unused
  }
};
