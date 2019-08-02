import { keys } from './Objects'
import { Validated } from './validation'
import { positive, NOT_POSITIVE } from './Number'

export class ValidationRule<P, E, A> {
  static compose<E1, E2, A, B, C>(left: ValidationRule<A, E1, B>, right: ValidationRule<B, E2, C>): ValidationRule<A, E1 | E2, C> {
    return new ValidationRule(
      (a: A): Validated<E1 | E2, C> => {
        return left.apply(a).flatMap(b => right.apply(b))
      }
    )
  }

  // static sequence<C extends Array<ValidationRule<any, any, any>>>(
  //   ...c: C
  // ): ValidationRule<ParameterOfValidationRuleTuple<C>, ErrorOfValidationRuleTuple<C>, ValueOfValidationRuleTuple<C>> {
  //   return createValidationRule((ps: ParameterOfValidationRuleTuple<C>) => {
  //     const acc: Array<Validated<ErrorOfValidationRuleTuple<C>, ValueOfValidationRuleTuple<C>>> = []
  //     ps.forEach((p, index) => {
  //       const validationRule = c[index]
  //       acc[index] = validationRule(p)
  //     })
  //     return null as any
  //   })
  // }

  // static all<P, E, A>(validationRule: ValidationRule<P, E, A>): ValidationRule<P[], E, A[]> {
  //   return createValidationRule((arr: P[]) => {
  //     const validateds = arr.map(validationRule)
  //     return null as any
  //   })
  // }

  static combine<O extends { [k: string]: ValidationRule<any, any, any> }>(
    vo: O
  ): ValidationRule<ParameterOfValidationRuleObject<O>, ErrorOfValidationRuleObject<O>, ValueOfValidationRuleObject<O>> {
    return new ValidationRule(
      (po: ParameterOfValidationRuleObject<O>): Validated<ErrorOfValidationRuleObject<O>, ValueOfValidationRuleObject<O>> => {
        const acc: Partial<Record<keyof O, Validated<any, any>>> = {}
        keys(vo).forEach(key => {
          const validationRule = vo[key]
          acc[key] = validationRule.apply(po[key])
        })
        return Validated.combine(acc as any) as any
      }
    )
  }

  constructor(public readonly apply: (p: P) => Validated<E, A>) {}

  public composeWith<EE, C>(other: ValidationRule<A, EE, C>): ValidationRule<P, E | EE, C> {
    return ValidationRule.compose(
      this,
      other
    )
  }

  public shape<P, E, O extends { [k: string]: ValidationRule<unknown, any, any> }>(
    this: ValidationRule<P, E, object>,
    o: O
  ): ValidationRule<P, E | ErrorOfValidationRuleObject<O>, ValueOfValidationRuleObject<O>> {
    return ValidationRule.compose(
      this,
      ValidationRule.combine(o) as any
    )
  }

  public positive<P, E>(this: ValidationRule<P, E, number>): ValidationRule<P, E | typeof NOT_POSITIVE, number> {
    return this.composeWith(positive())
  }
}

type ParameterOfValidationRule<V> = V extends ValidationRule<infer P, any, any> ? P : never
type ParameterOfValidationRuleObject<O> = { [K in keyof O]: ParameterOfValidationRule<O[K]> }
// type ParameterOfValidationRuleTuple<O> = { [K in keyof O]: ParameterOfValidationRule<O[K]> }
type ErrorOfValidationRule<V> = V extends ValidationRule<any, infer E, any> ? E : never
export type ErrorOfValidationRuleObject<O> = ({ [K in keyof O]: ErrorOfValidationRule<O[K]> })[keyof O]
// type ErrorOfValidationRuleTuple<O> = ({ [K in keyof O]: ErrorOfValidationRule<O[K]> }) extends Array<infer E> ? E : never
type ValueOfValidationRule<V> = V extends ValidationRule<any, any, infer A> ? A : never
export type ValueOfValidationRuleObject<O> = { [K in keyof O]: ValueOfValidationRule<O[K]> }
// type ValueOfValidationRuleTuple<O> = { [K in keyof O]: ValueOfValidationRule<O[K]> }
