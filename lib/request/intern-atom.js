// https://github.com/ttaubert/x-server-js
// (c) 2013 Tim Taubert <tim@timtaubert.de>
// x-server.js may be freely distributed under the MIT license.

"use strict";

var binary = require("../util/binary.js");
var atoms = require("../util/types.js").atoms;

module.exports = {
  parse: function (data, state) {
    return binary.unpack(data, {lsb: state.lsb, offset: 1})
      .uint8("onlyIfExists")
      .uint16("requestLength")
      .uint16("nameLength")
      .skip(2)
      .tap(function (vars) {
        this.asciiString("name", vars.nameLength, {pad: 4})
      });
  },

  handle: function (data, state) {
    console.log("InternAtom: " + JSON.stringify(data));

    var reply = function (atom) {
      return packReply(state, atom);
    };

    // Search in the list of atoms.
    var index = atoms.indexOf(data.name);
    if (index > -1) {
      return reply(index);
    }

    // Let's create the atom.
    if (!data.onlyIfExists) {
      return reply(atoms.push(data.name) - 1);
    }

    // Atom not found.
    return reply(0);
  }
}

function packReply(state, atom) {
  return binary.pack({lsb: state.lsb})
    .uint8(1) // reply
    .skip(1) // unused
    .uint16(state.sequence) // sequence number
    .uint32(0) // reply length
    .uint32(atom) // atom
    .skip(20); // unused
}
