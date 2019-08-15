import { ValidationRule } from './ValidationRule'
import { Validated } from './Validated'

export const IS_UNDEFINED: 'IS_UNDEFINED' = 'IS_UNDEFINED'

export function notUndefined<P>(): ValidationRule<P | undefined, typeof IS_UNDEFINED, P> {
  return ValidationRule.create(p => (p === undefined ? Validated.error(IS_UNDEFINED) : Validated.ok(p)))
}

export function optional<P, E, A>(validationRule: ValidationRule<P, E, A>): ValidationRule<P | undefined, E, A | undefined> {
  return ValidationRule.create<P | undefined, E, A | undefined>(p => {
    if (p === undefined) {
      return Validated.ok(undefined)
    } else {
      return validationRule.apply(p)
    }
  })
}
