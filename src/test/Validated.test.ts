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
      const invalid: Validated<string, string> = Validated.error('Nah')
      const toVerify: Validated<string, number> = invalid.map(stringLength)
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
      const invalid: Validated<string, string> = Validated.error('Nah')
      const toVerify: Validated<number, string> = invalid.mapError(stringLength)
      const expected: Validated<number, string> = Validated.error(3)
      expect(toVerify).toEqual(expected)
    })
  })

  describe('flatMap', () => {
    const NOT_A_NUMBER: 'NOT_A_NUMBER' = 'NOT_A_NUMBER'
    function isNumber(s: string): Validated<typeof NOT_A_NUMBER, number> {
      const n = parseInt(s, 10)
      if (isNaN(n)) {
        return Validated.error(NOT_A_NUMBER)
      } else {
        return Validated.ok(n)
      }
    }

    const OTHER_ERROR: 'OTHER_ERROR' = 'OTHER_ERROR'

    it('should return the outer error if the outer value is invalid', () => {
      const invalid: Validated<typeof OTHER_ERROR, string> = Validated.error(OTHER_ERROR)
      const toVerify: Validated<typeof OTHER_ERROR | typeof NOT_A_NUMBER, number> = invalid.flatMap(isNumber)
      const expected: Validated<typeof OTHER_ERROR | typeof NOT_A_NUMBER, number> = Validated.error(OTHER_ERROR)
      expect(toVerify).toEqual(expected)
    })

    it('should return the inner error if the outer value is valid but the inner is not', () => {
      const invalid: Validated<typeof OTHER_ERROR, string> = Validated.ok('NaN')
      const toVerify: Validated<typeof OTHER_ERROR | typeof NOT_A_NUMBER, number> = invalid.flatMap(isNumber)
      const expected: Validated<typeof OTHER_ERROR | typeof NOT_A_NUMBER, number> = Validated.error(NOT_A_NUMBER)
      expect(toVerify).toEqual(expected)
    })

    it('should return the inner value if both the outer value and the inner value are valid', () => {
      const invalid: Validated<typeof OTHER_ERROR, string> = Validated.ok('44')
      const toVerify: Validated<typeof OTHER_ERROR | typeof NOT_A_NUMBER, number> = invalid.flatMap(isNumber)
      const expected: Validated<typeof OTHER_ERROR | typeof NOT_A_NUMBER, number> = Validated.ok(44)
      expect(toVerify).toEqual(expected)
    })
  })

  describe('filter', () => {
    function isEven(n: number): boolean {
      return n % 2 === 0
    }

    const OTHER_ERROR: 'OTHER_ERROR' = 'OTHER_ERROR'
    const NOT_EVEN: 'NOT_EVEN' = 'NOT_EVEN'

    it('should return the original value if the original value is valid if the predicate returns true', () => {
      const valid: Validated<typeof OTHER_ERROR, number> = Validated.ok(2)
      const toVerify: Validated<typeof OTHER_ERROR | typeof NOT_EVEN, number> = valid.filter(isEven, (): typeof NOT_EVEN => NOT_EVEN)
      const expected: Validated<typeof OTHER_ERROR | typeof NOT_EVEN, number> = Validated.ok(2)
      expect(toVerify).toEqual(expected)
    })

    it('should return the original error if the original value is invalid', () => {
      const valid: Validated<typeof OTHER_ERROR, number> = Validated.error(OTHER_ERROR)
      const toVerify: Validated<typeof OTHER_ERROR | typeof NOT_EVEN, number> = valid.filter(isEven, (): typeof NOT_EVEN => NOT_EVEN)
      const expected: Validated<typeof OTHER_ERROR | typeof NOT_EVEN, number> = Validated.error(OTHER_ERROR)
      expect(toVerify).toEqual(expected)
    })

    it('should return the newly supplied error if the original value is valid but the predicate returns false', () => {
      const valid: Validated<typeof OTHER_ERROR, number> = Validated.ok(3)
      const toVerify: Validated<typeof OTHER_ERROR | typeof NOT_EVEN, number> = valid.filter(isEven, (): typeof NOT_EVEN => NOT_EVEN)
      const expected: Validated<typeof OTHER_ERROR | typeof NOT_EVEN, number> = Validated.error(NOT_EVEN)
      expect(toVerify).toEqual(expected)
    })
  })
})
