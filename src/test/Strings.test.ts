import { Strings, NotAString, NOT_A_STRING, EmptyString, EMPTY_STRING } from '../Strings'
import { Validated } from '../Validated'

describe('Strings', () => {
  describe('fromString', () => {
    it('should return the string that it was given', () => {
      const toVerify: Validated<never, string> = Strings.fromString().apply('Carrot')
      const expected: Validated<never, string> = Validated.ok('Carrot')
      expect(toVerify).toEqual(expected)
    })
  })

  describe('fromUnknown', () => {
    it('should return the string that it was given if it is a string', () => {
      const toVerify: Validated<NotAString, string> = Strings.fromUnknown().apply('Carrot')
      const expected: Validated<NotAString, string> = Validated.ok('Carrot')
      expect(toVerify).toEqual(expected)
    })

    it('should raise an error that the value is not a string', () => {
      const toVerify: Validated<NotAString, string> = Strings.fromUnknown().apply(45)
      const expected: Validated<NotAString, string> = Validated.error({ type: NOT_A_STRING, value: 45 })
      expect(toVerify).toEqual(expected)
    })
  })

  describe('notEmpty', () => {
    it('should return the value if it is not empty', () => {
      const toVerify: Validated<EmptyString, string> = Strings.notEmpty().apply('Carrot')
      const expected: Validated<EmptyString, string> = Validated.ok('Carrot')
      expect(toVerify).toEqual(expected)
    })

    it('should raise an error if the value is empty', () => {
      const toVerify: Validated<EmptyString, string> = Strings.notEmpty().apply('')
      const expected: Validated<EmptyString, string> = Validated.error({ type: EMPTY_STRING })
      expect(toVerify).toEqual(expected)
    })
  })
})
