import { ValidationRule } from './ValidationRule'
import { Validated } from './Validated'

export function str(): ValidationRule<string, never, string> {
  return new ValidationRule(Validated.ok)
}

export const EMPTY_STRING: 'EMPTY_STRING' = 'EMPTY_STRING'

export function notEmptyString(): ValidationRule<string, typeof EMPTY_STRING, string> {
  return ValidationRule.create(s => (s.length === 0 ? Validated.error(EMPTY_STRING) : Validated.ok(s)))
}
