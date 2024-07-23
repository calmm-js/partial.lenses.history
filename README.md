# <a id="partial-lenses-history"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.history/index.html#) [Partial Lenses History](#partial-lenses-history) &middot; [![Gitter](https://img.shields.io/gitter/room/calmm-js/chat.js.svg)](https://gitter.im/calmm-js/chat) [![GitHub stars](https://img.shields.io/github/stars/calmm-js/partial.lenses.history.svg?style=social)](https://github.com/calmm-js/partial.lenses.history) [![npm](https://img.shields.io/npm/dm/partial.lenses.history.svg)](https://www.npmjs.com/package/partial.lenses.history)

Partial Lenses History is a JavaScript library for state manipulation with
Undo-Redo history.  Basic features:
* [History can be serialized as JSON](#on-serializability)
* [All operations on history are either `O(1)` or `O(log n)`](#on-performance)
* Interactive documentation (the [▶
  links](https://calmm-js.github.io/partial.lenses.history/index.html)) and live
  examples:
  * The [Basic Undo-Redo](https://codesandbox.io/s/y0mzonm98x) CodeSandbox
    provides a simple example that is discussed [below](#a-basic-example).
  * The [Form using Context](https://codesandbox.io/s/2rq54pgrp) CodeSandbox
    also demonstrates this library.
* [Mostly](#on-side-effects) functional API:
  * [Immutable data structures](#on-immutability)
  * [Curried functions](http://fr.umio.us/favoring-curry/)
* [Supports tree-shaking](https://webpack.js.org/guides/tree-shaking/)
* [Contract checking in non-production builds](./src/partial.lenses.history.js)
* [MIT license](./LICENSE.md)

[![npm version](https://badge.fury.io/js/partial.lenses.history.svg)](http://badge.fury.io/js/partial.lenses.history)
[![Build Status](https://travis-ci.org/calmm-js/partial.lenses.history.svg?branch=master)](https://travis-ci.org/calmm-js/partial.lenses.history)
[![Code Coverage](https://img.shields.io/codecov/c/github/calmm-js/partial.lenses.history/master.svg)](https://codecov.io/github/calmm-js/partial.lenses.history?branch=master)
[![](https://david-dm.org/calmm-js/partial.lenses.history.svg)](https://david-dm.org/calmm-js/partial.lenses.history)
[![](https://david-dm.org/calmm-js/partial.lenses.history/dev-status.svg)](https://david-dm.org/calmm-js/partial.lenses.history?type=dev)

## <a id="contents"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.history/index.html#contents) [Contents](#contents)

* [A basic example](#a-basic-example)
* [Reference](#reference)
  * [Basic properties](#basic-properties)
    * [On serializability](#on-serializability)
    * [On performance](#on-performance)
    * [On immutability](#on-immutability)
    * [On side-effects](#on-side-effects)
  * [Creating](#creating)
    * [`H.init({[maxCount, pushEquals, replacePeriod]}, value) ~> history`](#H-init) <small><sup>v0.1.0</sup></small>
  * [Present](#present)
    * [`H.present ~> valueLens`](#H-present) <small><sup>v0.2.0</sup></small>
    * [`H.presentReplace ~> valueLens`](#H-presentReplace) <small><sup>v1.3.0</sup></small>
  * [Undo](#undo)
    * [`H.undoForget(history) ~> history`](#H-undoForget) <small><sup>v0.1.0</sup></small>
    * [`H.undoIndex ~> numberLens`](#H-undoIndex) <small><sup>v0.2.0</sup></small>
  * [Redo](redo)
    * [`H.redoForget(history) ~> history`](#H-redoForget) <small><sup>v0.1.0</sup></small>
    * [`H.redoIndex ~> numberLens`](#H-redoIndex) <small><sup>v0.2.0</sup></small>
  * [Time travel](#time-travel)
    * [`H.count(history) ~> number`](#H-count) <small><sup>v0.1.0</sup></small>
    * [`H.index ~> numberLens`](#H-index) <small><sup>v0.2.0</sup></small>
    * [`H.indexMax(history) ~> number`](#H-indexMax) <small><sup>v0.2.3</sup></small>

## <a id="a-basic-example"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.history/index.html#a-basic-example) [A basic example](#a-basic-example)

This section describes the [Basic
Undo-Redo](https://codesandbox.io/s/y0mzonm98x) CodeSandbox example that was
written to demonstrate usage of this library.  There is a text area and edits
retain history that can then be viewed through the undo and redo buttons.  You
probably want to open the example beside this tutorial.

Looking at the code, the first thing you might notice is the import statement:

```jsx
import * as H from 'kefir.partial.lenses.history'
```

When used in a [Karet](https://github.com/calmm-js/karet) UI, this library is
intended to be used through the [Kefir Partial Lenses
History](https://github.com/calmm-js/kefir.partial.lenses.history) library,
which is a simple [lifted](https://github.com/calmm-js/karet.util#U-lift)
wrapper around this library.  Lifting allows the functions of this library to be
directly used on [Kefir](https://kefirjs.github.io/kefir/)
[properties](https://kefirjs.github.io/kefir/#about-observables) and
[atoms](https://github.com/calmm-js/kefir.atom) representing time-varying values
and reactive variables.  However, this library does not depend on Karet or Kefir
and can be used with pretty much any UI framework.

To use history, one must first use [`H.init`](#H-init) to create the initial
history value and then store the value:

```jsx
const history = U.atom(H.init({}, ''))
```

In this case we use [`U.atom`](https://github.com/calmm-js/karet.util#U-atom) to
create an [atom](https://github.com/calmm-js/kefir.atom) to store the history.

> In a plain React UI, for example, one would typically store the history in
> component state:
>
> ```jsx
> this.state = {history: H.init({}, '')}
> ```

To access the present value from history, one uses the [`H.present`](#H-present)
[lens](https://github.com/calmm-js/partial.lenses/#lenses):

```jsx
const text = U.view(H.present, history)
```

As we are using atoms, we can use the
[`U.view`](https://github.com/calmm-js/karet.util#U-view) function to create a
bidirectional view of the present that we can then use to both read and write
the present value.

> In a plain React UI, one could use
> [`L.get`](https://github.com/calmm-js/partial.lenses/#L-get) to read the
> present value from component state:
>
> ```jsx
> const currentText = L.get(['history', H.present], this.state)
> ```
>
> and [`L.set`](https://github.com/calmm-js/partial.lenses/#L-set) to write to
> the present value in component state:
>
> ```jsx
> this.setState(L.set(['history', H.present], newText))
> ```
>
> The point here is that this library is not at all limited to Karet UIs.  In
> the remainder we will only discuss the actual example.

Now that we have the `text` view, we can use it to access the text without
knowing anything about the history.  So we can simply instantiate a
[`U.TextArea`](https://github.com/calmm-js/karet.util#U-TextArea) with the
`text` as the `value`:

```jsx
<U.TextArea placeholder="Retains history" value={text} />
```

Now edits through the text area generate history.  Note that, while in this case
we only store simple strings in history, values stored in history can be
arbitrarily complex trees of objects.

Of course, to actually make use of the history, we need to provide access to the
history itself, rather than just the present value.  To that end we implement a
countdown button component:

```jsx
const CountdownButton = ({count, shortcut, children, ...props}) => (
  <button disabled={R.not(count)} onClick={U.doModify(count, R.dec)} {...props}>
    {children}
    {U.when(count, U.string` (${count})`)}
    {U.when(
      shortcut,
      U.thru(
        U.fromEvents(document.body, 'keydown', false),
        U.skipUnless(shortcut),
        U.consume(U.actions(U.preventDefault, U.doModify(count, R.dec)))
      )
    )}
  </button>
)
```

The above `CountdownButton` component expects to receive a `count` atom
containing a non-negative integer and it then renders a button that is enabled
when the count is positive.  Clicking the button decrements the `count`.
Additionally, given a `shortcut` event predicate, it also binds a keyboard event
handler to the document that performs the same decrement action.  Note that the
above `CountdownButton` knows nothing about history.  It is just a generic
button that decrements a counter.

To wire countdown buttons to perform undo and redo actions on history, we use
the [`H.undoIndex`](#H-undoIndex) and [`H.redoIndex`](#H-redoIndex) lenses to
view the history.  Here is how it looks like for the undo button:

```jsx
<CountdownButton
  count={U.view(H.undoIndex, history)}
  title="Ctrl-z"
  shortcut={e => e.ctrlKey && e.key === 'z'}>
  Undo
</CountdownButton>
```

Modifying the undo index actually modifies the history.  That pretty much covers
basic usage of this library.

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
function thru(x, ...fns) {
  return fns.reduce((x, fn) => fn(x), x)
}
```

#### <a id="basic-properties"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.history/index.html#creating) [Basic properties](#basic-properties)

#### <a id="on-serializability"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.history/index.html#creating) [On serializability](#on-serializability)

The history data type should be considered opaque.  However, the history data
structure itself only uses [JSON](https://www.json.org/) compatible types.
Assuming that `JSON.parse(JSON.stringify(v))` is considered equivalent to `v`
for any value `v` put into history, then it is guaranteed that
`JSON.parse(JSON.stringify(history))` is considered equivalent to `history`.

#### <a id="on-performance"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.history/index.html#creating) [On performance](#on-performance)

The internal implementation of history uses a simple but fairly efficient data
structure (currently a radix search trie) that can perform all the operations
exposed by this library in either `O(1)` or `O(log n)` time.

#### <a id="on-immutability"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.history/index.html#creating) [On immutability](#on-immutability)

Since version 1.1.0 the history data structure is kept
[frozen](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze)
when `NODE_ENV` is not `production`.  Only the history data structure itself is
frozen.  Values inserted into history are not frozen by this library.

#### <a id="on-side-effects"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.history/index.html#creating) [On side-effects](#on-side-effects)

Certain operations, namely [`H.init`](#H-init) and
[`L.set(H.present)`](#H-present) in this library are not pure functions, because
they [take
timestamps](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/now)
underneath.

### <a id="creating"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.history/index.html#creating) [Creating](#creating)

#### <a id="H-init"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.history/index.html#H-init) [`H.init({[maxCount, pushEquals, replacePeriod]}, value) ~> history`](#H-init) <small><sup>v0.1.0</sup></small>

`H.init` creates a new history state object with the given initial `value`.  The
named parameters, `maxCount`, `replacePeriod`, and `pushEquals`, are optional
and control how history is updated when the state is modified through
[`H.present`](#H-present).
* `maxCount` defaults to `2^31-1` and specifies the maximum number of entries to
  keep in history.
* `pushEquals` defaults to `false` and determines whether writing a value that
  is equal to the present value updates history or not.
* `replacePeriod` defaults to `0` and specifies a period in milliseconds during
  which an update replaces the present value without adding history.

For example:

```js
thru(
  H.init({}, 101),
  L.get(H.present)
)
// 101
```

Note that `H.init` is not a pure function, because it takes a timestamp
underneath.

### <a id="present"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.history/index.html#present) [Present](#present)

#### <a id="H-present"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.history/index.html#H-present) [`H.present ~> valueLens`](#H-present) <small><sup>v0.2.0</sup></small>

`H.present` is a
[lens](https://github.com/calmm-js/partial.lenses/#partial-lenses) that focuses
on the present value of history.

For example:

```js
thru(
  H.init({}, 42),
  L.modify(H.present, x => -x),
  L.get(H.present)
)
// -42
```

Note that modifications through `H.present` are not referentially transparent
operations, because setting through `H.present` takes a timestamp underneath.

#### <a id="H-presentReplace"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.history/index.html#H-presentReplace) [`H.presentReplace ~> valueLens`](#H-presentReplace) <small><sup>v1.3.0</sup></small>

`H.presentReplace` is a
[lens](https://github.com/calmm-js/partial.lenses/#partial-lenses) that focuses
on the present value of history. When read it behaves exactly as [`H.present`](#H-present). When written it does *not* create a new history entry but instead replaces the current one. This might be useful for applying multiple changes in squence without polluting the history. 

For example:

```js
thru(
  H.init({}, 42),
  L.modify(H.presentReplace, x => -x),
  L.get(H.undoIndex)
)
// 0
```

Note that modifications through `H.presentReplace` are not referentially transparent
operations, because setting through `H.presentReplace` takes a timestamp underneath.

### <a id="undo"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.history/index.html#undo) [Undo](#undo)

#### <a id="H-undoForget"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.history/index.html#H-undoForget) [`H.undoForget(history) ~> history`](#H-undoForget) <small><sup>v0.1.0</sup></small>

`H.undoForget` removes all entries prior to present from history.

For example:

```js
thru(
  H.init({}, '1st'),
  L.set(H.present, '2nd'),
  L.set(H.present, '3rd'),
  H.undoForget,
  L.get(H.undoIndex)
)
// 0
```

#### <a id="H-undoIndex"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.history/index.html#H-undoIndex) [`H.undoIndex ~> numberLens`](#H-undoIndex) <small><sup>v0.2.0</sup></small>

`H.undoIndex` is a
[lens](https://github.com/calmm-js/partial.lenses/#partial-lenses) that focuses
on the undo position of history.

For example:

```js
thru(
  H.init({}, '1st'),
  L.set(H.present, '2nd'),
  L.set(H.present, '3rd'),
  L.modify(H.undoIndex, n => n-1),
  L.get(H.present)
)
// '2nd'
```

### <a id="redo"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.history/index.html#redo) [Redo](redo)

#### <a id="H-redoForget"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.history/index.html#H-redoForget) [`H.redoForget(history) ~> history`](#H-redoForget) <small><sup>v0.1.0</sup></small>

`H.redoForget` removes all entries following present from history.

For example:

```js
thru(
  H.init({}, '1st'),
  L.set(H.present, '2nd'),
  L.set(H.present, '3rd'),
  L.set(H.index, 0),
  H.redoForget,
  L.get(H.redoIndex)
)
// 0
```

#### <a id="H-redoIndex"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.history/index.html#H-redoIndex) [`H.redoIndex ~> numberLens`](#H-redoIndex) <small><sup>v0.2.0</sup></small>

`H.redoIndex` is a
[lens](https://github.com/calmm-js/partial.lenses/#partial-lenses) that focuses
on the redo position of history.

For example:

```js
thru(
  H.init({}, '1st'),
  L.set(H.present, '2nd'),
  L.set(H.present, '3rd'),
  L.set(H.index, 0),
  L.modify(H.redoIndex, n => n-1),
  L.get(H.present)
)
// '2nd'
```

### <a id="time-travel"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.history/index.html#time-travel) [Time travel](#time-travel)

#### <a id="H-count"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.history/index.html#H-count) [`H.count(history) ~> number`](#H-count) <small><sup>v0.1.0</sup></small>

`H.count` returns the number of entries in history.  See also
[`H.indexMax`](#H-indexMax).

For example:

```js
thru(
  H.init({}, '1st'),
  L.set(H.present, '2nd'),
  L.set(H.present, '3rd'),
  H.count
)
// 3
```

#### <a id="H-index"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.history/index.html#H-index) [`H.index ~> numberLens`](#H-index) <small><sup>v0.2.0</sup></small>

`H.index` is a
[lens](https://github.com/calmm-js/partial.lenses/#partial-lenses) that focuses
on the index of present of history.

For example:

```js
thru(
  H.init({}, '1st'),
  L.set(H.present, '2nd'),
  L.set(H.present, '3rd'),
  L.set(H.index, 1),
  L.get(H.present)
)
// '2nd'
```

#### <a id="H-indexMax"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.history/index.html#H-indexMax) [`H.indexMax(history) ~> number`](#H-indexMax) <small><sup>v0.2.3</sup></small>

`H.indexMax` returns the maximum history index.  See also [`H.count`](#H-count).

For example:

```js
thru(
  H.init({}, '1st'),
  L.set(H.present, '2nd'),
  L.set(H.present, '3rd'),
  H.indexMax
)
// 2
```
