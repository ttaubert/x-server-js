// https://github.com/ttaubert/x-server-js
// (c) 2013 Tim Taubert <tim@timtaubert.de>
// x-server.js may be freely distributed under the MIT license.

"use strict";

var binary = require("../util/binary.js");

var VENDOR = "x-server.js";
var RELEASE_NUMBER = 1;
var BYTE_ORDER_LSB = 0x6C;

var FORMATS = [
  new Format(0x01, 0x01, 0x20),
  new Format(0x04, 0x08, 0x20),
  new Format(0x08, 0x08, 0x20),
  new Format(0x0f, 0x10, 0x20),
  new Format(0x10, 0x10, 0x20),
  new Format(0x18, 0x20, 0x20),
  new Format(0x20, 0x20, 0x20)
];

var DEPTHS = [
  new Depth(0x01),
  new Depth(0x18, [
    new VisualType(
        0x00000020 // id
      , 0x04 // class
      , 0x08 // bits per rgb
      , 0x0100 // colormap entries
      , 0x00ff0000 // red mask
      , 0x0000ff00 // green mask
      , 0x000000ff // blue mask
    ),
    new VisualType(
        0x00000021 // id
      , 0x05 // class
      , 0x08 // bits per rgb
      , 0x0100 // colormap entries
      , 0x00ff0000 // red mask
      , 0x0000ff00 // green mask
      , 0x000000ff // blue mask
    )
  ])
];

function Format(depth, bpp, scanline_pad) {
  this.depth = depth;
  this.bpp = bpp;
  this.scanline_pad = scanline_pad;
  this.length = 8;
}

function VisualType (visualid, _class, bits_per_rgb, colormap_entries, red_mask, green_mask, blue_mask) {
  this.visualid = visualid || 0;
  this.class = _class || 0;
  this.bits_per_rgb = bits_per_rgb || 0;
  this.colormap_entries = colormap_entries || 0;
  this.red_mask = red_mask || 0;
  this.green_mask = green_mask || 0;
  this.blue_mask = blue_mask || 0;
  this.length = 24;
}

function Depth (depth, visual_types) {
  this.depth = depth || 0;
  this.visual_types = visual_types || [];
}

var resource_id_mask = 0x001fffff;
var resource_id_bases = [];
var res_base = resource_id_mask + 1;
var res_id = 0;
while (!(res_id & 0xE0000000)) {
  resource_id_bases.push(res_id += res_base);
}

module.exports = {
  parse: function (data, state) {
    return binary.unpack(data)
      .uint8("lsb")
      .tap(function (vars) {
        // Update LSB flag.
        this.lsb = vars.lsb = (vars.lsb == BYTE_ORDER_LSB);
      })
      .skip(1)
      .uint16("protocolMajorVersion")
      .uint16("protocolMinorVersion")
      .uint16("authNameLength")
      .uint16("authDataLength")
      .skip(2)
      .tap(function (vars) {
        this.asciiString("authProtocolName", vars.authNameLength, {pad: 4})
            .asciiString("authProtocolData", vars.authDataLength, {pad: 4})
      });
  },

  handle: function (data, state) {
    console.log("Connection set up: " + JSON.stringify(data));
    state.lsb = data.lsb;

    var packet = binary.pack({lsb: data.lsb})
      .uint8(1) // success
      .skip(1) // unused
      .uint16(11) // major proto version
      .uint16(0); // minor proto version

    // vendor
    var payload = binary.pack({lsb: data.lsb})
      .asciiString(VENDOR, {pad: 4});

    // formats
    for (var i = 0; i < FORMATS.length; i++) {
      var fmt = FORMATS[i];
      payload.uint8(fmt.depth)
             .uint8(fmt.bpp)
             .uint8(fmt.scanline_pad)
             .skip(5);
    }

    // screens
    payload.uint32(0x00000026) // root
           .uint32(0x00000022) // color map
           .uint32(0x00ffffff) // white
           .uint32(0x00000000) // black
           .uint32(0x00000000) // current input masks
           .uint16(640) // width px
           .uint16(480) // height px
           .uint16(Math.round(640 * 2.54 / 9.6)) // width mm
           .uint16(Math.round(480 * 2.54 / 9.6)) // height mm
           .uint16(0x0001) // min maps
           .uint16(0x0001) // max maps
           .uint32(0x20) // root visual
           .uint8(2) // backing stores 0 Never, 1 WhenMapped, 2 Always
           .uint8(1) // save unders
           .uint8(0x18) // 24bit default depth
           .uint8(DEPTHS.length);

    for (var i = 0; i < DEPTHS.length; i++) {
      payload.uint8(DEPTHS[i].depth)
             .skip(1)
             .uint16(DEPTHS[i].visual_types.length)
             .skip(4);

      for (var j = 0; j < DEPTHS[i].visual_types.length; j++) {
        var vt = DEPTHS[i].visual_types[j];
        payload.uint32(vt.visualid)
               .uint8(vt.class)
               .uint8(vt.bits_per_rgb)
               .uint16(vt.colormap_entries)
               .uint32(vt.red_mask)
               .uint32(vt.green_mask)
               .uint32(vt.blue_mask)
               .skip(4);
      }
    }

    // length of additional data?
    packet.uint16((32 + payload.length) / 4);

    // release number
    packet.uint32(RELEASE_NUMBER);

    // resource id base
    packet.uint32(resource_id_bases.shift());

    // resource id mask
    packet.uint32(resource_id_mask);

    // motion buffer size
    packet.uint32(0xff);

    // vendor length
    packet.uint16(VENDOR.length);

    // max request length
    packet.uint16(0xffff);

    // number of screens
    packet.uint8(1);

    // number of formats
    packet.uint8(FORMATS.length);

    packet.uint8(0); // image lsb first
    packet.uint8(0); // pixmap lsb first
    packet.uint8(32); // pixmap scanline unit
    packet.uint8(32); // pixmap scanline pad
    packet.uint8(8); // min keycode
    packet.uint8(255); // max keycode

    packet.skip(4);
    return packet.concat(payload);
  }
};
