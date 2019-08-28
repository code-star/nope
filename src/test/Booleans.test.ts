import { Booleans, NotABoolean, NOT_A_BOOLEAN } from '../Booleans'
import { Validated } from '../Validated'

describe('Booleans', () => {
  describe('fromBoolean', () => {
    it('should return the boolean that it was given', () => {
      const toVerify: Validated<never, boolean> = Booleans.fromBoolean().apply(true)
      const expected: Validated<never, boolean> = Validated.ok(true)
      expect(toVerify).toEqual(expected)
    })
  })

  describe('fromUnknown', () => {
    it('should return the boolean that it was given if it is a boolean', () => {
      const toVerify: Validated<NotABoolean, boolean> = Booleans.fromUnknown().apply(false)
      const expected: Validated<NotABoolean, boolean> = Validated.ok(false)
      expect(toVerify).toEqual(expected)
    })

    it('should raise an error that the value is not a boolean', () => {
      const toVerify: Validated<NotABoolean, boolean> = Booleans.fromUnknown().apply('Carrot')
      const expected: Validated<NotABoolean, boolean> = Validated.error({ type: NOT_A_BOOLEAN, value: 'Carrot' })
      expect(toVerify).toEqual(expected)
    })
  })
})
