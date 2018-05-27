import * as V from 'partial.lenses.validation'

export * from 'partial.lenses.validation'

export const fn = (args, res) => V.freeFn(V.args.apply(null, args), res)

export {accept as any} from 'partial.lenses.validation'

export const integer = x => Number.isInteger(x)

export {isBoolean as boolean} from './infestines'
export {isArray as array} from 'infestines'
