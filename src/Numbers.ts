import { ValidationRule } from './ValidationRule'
import { Validated } from './Validated'

export const NOT_POSITIVE: 'NOT_POSITIVE' = 'NOT_POSITIVE'
export type NotPositive = Readonly<{ type: 'NOT_POSITIVE'; value: number }>

export const NOT_A_NUMBER: 'NOT_A_NUMBER' = 'NOT_A_NUMBER'
export type NotANumber = Readonly<{ type: 'NOT_A_NUMBER'; value: unknown }>

export const Numbers = {
  fromNumber(): ValidationRule<number, never, number> {
    return new ValidationRule<number, never, number>(Validated.ok)
  },

  fromUnknown(): ValidationRule<unknown, NotANumber, number> {
    return new ValidationRule<unknown, NotANumber, number>(p => {
      if (typeof p === 'number') {
        return Validated.ok(p)
      } else {
        return Validated.error({ type: NOT_A_NUMBER, value: p })
      }
    })
  },

  positive(): ValidationRule<number, NotPositive, number> {
    return new ValidationRule(
      (n: number): Validated<NotPositive, number> => {
        if (n >= 0) {
          return Validated.ok(n)
        } else {
          return Validated.error({ type: NOT_POSITIVE, value: n })
        }
      }
    )
  }
}
