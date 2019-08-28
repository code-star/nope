import { Numbers, NotANumber, NOT_A_NUMBER, NotPositive, NOT_POSITIVE } from '../Numbers'
import { Validated } from '../Validated'

describe('Numbers', () => {
  describe('fromNumber', () => {
    it('should return the number that it was given', () => {
      const toVerify: Validated<never, number> = Numbers.fromNumber().apply(-5)
      const expected: Validated<never, number> = Validated.ok(-5)
      expect(toVerify).toEqual(expected)
    })
  })

  describe('fromUnknown', () => {
    it('should return the number that it was given if it is a number', () => {
      const toVerify: Validated<NotANumber, number> = Numbers.fromUnknown().apply(-5)
      const expected: Validated<NotANumber, number> = Validated.ok(-5)
      expect(toVerify).toEqual(expected)
    })

    it('should raise an error that the value is not a number', () => {
      const toVerify: Validated<NotANumber, number> = Numbers.fromUnknown().apply('Carrot')
      const expected: Validated<NotANumber, number> = Validated.error({ type: NOT_A_NUMBER, value: 'Carrot' })
      expect(toVerify).toEqual(expected)
    })
  })

  describe('positive', () => {
    it('should return the value if it is positive', () => {
      const toVerify: Validated<NotPositive, number> = Numbers.positive().apply(4)
      const expected: Validated<NotPositive, number> = Validated.ok(4)
      expect(toVerify).toEqual(expected)
    })

    it('should raise an error if the value is negative', () => {
      const toVerify: Validated<NotPositive, number> = Numbers.positive().apply(-4)
      const expected: Validated<NotPositive, number> = Validated.error({ type: NOT_POSITIVE, value: -4 })
      expect(toVerify).toEqual(expected)
    })
  })
})
