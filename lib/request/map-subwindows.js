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
    console.log("MapSubwindows: " + JSON.stringify(data));
  }
};
