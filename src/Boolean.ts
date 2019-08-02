import { ValidationRule } from './ValidationRule'
import { Validated } from './validation'

export const NOT_A_BOOLEAN: 'NOT_A_BOOLEAN' = 'NOT_A_BOOLEAN'

export function boolean(): ValidationRule<unknown, typeof NOT_A_BOOLEAN, boolean> {
  return new ValidationRule(
    (u: unknown): Validated<typeof NOT_A_BOOLEAN, boolean> => {
      if (typeof u === 'boolean') {
        return Validated.ok(u)
      } else {
        return Validated.errors([NOT_A_BOOLEAN])
      }
    }
  )
}
