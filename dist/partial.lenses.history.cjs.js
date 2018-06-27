'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var I = require('infestines');
var V = require('partial.lenses.validation');
var L = require('partial.lenses');

var isBoolean = function isBoolean(x) {
  return typeof x === 'boolean';
};

var fn = function fn(args, res) {
  return V.freeFn(V.args.apply(null, args), res);
};

var integer = function integer(x) {
  return Number.isInteger(x);
};

var BITS = 4;
var SINGLE = 1 << BITS;
var MASK = SINGLE - 1;

function shiftOf(count) {
  var level = 0;
  while (SINGLE << level < count) {
    level += BITS;
  }return level;
}

var construct = function construct(l, u, r) {
  return { l: l, u: u, r: r };
};

var empty = /*#__PURE__*/construct(0, 0, []);

var of = function of(v) {
  return construct(0, 1, [v]);
};

function nth(i, trie) {
  i += trie.l;
  var shift = shiftOf(trie.u);
  var work = trie.r;
  while (0 !== shift) {
    work = work[i >> shift & MASK];
    shift -= BITS;
  }
  return work[i & MASK];
}

var length = function length(trie) {
  return trie.u - trie.l;
};

function setRec(shift, i, value, node) {
  var j = i >> shift & MASK;
  var x = shift !== 0 ? setRec(shift - BITS, i, value, node[j] || '') : value;
  var r = [];
  for (var k = 0, n = node.length; k < n; ++k) {
    r[k] = node[k];
  }r[j] = x;
  return r;
}

function append(value, trie) {
  var upper = trie.u;
  var shift = shiftOf(upper);
  var root = trie.r;
  return construct(trie.l, upper + 1, upper >> shift < SINGLE ? setRec(shift, upper, value, root) : [root, setRec(shift, upper, value, '')]);
}

function clrLhsRec(shift, i, node) {
  var j = i >> shift & MASK;
  var x = 0 !== shift ? clrLhsRec(shift - BITS, i, node[j]) : node[j];
  var r = [];
  for (var k = 0; k < j; ++k) {
    r[k] = null;
  }r[j] = x;
  for (var _k = j + 1, n = node.length; _k < n; ++_k) {
    r[_k] = node[_k];
  }return r;
}

function clrRhsRec(shift, i, node) {
  var j = i >> shift & MASK;
  var x = 0 !== shift ? clrRhsRec(shift - BITS, i, node[j]) : node[j];
  var r = [];
  for (var k = 0; k < j; ++k) {
    r[k] = node[k];
  }r[j] = x;
  return r;
}

function slice(from, to, trie) {
  if (to <= from) return empty;
  if (from === 0 && length(trie) === to) return trie;
  var lower = trie.l + from;
  var upper = lower + to - from;
  var root = trie.r;
  var shift = shiftOf(trie.u);
  while (0 !== shift && (lower >> shift & MASK) === (upper - 1 >> shift & MASK)) {
    var offset = lower & MASK << shift;
    root = root[lower >> shift & MASK];
    lower -= offset;
    upper -= offset;
    shift -= BITS;
  }
  if (trie.u !== upper) root = clrRhsRec(shift, upper - 1, root);
  if (trie.l !== lower) root = clrLhsRec(shift, lower, root);
  return construct(lower, upper, root);
}

var drop = function drop(n, trie) {
  return slice(n, length(trie), trie);
};
var take = function take(n, trie) {
  return slice(0, n, trie);
};

//

var construct$1 = function construct(i, t, v, c) {
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
  return construct$1(j - j0, append(now, slice(j0, j, t)), append(value, slice(j0, j, v)), c);
}

var setIndexU = function setIndexU(index, history) {
  return construct$1(Math.max(0, Math.min(index, indexMax(history))), history.t, history.v, history.c);
};

// Creating

var init = /*#__PURE__*/I.curryN(2, function init(config) {
  config = config || 0;
  var c = {
    p: config.replacePeriod || 0,
    e: !config.pushEquals,
    m: Math.max(1, config.maxCount || -1 >>> 1) - 1
  };
  return function (value) {
    return construct$1(0, of(Date.now()), of(value), c);
  };
});

// Time travel

var count = function count(history) {
  return length(history.v);
};

var index = /*#__PURE__*/L.lens(function index(history) {
  return history.i;
}, setIndexU);

var indexMax = function indexMax(history) {
  return length(history.v) - 1;
};

// Present

var present = /*#__PURE__*/L.lens(function present(history) {
  return nth(history.i, history.v);
}, setPresentU);

var undoForget = function undoForget(history) {
  return construct$1(0, drop(history.i, history.t), drop(history.i, history.v), history.c);
};

// Redo

var redoIndex = /*#__PURE__*/L.lens(function redoIndex(history) {
  return indexMax(history) - history.i;
}, function (index, history) {
  return setIndexU(indexMax(history) - index, history);
});

var redoForget = function redoForget(history) {
  return construct$1(history.i, take(history.i + 1, history.t), take(history.i + 1, history.v), history.c);
};

var C = process.env.NODE_ENV === 'production' ? function (x) {
  return x;
} : function (x, c) {
  var v = V.validate(c, x);
  return I.isFunction(x) ? I.arityN(x.length, v) : v;
};

var trie = /*#__PURE__*/V.props({ l: integer, u: integer, r: I.isArray });

var history = /*#__PURE__*/V.props({
  i: integer,
  t: trie,
  v: trie,
  c: /*#__PURE__*/V.props({ p: integer, e: isBoolean, m: integer })
});

var lens = function lens(outer, inner) {
  return fn([outer, V.accept, V.accept, fn([inner, V.accept], V.accept)], V.accept);
};

// Creating

var init$1 = /*#__PURE__*/C(init, /*#__PURE__*/fn([/*#__PURE__*/V.optional( /*#__PURE__*/V.props({
  maxCount: /*#__PURE__*/V.optional(integer),
  pushEquals: /*#__PURE__*/V.optional(isBoolean),
  replacePeriod: /*#__PURE__*/V.optional(integer)
})), V.accept], history));

// Present

var present$1 = /*#__PURE__*/C(present, /*#__PURE__*/lens(history, V.accept));

// Undo

var undoIndex = /*#__PURE__*/C(index, /*#__PURE__*/lens(history, integer));
var undoForget$1 = /*#__PURE__*/C(undoForget, /*#__PURE__*/fn([history], history));

// Redo

var redoIndex$1 = /*#__PURE__*/C(redoIndex, /*#__PURE__*/lens(history, integer));
var redoForget$1 = /*#__PURE__*/C(redoForget, /*#__PURE__*/fn([history], history));

// Time travel

var count$1 = /*#__PURE__*/C(count, /*#__PURE__*/fn([history], integer));
var index$1 = /*#__PURE__*/C(index, /*#__PURE__*/lens(history, integer));
var indexMax$1 = /*#__PURE__*/C(indexMax, /*#__PURE__*/fn([history], integer));

exports.init = init$1;
exports.present = present$1;
exports.undoIndex = undoIndex;
exports.undoForget = undoForget$1;
exports.redoIndex = redoIndex$1;
exports.redoForget = redoForget$1;
exports.count = count$1;
exports.index = index$1;
exports.indexMax = indexMax$1;
