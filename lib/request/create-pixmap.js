// https://github.com/ttaubert/x-server-js
// (c) 2013 Tim Taubert <tim@timtaubert.de>
// x-server.js may be freely distributed under the MIT license.

"use strict";

var binary = require("../util/binary.js");

module.exports = {
  parse: function (data, state) {
    return binary.unpack(data, {lsb: state.lsb, offset: 1})
      .uint8("depth")
      .uint16("requestLength")
      .uint32("pid")
      .uint32("drawable")
      .uint16("width")
      .uint16("height");
  },

  handle: function (data, state) {
    console.log("CreatePixmap: " + JSON.stringify(data));
  }
};
