import { Validated } from '../Validated'

describe('Validated', () => {
  describe('map', () => {
    function stringLength(s: string): number {
      return s.length
    }

    it('should apply the function when it is valid', () => {
      const valid: Validated<string, string> = Validated.ok('Cool')
      const toVerify: Validated<string, number> = valid.map(stringLength)
      const expected: Validated<string, number> = Validated.ok(4)
      expect(toVerify).toEqual(expected)
    })

    it('should not apply the function when it is not valid', () => {
      const valid: Validated<string, string> = Validated.error('Nah')
      const toVerify: Validated<string, number> = valid.map(stringLength)
      const expected: Validated<string, number> = Validated.error('Nah')
      expect(toVerify).toEqual(expected)
    })
  })

  describe('mapError', () => {
    function stringLength(s: string): number {
      return s.length
    }

    it('should not apply the function when it is valid', () => {
      const valid: Validated<string, string> = Validated.ok('Cool')
      const toVerify: Validated<number, string> = valid.mapError(stringLength)
      const expected: Validated<number, string> = Validated.ok('Cool')
      expect(toVerify).toEqual(expected)
    })

    it('should apply the function when it is not valid', () => {
      const valid: Validated<string, string> = Validated.error('Nah')
      const toVerify: Validated<number, string> = valid.mapError(stringLength)
      const expected: Validated<number, string> = Validated.error(3)
      expect(toVerify).toEqual(expected)
    })
  })
})
