import { ValidationRule, ValueOfObject, createValidationRule, ErrorOfObject } from './ValidationRule'
import { Validated } from './validation'
import { positive, positive2, number } from './Number'

export const NOT_AN_OBJECT: 'NOT_AN_OBJECT' = 'NOT_AN_OBJECT'

export function object(): ValidationRule<unknown, typeof NOT_AN_OBJECT, object> {
  return createValidationRule(
    (u: unknown): Validated<typeof NOT_AN_OBJECT, object> => {
      if (typeof u === 'object' && u !== null) {
        return Validated.ok(u)
      } else {
        return Validated.errors([NOT_AN_OBJECT])
      }
    }
  )
}

export function shape<P, E, O extends { [k: string]: ValidationRule<unknown, any, any> }>(
  this: ValidationRule<P, E, object>,
  o: O
): ValidationRule<P, E | ErrorOfObject<O>, ValueOfObject<O>> {
  return null as any
}

const x = object().shape({
  obj: object(),
  num: positive2(),
  alsoNum: ValidationRule.compose(
    number(),
    positive2()
  )
})(4)

if (x.isValid()) {
  x.value.obj
}
