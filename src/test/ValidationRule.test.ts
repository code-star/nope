import { object, NOT_AN_OBJECT } from '../Object'
import { number, NOT_POSITIVE } from '../Number'
import { string, NOT_A_STRING } from '../String'
import { boolean, NOT_A_BOOLEAN } from '../Boolean'

describe('ValidationRule', () => {
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

      const expected = [NOT_POSITIVE, NOT_A_STRING, NOT_A_BOOLEAN]

      const validated = validator.apply(invalidObject)
      if (validated.isInvalid()) {
        expect(validated.errors).toEqual(expect.arrayContaining(expected))
      } else {
        fail()
      }
    })

    it('should know when the input is not an object', () => {
      const invalidObject = 35

      const expected = [NOT_AN_OBJECT]

      const validated = validator.apply(invalidObject)
      if (validated.isInvalid()) {
        expect(validated.errors).toEqual(expect.arrayContaining(expected))
      } else {
        fail()
      }
    })
  })
})
