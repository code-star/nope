import { ValidationRule } from './ValidationRule'
import { Validated } from './Validated'

export const Arrays = {
  fromArray<A>(): ValidationRule<A[], never, A[]> {
    return ValidationRule.create<A[], never, A[]>(Validated.ok)
  },

  many<P, E, A, M extends any[]>(validationRule: ValidationRule<P, E, A, M>): ValidationRule<P[], Partial<E[]>, A[], M> {
    return ValidationRule.create<P[], Partial<E[]>, A[], M>((ps: P[], ...meta: M) => {
      const validatedAs: Array<Validated<E, A>> = ps.map(p => validationRule.apply(p, ...meta))
      return Validated.sequence(validatedAs)
    })
  }
}
