'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var I = require('infestines');
var L = require('partial.lenses');

var nth = function nth(i, vs) {
  return vs[i];
};
var append = function append(v, vs) {
  return vs.concat([v]);
};
var slice = function slice(from, to, vs) {
  return from === 0 && length(vs) === to ? vs : vs.slice(from, to);
};
var drop = function drop(n, vs) {
  return slice(n, length(vs), vs);
};
var length = function length(vs) {
  return vs.length;
};
var take = function take(n, vs) {
  return slice(0, n, vs);
};
var of = function of(v) {
  return [v];
};

//

var dec = function dec(x) {
  return x - 1;
};

//

var construct = function construct(i, t, v, c) {
  return { i: i, t: t, v: v, c: c };
};

//

function setPresentU(value, history) {
  var v = history.v;
  var i = history.i;
  var c = history.c;
  if (c.e) {
    if (I.acyclicEqualsU(nth(i, v), value)) {
      return history;
    }
  }
  var t = history.t;
  var now = Date.now();
  var j = i + (c.p <= now - nth(i, t));
  var j0 = Math.max(0, j - c.m);
  return construct(j - j0, append(now, slice(j0, j, t)), append(value, slice(j0, j, v)), c);
}

var setIndexU = function setIndexU(index, history) {
  return construct(Math.max(0, Math.min(index, count(history) - 1)), history.t, history.v, history.c);
};

// Creating

var init = /*#__PURE__*/I.curryN(2, function (config) {
  config = config || 0;
  var c = {
    p: config.replacePeriod || 0,
    e: !config.pushEquals,
    m: Math.max(1, config.maxCount || -1 >>> 1) - 1
  };
  return function (value) {
    return construct(0, of(Date.now()), of(value), c);
  };
});

// Time travel

var count = function count(history) {
  return length(history.v);
};
var index = function index(history) {
  return history.i;
};
var setIndex = /*#__PURE__*/I.curry(setIndexU);
var viewIndex = /*#__PURE__*/L.lens(index, setIndexU);

// Present

var present = function present(history) {
  return nth(history.i, history.v);
};
var setPresent = /*#__PURE__*/I.curry(setPresentU);
var viewPresent = /*#__PURE__*/L.lens(present, setPresentU);
var undo = /*#__PURE__*/L.modify(viewIndex, dec);
var undoForget = function undoForget(history) {
  return construct(0, drop(history.i, history.t), drop(history.i, history.v), history.c);
};

// Redo

var redoCount = function redoCount(history) {
  return count(history) - 1 - history.i;
};
var viewRedoCount = /*#__PURE__*/L.lens(redoCount, function (index, history) {
  return setIndex(count(history) - 1 - index, history);
});
var redo = /*#__PURE__*/L.modify(viewRedoCount, dec);
var redoForget = function redoForget(history) {
  return construct(history.i, take(history.i + 1, history.t), take(history.i + 1, history.v), history.c);
};

exports.init = init;
exports.count = count;
exports.index = index;
exports.setIndex = setIndex;
exports.viewIndex = viewIndex;
exports.present = present;
exports.setPresent = setPresent;
exports.viewPresent = viewPresent;
exports.undoCount = index;
exports.viewUndoCount = viewIndex;
exports.undo = undo;
exports.undoForget = undoForget;
exports.redoCount = redoCount;
exports.viewRedoCount = viewRedoCount;
exports.redo = redo;
exports.redoForget = redoForget;
