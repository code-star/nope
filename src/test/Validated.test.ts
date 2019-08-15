import { Validated, Valid } from '../Validated'

describe('Validated', () => {
  describe('map', () => {
    function stringLength(s: string): number {
      return s.length
    }

    it('should apply the function when the value is valid', () => {
      const valid: Validated<string, string> = Validated.ok('Cool')
      const toVerify: Validated<string, number> = valid.map(stringLength)
      const expected: Validated<string, number> = Validated.ok(4)
      expect(toVerify).toEqual(expected)
    })

    it('should return the original error when the value is not valid', () => {
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

    it('should not apply the function when the value is valid', () => {
      const valid: Validated<string, string> = Validated.ok('Cool')
      const toVerify: Validated<number, string> = valid.mapError(stringLength)
      const expected: Validated<number, string> = Validated.ok('Cool')
      expect(toVerify).toEqual(expected)
    })

    it('should apply the function when the value is not valid', () => {
      const invalid: Validated<string, string> = Validated.error('Nah')
      const toVerify: Validated<number, string> = invalid.mapError(stringLength)
      const expected: Validated<number, string> = Validated.error(3)
      expect(toVerify).toEqual(expected)
    })
  })

  describe('flatMap', () => {
    function isNumber(s: string): Validated<string, number> {
      const n = parseInt(s, 10)
      if (isNaN(n)) {
        return Validated.error(`${s} is not a number`)
      } else {
        return Validated.ok(n)
      }
    }

    it('should return the outer error if the outer value is invalid', () => {
      const invalid: Validated<boolean, string> = Validated.error(false)
      const toVerify: Validated<boolean | string, number> = invalid.flatMap(isNumber)
      const expected: Validated<boolean | string, number> = Validated.error(false)
      expect(toVerify).toEqual(expected)
    })

    it('should return the inner error if the outer value is valid but the inner is not', () => {
      const valid: Validated<boolean, string> = Validated.ok('NaN')
      const toVerify: Validated<boolean | string, number> = valid.flatMap(isNumber)
      const expected: Validated<boolean | string, number> = Validated.error(`NaN is not a number`)
      expect(toVerify).toEqual(expected)
    })

    it('should return the inner value if both the outer value and the inner value are valid', () => {
      const valid: Validated<boolean, string> = Validated.ok('44')
      const toVerify: Validated<boolean | string, number> = valid.flatMap(isNumber)
      const expected: Validated<boolean | string, number> = Validated.ok(44)
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
      const invalid: Validated<typeof OTHER_ERROR, number> = Validated.error(OTHER_ERROR)
      const toVerify: Validated<typeof OTHER_ERROR | typeof NOT_EVEN, number> = invalid.filter(isEven, (): typeof NOT_EVEN => NOT_EVEN)
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

  describe('recover', () => {
    const SOME_ERROR: 'SOME_ERROR' = 'SOME_ERROR'

    function toValidString(e: typeof SOME_ERROR): Valid<string> {
      return Validated.ok(`Now valid ${e}`)
    }

    it('should return the original value if the original value is valid', () => {
      const valid: Validated<typeof SOME_ERROR, number> = Validated.ok(3)
      const toVerify: Valid<number | string> = valid.recover(toValidString)
      const expected: Valid<number | string> = Validated.ok(3)
      expect(toVerify).toEqual(expected)
    })

    it('should return the recovered value if the original value is invalid', () => {
      const invalid: Validated<typeof SOME_ERROR, number> = Validated.error(SOME_ERROR)
      const toVerify: Valid<number | string> = invalid.recover(toValidString)
      const expected: Valid<number | string> = Validated.ok('Now valid SOME_ERROR')
      expect(toVerify).toEqual(expected)
    })
  })

  describe('isValid', () => {
    it('should return true if the value is valid', () => {
      const valid: Validated<string, number> = Validated.ok(3)
      const toVerify: boolean = valid.isValid()
      const expected: boolean = true
      expect(toVerify).toEqual(expected)
    })

    it('should return false if the value is valid', () => {
      const invalid: Validated<string, number> = Validated.error('Not three')
      const toVerify: boolean = invalid.isValid()
      const expected: boolean = false
      expect(toVerify).toEqual(expected)
    })
  })

  describe('isInvalid', () => {
    it('should return false if the value is valid', () => {
      const valid: Validated<string, number> = Validated.ok(3)
      const toVerify: boolean = valid.isInvalid()
      const expected: boolean = false
      expect(toVerify).toEqual(expected)
    })

    it('should return true if the value is valid', () => {
      const invalid: Validated<string, number> = Validated.error('Not three')
      const toVerify: boolean = invalid.isInvalid()
      const expected: boolean = true
      expect(toVerify).toEqual(expected)
    })
  })

  describe('fold', () => {
    function ok(s: string): number {
      return s.length
    }

    function error(n: number): number {
      return n * 2
    }

    it('should return the result of the `ok`-function if the value is valid', () => {
      const valid: Validated<number, string> = Validated.ok('Four')
      const toVerify: number = valid.fold(ok, error)
      const expected: number = 4
      expect(toVerify).toEqual(expected)
    })

    it('should return the result of the `error`-function if the value is invalid', () => {
      const valid: Validated<number, string> = Validated.error(12)
      const toVerify: number = valid.fold(ok, error)
      const expected: number = 24
      expect(toVerify).toEqual(expected)
    })
  })

  describe('sequence', () => {
    it('should return a valid array if all values are valid', () => {
      const allValid: Array<Validated<number, string>> = [Validated.ok('Koala'), Validated.ok('Tiger'), Validated.ok('Duck')]
      const toVerify: Validated<Partial<number[]>, string[]> = Validated.sequence(allValid)
      const expected: Validated<Partial<number[]>, string[]> = Validated.ok(['Koala', 'Tiger', 'Duck'])
      expect(toVerify).toEqual(expected)
    })

    it('should return a partial array with errors if some values are invalid', () => {
      const someInvalid: Array<Validated<number, string>> = [Validated.error(4), Validated.ok('Tiger'), Validated.error(11)]
      const toVerify: Validated<Partial<number[]>, string[]> = Validated.sequence(someInvalid)
      const expected: Validated<Partial<number[]>, string[]> = Validated.error([4, undefined, 11])
      expect(toVerify).toEqual(expected)
    })

    it('should return a complete array with errors if all values are invalid', () => {
      const allInvalid: Array<Validated<number, string>> = [Validated.error(4), Validated.error(-1), Validated.error(11)]
      const toVerify: Validated<Partial<number[]>, string[]> = Validated.sequence(allInvalid)
      const expected: Validated<Partial<number[]>, string[]> = Validated.error([4, -1, 11])
      expect(toVerify).toEqual(expected)
    })
  })

  describe('combine', () => {
    type ToCombine = Readonly<{
      koala: Validated<boolean, string>
      tiger: Validated<string, number>
      duck: Validated<number, boolean>
    }>

    it('should return a valid object if all values are valid', () => {
      const allValid: ToCombine = {
        koala: Validated.ok('Munch'),
        tiger: Validated.ok(4),
        duck: Validated.ok(true)
      }
      const toVerify = Validated.combine<ToCombine>(allValid)
      const expected = Validated.ok({
        koala: 'Munch',
        tiger: 4,
        duck: true
      })
      expect(toVerify).toEqual(expected)
    })

    it('should return a partial valid object if some values are invalid', () => {
      const someInvalid: ToCombine = {
        koala: Validated.error(true),
        tiger: Validated.ok(4),
        duck: Validated.error(11)
      }
      const toVerify = Validated.combine<ToCombine>(someInvalid)
      const expected = Validated.error({
        koala: true,
        duck: 11
      })
      expect(toVerify).toEqual(expected)
    })

    it('should return a complete valid object if all values are invalid', () => {
      const allInvalid: ToCombine = {
        koala: Validated.error(true),
        tiger: Validated.error('Woah'),
        duck: Validated.error(11)
      }
      const toVerify = Validated.combine<ToCombine>(allInvalid)
      const expected = Validated.error({
        koala: true,
        tiger: 'Woah',
        duck: 11
      })
      expect(toVerify).toEqual(expected)
    })
  })
})
