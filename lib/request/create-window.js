// https://github.com/ttaubert/x-server-js
// (c) 2013 Tim Taubert <tim@timtaubert.de>
// x-server.js may be freely distributed under the MIT license.

"use strict";

var binary = require("../util/binary.js");

var CLASS_COPY_FROM_PARENT = 0;
var CLASS_INPUT_OUTPUT = 1;
var CLASS_INPUT_ONLY = 2;

var VFIELDS = {
  0x00000001: function (unpacker) {
    unpacker.uint32("background-pixmap");
  },

  0x00000002: function (unpacker) {
    unpacker.uint32("background-pixel");
  },

  0x00000004: function (unpacker) {
    unpacker.uint32("border-pixmap");
  },

  0x00000008: function (unpacker) {
    unpacker.uint32("border-pixel");
  },

  0x00000010: function (unpacker) {
    unpacker.uint8("bit-gravity")
            .skip(3);
  },

  0x00000020: function (unpacker) {
    unpacker.uint8("win-gravity")
            .skip(3);
  },

  0x00000040: function (unpacker) {
    unpacker.uint8("backing-store")
            .skip(3);
  },

  /*0x00000080: "backing-planes",
  0x00000100: "backing-pixel",
  0x00000200: "override-redirect",
  0x00000400: "save-under",*/

  0x00000800: function (unpacker) {
    unpacker.uint32("event-mask");
  },

  /*0x00001000: "do-not-propagate-mask",*/

  0x00002000: function (unpacker) {
    unpacker.uint32("colormap");
  },

  /*0x00004000: "cursor"*/
};

module.exports = {
  parse: function (data, state) {
    return binary.unpack(data, {lsb: state.lsb, offset: 1})
      .uint8("depth")
      .uint16("requestLength")
      .uint32("wid")
      .uint32("parent")
      .int16("x")
      .int16("y")
      .uint16("width")
      .uint16("height")
      .uint16("borderWidth")
      .uint16("class")
      .uint32("visualID")
      .uint32("valuemask")
      .tap(function (vars) {
        Object.keys(VFIELDS).forEach(function (id) {
          if (id & vars.valuemask) {
            VFIELDS[id](this);
          }
        }, this);
      });
  },

  handle: function (data, state) {
    console.log("CreateWindow: " + JSON.stringify(data));

    // fire expose event
    return binary.pack({lsb: state.lsb})
      .uint8(12) // code
      .skip(1) // unused
      .uint16(state.sequence) // sequence
      .uint32(data.wid) // window
      .uint16(data.x) // x
      .uint16(data.y) // y
      .uint16(data.width) // width
      .uint16(data.height) // height
      .uint16(0) // count
      .skip(14);
  }
};
