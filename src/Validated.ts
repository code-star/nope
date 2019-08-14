import { keys } from './Objects'

const ValidTypeTag = 'valid'
const InvalidTypeTag = 'invalid'

export type ErrorOfValidated<V> = V extends Invalid<infer E> ? E : never
type ErrorOfCombinedValidated<O> = Partial<{ [K in keyof O]: ErrorOfValidated<O[K]> }>
export type ValueOfValidated<V> = V extends Valid<infer A> ? A : never
type ValueOfCombinedValidated<O> = { [K in keyof O]: ValueOfValidated<O[K]> }

type CombineObject = {
  [k: string]: Validated<any, any>
}
type CombinedValidated<O> = Validated<ErrorOfCombinedValidated<O>, ValueOfCombinedValidated<O>>

export abstract class Validated<E, A> {
  // constructor(readonly value: Validated<E, A>) {}

  map<B>(f: (a: A) => B): Validated<E, B> {
    return this.fold<Validated<E, B>>(v => Validated.ok(f(v)), Validated.error)
  }

  mapError<F>(f: (error: E) => F): Validated<F, A> {
    return this.fold<Validated<F, A>>(Validated.ok, errors => Validated.error(f(errors)))
  }

  flatMap<EE, B>(f: (a: A) => Validated<EE, B>): Validated<E | EE, B> {
    return this.fold<Validated<E | EE, B>>(f, Validated.error)
  }

  filter(pred: (a: A) => boolean, toError: (error: A) => E): Validated<E, A> {
    return this.fold(a => (pred(a) ? Validated.ok(a) : Validated.error(toError(a))), Validated.error)
  }

  recover(f: (error: E) => Valid<A>): Valid<A> {
    return this.fold<Valid<A>>(Validated.ok, f)
  }

  abstract isValid(): this is Valid<A>

  isInvalid(): this is Invalid<E> {
    return !this.isValid()
  }

  abstract fold<B>(ok: (a: A) => B, error: (error: E) => B): B

  static ok<A>(value: A): Valid<A> {
    return new Valid(value)
  }
  static error<E>(error: E): Invalid<E> {
    return new Invalid(error)
  }

  static sequence<E, A>(validateds: Array<Validated<E, A>>): Validated<Partial<Array<E>>, A[]> {
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
  }

  static combine<O extends CombineObject>(o: O): CombinedValidated<O> {
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

class Valid<A> extends Validated<never, A> {
  static readonly type = ValidTypeTag

  constructor(readonly value: A) {
    super()
  }

  fold<B>(ok: (a: A) => B, _error: (error: never) => B): B {
    return ok(this.value)
  }

  isValid(): this is Valid<A> {
    return true
  }
}

class Invalid<E> extends Validated<E, never> {
  static readonly type = InvalidTypeTag

  constructor(readonly error: E) {
    super()
  }

  fold<B>(_ok: (a: never) => B, error: (error: E) => B): B {
    return error(this.error)
  }

  isValid(): this is Valid<never> {
    return false
  }
}
