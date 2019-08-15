import { keys } from './Objects'
import { Validated, CombinedValidated, ValueOfValidated, ErrorOfValidated } from './Validated'
import { positive, NOT_POSITIVE } from './Number'
import { EMPTY_STRING, notEmptyString } from './String'
import { notUndefined, IS_UNDEFINED } from './Generic'

export class ValidationRule<P, E, A> {
  static compose<E, F, A, B, C>(left: ValidationRule<A, E, B>, right: ValidationRule<B, F, C>): ValidationRule<A, E | F, C> {
    return new ValidationRule(
      (a: A): Validated<E | F, C> => {
        return left.apply(a).flatMap<F, C>((b: B): Validated<F, C> => right.apply(b))
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
    o: O
  ): ValidationRule<
    ParameterOfCombinedValidationRule<O>,
    ErrorOfValidated<CombinedValidated<ValidatedOfCombinedValidationRule<O>>>,
    ValueOfValidated<CombinedValidated<ValidatedOfCombinedValidationRule<O>>>
  > {
    return new ValidationRule(
      (p: ParameterOfCombinedValidationRule<O>): CombinedValidated<ValidatedOfCombinedValidationRule<O>> => {
        const acc: Partial<ValidatedOfCombinedValidationRule<O>> = {}
        keys(o).forEach(key => {
          const validationRule: ValidationRule<ParameterOfValidationRule<O[keyof O]>, ErrorOfValidationRule<O[keyof O]>, ValueOfValidationRule<O[keyof O]>> = o[key]
          const validated: Validated<ErrorOfValidationRule<O[keyof O]>, ValueOfValidationRule<O[keyof O]>> = validationRule.apply(p[key])
          acc[key] = validated
        })
        return Validated.combine(acc as ValidatedOfCombinedValidationRule<O>)
      }
    )
  }

  static create<P, E, A>(apply: (p: P) => Validated<E, A>): ValidationRule<P, E, A> {
    return new ValidationRule(apply)
  }

  constructor(public readonly apply: (p: P) => Validated<E, A>) {}

  public map<B>(fn: (a: A) => B): ValidationRule<P, E, B> {
    return new ValidationRule<P, E, B>(p => this.apply(p).map(fn))
  }

  public mapError<F>(fn: (e: E) => F): ValidationRule<P, F, A> {
    return new ValidationRule<P, F, A>(p => this.apply(p).mapError(fn))
  }

  public composeWith<F, C>(other: ValidationRule<A, F, C>): ValidationRule<P, E | F, C> {
    return ValidationRule.compose(
      this,
      other
    )
  }

  public filter<F>(pred: (a: A) => boolean, toError: (error: A) => F): ValidationRule<P, E | F, A> {
    return new ValidationRule<P, E | F, A>(p => this.apply(p).filter(pred, toError))
  }

  public recover<B>(f: (error: E) => B): ValidationRule<P, never, A | B> {
    return new ValidationRule<P, never, A | B>(p => this.apply(p).recover(f))
  }

  public positive<P, E>(this: ValidationRule<P, E, number>): ValidationRule<P, E | typeof NOT_POSITIVE, number> {
    return this.composeWith(positive())
  }

  public notEmptyString<P, E>(this: ValidationRule<P, E, string>): ValidationRule<P, E | typeof EMPTY_STRING, string> {
    return this.composeWith(notEmptyString())
  }

  public required(): ValidationRule<P | undefined, E | typeof IS_UNDEFINED, A> {
    return notUndefined<P>().composeWith(this)
  }
}

type ParameterOfValidationRule<V> = V extends ValidationRule<infer P, any, any> ? P : never
type ParameterOfCombinedValidationRule<O> = { [K in keyof O]: ParameterOfValidationRule<O[K]> }
type ErrorOfValidationRule<V> = V extends ValidationRule<any, infer E, any> ? E : never
type ValueOfValidationRule<V> = V extends ValidationRule<any, any, infer A> ? A : never
type ValidatedOfCombinedValidationRule<O> = { [K in keyof O]: Validated<ErrorOfValidationRule<O[K]>, ValueOfValidationRule<O[K]>> }
