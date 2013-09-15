// https://github.com/ttaubert/x-server-js
// (c) 2013 Tim Taubert <tim@timtaubert.de>
// x-server.js may be freely distributed under the MIT license.

"use strict";

var binary = require("../util/binary.js");

var VFIELDS = {
  /*0x00000001: "function",
  0x00000002: "plane-mask",*/

  0x00000004: function (unpacker) {
    unpacker.uint32("foreground");
  },

  0x00000008: function (unpacker) {
    unpacker.uint32("background");
  },

  /*0x00000010: "line-width",
  0x00000020: "line-style",
  0x00000040: "cap-style",
  0x00000080: "join-style",
  0x00000100: "fill-style",
  0x00000200: "fill-rule",
  0x00000400: "tile",
  0x00000800: "stipple",
  0x00001000: "tile-stipple-x-origin",
  0x00002000: "tile-stipple-y-origin",
  0x00004000: "font",
  0x00008000: "subwindow-mode",
  0x00010000: "graphics-exposures",
  0x00020000: "clip-x-origin",
  0x00040000: "clip-y-origin",
  0x00080000: "clip-mask",
  0x00100000: "dash-offset",
  0x00200000: "dashes",
  0x00400000: "arc-mode"*/
};

module.exports = {
  parse: function (data, state) {
    return binary.unpack(data, {lsb: state.lsb, offset: 4})
      .uint32("cid")
      .uint32("drawable")
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
    console.log("CreateGC: " + JSON.stringify(data));
    state.contexts[data.cid] = data;
  }
};
