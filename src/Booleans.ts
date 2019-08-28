import { ValidationRule } from './ValidationRule'
import { Validated } from './Validated'

export const NOT_A_BOOLEAN: 'NOT_A_BOOLEAN' = 'NOT_A_BOOLEAN'
export type NotABoolean = Readonly<{ type: 'NOT_A_BOOLEAN'; value: unknown }>

export const Booleans = {
  fromBoolean(): ValidationRule<boolean, never, boolean> {
    return new ValidationRule<boolean, never, boolean>(Validated.ok)
  },

  fromUnknown(): ValidationRule<unknown, NotABoolean, boolean> {
    return new ValidationRule<unknown, NotABoolean, boolean>(p => {
      if (typeof p === 'boolean') {
        return Validated.ok(p)
      } else {
        return Validated.error({ type: NOT_A_BOOLEAN, value: p })
      }
    })
  }
}
