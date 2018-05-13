import { acyclicEqualsU, curry, curryN } from 'infestines';
import { lens } from 'partial.lenses';

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

var construct = function construct(i, t, v, c) {
  return { i: i, t: t, v: v, c: c };
};

//

function setPresentU(value, history) {
  var v = history.v;
  var i = history.i;
  var c = history.c;
  if (c.e) {
    if (acyclicEqualsU(nth(i, v), value)) {
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

var shiftBy = /*#__PURE__*/curry(function (delta, history) {
  return setIndexU(history.i + delta, history);
});

// Creating

var init = /*#__PURE__*/curryN(2, function (config) {
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
var setIndex = /*#__PURE__*/curry(setIndexU);
var viewIndex = /*#__PURE__*/lens(index, setIndexU);

// Present

var present = function present(history) {
  return nth(history.i, history.v);
};
var setPresent = /*#__PURE__*/curry(setPresentU);
var viewPresent = /*#__PURE__*/lens(present, setPresentU);

// Undo

var undo = /*#__PURE__*/shiftBy(-1);
var undoForget = function undoForget(history) {
  return construct(0, drop(history.i, history.t), drop(history.i, history.v), history.c);
};

// Redo

var redo = /*#__PURE__*/shiftBy(+1);
var redoCount = function redoCount(history) {
  return count(history) - 1 - history.i;
};
var redoForget = function redoForget(history) {
  return construct(history.i, take(history.i + 1, history.t), take(history.i + 1, history.v), history.c);
};

export { init, count, index, setIndex, viewIndex, present, setPresent, viewPresent, undo, index as undoCount, undoForget, redo, redoCount, redoForget };
