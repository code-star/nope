import { ValidationRule } from './ValidationRule'
import { Validated } from './Validated'

export const IS_UNDEFINED: 'IS_UNDEFINED' = 'IS_UNDEFINED'

export function notUndefined<P>(): ValidationRule<P | undefined, typeof IS_UNDEFINED, P> {
  return ValidationRule.create(p => (p === undefined ? Validated.error(IS_UNDEFINED) : Validated.ok(p)))
}
