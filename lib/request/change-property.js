// https://github.com/ttaubert/x-server-js
// (c) 2013 Tim Taubert <tim@timtaubert.de>
// x-server.js may be freely distributed under the MIT license.

"use strict";

var binary = require("../util/binary.js");
var atoms = require("../util/types.js").atoms;

var MODE_REPLACE = 0;
var MODE_PREPEND = 1;
var MODE_APPEND = 2;

var properties = {};

module.exports = {
  parse: function (data, state) {
    return binary.unpack(data, {lsb: state.lsb, offset: 1})
      .uint8("mode")
      .uint16("requestLength")
      .uint32("window")
      .uint32("property")
      .tap(function (vars) {
        vars.propertyName = atoms[vars.property];
      })
      .uint32("type")
      .tap(function (vars) {
        vars.typeName = (vars.type && atoms[vars.type]) || "";
      })
      .uint8("format")
      .skip(3)
      .uint32("dataLength")
      .tap(function (vars) {
        var method = "uint" + vars.format;
        for (var i = 0; i < vars.dataLength; i++) {
          this[method]("data[]");
        }

        var length = vars.dataLength * (vars.format / 8);
        this.skip(4 - ((length % 4) || 4));
      });
  },

  handle: function (data, state) {
    console.log("ChangeProperty: " + JSON.stringify(data));
  }
};
