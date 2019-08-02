import { Validated } from './validation'
import { createValidationRule, ValidationRule } from './ValidationRule'

export const NOT_AN_OBJECT: 'NOT_AN_OBJECT' = 'NOT_AN_OBJECT'

export function object(): ValidationRule<unknown, typeof NOT_AN_OBJECT, object> {
  return createValidationRule(
    (u: unknown): Validated<typeof NOT_AN_OBJECT, object> => {
      if (typeof u === 'object' && u !== null) {
        return Validated.ok(u)
      } else {
        return Validated.errors([NOT_AN_OBJECT])
      }
    }
  )
}