export const nth = (i, vs) => vs[i]
export const append = (v, vs) => vs.concat([v])
export const slice = (from, to, vs) =>
  from === 0 && length(vs) === to ? vs : vs.slice(from, to)
export const drop = (n, vs) => slice(n, length(vs), vs)
export const length = vs => vs.length
export const take = (n, vs) => slice(0, n, vs)
export const of = v => [v]
