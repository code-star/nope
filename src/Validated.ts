import { keys } from './Objects'
import { identity, always } from './util'
import { Predicate } from './Predicate'

const ValidTypeTag = 'valid'
const InvalidTypeTag = 'invalid'

export type ErrorOfValidated<V> = V extends Invalid<infer E, any> ? E : never
type ErrorOfCombinedValidated<O> = Partial<{ [K in keyof O]: ErrorOfValidated<O[K]> }>
export type ValueOfValidated<V> = V extends Valid<any, infer A> ? A : never
type ValueOfCombinedValidated<O> = { [K in keyof O]: ValueOfValidated<O[K]> }

type ObjectToCombine = {
  [k: string]: Validated<any, any>
}
export type CombinedValidated<O> = Validated<ErrorOfCombinedValidated<O>, ValueOfCombinedValidated<O>>

export type Validated<E, A = []> = Invalid<E, A> | Valid<E, A>

export abstract class AbstractValidated<E, A = []> {
  map<B>(f: (a: A) => B): Validated<E, B> {
    return this.fold<Validated<E, B>>(v => Validated.ok(f(v)), Validated.error)
  }

  mapError<F>(f: (error: E) => F): Validated<F, A> {
    return this.fold<Validated<F, A>>(Validated.ok, errors => Validated.error(f(errors)))
  }

  flatMap<F, B>(f: (a: A) => Validated<F, B>): Validated<E | F, B> {
    return this.fold<Validated<E | F, B>>(f, Validated.error)
  }

  filter<F>(pred: (a: A) => boolean, toError: (error: A) => F): Validated<E | F, A> {
    return this.fold<Validated<F | E, A>>(a => (pred(a) ? Validated.ok(a) : Validated.error(toError(a))), Validated.error)
  }

  test<F>(...predicates: Array<Predicate<A, F>>): Validated<E | F[], A> {
    return this.fold<Validated<E | F[], A>>((a: A): Validated<E | F[], A> => {
      const errors: F[] = []
      predicates.forEach(predicate => {
        const validated = predicate(a)
        if (validated.isInvalid()) {
          errors.push(validated.error)
        }
      })

      if (errors.length > 0) {
        return Validated.error(errors)
      } else {
        return Validated.ok(a)
      }
    }, Validated.error)
  }

  recover<B>(f: (error: E) => B): Validated<never, A | B> {
    return Validated.ok(this.fold<A | B>(identity, f))
  }

  orElse<F, B>(alternative: Validated<F, B>): Validated<F, A | B> {
    return this.fold<Validated<F, A | B>>(Validated.ok, always(alternative))
  }

  abstract isValid(): this is Valid<E, A>

  isInvalid(): this is Invalid<E, A> {
    return !this.isValid()
  }

  abstract fold<B>(ok: (a: A) => B, error: (error: E) => B): B
}

// Defined separately, to be able to create an overloaded function:
function ok(): Valid<never, []>
function ok<A>(value: A): Valid<never, A>
function ok<A>(value?: A): Valid<never, A | undefined> {
  return new Valid(value)
}

export const Validated = {
  ok,

  error<E>(error: E): Invalid<E, never> {
    return new Invalid(error)
  },

  sequence<E, A>(validateds: Array<Validated<E, A>>): Validated<Partial<Array<E>>, A[]> {
    let hasErrors = false
    const errors: Partial<Array<E>> = []
    const values: A[] = []
    validateds.forEach(validated => {
      if (validated.isValid()) {
        values.push(validated.value)
        errors.push(undefined)
      } else if (validated.isInvalid()) {
        errors.push(validated.error)
        hasErrors = true
      }
    })

    if (hasErrors) {
      return Validated.error(errors)
    } else {
      return Validated.ok(values)
    }
  },

  combine<O extends ObjectToCombine>(o: O): CombinedValidated<O> {
    let hasErrors = false
    const errors: ErrorOfCombinedValidated<O> = {}
    const values: Partial<ValueOfCombinedValidated<O>> = {}
    keys(o).forEach(key => {
      const validated: Validated<ErrorOfValidated<O[keyof O]>, ValueOfValidated<O[keyof O]>> = o[key]
      if (validated.isValid()) {
        values[key] = validated.value
      } else if (validated.isInvalid()) {
        errors[key] = validated.error
        hasErrors = true
      }
    })

    if (hasErrors) {
      return Validated.error(errors)
    } else {
      return Validated.ok(values as ValueOfCombinedValidated<O>)
    }
  }
}

export class Valid<E, A> extends AbstractValidated<E, A> {
  static readonly type = ValidTypeTag

  constructor(readonly value: A) {
    super()
  }

  fold<B>(ok: (a: A) => B, _error: (error: never) => B): B {
    return ok(this.value)
  }

  isValid(): this is Valid<E, A> {
    return true
  }
}

export class Invalid<E, A> extends AbstractValidated<E, A> {
  static readonly type = InvalidTypeTag

  constructor(readonly error: E) {
    super()
  }

  fold<B>(_ok: (a: A) => B, error: (error: E) => B): B {
    return error(this.error)
  }

  isValid(): this is Valid<E, A> {
    return false
  }
}
