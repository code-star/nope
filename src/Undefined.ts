import { ValidationRule } from './ValidationRule'
import { Validated } from './Validated'

export function undefined(): ValidationRule<undefined, never, undefined> {
  return ValidationRule.create(Validated.ok)
}
