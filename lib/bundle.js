;(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{"../util/binary.js":18,"../util/types.js":19}],2:[function(require,module,exports){
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

},{"../util/binary.js":18}],3:[function(require,module,exports){
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

},{"../util/binary.js":18}],4:[function(require,module,exports){
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
  }
};

},{"../util/binary.js":18}],5:[function(require,module,exports){
// https://github.com/ttaubert/x-server-js
// (c) 2013 Tim Taubert <tim@timtaubert.de>
// x-server.js may be freely distributed under the MIT license.

"use strict";

var setup = require("./setup.js");

var OPCODES = {
  1: require("./create-window.js"),
  /*, 2: 'ChangeWindowAttributes'
  , 3: 'GetWindowAttributes'
  , 4: 'DestroyWindow'
  , 5: 'DestroySubWindows'
  , 6: 'ChangeSaveSet'
  , 7: 'ReparentWindow'*/
  8: require("./map-window.js"),
  9: require("./map-subwindows.js"),
  /*, 10: 'UnmapWindow'
  , 11: 'UnmapSubwindows'
  , 12: 'ConfigureWindow'
  , 13: 'CirculateWindow'
  , 14: 'GetGeometry'
  , 15: 'QueryTree'*/
  16: require("./intern-atom.js"),
  /*, 17: 'GetAtomName'*/
  18: require("./change-property.js"),
  /*, 19: 'DeleteProperty'*/
  20: require("./get-property.js"),
  /*, 21: 'ListProperties'
  , 22: 'SetSelectionOwner'
  , 23: 'GetSelectionOwner'
  , 24: 'SetSelectionOwner'
  , 25: 'SendEvent'
  , 26: 'GrabPointer'
  , 27: 'UngrabPointer'
  , 28: 'GrabButton'
  , 29: 'UngrabButton'
  , 30: 'ChangeActivePointerGrab'
  , 31: 'GrabKeyboard'
  , 32: 'UngrabKeyboard'
  , 33: 'GrabKey'
  , 34: 'UngrabKey'
  , 35: 'AllowEvents'
  , 36: 'GrabServer'
  , 37: 'UngrabServer'
  , 38: 'QueryPointer'
  , 39: 'GetMotionEvents'
  , 40: 'TranslateCoordinates'
  , 41: 'WarpPointer'
  , 42: 'SetInputFocus'*/
  43: require("./get-input-focus.js"),
  /*, 44: 'QueryKeymap'
  , 45: 'OpenFont'
  , 46: 'CloseFont'
  , 47: 'QueryFont'
  , 48: 'QueryTextExtents'
  , 49: 'ListFonts'
  , 50: 'ListFontsWithInfo'
  , 51: 'SetFontPath'
  , 52: 'GetFontPath'*/
  53: require("./create-pixmap.js"),
  54: require("./free-pixmap.js"),
  55: require("./create-gc.js"),
  /*, 56: 'ChangeGC'
  , 57: 'CopyGC'
  , 58: 'SetDashes'
  , 59: 'SetClipRectangles'*/
  60: require("./free-gc.js"),
  /*, 61: 'ClearArea'
  , 62: 'CopyArea'
  , 63: 'CopyPlane'
  , 64: 'PolyPoint'
  , 65: 'PolyLine'
  , 66: 'PolySegment'
  , 67: 'PolyRectangle'
  , 68: 'PolyArc'*/
  69: require("./fill-poly.js"),
  70: require("./poly-fill-rectangle.js"),
  /*, 71: 'PolyFillArc'*/
  72: require("./put-image.js"),
  /*, 73: 'GetImage'
  , 74: 'PolyText8'
  , 75: 'PolyText16'
  , 76: 'ImageText8'
  , 77: 'ImageText16'
  , 78: 'CreateColormap'
  , 79: 'FreeColormap'
  , 80: 'CopyColormapAndFree'
  , 81: 'InstallColormap'
  , 82: 'UninstallColormap'
  , 83: 'ListInstalledColormaps'
  , 84: 'AllocColor'
  , 85: 'AllocNamedColor'
  , 86: 'AllocColorCells'
  , 87: 'AllocColorPlanes'
  , 88: 'FreeColors'
  , 89: 'StoreColors'
  , 90: 'StoreNamedColor'
  , 91: 'QueryColors'
  , 92: 'LookupColor'
  , 93: 'CreateCursor'
  , 94: 'CreateGlyphCursor'
  , 95: 'FreeCursor'
  , 96: 'RecolorCursor'
  , 97: 'QueryBestSize'*/
  98: require("./query-extension.js"),
  /*, 99: 'ListExtensions'
  , 100: 'ChangeKeyboardMapping'
  , 101: 'GetKeyboardMapping'
  , 102: 'ChangeKeyboardControl'
  , 103: 'GetKeyboardControl'
  , 104: 'Bell'
  , 105: 'ChangePointerControl'
  , 106: 'GetPointerControl'
  , 107: 'SetScreenSaver'
  , 108: 'GetScreenSaver'
  , 109: 'ChangeHosts'
  , 110: 'ListHosts'
  , 111: 'SetAccessControl'
  , 112: 'SetCloseDownMode'
  , 113: 'KillClient'
  , 114: 'RotateProperties'
  , 115: 'ForceScreenSaver'
  , 116: 'SetPointerMapping'
  , 117: 'GetPointerMapping'
  , 118: 'SetModifierMapping'
  , 119: 'GetModifierMapping'
  , 127: 'NoOperation'*/
};

module.exports = function (data, state, send) {
  while (data.byteLength) {
    var request;

    if (state.ready) {
      var view = new DataView(data);
      var code = view.getUint8(0);

      if (code in OPCODES) {
        state.sequence++;
        request = OPCODES[code];
      } else {
        return console.log("Unknown request with opcode #" + code);
      }
    } else {
      state.ready = true;
      request = setup;
    }

    var parsed = request.parse(data, state);
    data = data.slice(parsed.offset);

    var response = request.handle(parsed.vars, state)
    if (response) {
      send(response.toArrayBuffer());
    }
  }
};

},{"./change-property.js":1,"./create-gc.js":2,"./create-pixmap.js":3,"./create-window.js":4,"./fill-poly.js":6,"./free-gc.js":7,"./free-pixmap.js":8,"./get-input-focus.js":9,"./get-property.js":10,"./intern-atom.js":11,"./map-subwindows.js":12,"./map-window.js":13,"./poly-fill-rectangle.js":14,"./put-image.js":15,"./query-extension.js":16,"./setup.js":17}],6:[function(require,module,exports){
// https://github.com/ttaubert/x-server-js
// (c) 2013 Tim Taubert <tim@timtaubert.de>
// x-server.js may be freely distributed under the MIT license.

"use strict";

var binary = require("../util/binary.js");

var SHAPE_COMPLEX = 0;
var SHAPE_NONCONVEX = 1;
var SHAPE_CONVEX = 2;

var COORD_MODE_ORIGIN = 0;
var COORD_MODE_PREVIOUS = 1;

module.exports = {
  parse: function (data, state) {
    return binary.unpack(data, {lsb: state.lsb, offset: 2})
      .uint16("requestLength")
      .uint32("drawable")
      .uint32("gc")
      .uint8("shape")
      .uint8("coordinateMode")
      .skip(2)
      .tap(function (vars) {
        for (var i = 0; i < (vars.requestLength - 4); i++) {
          this.point("points[]");
        }
      });
  },

  handle: function (data, state) {
    console.log("FillPoly: " + JSON.stringify(data));

    var ctx = state.canvas.getContext("2d");
    var gc = state.contexts[data.gc];
    var fg = (gc.foreground || 0);

    var r = (fg & 0x00ff0000) >> 16
    var g = (fg & 0x0000ff00) >> 8
    var b = (fg & 0x000000ff);
    ctx.fillStyle = "rgb(" + r + "," + g + "," + b + ")";

    ctx.beginPath();
    var start = data.points[0];
    ctx.moveTo(start.x, start.y);

    data.points.slice(1).forEach(function (point) {
      ctx.lineTo(point.x, point.y);
    });

    ctx.fill();
  }
};

},{"../util/binary.js":18}],7:[function(require,module,exports){
// https://github.com/ttaubert/x-server-js
// (c) 2013 Tim Taubert <tim@timtaubert.de>
// x-server.js may be freely distributed under the MIT license.

"use strict";

var binary = require("../util/binary.js");

module.exports = {
  parse: function (data, state) {
    return binary.unpack(data, {lsb: state.lsb, offset: 4})
      .uint32("gc");
  },

  handle: function (data, state) {
    console.log("FreeGC: " + JSON.stringify(data));
    delete state.contexts[data.gc];
  }
};

},{"../util/binary.js":18}],8:[function(require,module,exports){
// https://github.com/ttaubert/x-server-js
// (c) 2013 Tim Taubert <tim@timtaubert.de>
// x-server.js may be freely distributed under the MIT license.

"use strict";

var binary = require("../util/binary.js");

module.exports = {
  parse: function (data, state) {
    return binary.unpack(data, {lsb: state.lsb, offset: 4})
      .uint32("pid");
  },

  handle: function (data, state) {
    console.log("FreePixmap: " + JSON.stringify(data));
  },
};

},{"../util/binary.js":18}],9:[function(require,module,exports){
// https://github.com/ttaubert/x-server-js
// (c) 2013 Tim Taubert <tim@timtaubert.de>
// x-server.js may be freely distributed under the MIT license.

"use strict";

var binary = require("../util/binary.js");

module.exports = {
  parse: function (data, state) {
    return binary.unpack(data, {lsb: state.lsb, offset: 4});
  },

  handle: function (data, state) {
    console.log("GetInputFocus: " + JSON.stringify(data));

    return binary.pack({lsb: state.lsb})
      .uint8(1) // reply
      .uint8(0) // revert to
      .uint16(state.sequence) // sequence number
      .uint32(0) // reply length
      .uint32(0) // focus
      .skip(20); // unused
  }
};

},{"../util/binary.js":18}],10:[function(require,module,exports){
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

},{"../util/binary.js":18,"../util/types.js":19}],11:[function(require,module,exports){
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

},{"../util/binary.js":18,"../util/types.js":19}],12:[function(require,module,exports){
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

},{"../util/binary.js":18}],13:[function(require,module,exports){
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
    console.log("MapWindow: " + JSON.stringify(data));

    // fire expose event
    return binary.pack({lsb: state.lsb})
      .uint8(12) // code
      .skip(1) // unused
      .uint16(state.sequence) // sequence
      .uint32(0x00200009/*data.window*/) // window
      .uint16(0) // x
      .uint16(0) // y
      .uint16(100) // width
      .uint16(100) // height
      .uint16(0) // count
      .skip(14);
  }
};

},{"../util/binary.js":18}],14:[function(require,module,exports){
// https://github.com/ttaubert/x-server-js
// (c) 2013 Tim Taubert <tim@timtaubert.de>
// x-server.js may be freely distributed under the MIT license.

"use strict";

var binary = require("../util/binary.js");

module.exports = {
  parse: function (data, state) {
    return binary.unpack(data, {lsb: state.lsb, offset: 2})
      .uint16("requestLength")
      .uint32("drawable")
      .uint32("gc")
      .tap(function (vars) {
        for (var i = 0; i < (vars.requestLength - 3) / 2; i++) {
          this.rectangle("rectangles[]");
        }
      });
  },

  handle: function (data, state) {
    console.log("PolyFillRectangle: " + JSON.stringify(data));

    var ctx = state.canvas.getContext("2d");
    var gc = state.contexts[data.gc];
    var fg = (gc.foreground || 0);

    var r = (fg & 0x00ff0000) >> 16
    var g = (fg & 0x0000ff00) >> 8
    var b = (fg & 0x000000ff);
    ctx.fillStyle = "rgb(" + r + "," + g + "," + b + ")";

    data.rectangles.forEach(function (rect) {
      ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
    });
  }
};

},{"../util/binary.js":18}],15:[function(require,module,exports){
// https://github.com/ttaubert/x-server-js
// (c) 2013 Tim Taubert <tim@timtaubert.de>
// x-server.js may be freely distributed under the MIT license.

"use strict";

var binary = require("../util/binary.js");

var FMT_BITMAP = 0;
var FMT_XY_PIXMAP = 1;
var FMT_Z_PIXMAP = 2;

module.exports = {
  parse: function (data, state) {
    return binary.unpack(data, {lsb: state.lsb, offset: 1})
      .uint8("format")
      .uint16("requestLength")
      .uint32("drawable")
      .uint32("gc")
      .uint16("width")
      .uint16("height")
      .int16("dst-x")
      .int16("dst-y")
      .uint8("leftPad")
      .uint8("depth")
      .skip(2)
      .tap(function (vars) {
        this.skip((vars.requestLength - 6) * 4); // image + padding
      });
  },

  handle: function (data, state) {
    console.log("PutImage: " + JSON.stringify(data));
  }
};

},{"../util/binary.js":18}],16:[function(require,module,exports){
// https://github.com/ttaubert/x-server-js
// (c) 2013 Tim Taubert <tim@timtaubert.de>
// x-server.js may be freely distributed under the MIT license.

"use strict";

var binary = require("../util/binary.js");

module.exports = {
  parse: function (data, state) {
    return binary.unpack(data, {lsb: state.lsb, offset: 4})
      .uint16("nameLength")
      .skip(2)
      .tap(function (vars) {
        this.asciiString("name", vars.nameLength, {pad: 4})
      });
  },

  handle: function (data, state) {
    console.log("QueryExtension: " + JSON.stringify(data));

    return binary.pack({lsb: state.lsb})
      .uint8(1) // reply
      .skip(1) // unused
      .uint16(state.sequence) // sequence number
      .uint32(0) // reply length
      .uint8(0) // present
      .uint8(0) // major opcode
      .uint8(0) // first event
      .uint8(0) // first error
      .skip(20); // unused
  }
};

},{"../util/binary.js":18}],17:[function(require,module,exports){
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

},{"../util/binary.js":18}],18:[function(require,module,exports){
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

},{}],19:[function(require,module,exports){
// https://github.com/ttaubert/x-server-js
// (c) 2013 Tim Taubert <tim@timtaubert.de>
// x-server.js may be freely distributed under the MIT license.

"use strict";

var ATOMS = [
  null,
  // 1-5
  "PRIMARY", "SECONDARY", "ARC", "ATOM", "BITMAP",
  // 6-10
  "CARDINAL", "COLORMAP", "CURSOR", "CUT_BUFFER0", "CUT_BUFFER1",
  // 11-15
  "CUT_BUFFER2", "CUT_BUFFER3", "CUT_BUFFER4", "CUT_BUFFER5", "CUT_BUFFER6",
  // 16-20
  "CUT_BUFFER7", "DRAWABLE", "FONT", "INTEGER", "PIXMAP",
  // 21-25
  "POINT", "RECTANGLE", "RESOURCE_MANAGER", "RGB_COLOR_MAP", "RGB_BEST_MAP",
  // 26-30
  "RGB_BLUE_MAP", "RGB_DEFAULT_MAP", "RGB_GRAY_MAP", "RGB_GREEN_MAP", "RGB_RED_MAP",
  // 31-35
  "STRING", "VISUALID", "WINDOW", "WM_COMMAND", "WM_HINTS",
  // 36-40
  "WM_CLIENT_MACHINE", "WM_ICON_NAME", "WM_ICON_SIZE", "WM_NAME", "WM_NORMAL_HINTS",
  // 41-45
  "WM_SIZE_HINTS", "WM_ZOOM_HINTS", "MIN_SPACE", "NORM_SPACE", "MAX_SPACE",
  // 46-50
  "END_SPACE", "SUPERSCRIPT_X", "SUPERSCRIPT_Y", "SUBSCRIPT_X", "SUBSCRIPT_Y",
  // 51-55
  "UNDERLINE_POSITION", "UNDERLINE_THICKNESS", "STRIKEOUT_ASCENT", "STRIKEOUT_DESCENT", "ITALIC_ANGLE",
  // 56-60
  "X_HEIGHT", "QUAD_WIDTH", "WEIGHT", "POINT_SIZE", "RESOLUTION",
  // 61-65
  "COPYRIGHT", "NOTICE", "FONT_NAME", "FAMILY_NAME", "FULL_NAME",
  // 66-68
  "CAP_HEIGHT", "WM_CLASS", "WM_TRANSIENT_FOR",
];

module.exports = {
  atoms: ATOMS
};

},{}],20:[function(require,module,exports){
// https://github.com/ttaubert/x-server-js
// (c) 2013 Tim Taubert <tim@timtaubert.de>
// x-server.js may be freely distributed under the MIT license.

"use strict";

var binary = require("./util/binary.js");
var dispatch = require("./request/dispatcher.js");

var WebSocket = window.WebSocket || window.MozWebSocket;

function createXDisplay(canvas, url) {
  var conn = new WebSocket(url);
  conn.binaryType = "arraybuffer";

  var state = {
    ready: false,
    lsb: false,
    sequence: 0,
    pixmaps: {},
    resources: {},
    contexts: {},
    canvas: canvas
  };

  var ctx = canvas.getContext("2d");
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  /*this.resources[0x00000022] = new x_types.ColorMap(
      0x00000022
    , function (rgb, type) {
        rgb = [
            (rgb & 0x000000ff)
          , (rgb & 0x0000ff00) >> 8
          , (rgb & 0x00ff0000) >> 16
        ];
        switch (type) {
          case 'hex':
            return rgb.reduce(function (str, v) { v = v.toString(16); return str + (v.length < 2 ? '0' : '') + v }, '');
          default:
            return rgb;
        }
      }
  );
  this.resources[0x00000026] = this.root = new x_types.Window(
      this
    , 0x00000026
    , 0x18 // depth 24
    , 0, 0
    , this.screen.width(), this.screen.height()
    , 0, 1, 0
  );*/

  conn.onopen = function () {
    console.log("XDisplay connected to " + url);
  };

  conn.onerror = function (error) {
    console.log("XDisplay error: " + error);
  };

  conn.onmessage = function (msg) {
    dispatch(msg.data, state, conn.send.bind(conn));
  };

  return {};
}

window.XDisplay = {
  create: createXDisplay
};

},{"./request/dispatcher.js":5,"./util/binary.js":18}]},{},[20])
;