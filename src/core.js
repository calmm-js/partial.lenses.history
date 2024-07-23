import * as I from 'infestines'
import * as L from 'partial.lenses'

import * as S from './trie'

//

const construct =
  process.env.NODE_ENV === 'production'
    ? (i, t, v, c) => ({i, t, v, c})
    : (i, t, v, c) => I.freeze({i, t, v, c: I.freeze(c)})

//

function setPresentU(value, history) {
  const v = history.v
  const i = history.i
  const c = history.c
  if (c.e) {
    if (I.acyclicEqualsU(S.nth(i, v), value)) {
      return history
    }
  }
  const t = history.t
  const now = Date.now()
  const j = i + (c.p <= now - S.nth(i, t))
  const j0 = Math.max(0, j - c.m)
  return construct(
    j - j0,
    S.append(now, S.slice(j0, j, t)),
    S.append(value, S.slice(j0, j, v)),
    c
  )
}

function setPresentReplaceU(value, history) {
  const v = history.v
  const i = history.i
  const c = history.c
  if (c.e) {
    if (I.acyclicEqualsU(S.nth(i, v), value)) {
      return history
    }
  }
  const t = history.t
  const now = Date.now()
  const j0 = Math.max(0, i - c.m)
  return construct(
    i - j0,
    S.append(now, S.slice(j0, i, t)),
    S.append(value, S.slice(j0, i, v)),
    c
  )
}

const setIndexU = (index, history) =>
  construct(
    Math.max(0, Math.min(index, indexMax(history))),
    history.t,
    history.v,
    history.c
  )

// Creating

export const init = I.curryN(2, function init(config) {
  config = config || 0
  const c = {
    p: config.replacePeriod || 0,
    e: !config.pushEquals,
    m: Math.max(1, config.maxCount || -1 >>> 1) - 1
  }
  return value => construct(0, S.of(Date.now()), S.of(value), c)
})

// Time travel

export const count = history => S.length(history.v)

export const index = L.lens(function index(history) {
  return history.i
}, setIndexU)

export const indexMax = history => S.length(history.v) - 1

// Present

export const present = L.lens(function present(history) {
  return S.nth(history.i, history.v)
}, setPresentU)

export const presentReplace = L.lens(function presentReplace(history) {
  return S.nth(history.i, history.v)
}, setPresentReplaceU)

// Undo

export {index as undoIndex}

export const undoForget = history =>
  construct(
    0,
    S.drop(history.i, history.t),
    S.drop(history.i, history.v),
    history.c
  )

// Redo

export const redoIndex = L.lens(
  function redoIndex(history) {
    return indexMax(history) - history.i
  },
  (index, history) => setIndexU(indexMax(history) - index, history)
)

export const redoForget = history =>
  construct(
    history.i,
    S.take(history.i + 1, history.t),
    S.take(history.i + 1, history.v),
    history.c
  )
