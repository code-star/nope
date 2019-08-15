import { object, NOT_AN_OBJECT } from '../Object'
import { number, NOT_POSITIVE } from '../Number'
import { string, NOT_A_STRING } from '../String'
import { boolean, NOT_A_BOOLEAN } from '../Boolean'
import { ValidationRule } from '../ValidationRule'
import { Validated } from '../Validated'

describe('ValidationRule', () => {
  describe('map', () => {
    function stringLength(s: string): number {
      return s.length
    }

    it('should apply the function when the value is valid', () => {
      const alwaysValid: ValidationRule<string, string, string> = ValidationRule.create(s => Validated.ok(s))
      const toVerify: Validated<string, number> = alwaysValid.map(stringLength).apply('Cool')
      const expected: Validated<string, number> = Validated.ok(4)
      expect(toVerify).toEqual(expected)
    })

    it('should return the original error when the value is not valid', () => {
      const alwaysInvalid: ValidationRule<string, string, string> = ValidationRule.create(s => Validated.error(s))
      const toVerify: Validated<string, number> = alwaysInvalid.map(stringLength).apply('Nah')
      const expected: Validated<string, number> = Validated.error('Nah')
      expect(toVerify).toEqual(expected)
    })
  })

  describe('mapError', () => {
    function stringLength(s: string): number {
      return s.length
    }

    it('should not apply the function when the value is valid', () => {
      const alwaysValid: ValidationRule<string, string, string> = ValidationRule.create(s => Validated.ok(s))
      const toVerify: Validated<number, string> = alwaysValid.mapError(stringLength).apply('Cool')
      const expected: Validated<number, string> = Validated.ok('Cool')
      expect(toVerify).toEqual(expected)
    })

    it('should apply the function when the value is not valid', () => {
      const alwaysInvalid: ValidationRule<string, string, string> = ValidationRule.create(s => Validated.error(s))
      const toVerify: Validated<number, string> = alwaysInvalid.mapError(stringLength).apply('Nah')
      const expected: Validated<number, string> = Validated.error(3)
      expect(toVerify).toEqual(expected)
    })
  })

  describe('shape', () => {
    const validator = object().shape({
      n: number().positive(),
      s: string(),
      b: boolean()
    })

    it('should know when an object is valid', () => {
      const validObject = {
        n: 4,
        s: 'Henk',
        b: true
      }

      const expected = {
        n: 4,
        s: 'Henk',
        b: true
      }

      const validated = validator.apply(validObject)
      if (validated.isValid()) {
        expect(validated.value).toEqual(expected)
      } else {
        fail()
      }
    })

    it('should know when an object is not valid', () => {
      const invalidObject = {
        n: -1,
        s: true
      }

      const expected = {
        n: NOT_POSITIVE,
        s: NOT_A_STRING,
        b: NOT_A_BOOLEAN
      }

      const validated = validator.apply(invalidObject)
      if (validated.isInvalid()) {
        expect(validated.error).toEqual(expected)
      } else {
        fail()
      }
    })

    it('should know when the input is not an object', () => {
      const invalidObject = 35

      const expected = NOT_AN_OBJECT

      const validated = validator.apply(invalidObject)
      if (validated.isInvalid()) {
        expect(validated.error).toEqual(expected)
      } else {
        fail()
      }
    })
  })
})
