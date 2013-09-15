// https://github.com/ttaubert/x-server-js
// (c) 2013 Tim Taubert <tim@timtaubert.de>
// x-server.js may be freely distributed under the MIT license.

"use strict";

var binary = require("../util/binary.js");

module.exports = {
  parse: function (data, state) {
    return binary.unpack(data, {lsb: state.lsb, offset: 4})
      .uint16("nameLength")
      .skip(2)
      .tap(function (vars) {
        this.asciiString("name", vars.nameLength, {pad: 4})
      });
  },

  handle: function (data, state) {
    console.log("QueryExtension: " + JSON.stringify(data));

    return binary.pack({lsb: state.lsb})
      .uint8(1) // reply
      .skip(1) // unused
      .uint16(state.sequence) // sequence number
      .uint32(0) // reply length
      .uint8(0) // present
      .uint8(0) // major opcode
      .uint8(0) // first event
      .uint8(0) // first error
      .skip(20); // unused
  }
};
