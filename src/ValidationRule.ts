import { keys } from './Objects'
import { Validated, CombinedValidated, ValueOfValidated, ErrorOfValidated } from './Validated'
import { Arrays } from './Arrays'
import { Undefineds, IsUndefined } from './Undefineds'
import { Predicate } from './Predicate'

export class ValidationRule<P, E, A, M extends any[] = []> {
  static compose<E, F, A, B, C, M extends any[]>(left: ValidationRule<A, E, B, M>, right: ValidationRule<B, F, C, M>): ValidationRule<A, E | F, C, M> {
    return new ValidationRule(
      (a: A, ...meta: M): Validated<E | F, C> => {
        return left.apply(a, ...meta).flatMap<F, C>((b: B): Validated<F, C> => right.apply(b, ...meta))
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

  static create<P, E, A>(apply: (p: P) => Validated<E, A>): ValidationRule<P, E, A, []>
  static create<P, E, A, M extends any[]>(apply: (p: P, ...meta: M) => Validated<E, A>): ValidationRule<P, E, A, M>
  static create<P, E, A, M extends any[]>(apply: (p: P, ...meta: M) => Validated<E, A>): ValidationRule<P, E, A, M> {
    return new ValidationRule(apply)
  }

  constructor(public readonly apply: (p: P, ...meta: M) => Validated<E, A>) {}

  public map<B>(fn: (a: A) => B): ValidationRule<P, E, B, M> {
    return new ValidationRule<P, E, B, M>((p, ...meta) => this.apply(p, ...meta).map(fn))
  }

  public mapError<F>(fn: (e: E) => F): ValidationRule<P, F, A, M> {
    return new ValidationRule<P, F, A, M>((p, ...meta) => this.apply(p, ...meta).mapError(fn))
  }

  public composeWith<F, C>(other: ValidationRule<A, F, C, M>): ValidationRule<P, E | F, C, M> {
    return ValidationRule.compose(
      this,
      other
    )
  }

  public filter<F>(pred: (a: A) => boolean, toError: (error: A) => F): ValidationRule<P, E | F, A, M> {
    return new ValidationRule<P, E | F, A, M>((p, ...meta) => this.apply(p, ...meta).filter(pred, toError))
  }

  public recover<B>(f: (error: E) => B): ValidationRule<P, never, A | B, M> {
    return new ValidationRule<P, never, A | B, M>((p, ...meta) => this.apply(p, ...meta).recover(f))
  }

  public orElse<Q, F, B>(alternative: ValidationRule<P, F, B, M>): ValidationRule<P & Q, F, A | B, M> {
    return new ValidationRule<P & Q, F, A | B, M>((p, ...meta) => this.apply(p, ...meta).orElse(alternative.apply(p, ...meta)))
  }

  public lmap<MM extends any[]>(fn: (mm: MM) => M): ValidationRule<P, E, A, MM> {
    return new ValidationRule<P, E, A, MM>((p, ...mm) => this.apply(p, ...fn(mm)))
  }

  public upcastMeta<MM extends M>(): ValidationRule<P, E, A, MM> {
    return new ValidationRule<P, E, A, MM>((p, ...meta) => this.apply(p, ...meta))
  }

  public required(): ValidationRule<P | undefined, E | IsUndefined, A, M> {
    return Undefineds.notUndefined<P>()
      .lmap<M>(() => [])
      .composeWith(this)
  }

  public optional(): ValidationRule<P | undefined, E, A | undefined, M> {
    return Undefineds.optional(this)
  }

  public many(): ValidationRule<P[], Partial<E[]>, A[], M> {
    return Arrays.many(this)
  }

  public of<F, B, C>(this: ValidationRule<P, E, B[]>, validationRule: ValidationRule<B, F, C>): ValidationRule<P, E | Partial<F[]>, C[]> {
    return this.composeWith(Arrays.many(validationRule))
  }

  public test<F>(...predicates: Array<Predicate<A, F>>): ValidationRule<P, E | F[], A, M> {
    return ValidationRule.create<P, E | F[], A, M>((p, ...meta: M) => {
      return this.apply(p, ...meta).test(...predicates)
    })
  }
}

type ParameterOfValidationRule<V> = V extends ValidationRule<infer P, any, any> ? P : never
type ParameterOfCombinedValidationRule<O> = { [K in keyof O]: ParameterOfValidationRule<O[K]> }
type ErrorOfValidationRule<V> = V extends ValidationRule<any, infer E, any> ? E : never
type ValueOfValidationRule<V> = V extends ValidationRule<any, any, infer A> ? A : never
type ValidatedOfCombinedValidationRule<O> = { [K in keyof O]: Validated<ErrorOfValidationRule<O[K]>, ValueOfValidationRule<O[K]>> }
