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
  , 37: 'UngrabServer'*/
  38: require("./query-pointer.js"),
  /*, 39: 'GetMotionEvents'
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
  61: require("./clear-area.js"),
  /*, 62: 'CopyArea'
  , 63: 'CopyPlane'
  , 64: 'PolyPoint'
  , 65: 'PolyLine'
  , 66: 'PolySegment'
  , 67: 'PolyRectangle'
  , 68: 'PolyArc'*/
  69: require("./fill-poly.js"),
  70: require("./poly-fill-rectangle.js"),
  71: require("./poly-fill-arc.js"),
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
  , 90: 'StoreNamedColor'*/
  91: require("./query-colors.js"),
  /*, 92: 'LookupColor'
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
