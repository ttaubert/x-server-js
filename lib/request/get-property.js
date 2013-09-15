// https://github.com/ttaubert/x-server-js
// (c) 2013 Tim Taubert <tim@timtaubert.de>
// x-server.js may be freely distributed under the MIT license.

"use strict";

var binary = require("../util/binary.js");
var atoms = require("../util/types.js").atoms;

var properties = {};

module.exports = {
  parse: function (data, state) {
    return binary.unpack(data, {lsb: state.lsb, offset: 1})
      .uint8("delete")
      .skip(2)
      .uint32("window")
      .uint32("property")
      .tap(function (vars) {
        vars.propertyName = atoms[vars.property];
      })
      .uint32("type")
      .tap(function (vars) {
        vars.typeName = (vars.type && atoms[vars.type]) || "";
      })
      .uint32("longOffset")
      .uint32("longLength");
  },

  handle: function (data, state) {
    console.log("GetProperty: " + JSON.stringify(data));

    return binary.pack({lsb: state.lsb})
      .uint8(1) // reply
      .uint8(0) // format
      .uint16(state.sequence) // sequence number
      .uint32(0) // reply length
      .uint32(0) // type
      .uint32(0) // bytes after
      .uint32(0) // value length
      .skip(12); // unused
  }
};
