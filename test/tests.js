import * as I from 'infestines'
import * as L from 'partial.lenses'
import * as R from 'ramda'

import * as H from '../dist/partial.lenses.history.cjs'

function show(x) {
  switch (typeof x) {
    case 'string':
    case 'object':
      return JSON.stringify(x)
    default:
      return `${x}`
  }
}

const toExpr = thunk =>
  thunk
    .toString()
    .replace(/\s+/g, ' ')
    .replace(/^\s*function\s*\(\s*\)\s*{\s*(return\s*)?/g, '')
    .replace(/\s*;?\s*}\s*$/g, '')
    .replace(/function\s*(\([a-zA-Z]*\))\s*/g, '$1 => ')
    .replace(/{\s*return\s*([^{;]+)\s*;\s*}/g, '$1')

const assertEqual = (expected, actual) =>
  Promise.resolve(actual).then(actual => {
    if (!R.equals(actual, expected))
      throw Error(`Expected: ${show(expected)}, actual: ${show(actual)}`)
  })

const testEq = (expect, thunk) =>
  it(`${toExpr(thunk)} => ${show(expect)}`, () => assertEqual(expect, thunk()))

describe('History', () => {
  const getState = state => ({
    undoCount: H.undoCount(state),
    redoCount: H.redoCount(state),
    count: H.count(state),
    present: H.present(state),
    index: H.index(state)
  })

  testEq(
    {
      undoCount: 0,
      redoCount: 0,
      count: 1,
      present: 101,
      index: 0
    },
    () => I.seq(H.init(undefined, 101), H.undoForget, H.redoForget, getState)
  )

  testEq({undoCount: 1, redoCount: 1, count: 3, present: 42, index: 1}, () =>
    I.seq(
      H.init({maxCount: 3}, 101),
      H.setPresent(69),
      H.setPresent(42),
      L.set(H.viewPresent, 42),
      L.set(H.viewPresent, 69),
      H.undo,
      H.undo,
      H.redo,
      getState
    )
  )

  const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

  testEq([2, 3, 5], async () => {
    let h = H.init({replacePeriod: 10, pushEquals: true}, 1)
    h = H.setPresent(2, h)
    await delay(20)
    h = H.setPresent(3, h)
    h = H.setPresent(3, h)
    await delay(20)
    h = H.setPresent(4, h)
    h = H.setPresent(5, h)
    return R.map(i => H.present(H.setIndex(i, h)), R.range(0, H.count(h)))
  })

  testEq(16000, () => {
    let h = H.init({maxCount: 5000}, 1)
    for (let i = 2; i < 20000; ++i) h = H.setPresent(i, h)
    h = H.setIndex(1000, h)
    h = H.redoForget(h)
    h = H.undoForget(h)
    return H.present(h)
  })
})
