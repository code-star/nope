import { Validated } from '../Validated'
import { positive, NOT_POSITIVE } from '../Number'
import { many } from '../Array'

describe('ArrayValidationRule', () => {
  describe('many', () => {
    it('should return a valid array if all values are valid', () => {
      const validationRule = many(positive())
      const toVerify: Validated<Partial<Array<typeof NOT_POSITIVE>>, number[]> = validationRule.apply([1, 2, 3])
      const expected: Validated<Partial<Array<typeof NOT_POSITIVE>>, number[]> = Validated.ok([1, 2, 3])
      expect(toVerify).toEqual(expected)
    })

    it('should return a partial array with errors if some values are invalid', () => {
      const validationRule = many(positive())
      const toVerify: Validated<Partial<Array<typeof NOT_POSITIVE>>, number[]> = validationRule.apply([-1, 2, -3])
      const expected: Validated<Partial<Array<typeof NOT_POSITIVE>>, number[]> = Validated.error([NOT_POSITIVE, undefined, NOT_POSITIVE])
      expect(toVerify).toEqual(expected)
    })

    it('should return a complete array with errors if all values are invalid', () => {
      const validationRule = many(positive())
      const toVerify: Validated<Partial<Array<typeof NOT_POSITIVE>>, number[]> = validationRule.apply([-1, -2, -3])
      const expected: Validated<Partial<Array<typeof NOT_POSITIVE>>, number[]> = Validated.error([NOT_POSITIVE, NOT_POSITIVE, NOT_POSITIVE])
      expect(toVerify).toEqual(expected)
    })
  })
})
