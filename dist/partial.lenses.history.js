(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('infestines'), require('partial.lenses')) :
  typeof define === 'function' && define.amd ? define(['exports', 'infestines', 'partial.lenses'], factory) :
  (factory((global.H = {}),global.I,global.L));
}(this, (function (exports,I,L) { 'use strict';

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
    return construct$1(Math.max(0, Math.min(index, count(history) - 1)), history.t, history.v, history.c);
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
      return construct$1(0, of(Date.now()), of(value), c);
    };
  });

  // Time travel

  var count = function count(history) {
    return length(history.v);
  };

  var index = /*#__PURE__*/L.lens(function (history) {
    return history.i;
  }, setIndexU);

  // Present

  var present = /*#__PURE__*/L.lens(function (history) {
    return nth(history.i, history.v);
  }, setPresentU);

  var undoForget = function undoForget(history) {
    return construct$1(0, drop(history.i, history.t), drop(history.i, history.v), history.c);
  };

  // Redo

  var redoIndex = /*#__PURE__*/L.lens(function (history) {
    return count(history) - 1 - history.i;
  }, function (index, history) {
    return setIndexU(count(history) - 1 - index, history);
  });

  var redoForget = function redoForget(history) {
    return construct$1(history.i, take(history.i + 1, history.t), take(history.i + 1, history.v), history.c);
  };

  exports.init = init;
  exports.count = count;
  exports.index = index;
  exports.present = present;
  exports.undoIndex = index;
  exports.undoForget = undoForget;
  exports.redoIndex = redoIndex;
  exports.redoForget = redoForget;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
