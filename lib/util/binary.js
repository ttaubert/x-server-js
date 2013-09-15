// https://github.com/ttaubert/x-server-js
// (c) 2013 Tim Taubert <tim@timtaubert.de>
// x-server.js may be freely distributed under the MIT license.

"use strict";

module.exports = {
  pack: function (opt) {
    return new Packer(opt);
  },

  unpack: function (data, opt) {
    return new Unpacker(data, opt);
  }
};

function Packer(opt) {
  this.lsb = !!(opt && opt.lsb);
  this.values = [];
  this.length = 0;
}

Packer.prototype = {
  skip: function (num) {
    this.values.push([null, "skip", num]);
    this.length += num;
    return this;
  },

  concat: function (packed) {
    this.values = this.values.concat(packed.values);
    this.length += packed.length;
    return this;
  },

  uint8: function (value) {
    this.values.push([value, "setUint8", 1]);
    this.length += 1;
    return this;
  },

  uint16: function (value) {
    this.values.push([value, "setUint16", 2]);
    this.length += 2;
    return this;
  },

  uint32: function (value) {
    this.values.push([value, "setUint32", 4]);
    this.length += 4;
    return this;
  },

  int16: function (value) {
    this.values.push([value, "setInt16", 2]);
    this.length += 2;
    return this;
  },

  asciiString: function (value, opt) {
    var total = value.length;
    if (opt && opt.pad) {
      total += opt.pad - ((value.length % opt.pad) || opt.pad);
    }

    this.values.push([value, "string", total]);
    this.length += total;
    return this;
  },

  toArrayBuffer: function () {
    var buffer = new ArrayBuffer(this.length);
    var view = new DataView(buffer);
    var offset = 0;

    this.values.forEach(function (value) {
      switch (value[1]) {
        case "string":
          var arr = new Uint8Array(buffer, offset, value[0].length);
          for (var i = 0; i < value[0].length; i++) {
            arr[i] = value[0].charCodeAt(i);
          }
          break;
        case "skip":
          break;
        default:
          view[value[1]](offset, value[0], this.lsb);
          break;
      }

      offset += value[2];
    }, this);

    return buffer;
  }
};

function Unpacker(data, opt) {
  this.data = data;
  this.lsb = !!(opt && opt.lsb);
  this.offset = +(opt && opt.offset) || 0;
  this.view = new DataView(data);
  this.vars = {};
}

Unpacker.prototype = {
  skip: function (num) {
    this.offset += num;
    return this;
  },

  uint8: function (name) {
    this.setValue(name, this.view.getUint8(this.offset));
    this.offset += 1;
    return this;
  },

  uint16: function (name) {
    this.setValue(name, this.view.getUint16(this.offset, this.lsb));
    this.offset += 2;
    return this;
  },

  uint32: function (name) {
    this.setValue(name, this.view.getUint32(this.offset, this.lsb));
    this.offset += 4;
    return this;
  },

  int16: function (name) {
    this.setValue(name, this.view.getInt16(this.offset, this.lsb));
    this.offset += 2;
    return this;
  },

  asciiString: function (name, length, opt) {
    var str = "";
    var arr = new Uint8Array(this.data.slice(this.offset, this.offset + length));

    for (var i = 0; i < arr.length; i++) {
      str += String.fromCharCode(arr[i]);
    }

    this.setValue(name, str);
    this.offset += length;

    if (opt && opt.pad) {
      this.offset += length + (opt.pad - ((length % opt.pad) || opt.pad));
    }

    return this;
  },

  point: function (name) {
    var x = this.view.getInt16(this.offset, this.lsb);
    var y = this.view.getInt16(this.offset + 2, this.lsb);
    this.setValue(name, {x: x, y: y});
    this.offset += 4;
  },

  rectangle: function (name) {
    var x = this.view.getInt16(this.offset, this.lsb);
    var y = this.view.getInt16(this.offset + 2, this.lsb);
    var w = this.view.getUint16(this.offset + 4, this.lsb);
    var h = this.view.getUint16(this.offset + 6, this.lsb);
    this.setValue(name, {x: x, y: y, width: w, height: h});
    this.offset += 8;
  },

  arc: function (name) {
    var x = this.view.getInt16(this.offset, this.lsb);
    var y = this.view.getInt16(this.offset + 2, this.lsb);
    var w = this.view.getUint16(this.offset + 4, this.lsb);
    var h = this.view.getUint16(this.offset + 6, this.lsb);
    var a1 = this.view.getInt16(this.offset + 8, this.lsb);
    var a2 = this.view.getInt16(this.offset + 10, this.lsb);
    this.setValue(name, {x: x, y: y, width: w, height: h, angle1: a1, angle2: a2});
    this.offset += 12;
  },

  setValue: function (name, value) {
    if (/\[\]$/.test(name)) {
      name = name.replace(/\[\]$/, "");
      if (!this.vars.hasOwnProperty(name)) {
        this.vars[name] = [];
      }

      this.vars[name].push(value);
    } else {
      this.vars[name] = value;
    }
  },

  tap: function (cb) {
    cb.call(this, this.vars);
    return this;
  }
};
