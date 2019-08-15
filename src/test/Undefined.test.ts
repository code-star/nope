import { IS_UNDEFINED, notUndefined, optional } from '../Undefined'
import { Validated } from '../Validated'
import { str } from '../String'
import { positive, NOT_POSITIVE } from '../Number'

describe('Undefined', () => {
  describe('notUndefined', () => {
    it('should be valid when the value is not undefined', () => {
      const toVerify: Validated<typeof IS_UNDEFINED, number> = notUndefined<number>().apply(4)
      const expected: Validated<typeof IS_UNDEFINED, number> = Validated.ok(4)
      expect(toVerify).toEqual(expected)
    })

    it('should be invalid when the value is undefined', () => {
      const toVerify: Validated<typeof IS_UNDEFINED, number> = notUndefined<number>().apply(undefined)
      const expected: Validated<typeof IS_UNDEFINED, number> = Validated.error(IS_UNDEFINED)
      expect(toVerify).toEqual(expected)
    })
  })

  describe('optional', () => {
    it('should be valid when the value is not undefined and valid', () => {
      const toVerify: Validated<typeof NOT_POSITIVE, number | undefined> = optional(positive()).apply(4)
      const expected: Validated<typeof NOT_POSITIVE, number | undefined> = Validated.ok(4)
      expect(toVerify).toEqual(expected)
    })

    it('should be invalid when the value is not undefined and not valid', () => {
      const toVerify: Validated<typeof NOT_POSITIVE, number | undefined> = optional(positive()).apply(-4)
      const expected: Validated<typeof NOT_POSITIVE, number | undefined> = Validated.error(NOT_POSITIVE)
      expect(toVerify).toEqual(expected)
    })

    it('should be valid when the value is undefined', () => {
      const toVerify: Validated<typeof NOT_POSITIVE, number | undefined> = optional(positive()).apply(undefined)
      const expected: Validated<typeof NOT_POSITIVE, number | undefined> = Validated.ok(undefined)
      expect(toVerify).toEqual(expected)
    })
  })
})
