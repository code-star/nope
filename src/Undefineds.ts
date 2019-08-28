import { ValidationRule } from './ValidationRule'
import { Validated } from './Validated'

export const IS_UNDEFINED: 'IS_UNDEFINED' = 'IS_UNDEFINED'
export type IsUndefined = Readonly<{ type: 'IS_UNDEFINED' }>

export const Undefineds = {
  notUndefined<P>(): ValidationRule<P | undefined, IsUndefined, P> {
    return ValidationRule.create(p => (p === undefined ? Validated.error({ type: IS_UNDEFINED }) : Validated.ok(p)))
  },

  optional<P, E, A, M extends any[]>(validationRule: ValidationRule<P, E, A, M>): ValidationRule<P | undefined, E, A | undefined, M> {
    return ValidationRule.create<P | undefined, E, A | undefined, M>((p, ...meta) => {
      if (p === undefined) {
        return Validated.ok(undefined)
      } else {
        return validationRule.apply(p, ...meta)
      }
    })
  }
}
