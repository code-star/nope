import { ValidationRule } from './ValidationRule'
import { Validated } from './Validated'

export function boolean(): ValidationRule<boolean, never, boolean> {
  return new ValidationRule(Validated.ok)
}
