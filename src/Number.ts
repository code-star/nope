import { ValidationRule, createValidationRule } from './ValidationRule'
import { Validated } from './validation'

export const NOT_A_NUMBER: 'NOT_A_NUMBER' = 'NOT_A_NUMBER'

export function number(): ValidationRule<unknown, typeof NOT_A_NUMBER, number> {
  return createValidationRule(
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

export function positive<P, E>(this: ValidationRule<P, E, number>): ValidationRule<P, E | typeof NOT_POSITIVE, number> {
  return ValidationRule.compose(
    this,
    positive2()
  )
}

export function positive2(): ValidationRule<number, typeof NOT_POSITIVE, number> {
  return createValidationRule(
    (n: number): Validated<typeof NOT_POSITIVE, number> => {
      if (n >= 0) {
        return Validated.ok(n)
      } else {
        return Validated.errors([NOT_POSITIVE])
      }
    })
  )
}

