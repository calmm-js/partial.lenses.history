import * as I from 'infestines'

const BITS = 4
const SINGLE = 1 << BITS
const MASK = SINGLE - 1

function shiftOf(count) {
  let level = 0
  while (SINGLE << level < count) level += BITS
  return level
}

const construct =
  process.env.NODE_ENV === 'production'
    ? (l, u, r) => ({l, u, r})
    : (l, u, r) => I.freeze({l, u, r: I.freeze(r)})

const empty = construct(0, 0, I.array0)

const of = v => construct(0, 1, [v])

function nth(i, trie) {
  i += trie.l
  let shift = shiftOf(trie.u)
  let work = trie.r
  while (0 !== shift) {
    work = work[(i >> shift) & MASK]
    shift -= BITS
  }
  return work[i & MASK]
}

const length = trie => trie.u - trie.l

const setRec = (process.env.NODE_ENV === 'production'
  ? I.id
  : fn =>
      function setRec(s, i, v, n) {
        return I.freeze(fn(s, i, v, n))
      })((shift, i, value, node) => {
  const j = (i >> shift) & MASK
  const x = shift !== 0 ? setRec(shift - BITS, i, value, node[j] || '') : value
  const r = []
  for (let k = 0, n = node.length; k < n; ++k) r[k] = node[k]
  r[j] = x
  return r
})

function append(value, trie) {
  const upper = trie.u
  const shift = shiftOf(upper)
  const root = trie.r
  return construct(
    trie.l,
    upper + 1,
    upper >> shift < SINGLE
      ? setRec(shift, upper, value, root)
      : [root, setRec(shift, upper, value, '')]
  )
}

const clrLhsRec = (process.env.NODE_ENV === 'production'
  ? I.id
  : fn =>
      function clrLhsRec(s, i, n) {
        return I.freeze(fn(s, i, n))
      })((shift, i, node) => {
  const j = (i >> shift) & MASK
  const x = 0 !== shift ? clrLhsRec(shift - BITS, i, node[j]) : node[j]
  const r = []
  for (let k = 0; k < j; ++k) r[k] = null
  r[j] = x
  for (let k = j + 1, n = node.length; k < n; ++k) r[k] = node[k]
  return r
})

const clrRhsRec = (process.env.NODE_ENV === 'production'
  ? I.id
  : fn =>
      function clrRhsRec(s, i, n) {
        return I.freeze(fn(s, i, n))
      })((shift, i, node) => {
  const j = (i >> shift) & MASK
  const x = 0 !== shift ? clrRhsRec(shift - BITS, i, node[j]) : node[j]
  const r = []
  for (let k = 0; k < j; ++k) r[k] = node[k]
  r[j] = x
  return r
})

function slice(from, to, trie) {
  if (to <= from) return empty
  if (from === 0 && length(trie) === to) return trie
  let lower = trie.l + from
  let upper = lower + to - from
  let root = trie.r
  let shift = shiftOf(trie.u)
  while (
    0 !== shift &&
    ((lower >> shift) & MASK) === (((upper - 1) >> shift) & MASK)
  ) {
    const offset = lower & (MASK << shift)
    root = root[(lower >> shift) & MASK]
    lower -= offset
    upper -= offset
    shift -= BITS
  }
  if (trie.u !== upper) root = clrRhsRec(shift, upper - 1, root)
  if (trie.l !== lower) root = clrLhsRec(shift, lower, root)
  return construct(lower, upper, root)
}

const drop = (n, trie) => slice(n, length(trie), trie)
const take = (n, trie) => slice(0, n, trie)

export {append, drop, empty, length, nth, of, slice, take}
