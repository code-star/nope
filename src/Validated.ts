import { keys } from './Objects'

const ValidTypeTag = 'valid'
const InvalidTypeTag = 'invalid'

export type ErrorOfValidated<V> = V extends Invalid<infer E, any> ? E : never
type ErrorOfCombinedValidated<O> = Partial<{ [K in keyof O]: ErrorOfValidated<O[K]> }>
export type ValueOfValidated<V> = V extends Valid<any, infer A> ? A : never
type ValueOfCombinedValidated<O> = { [K in keyof O]: ValueOfValidated<O[K]> }

type ObjectToCombine = {
  [k: string]: Validated<any, any>
}
type CombinedValidated<O> = Validated<ErrorOfCombinedValidated<O>, ValueOfCombinedValidated<O>>

export type Validated<E, A> = Invalid<E, A> | Valid<E, A>

export const Validated = {
  ok<A>(value: A): Valid<never, A> {
    return new Valid(value)
  },
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
      } else {
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
      } else {
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

export abstract class AbstractValidated<E, A> {
  map<B>(f: (a: A) => B): Validated<E, B> {
    return this.fold<Validated<E, B>>(v => Validated.ok(f(v)), Validated.error)
  }

  mapError<F>(f: (error: E) => F): Validated<F, A> {
    return this.fold<Validated<F, A>>(Validated.ok, errors => Validated.error(f(errors)))
  }

  flatMap<EE, B>(f: (a: A) => Validated<EE, B>): Validated<E | EE, B> {
    return this.fold<Validated<E | EE, B>>(f, Validated.error)
  }

  filter<EE>(pred: (a: A) => boolean, toError: (error: A) => EE): Validated<E | EE, A> {
    return this.fold<Validated<EE | E, A>>(a => (pred(a) ? Validated.ok(a) : Validated.error(toError(a))), Validated.error)
  }

  recover<B>(f: (error: E) => Valid<never, B>): Valid<never, A | B> {
    return this.fold<Valid<never, A | B>>(Validated.ok, f)
  }

  abstract isValid(): this is Valid<E, A>

  isInvalid(): this is Invalid<E, A> {
    return !this.isValid()
  }

  abstract fold<B>(ok: (a: A) => B, error: (error: E) => B): B
}

export class Valid<E, A> extends AbstractValidated<E, A> {
  static readonly type = ValidTypeTag

  constructor(readonly value: A) {
    super()
  }

  fold<B>(ok: (a: A) => B, _error: (error: E) => B): B {
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

  fold<B>(_ok: (a: never) => B, error: (error: E) => B): B {
    return error(this.error)
  }

  isValid(): this is Valid<E, A> {
    return false
  }
}
