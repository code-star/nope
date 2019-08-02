import { ValidationRule } from './ValidationRule'
import { Validated } from './validation'

export const NOT_A_STRING: 'NOT_A_STRING' = 'NOT_A_STRING'

export function string(): ValidationRule<unknown, typeof NOT_A_STRING, string> {
  return new ValidationRule(
    (u: unknown): Validated<typeof NOT_A_STRING, string> => {
      if (typeof u === 'string') {
        return Validated.ok(u)
      } else {
        return Validated.errors([NOT_A_STRING])
      }
    }
  )
}
