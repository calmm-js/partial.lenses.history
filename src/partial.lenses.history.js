import * as I from './ext/infestines'
import * as V from './ext/partial.lenses.validation'

import * as H from './core'

const C =
  process.env.NODE_ENV === 'production'
    ? x => x
    : (x, c) => {
        const v = V.validate(c, x)
        return I.isFunction(x) ? I.arityN(x.length, v) : v
      }

const trie = V.props({l: V.integer, u: V.integer, r: V.array})

const history = V.props({
  i: V.integer,
  t: trie,
  v: trie,
  c: V.props({p: V.integer, e: V.boolean, m: V.integer})
})

const lens = (outer, inner) =>
  V.fn([outer, V.any, V.any, V.fn([inner, V.any], V.any)], V.any)

// Creating

export const init = C(
  H.init,
  V.fn(
    [
      V.optional(
        V.props({
          maxCount: V.optional(V.integer),
          pushEquals: V.optional(V.boolean),
          replacePeriod: V.optional(V.integer)
        })
      ),
      V.any
    ],
    history
  )
)

// Present

export const present = C(H.present, lens(history, V.any))
export const presentReplace = C(H.presentReplace, lens(history, V.any))

// Undo

export const undoIndex = C(H.undoIndex, lens(history, V.integer))
export const undoForget = C(H.undoForget, V.fn([history], history))

// Redo

export const redoIndex = C(H.redoIndex, lens(history, V.integer))
export const redoForget = C(H.redoForget, V.fn([history], history))

// Time travel

export const count = C(H.count, V.fn([history], V.integer))
export const index = C(H.index, lens(history, V.integer))
export const indexMax = C(H.indexMax, V.fn([history], V.integer))
