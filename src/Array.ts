import { ValidationRule } from './ValidationRule'
import { Validated } from './Validated'

export function array<A>(): ValidationRule<A[], never, A[]> {
  return ValidationRule.create(Validated.ok)
}

export function many<P, E, A>(validationRule: ValidationRule<P, E, A>): ValidationRule<P[], Partial<E[]>, A[]> {
  return ValidationRule.create<P[], Partial<E[]>, A[]>((ps: P[]) => {
    const validatedAs: Array<Validated<E, A>> = ps.map(p => validationRule.apply(p))
    return Validated.sequence(validatedAs)
  })
}
