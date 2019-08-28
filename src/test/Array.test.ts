import { Validated } from '../Validated'
import { Numbers, NOT_POSITIVE, NotPositive } from '../Numbers'
import { many } from '../Array'

describe('ArrayValidationRule', () => {
  describe('many', () => {
    it('should return a valid array if all values are valid', () => {
      const validationRule = many(Numbers.positive())
      const toVerify: Validated<Partial<Array<NotPositive>>, number[]> = validationRule.apply([1, 2, 3])
      const expected: Validated<Partial<Array<NotPositive>>, number[]> = Validated.ok([1, 2, 3])
      expect(toVerify).toEqual(expected)
    })

    it('should return a partial array with errors if some values are invalid', () => {
      const validationRule = many(Numbers.positive())
      const toVerify: Validated<Partial<Array<NotPositive>>, number[]> = validationRule.apply([-1, 2, -3])
      const expected: Validated<Partial<Array<NotPositive>>, number[]> = Validated.error([{ type: NOT_POSITIVE, value: -1 }, undefined, { type: NOT_POSITIVE, value: -3 }])
      expect(toVerify).toEqual(expected)
    })

    it('should return a complete array with errors if all values are invalid', () => {
      const validationRule = many(Numbers.positive())
      const toVerify: Validated<Partial<Array<NotPositive>>, number[]> = validationRule.apply([-1, -2, -3])
      const expected: Validated<Partial<Array<NotPositive>>, number[]> = Validated.error([
        { type: NOT_POSITIVE, value: -1 },
        { type: NOT_POSITIVE, value: -2 },
        { type: NOT_POSITIVE, value: -3 }
      ])
      expect(toVerify).toEqual(expected)
    })
  })
})
