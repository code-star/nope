import { keys } from './Objects'

const ValidTypeTag = 'valid'
const InvalidTypeTag = 'invalid'

type ErrorOf<V> = V extends Invalid<infer E> ? E : never
type ErrorOfObject<O> = ({ [K in keyof O]: ErrorOf<O[K]> })[keyof O]
// type ErrorOfTuple<O> = ({ [K in keyof O]: ErrorOf<O[K]> }) extends Array<infer E> ? E : never
type ValueOf<V> = V extends Valid<infer A> ? A : never
type ValueOfObject<O> = { [K in keyof O]: ValueOf<O[K]> }
// type ValueOfTuple<O> = { [K in keyof O]: ValueOf<O[K]> }

type CombineObject = {
  [k: string]: Validated<any, any>
}
type CombineValidated<O> = Validated<ErrorOfObject<O>, ValueOfObject<O>>

export abstract class Validated<E, A> {
  // constructor(readonly value: Validated<E, A>) {}

  map<B>(f: (a: A) => B): Validated<E, B> {
    return this.fold<Validated<E, B>>(v => Validated.ok(f(v)), Validated.errors)
  }

  mapError<F>(f: (error: E) => F): Validated<F, A> {
    return this.fold<Validated<F, A>>(Validated.ok, errors => Validated.errors(errors.map(f)))
  }

  flatMap<EE, B>(f: (a: A) => Validated<EE, B>): Validated<E | EE, B> {
    return this.fold<Validated<E | EE, B>>(f, Validated.errors)
  }

  filter(pred: (a: A) => boolean, toError: (error: A) => E): Validated<E, A> {
    return this.fold(a => (pred(a) ? Validated.ok(a) : Validated.errors([toError(a)])), Validated.errors)
  }

  recover(f: (errors: E[]) => Valid<A>): Valid<A> {
    return this.fold<Valid<A>>(Validated.ok, f)
  }

  abstract isValid(): this is Valid<A>

  isInvalid(): this is Invalid<E> {
    return !this.isValid
  }

  abstract fold<B>(ok: (a: A) => B, error: (errors: E[]) => B): B

  static ok<A>(value: A): Valid<A> {
    return new Valid(value)
  }
  static errors<E>(errors: E[]): Invalid<E> {
    return new Invalid(errors)
  }

  static combine<O extends CombineObject>(o: O): CombineValidated<O> {
    const errors: any[] = []
    const values: { [K in keyof O]?: any } = {}
    keys(o).forEach(key => {
      const validated: Validated<any, any> = o[key]
      if (validated.isValid()) {
        values[key] = validated.value
      } else if (validated.isInvalid()) {
        validated.errors.forEach((e: any) => {
          errors.push(e)
        })
      }
    })

    if (errors.length > 0) {
      return Validated.errors(errors)
    } else {
      return Validated.ok(values as any)
    }
  }
}

class Valid<A> extends Validated<never, A> {
  static readonly type = ValidTypeTag

  constructor(readonly value: A) {
    super()
  }

  fold<B>(ok: (a: A) => B, _error: (errors: never[]) => B): B {
    return ok(this.value)
  }

  isValid(): this is Valid<A> {
    return true
  }
}

class Invalid<E> extends Validated<E, never> {
  static readonly type = InvalidTypeTag

  constructor(readonly errors: E[]) {
    super()
  }

  fold<B>(_ok: (a: never) => B, error: (errors: E[]) => B): B {
    return error(this.errors)
  }

  isValid(): this is Valid<never> {
    return false
  }
}
