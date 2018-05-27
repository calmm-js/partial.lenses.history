# Partial Lenses History Changelog

## 0.2.0

Redesigned the library interface.

After experimenting with the library, it became apparent that it makes sense to
manipulate history primarily via lenses rather than plain functions.  For
example, instead of a `H.undo` function, the same functionality can be obtained
by exposing a `H.undoIndex` lens such that `H.undo` becomes
`L.modify(H.undoIndex, R.dec)`.

This allows undo-redo functionality to be implemented via simple generic
components.  For example, a generic "count down" -button, like

```jsx
const CountDownButton = ({count, label}) => (
  <button disabled={R.not(count)} onClick={U.doModify(count, R.dec)}>
    {U.ifElse(count, U.string`${label} (${count})`, label)}
  </button>
)
```

that knows nothing about undo-redo, can be easily wired to control both undo and
redo:

```js
<CountDownButton value={U.view(H.undoIndex, history)} label="Undo"/>
<CountDownButton value={U.view(H.redoIndex, history)} label="Redo"/>
```

The use of lenses also simplifies the library interface significantly as instead
of three exports for a property, e.g. `H.present`, `H.setPresent`, and
`H.viewPresent`, a single lens is exported, e.g. `H.present`.
