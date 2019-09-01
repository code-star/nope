import { Strings, NotAString, NOT_A_STRING, EmptyString, EMPTY_STRING, DoesNotContainFloat, DOES_NOT_CONTAIN_FLOAT } from '../Strings'
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

  describe('containsFloat', () => {
    it('should return a `number` if the `string` contains a float', () => {
      const toVerify: Validated<DoesNotContainFloat, number> = Strings.containsFloat().apply('123.456')
      const expected: Validated<DoesNotContainFloat, number> = Validated.ok(123.456)
      expect(toVerify).toEqual(expected)
    })

    it('should return an error if the `string` does not contain a float', () => {
      const toVerify: Validated<DoesNotContainFloat, number> = Strings.containsFloat().apply('Dog')
      const expected: Validated<DoesNotContainFloat, number> = Validated.error({ type: DOES_NOT_CONTAIN_FLOAT, value: 'Dog' })
      expect(toVerify).toEqual(expected)
    })
  })
})
