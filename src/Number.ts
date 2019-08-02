import { ValidationRule } from './ValidationRule'
import { Validated } from './validation'

export const NOT_A_NUMBER: 'NOT_A_NUMBER' = 'NOT_A_NUMBER'

export function number(): ValidationRule<unknown, typeof NOT_A_NUMBER, number> {
  return new ValidationRule(
    (u: unknown): Validated<typeof NOT_A_NUMBER, number> => {
      if (typeof u === 'number') {
        return Validated.ok(u)
      } else {
        return Validated.errors([NOT_A_NUMBER])
      }
    }
  )
}

export const NOT_POSITIVE: 'NOT_POSITIVE' = 'NOT_POSITIVE'

export function positive(): ValidationRule<number, typeof NOT_POSITIVE, number> {
  return new ValidationRule(
    (n: number): Validated<typeof NOT_POSITIVE, number> => {
      if (n >= 0) {
        return Validated.ok(n)
      } else {
        return Validated.errors([NOT_POSITIVE])
      }
    }
  )
}
