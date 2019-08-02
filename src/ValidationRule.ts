import { keys } from './Objects'
import { Validated } from './validation'
import { shape } from './Object'

type ValidatedOfObject<E, O> = { [K in keyof O]: Validated<Element, O[K]> }

export type ValidationRule<P, E, A> = {
  (p: P): Validated<E, A>
  required(): ValidationRule<P, E, Exclude<A, null>>
  positive(this: ValidationRule<P, E, number>): ValidationRule<P, E, number>
  shape: typeof shape
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

export const ValidationRule = {
  compose<E1, E2, A, B, C>(left: (a: A) => Validated<E1, B>, right: (b: B) => Validated<E2, C>): ValidationRule<A, E1 | E2, C> {
    return createValidationRule(
      (a: A): Validated<E1 | E2, C> => {
        return left(a).flatMap(right)
      }
    )
  },
  sequence<C extends Array<ValidationRule<any, any, any>>>(...c: C): ValidationRule<ParameterOfTuple<C>, ErrorOfTuple<C>, ValueOfTuple<C>> {
    return createValidationRule((ps: ParameterOfTuple<C>) => {
      const acc: Array<Validated<ErrorOfTuple<C>, ValueOfTuple<C>>> = []
      ps.forEach((p, index) => {
        const validationRule = c[index]
        acc[index] = validationRule(p)
      })
      return null as any
    })
  },
  all<P, E, A>(validationRule: ValidationRule<P, E, A>): ValidationRule<P[], E, A[]> {
    return createValidationRule((arr: P[]) => {
      const validateds = arr.map(validationRule)
      return null as any
    })
  },
  combine<O extends { [k: string]: ValidationRule<any, any, any> }>(vo: O): ValidationRule<ParameterOfObject<O>, ErrorOfObject<O>, ValueOfObject<O>> {
    return createValidationRule((po: ParameterOfObject<O>) => {
      const acc: Partial<ValidatedOfObject<ErrorOfObject<O>, ValueOfObject<O>>> = {}
      keys(po).forEach(key => {
        const validationRule = vo[key]
        acc[key] = validationRule(po[key])
      })
      return null as any
    })
  }
}

export function number<E>(): ValidationRule<any, E, number | null> {
  return null as any
}

export function string<E>(): ValidationRule<any, E, string | null> {
  return null as any
}

number()
  .required()
  .positive()
string().positive()

declare const v1: ValidationRule<string, boolean, number>
declare const v2: ValidationRule<number, string, boolean>
const vs: Array<ValidationRule<number, string, boolean>> = []
const z = ValidationRule.sequence(...vs)
const zz = z([])
const x = ValidationRule.combine({
  k1: v1,
  k2: v2
})
const y = x({
  k1: '',
  k2: 4
})
