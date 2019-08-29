import { keys } from './Objects'
import { Validated, CombinedValidated, ValueOfValidated, ErrorOfValidated } from './Validated'
import { Arrays } from './Arrays'
import { Undefineds, IsUndefined } from './Undefineds'

export class ValidationRule<P, E, A = P, M extends any[] = []> {
  static compose<E, F, A, B, C, M extends any[]>(left: ValidationRule<A, E, B, M>, right: ValidationRule<B, F, C, M>): ValidationRule<A, E | F, C, M> {
    return new ValidationRule(
      (a: A, ...meta: M): Validated<E | F, C> => {
        return left.apply(a, ...meta).flatMap<F, C>((b: B): Validated<F, C> => right.apply(b, ...meta))
      }
    )
  }

  static combine<O extends { [k: string]: ValidationRule<any, any, any, any> }>(
    o: O
  ): ValidationRule<
    ParameterOfCombinedValidationRule<O>,
    ErrorOfValidated<CombinedValidated<ValidatedOfCombinedValidationRule<O>>>,
    ValueOfValidated<CombinedValidated<ValidatedOfCombinedValidationRule<O>>>,
    MetaOfCombinedValidationRule<O>
  > {
    return new ValidationRule(
      (p: ParameterOfCombinedValidationRule<O>, ...meta: MetaOfCombinedValidationRule<O>): CombinedValidated<ValidatedOfCombinedValidationRule<O>> => {
        const acc: Partial<ValidatedOfCombinedValidationRule<O>> = {}
        keys(o).forEach(key => {
          const validationRule: ValidationRule<ParameterOfValidationRule<O[keyof O]>, ErrorOfValidationRule<O[keyof O]>, ValueOfValidationRule<O[keyof O]>, any[]> = o[key]
          const validated: Validated<ErrorOfValidationRule<O[keyof O]>, ValueOfValidationRule<O[keyof O]>> = validationRule.apply(p[key], ...meta)
          acc[key] = validated
        })
        return Validated.combine(acc as ValidatedOfCombinedValidationRule<O>)
      }
    )
  }

  static test<P, E, M extends any[] = []>(predicate: (p: P, ...meta: M) => Validated<E, []>): ValidationRule<P, E, P, M> {
    return new ValidationRule<P, E, P, M>((p, ...meta) => {
      return predicate(p, ...meta).map(() => p)
    })
  }

  static create<P, E, A = P, M extends any[] = []>(apply: (p: P, ...meta: M) => Validated<E, A>): ValidationRule<P, E, A, M> {
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

  public mapMeta<MM extends any[]>(fn: (mm: MM) => M): ValidationRule<P, E, A, MM> {
    return new ValidationRule<P, E, A, MM>((p, ...mm) => this.apply(p, ...fn(mm)))
  }

  public mapInput<Q>(fn: (q: Q) => P): ValidationRule<Q, E, A, M> {
    return new ValidationRule<Q, E, A, M>((q, ...m) => this.apply(fn(q), ...m))
  }

  public upcastMeta<MM extends M>(): ValidationRule<P, E, A, MM> {
    return new ValidationRule<P, E, A, MM>((p, ...meta) => this.apply(p, ...meta))
  }

  public required(): ValidationRule<P | undefined, E | IsUndefined, A, M> {
    return Undefineds.notUndefined<P>()
      .mapMeta<M>(() => [])
      .composeWith(this)
  }

  public optional(): ValidationRule<P | undefined, E, A | undefined, M> {
    return Undefineds.optional(this)
  }

  public many(): ValidationRule<P[], Partial<E[]>, A[], M> {
    return Arrays.many(this)
  }

  public of<F, B, C>(this: ValidationRule<P, E, B[], M>, validationRule: ValidationRule<B, F, C, M>): ValidationRule<P, E | Partial<F[]>, C[], M> {
    return this.composeWith(Arrays.many(validationRule))
  }

  public test<F>(...validationRules: Array<ValidationRule<A, F, A, M>>): ValidationRule<P, E | F[], A, M> {
    return ValidationRule.create<P, E | F[], A, M>(
      (p, ...meta: M): Validated<E | F[], A> => {
        const withMeta: Array<(a: A) => Validated<F, A>> = validationRules.map(validationRule => (a: A) => validationRule.apply(a, ...meta))
        return this.apply(p, ...meta).test<F>(...withMeta)
      }
    )
  }
}

// Taken from https://stackoverflow.com/questions/50374908/transform-union-type-to-intersection-type
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never

type ParameterOfValidationRule<V> = V extends ValidationRule<infer P, any, any, any> ? P : never
type ParameterOfCombinedValidationRule<O> = { [K in keyof O]: ParameterOfValidationRule<O[K]> }
type MetaOfValidationRule<V> = V extends ValidationRule<any, any, any, infer M> ? M : never
type MetaOfCombinedValidationRule<O> = UnionToIntersection<({ [K in keyof O]: MetaOfValidationRule<O[K]> })[keyof O]> & any[]
type ErrorOfValidationRule<V> = V extends ValidationRule<any, infer E, any, any> ? E : never
type ValueOfValidationRule<V> = V extends ValidationRule<any, any, infer A, any> ? A : never
type ValidatedOfCombinedValidationRule<O> = { [K in keyof O]: Validated<ErrorOfValidationRule<O[K]>, ValueOfValidationRule<O[K]>> }
