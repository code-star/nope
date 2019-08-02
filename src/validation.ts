import {ValidationRule} from "./ValidationRule";
import {keys} from "./Objects"


const ValidTypeTag = "valid"
const InvalidTypeTag = "invalid"
type ValidationTypeTag = typeof ValidTypeTag | typeof InvalidTypeTag

interface Valid<A>{
  type: typeof ValidTypeTag
  value: A
}

interface Invalid<E>{
  type: typeof InvalidTypeTag
  errors: E[]
}



type Validated<E, A> = Valid<A> | Invalid<E>


// interface ValidatedOps {
//   map<E, A, B>(v: Validated<E, A> , f: (a: A) => B): Validated<E, B>
//   fold<E, A, B>(v: Validated<E, A>, ok: (a: A) => B, error: (errors: E) => B): B
// }

type ErrorOf<V> = V extends Validated<infer E, any> ? E : never
type ErrorOfObject<O> = ({ [K in keyof O]: ErrorOf<O[K]> })[keyof O]
// type ErrorOfTuple<O> = ({ [K in keyof O]: ErrorOf<O[K]> }) extends Array<infer E> ? E : never
type ValueOf<V> = V extends Validated<any, infer A> ? A : never
type ValueOfObject<O> = { [K in keyof O]: ValueOf<O[K]> }
// type ValueOfTuple<O> = { [K in keyof O]: ValueOf<O[K]> }



function identity<T>(t: T): T { return t; }

class ValidatedOps<E, A> {
  constructor(readonly value: Validated<E, A>) {}

  map<B>(f: (a: A) => B): Validated<E, B> {
    return this.fold<Validated<E,B>>(v => Validated.ok(f(v)), Validated.errors)
  }

  flatMap<B>(f: (a: A) => Validated<E, B>): Validated<E,B> {
    return this.fold(f, Validated.errors)
  }


  fold<B>(ok: (a: A) => B, error: (errors: E[]) => B): B {
    switch(this.value.type) {
      case ValidTypeTag:
        return ok(this.value.value)
      case InvalidTypeTag:
        return error(this.value.errors)
    }
  }
}



const Validated = {
  ok<A>(value: A): Valid<A>  {
    return { type: ValidTypeTag, value }
  },
  errors<E>(errors: E[]): Invalid<E> { return {type: InvalidTypeTag, errors: errors}},

  combine<O extends { [k: string]: Validated<any, any>}>(o: O): Validated<ErrorOfObject<O>, ValueOfObject<O>> {
    const errors: any[] = []
    const values: { [K in keyof O]?: any } = {}
    keys(o).forEach(key => {
      const validated: Validated<any, any> = o[key]
      if (validated.type === ValidTypeTag) {
        values[key] = validated.value
      } else if (validated.type === InvalidTypeTag) {
        validated.errors.forEach((e: any) => {
          errors.push(e)
        })
      } else {
        const exhaustive: never = validated
        throw exhaustive
      }
    })

    if (errors.length > 0) {
      return Validated.errors(errors)
    } else {
      return Validated.ok(values as any)
    }
  }
}

declare const v1: Validated<boolean, number>
declare const v2: Validated<string, Date>

const result = Validated.combine({
  k1: v1,
  k2: v2
})

if(result.type === "valid") {
  result.value.
}












abstract class AbstractValidated<E,A> {
  abstract map<B>(f: (a: A) => B): Validated<E, B>

  abstract flatMap<B>(f: (a: A) => Validated<E, B>): Validated<E, B>

  abstract isValid(): this is Valid<A>
}




// class Valid<A> extends AbstractValidated<never, A> {
//
//   constructor(readonly value: A) {
//     super()
//   }
//
//   map<B>(fn: (a: A) => B): Validated<never, B> {
//     return new Valid<B>(fn(this.value))
//   }
//
//   flatMap<E, B>(fn: (a: A) => Validated<E, B>): Validated<E, B> {
//     return fn(this.value)
//   }
//
//   isValid(): this is Valid<A> {
//     return true;
//   }
//
//
//
//   mapError<F>(fn: (e: E) => F): Validated<F, A> {
//     return new Valid<F, A>(this.value)
//   }
//
//   fold<B>(ok: (v: Valid<E, A>) => B, error: (v: Invalid<E, A>) => B): B {
//     return ok(this)
//   }
//
//   andThen<B>(fn: (a: A) => Validated<E, A>): Validated<E, A> {
//     return fn(this.value)
//   }
//
//   withValueOf<B>(that: Validated<E, B>): Validated<E, B> {
//     return that
//   }
//
//   fromEither<A>(this: Validated<A, A[]>): A[] {
//     return Validated.fromEither(this)
//   }
// }


// class Invalid<E> extends AbstractValidated<E, never> {
//   constructor(readonly errors: E[]) {
//     super()
//   }
//
//   isValid(): this is Valid<never> {
//     return false
//   }
//
//   map<B>(_: (a: never) => B): Validated<E, B> {
//     return this
//   }
//
//   flatMap<B>(_: (a: never) => Validated<E, B>): Validated<E, B> {
//     return this
//   }
//
//   mapError<F>(fn: (e: E) => F): Validated<F, A> {
//     return new Invalid<F, A>(this.errors.map(fn))
//   }
//
//   fold<B>(ok: (v: Valid<E, A>) => B, error: (v: Invalid<E, A>) => B): B {
//     return error(this)
//   }
//
//   andThen<B>(fn: (a: A) => Validated<E, B>): Validated<E, B> {
//     return Validated.errors(this.errors)
//   }
//
//   withValueOf<B>(that: Validated<E, B>): Validated<E, B> {
//     return that.isValid()
//       ? Validated.errors(this.errors)
//       : Validated.errors([...this.errors, ...that.errors])
//   }
//
//   fromEither<A>(this: Validated<A, A[]>): A[] {
//     return Validated.fromEither(this)
//   }
// }








// type ValidatedOf<E, O> = { [K in keyof O]: Validated<E, O[K]> }
//
// const Validated = {
//
//   ok<E, A>(a: A): Valid<E, A> {
//     return new Valid<E, A>(a)
//   },
//
//   error<E, A>(error: E): Invalid<E, A> {
//     return new Invalid<E, A>([error])
//   },
//
//   errors<E, A>(errors: E[]): Invalid<E, A> {
//     return new Invalid<E, A>(errors)
//   },
//
//   notUndefined<E, A>(value: A | undefined, error: E): Validated<E, A> {
//     if (value === undefined) {
//       return Validated.error(error)
//     } else {
//       return Validated.ok(value)
//     }
//   },
//
//   fromEither<A>(validated: Validated<A, A[]>): A[] {
//     return validated.fold(
//       v => v.value,
//       v => v.errors
//     )
//   },
//
//   seq<E, A>(vs: Validated<E, A>[]): Validated<E, A[]> {
//     const errors: E[] = []
//     const values: A[] = []
//     vs.forEach(v => {
//       if (v.type === Valid.type) {
//         values.push(v.value)
//       } else {
//         errors.push(...v.errors)
//       }
//     })
//
//     if (errors.length === 0) {
//       return Validated.ok(values)
//     } else {
//       return Validated.errors(errors)
//     }
//   },
//
//   combine<O extends { [k: string]: Validated<any, any> }>(o: O): Validated<ErrorOfValidated<O[keyof O]>, { [K in keyof O]: ValueOfValidated<O[K]> }> {
//
//     const errors: any[] = []
//     const values: { [K in keyof O]?: any } = {}
//     Object.keys(o).forEach(key => {
//       const validated = o[key]
//       if (validated.type === Valid.type) {
//         values[key] = validated.value
//       } else if (validated.type === Invalid.type) {
//         validated.errors.forEach((e: any) => {
//           errors.push(e)
//         })
//       } else {
//         const exhaustive: never = validated
//         throw exhaustive
//       }
//     })
//
//     if (errors.length > 0) {
//       return new Invalid(errors)
//     } else {
//       return new Valid(values as any)
//     }
//   },
//
//   /**
//    * Split an array of `Validated<E, T>` into errors (`E[]`) and values (`T[]`).
//    */
//   splitArray<E, T>(validateds: Array<Validated<E, T>>): { invalid: E[], valid: T[] } {
//     const invalid: E[] = []
//     const valid: T[] = []
//     validateds.forEach(validated => {
//       if (validated.type === Valid.type) {
//         valid.push(validated.value)
//       } else if (validated.type === Invalid.type) {
//         invalid.push(...validated.errors)
//       } else {
//         const exhaustive: never = validated
//         throw exhaustive
//       }
//     })
//
//     return {valid, invalid}
//   },
//
//   withDefault<O, Default>(validatedOf: ValidatedOf<any, O>, d: Default): WithDefault<O, Default> {
//     const result: Partial<WithDefault<O, Default>> = {}
//     const keys = Object.keys(validatedOf) as Array<keyof O>
//     keys.forEach((key: keyof O) => {
//       const validated: Validated<any, O[keyof O]> = validatedOf[key]
//       if (validated.type === Valid.type) {
//         result[key] = validated.value
//       } else if (validated.type === Invalid.type) {
//         result[key] = d
//       } else {
//         const exhaustive: never = validated
//         throw exhaustive
//       }
//     })
//
//     return result as WithDefault<O, Default>
//   },
//
//   splitObject<E, O>(validatedOf: ValidatedOf<E, O>): { invalid: E[], valid: Partial<O> } {
//     const invalid: E[] = []
//     const valid: Partial<O> = {}
//     const keys = Object.keys(validatedOf) as Array<keyof O>
//     keys.forEach((key: keyof O) => {
//       const validated: Validated<E, O[keyof O]> = validatedOf[key]
//       if (validated.type === Valid.type) {
//         valid[key] = validated.value
//       } else if (validated.type === Invalid.type) {
//         invalid.push(...validated.errors)
//       } else {
//         const exhaustive: never = validated
//         throw exhaustive
//       }
//     })
//
//     return {valid, invalid}
//   },
//
//   compose<E, T>(...rules: Array<(t: T) => Validated<E, T>>): (t: T) => Validated<E, T> {
//     return (t: T): Validated<E, T> => {
//       const applied = rules.map(rule => rule(t))
//       const split = Validated.splitArray(applied)
//       if (split.invalid.length === 0) {
//         return Validated.ok(t)
//       } else {
//         return Validated.errors(split.invalid)
//       }
//     }
//   }
// }

