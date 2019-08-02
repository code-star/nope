import { keys } from './Objects'
import { Validated } from './validation'
import { object } from './Object'
import { positive, number, NOT_POSITIVE } from './Number'
import { string } from './String'

type ValidatedOfObject<E, O> = { [K in keyof O]: Validated<Element, O[K]> }

export class ValidationRule<P, E, A> {
  static compose<E1, E2, A, B, C>(left: ValidationRule<A, E1, B>, right: ValidationRule<B, E2, C>): ValidationRule<A, E1 | E2, C> {
    return new ValidationRule(
      (a: A): Validated<E1 | E2, C> => {
        return left.apply(a).flatMap(b => right.apply(b))
      }
    )
  }

  static sequence<C extends Array<ValidationRule<any, any, any>>>(...c: C): ValidationRule<ParameterOfTuple<C>, ErrorOfTuple<C>, ValueOfTuple<C>> {
    return createValidationRule((ps: ParameterOfTuple<C>) => {
      const acc: Array<Validated<ErrorOfTuple<C>, ValueOfTuple<C>>> = []
      ps.forEach((p, index) => {
        const validationRule = c[index]
        acc[index] = validationRule(p)
      })
      return null as any
    })
  }

  static all<P, E, A>(validationRule: ValidationRule<P, E, A>): ValidationRule<P[], E, A[]> {
    return createValidationRule((arr: P[]) => {
      const validateds = arr.map(validationRule)
      return null as any
    })
  }

  static combine<O extends { [k: string]: ValidationRule<any, any, any> }>(vo: O): ValidationRule<ParameterOfObject<O>, ErrorOfObject<O>, ValueOfObject<O>> {
    return createValidationRule((po: ParameterOfObject<O>) => {
      const acc: Partial<ValidatedOfObject<ErrorOfObject<O>, ValueOfObject<O>>> = {}
      keys(po).forEach(key => {
        const validationRule = vo[key]
        acc[key] = validationRule(po[key])
      })
      return null as any
    })
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
  ): ValidationRule<P, E | ErrorOfObject<O>, ValueOfObject<O>> {
    return null as any
  }

  public positive<P, E>(this: ValidationRule<P, E, number>): ValidationRule<P, E | typeof NOT_POSITIVE, number> {
    return this.composeWith(positive())
  }
}

export function createValidationRule<P, E, A>(fn: (p: P) => Validated<E, A>): ValidationRule<P, E, A> {
  return null as any
}

type ParameterOf<V> = V extends ValidationRule<infer P, any, any> ? P : never
type ParameterOfObject<O> = { [K in keyof O]: ParameterOf<O[K]> }
type ParameterOfTuple<O> = { [K in keyof O]: ParameterOf<O[K]> }
type ErrorOf<V> = V extends ValidationRule<any, infer E, any> ? E : never
export type ErrorOfObject<O> = ({ [K in keyof O]: ErrorOf<O[K]> })[keyof O]
type ErrorOfTuple<O> = ({ [K in keyof O]: ErrorOf<O[K]> }) extends Array<infer E> ? E : never
type ValueOf<V> = V extends ValidationRule<any, any, infer A> ? A : never
export type ValueOfObject<O> = { [K in keyof O]: ValueOf<O[K]> }
type ValueOfTuple<O> = { [K in keyof O]: ValueOf<O[K]> }

const x = object()
  .shape({
    n: number().positive(),
    s: string()
  })
  .apply(4)
