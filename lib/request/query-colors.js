// https://github.com/ttaubert/x-server-js
// (c) 2013 Tim Taubert <tim@timtaubert.de>
// x-server.js may be freely distributed under the MIT license.

"use strict";

var binary = require("../util/binary.js");

module.exports = {
  parse: function (data, state) {
    return binary.unpack(data, {lsb: state.lsb, offset: 2})
      .uint16("requestLength")
      .uint32("cmap")
      .tap(function (vars) {
        for (var i = 0; i < (vars.requestLength - 2); i++) {
          this.uint32("pixels[]");
        }
      });
  },

  handle: function (data, state) {
    console.log("QueryColors: " + JSON.stringify(data));

    var packet = binary.pack({lsb: state.lsb})
      .uint8(1) // reply
      .skip(1) // unused
      .uint16(state.sequence) // sequence
      .uint32(2 * data.pixels.length) // reply length
      .uint16(data.pixels.length) // number of rgbs in colors
      .skip(22);

    data.pixels.forEach(function (pixel) {
      packet.uint16(pixel & 0x000000ff)
            .uint16((pixel & 0x0000ff00) >> 8)
            .uint16((pixel & 0x00ff0000) >> 16)
            .skip(2);
    });

    return packet;
  }
};
