import { ValidationRule } from './ValidationRule'
import { Validated } from './Validated'

export const EMPTY_STRING: 'EMPTY_STRING' = 'EMPTY_STRING'
export type EmptyString = Readonly<{ type: 'EMPTY_STRING' }>

export const NOT_A_STRING: 'NOT_A_STRING' = 'NOT_A_STRING'
export type NotAString = Readonly<{ type: 'NOT_A_STRING'; value: unknown }>

export const Strings = {
  fromString(): ValidationRule<string, never, string> {
    return new ValidationRule<string, never, string>(Validated.ok)
  },

  fromUnknown(): ValidationRule<unknown, NotAString, string> {
    return new ValidationRule<unknown, NotAString, string>(p => {
      if (typeof p === 'string') {
        return Validated.ok(p)
      } else {
        return Validated.error({ type: NOT_A_STRING, value: p })
      }
    })
  },

  notEmpty(): ValidationRule<string, EmptyString, string> {
    return ValidationRule.create(s => (s.length === 0 ? Validated.error({ type: EMPTY_STRING }) : Validated.ok(s)))
  }
}
