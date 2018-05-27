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
    undoIndex: L.get(H.undoIndex, state),
    redoIndex: L.get(H.redoIndex, state),
    count: H.count(state),
    present: L.get(H.present, state),
    index: L.get(H.index, state)
  })

  testEq(
    {
      undoIndex: 0,
      redoIndex: 0,
      count: 1,
      present: 101,
      index: 0
    },
    () => I.seq(H.init(undefined, 101), H.undoForget, H.redoForget, getState)
  )

  testEq({undoIndex: 1, redoIndex: 1, count: 3, present: 42, index: 1}, () =>
    I.seq(
      H.init({maxCount: 3}, 101),
      L.set(H.present, 69),
      L.set(H.present, 42),
      L.set(H.present, 42),
      L.set(H.present, 69),
      L.modify(H.undoIndex, R.dec),
      L.modify(H.undoIndex, R.dec),
      L.modify(H.redoIndex, R.dec),
      getState
    )
  )

  const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

  testEq([2, 3, 5], async () => {
    let h = H.init({replacePeriod: 10, pushEquals: true}, 1)
    h = L.set(H.present, 2, h)
    await delay(20)
    h = L.set(H.present, 3, h)
    h = L.set(H.present, 3, h)
    await delay(20)
    h = L.set(H.present, 4, h)
    h = L.set(H.present, 5, h)
    return R.map(
      i => L.get(H.present, L.set(H.index, i, h)),
      R.range(0, H.count(h))
    )
  })

  testEq(16000, () => {
    let h = H.init({maxCount: 5000}, 1)
    for (let i = 2; i < 20000; ++i) h = L.set(H.present, i, h)
    h = L.set(H.index, 1000, h)
    h = H.redoForget(h)
    h = H.undoForget(h)
    return L.get(H.present, h)
  })
})
