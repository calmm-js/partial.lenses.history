# <a id="partial-lenses-history"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.history/index.html#) [Partial Lenses History](#partial-lenses-history) &middot; [![Gitter](https://img.shields.io/gitter/room/calmm-js/chat.js.svg)](https://gitter.im/calmm-js/chat) [![GitHub stars](https://img.shields.io/github/stars/calmm-js/partial.lenses.history.svg?style=social)](https://github.com/calmm-js/partial.lenses.history) [![npm](https://img.shields.io/npm/dm/partial.lenses.history.svg)](https://www.npmjs.com/package/partial.lenses.history)

Partial Lenses History is a JavaScript library for state manipulation with
Undo-Redo history.  History can be serialized as JSON and all operations on
history are either `O(1)` or `O(log n)`.  See this live
[CodeSandbox](https://codesandbox.io/s/2rq54pgrp) for an example.

[![npm version](https://badge.fury.io/js/partial.lenses.history.svg)](http://badge.fury.io/js/partial.lenses.history)
[![Build Status](https://travis-ci.org/calmm-js/partial.lenses.history.svg?branch=master)](https://travis-ci.org/calmm-js/partial.lenses.history)
[![Code Coverage](https://img.shields.io/codecov/c/github/calmm-js/partial.lenses.history/master.svg)](https://codecov.io/github/calmm-js/partial.lenses.history?branch=master)
[![](https://david-dm.org/calmm-js/partial.lenses.history.svg)](https://david-dm.org/calmm-js/partial.lenses.history)
[![](https://david-dm.org/calmm-js/partial.lenses.history/dev-status.svg)](https://david-dm.org/calmm-js/partial.lenses.history?type=dev)

## <a id="contents"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.history/index.html#contents) [Contents](#contents)

* [Reference](#reference)
  * [Creating](#creating)
    * [`H.init({[maxCount, pushEquals, replacePeriod]}, value) ~> history`](#H-init) <small><sup>v0.1.0</sup></small>
  * [Present](#present)
    * [`H.present(history) ~> value`](#H-present) <small><sup>v0.1.0</sup></small>
    * [`H.setPresent(value, history) ~> history`](#H-setPresent) <small><sup>v0.1.0</sup></small>
    * [`H.viewPresent ~> lens`](#H-viewPresent) <small><sup>v0.1.0</sup></small>
  * [Undo](#undo)
    * [`H.undo(history) ~> history`](#H-undo) <small><sup>v0.1.0</sup></small>
    * [`H.undoCount(history) ~> number`](#H-undoCount) <small><sup>v0.1.0</sup></small>
    * [`H.undoForget(history) ~> history`](#H-undoForget) <small><sup>v0.1.0</sup></small>
    * [`H.viewUndoCount(history) ~> lens`](#H-viewUndoCount) <small><sup>v0.1.1</sup></small>
  * [Redo](redo)
    * [`H.redo(history) ~> history`](#H-redo) <small><sup>v0.1.0</sup></small>
    * [`H.redoCount(history) ~> number`](#H-redoCount) <small><sup>v0.1.0</sup></small>
    * [`H.redoForget(history) ~> history`](#H-redoForget) <small><sup>v0.1.0</sup></small>
    * [`H.viewRedoCount(history) ~> lens`](#H-viewRedoCount) <small><sup>v0.1.1</sup></small>
  * [Time travel](#time-travel)
    * [`H.count(history) ~> number`](#H-count) <small><sup>v0.1.0</sup></small>
    * [`H.index(history) ~> number`](#H-index) <small><sup>v0.1.0</sup></small>
    * [`H.setIndex(number, history) ~> history`](#H-setIndex) <small><sup>v0.1.0</sup></small>
    * [`H.viewIndex ~> lens`](#H-viewIndex) <small><sup>v0.1.0</sup></small>

## <a id="reference"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.history/index.html#reference) [Reference](#reference)

The [combinators](https://wiki.haskell.org/Combinator) provided by this library
are available as named imports.  Typically one just imports the library as:

```jsx
import * as H from 'partial.lenses.history'
```

The examples also use the [Partial
Lenses](https://github.com/calmm-js/partial.lenses) library imported as

```jsx
import * as L from 'partial.lenses'
```

and the following helper function,
[`thru`](https://github.com/calmm-js/karet.util/#U-thru), that pipes a value
through the given sequence of functions:

```js
const thru = (x, ...fns) => fns.reduce((x, fn) => fn(x), x)
```

### <a id="creating"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.history/index.html#creating) [Creating](#creating)

#### <a id="H-init"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.history/index.html#H-init) [`H.init({[maxCount, pushEquals, replacePeriod]}, value) ~> history`](#H-init) <small><sup>v0.1.0</sup></small>

`H.init` creates a new history state object with the given initial `value`.  The
named parameters, `maxCount`, `replacePeriod`, and `pushEquals`, are optional
and control how history is updated when the state is modified using
[`H.setPresent`](#H-setPresent) or via [`H.viewPresent`](#H-viewPresent).
* `maxCount` defaults to `2^31-1` and specifies the maximum number of entries to
  keep in history.
* `pushEquals` defaults to `false` and determines whether writing a value that
  is equal to the present value updates history or not.
* `replacePeriod` defaults to `0` and specifies a period in milliseconds during
  which an update replaces the present value without adding history.

For example:

```js
H.init({}, 101)
// <history>
```

The `history` data type should be considered opaque.  However, assuming that
`JSON.parse(JSON.stringify(v))` is considered equivalent to `v` for any value
`v` put into history, then it is guaranteed that
`JSON.parse(JSON.stringify(history))` is considered equivalent to `history`.

Note that `H.init` is not a pure function, because it takes a timestamp
underneath.

### <a id="present"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.history/index.html#present) [Present](#present)

#### <a id="H-present"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.history/index.html#H-present) [`H.present(history) ~> value`](#H-present) <small><sup>v0.1.0</sup></small>

`H.present` returns the present value from history.

For example:

```js
thru(
  H.init({}, 42),
  H.setPresent(101),
  H.setPresent(69),
  H.undo,
  H.present
)
// 101
```

#### <a id="H-setPresent"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.history/index.html#H-setPresent) [`H.setPresent(value, history) ~> history`](#H-setPresent) <small><sup>v0.1.0</sup></small>

`H.setPresent` sets the present value of history.

For example:

```js
thru(
  H.init({}, 42),
  H.setPresent(101),
  H.present
)
// 101
```

Note that `H.setPresent` is not a pure function, because it takes a timestamp
underneath.

#### <a id="H-viewPresent"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.history/index.html#H-viewPresent) [`H.viewPresent ~> lens`](#H-viewPresent) <small><sup>v0.1.0</sup></small>

`H.viewPresent` is a
[lens](https://github.com/calmm-js/partial.lenses/#partial-lenses) that focuses
on the present value of history.

For example:

```js
thru(
  H.init({}, 42),
  L.modify(H.viewPresent, x => -x),
  H.present
)
// -42
```

### <a id="undo"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.history/index.html#undo) [Undo](#undo)

#### <a id="H-undo"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.history/index.html#H-undo) [`H.undo(history) ~> history`](#H-undo) <small><sup>v0.1.0</sup></small>

`H.undo` decreases the index of present by one in history if possible.

For example:

```js
thru(
  H.init({}, '1st'),
  H.setPresent('2nd'),
  H.setPresent('3rd'),
  H.undo,
  H.present
)
// '2nd'
```

#### <a id="H-undoCount"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.history/index.html#H-undoCount) [`H.undoCount(history) ~> number`](#H-undoCount) <small><sup>v0.1.0</sup></small>

`H.undoCount` returns the number of times [`H.undo`](#H-undo) has an effect
starting from present.

For example:

```js
thru(
  H.init({}, '1st'),
  H.setPresent('2nd'),
  H.setPresent('3rd'),
  H.undoCount
)
// 2
```

#### <a id="H-undoForget"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.history/index.html#H-undoForget) [`H.undoForget(history) ~> history`](#H-undoForget) <small><sup>v0.1.0</sup></small>

`H.undoForget` removes all entries prior to present from history.

For example:

```js
thru(
  H.init({}, '1st'),
  H.setPresent('2nd'),
  H.setPresent('3rd'),
  H.undoForget,
  H.undoCount
)
// 0
```

#### <a id="H-viewUndoCount"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.history/index.html#H-viewUndoCount) [`H.viewUndoCount(history) ~> lens`](#H-viewUndoCount) <small><sup>v0.1.1</sup></small>

`H.viewUndoCount` is a
[lens](https://github.com/calmm-js/partial.lenses/#partial-lenses) that focuses
on the undo count of history.

For example:

```js
thru(
  H.init({}, '1st'),
  H.setPresent('2nd'),
  H.setPresent('3rd'),
  L.modify(H.viewUndoCount, n => n-1),
  H.present
)
// '2nd'
```

### <a id="redo"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.history/index.html#redo) [Redo](redo)

#### <a id="H-redo"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.history/index.html#H-redo) [`H.redo(history) ~> history`](#H-redo) <small><sup>v0.1.0</sup></small>

`H.redo` increases the index of present by one in history is possible.

For example:

```js
thru(
  H.init({}, '1st'),
  H.setPresent('2nd'),
  H.setPresent('3rd'),
  H.setIndex(0),
  H.redo,
  H.present
)
// '2nd'
```

#### <a id="H-redoCount"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.history/index.html#H-redoCount) [`H.redoCount(history) ~> number`](#H-redoCount) <small><sup>v0.1.0</sup></small>

`H.redoCount` returns the number of times [`H.redo`](#H-redo) has an effect
starting from present.

For example:

```js
thru(
  H.init({}, '1st'),
  H.setPresent('2nd'),
  H.setPresent('3rd'),
  H.setIndex(0),
  H.redoCount
)
// 2
```

#### <a id="H-redoForget"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.history/index.html#H-redoForget) [`H.redoForget(history) ~> history`](#H-redoForget) <small><sup>v0.1.0</sup></small>

`H.redoForget` removes all entries following present from history.

For example:

```js
thru(
  H.init({}, '1st'),
  H.setPresent('2nd'),
  H.setPresent('3rd'),
  H.setIndex(0),
  H.redoForget,
  H.redoCount
)
// 0
```

#### <a id="H-viewRedoCount"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.history/index.html#H-viewRedoCount) [`H.viewRedoCount(history) ~> lens`](#H-viewRedoCount) <small><sup>v0.1.1</sup></small>

`H.viewRedoCount` is a
[lens](https://github.com/calmm-js/partial.lenses/#partial-lenses) that focuses
on the redo count of history.

For example:

```js
thru(
  H.init({}, '1st'),
  H.setPresent('2nd'),
  H.setPresent('3rd'),
  H.setIndex(0),
  L.modify(H.viewRedoCount, n => n-1),
  H.present
)
// '2nd'
```

### <a id="time-travel"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.history/index.html#time-travel) [Time travel](#time-travel)

#### <a id="H-count"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.history/index.html#H-count) [`H.count(history) ~> number`](#H-count) <small><sup>v0.1.0</sup></small>

`H.count` returns the number of entries in history.

For example:

```js
thru(
  H.init({}, '1st'),
  H.setPresent('2nd'),
  H.setPresent('3rd'),
  H.count
)
// 3
```

#### <a id="H-index"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.history/index.html#H-index) [`H.index(history) ~> number`](#H-index) <small><sup>v0.1.0</sup></small>

`H.index` returns the index of present in history.

For example:

```js
thru(
  H.init({}, '1st'),
  H.setPresent('2nd'),
  H.setPresent('3rd'),
  H.index
)
// 2
```

#### <a id="H-setIndex"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.history/index.html#H-setIndex) [`H.setIndex(number, history) ~> history`](#H-setIndex) <small><sup>v0.1.0</sup></small>

`H.setIndex` sets the index of present in history.

For example:

```js
thru(
  H.init({}, '1st'),
  H.setPresent('2nd'),
  H.setPresent('3rd'),
  H.setIndex(1),
  H.present
)
// '2nd'
```

#### <a id="H-viewIndex"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.history/index.html#H-viewIndex) [`H.viewIndex ~> lens`](#H-viewIndex) <small><sup>v0.1.0</sup></small>

`H.viewIndex` is a
[lens](https://github.com/calmm-js/partial.lenses/#partial-lenses) that focuses
on the index of present of history.

For example:

```js
thru(
  H.init({}, '1st'),
  H.setPresent('2nd'),
  H.setPresent('3rd'),
  L.set(H.viewIndex, 1),
  H.present
)
// '2nd'
```
