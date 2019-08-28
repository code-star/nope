import { IS_UNDEFINED, Undefineds, IsUndefined } from '../Undefineds'
import { Validated } from '../Validated'
import { Numbers, NOT_POSITIVE, NotPositive } from '../Numbers'

describe('Undefined', () => {
  describe('notUndefined', () => {
    it('should be valid when the value is not undefined', () => {
      const toVerify: Validated<IsUndefined, number> = Undefineds.notUndefined<number>().apply(4)
      const expected: Validated<IsUndefined, number> = Validated.ok(4)
      expect(toVerify).toEqual(expected)
    })

    it('should be invalid when the value is undefined', () => {
      const toVerify: Validated<IsUndefined, number> = Undefineds.notUndefined<number>().apply(undefined)
      const expected: Validated<IsUndefined, number> = Validated.error({ type: IS_UNDEFINED })
      expect(toVerify).toEqual(expected)
    })
  })

  describe('optional', () => {
    it('should be valid when the value is not undefined and valid', () => {
      const toVerify: Validated<NotPositive, number | undefined> = Undefineds.optional(Numbers.positive()).apply(4)
      const expected: Validated<NotPositive, number | undefined> = Validated.ok(4)
      expect(toVerify).toEqual(expected)
    })

    it('should be invalid when the value is not undefined and not valid', () => {
      const toVerify: Validated<NotPositive, number | undefined> = Undefineds.optional(Numbers.positive()).apply(-4)
      const expected: Validated<NotPositive, number | undefined> = Validated.error({ type: NOT_POSITIVE, value: -4 })
      expect(toVerify).toEqual(expected)
    })

    it('should be valid when the value is undefined', () => {
      const toVerify: Validated<NotPositive, number | undefined> = Undefineds.optional(Numbers.positive()).apply(undefined)
      const expected: Validated<NotPositive, number | undefined> = Validated.ok(undefined)
      expect(toVerify).toEqual(expected)
    })
  })
})
