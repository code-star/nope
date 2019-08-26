import { ValidationRule } from './ValidationRule'
import { Validated } from './Validated'

export function number(): ValidationRule<number, never, number> {
  return new ValidationRule<number, never, number>(Validated.ok)
}

export const NOT_POSITIVE: 'NOT_POSITIVE' = 'NOT_POSITIVE'

export function positive(): ValidationRule<number, typeof NOT_POSITIVE, number> {
  return new ValidationRule(
    (n: number): Validated<typeof NOT_POSITIVE, number> => {
      if (n >= 0) {
        return Validated.ok(n)
      } else {
        return Validated.error(NOT_POSITIVE)
      }
    }
  )
}
