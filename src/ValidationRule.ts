type Validated<E, A> = Valid<A> | Invalid<E>

type Valid<A> = Readonly<{
  type: 'ok'
  value: A
}>

type Invalid<E> = Readonly<{
  type: 'nook'
  errors: E[]
}>

export type ValidationRule<P, E, A> = (p: P) => Validated<E, A>

type ParameterOf<V> = V extends ValidationRule<infer P, any, any> ? P : never
type ParameterOfObject<O> = { [K in keyof O]: ParameterOf<O[K]> }
type ErrorOf<V> = V extends ValidationRule<any, infer E, any> ? E : never
type ErrorOfObject<O> = ({ [K in keyof O]: ErrorOf<O[K]> })[keyof O]
type ValueOf<V> = V extends ValidationRule<any, any, infer A> ? A : never
type ValueOfObject<O> = { [K in keyof O]: ValueOf<O[K]> }

export const ValidationRule = {
  combine<O>(_o: O): ValidationRule<ParameterOfObject<O>, ErrorOfObject<O>, ValueOfObject<O>> {
    return null as any
  }
}

declare const v1: ValidationRule<string, boolean, number>
declare const v2: ValidationRule<number, string, boolean>
const x = ValidationRule.combine({
  k1: v1,
  k2: v2
})
const y = x({
  k1: 4,
  k2: 4
})
