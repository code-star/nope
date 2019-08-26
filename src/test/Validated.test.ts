import { Validated } from '../Validated'

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

    function numberNotEven(n: number): string {
      return `${n} is not even`
    }

    it('should return the original value if the original value is valid if the predicate returns true', () => {
      const valid: Validated<boolean, number> = Validated.ok(2)
      const toVerify: Validated<boolean | string, number> = valid.filter(isEven, numberNotEven)
      const expected: Validated<boolean | string, number> = Validated.ok(2)
      expect(toVerify).toEqual(expected)
    })

    it('should return the original error if the original value is invalid', () => {
      const invalid: Validated<boolean, number> = Validated.error(false)
      const toVerify: Validated<boolean | string, number> = invalid.filter(isEven, numberNotEven)
      const expected: Validated<boolean | string, number> = Validated.error(false)
      expect(toVerify).toEqual(expected)
    })

    it('should return the newly supplied error if the original value is valid but the predicate returns false', () => {
      const valid: Validated<boolean, number> = Validated.ok(3)
      const toVerify: Validated<boolean | string, number> = valid.filter(isEven, numberNotEven)
      const expected: Validated<boolean | string, number> = Validated.error('3 is not even')
      expect(toVerify).toEqual(expected)
    })
  })

  describe('test', () => {
    function isEven(n: number): Validated<string> {
      return n % 2 === 0 ? Validated.ok() : Validated.error(`${n} is not even`)
    }

    function isPositive(n: number): Validated<boolean> {
      return n > 0 ? Validated.ok() : Validated.error(false)
    }

    it('should return the original value if the original value is valid if the predicates return true', () => {
      const valid: Validated<number, number> = Validated.ok(2)
      const toVerify: Validated<number | Array<boolean | string>, number> = valid.test<string | boolean>(isEven, isPositive)
      const expected: Validated<number | Array<boolean | string>, number> = Validated.ok(2)
      expect(toVerify).toEqual(expected)
    })

    it('should return the original error if the original value is invalid', () => {
      const valid: Validated<number, number> = Validated.error(2)
      const toVerify: Validated<number | Array<boolean | string>, number> = valid.test<string | boolean>(isEven, isPositive)
      const expected: Validated<number | Array<boolean | string>, number> = Validated.error(2)
      expect(toVerify).toEqual(expected)
    })

    it('should return the newly supplied error if the original value is valid but one of the the predicates returns false', () => {
      const valid: Validated<number, number> = Validated.ok(3)
      const toVerify: Validated<number | Array<boolean | string>, number> = valid.test<string | boolean>(isEven, isPositive)
      const expected: Validated<number | Array<boolean | string>, number> = Validated.error(['3 is not even'])
      expect(toVerify).toEqual(expected)
    })

    it('should return multiple newly supplied errors if the original value is valid but many of the the predicates return false', () => {
      const valid: Validated<number, number> = Validated.ok(-3)
      const toVerify: Validated<number | Array<boolean | string>, number> = valid.test<string | boolean>(isEven, isPositive)
      const expected: Validated<number | Array<boolean | string>, number> = Validated.error(['-3 is not even', false])
      expect(toVerify).toEqual(expected)
    })
  })

  describe('recover', () => {
    function toValidString(n: number): string {
      return `Now valid ${n}`
    }

    it('should return the original value if the original value is valid', () => {
      const valid: Validated<number, boolean> = Validated.ok(true)
      const toVerify: Validated<never, boolean | string> = valid.recover(toValidString)
      const expected: Validated<never, boolean | string> = Validated.ok(true)
      expect(toVerify).toEqual(expected)
    })

    it('should return the recovered value if the original value is invalid', () => {
      const invalid: Validated<number, boolean> = Validated.error(3)
      const toVerify: Validated<never, boolean | string> = invalid.recover(toValidString)
      const expected: Validated<never, boolean | string> = Validated.ok('Now valid 3')
      expect(toVerify).toEqual(expected)
    })
  })

  describe('orElse', () => {
    it('should return the original value if the original value is valid, even if the alternative is invalid', () => {
      const original: Validated<number, boolean> = Validated.ok(true)
      const alternative: Validated<boolean, string> = Validated.error(false)
      const toVerify: Validated<boolean, boolean | string> = original.orElse(alternative)
      const expected: Validated<boolean, boolean | string> = Validated.ok(true)
      expect(toVerify).toEqual(expected)
    })

    it('should return the original value if the original value is valid, even if the alternative is valid', () => {
      const original: Validated<number, boolean> = Validated.ok(true)
      const alternative: Validated<boolean, string> = Validated.ok('Woah')
      const toVerify: Validated<boolean, boolean | string> = original.orElse(alternative)
      const expected: Validated<boolean, boolean | string> = Validated.ok(true)
      expect(toVerify).toEqual(expected)
    })

    it('should return the alternative error if both the original value and the altnerative are invalid', () => {
      const original: Validated<number, boolean> = Validated.error(4)
      const alternative: Validated<boolean, string> = Validated.error(false)
      const toVerify: Validated<boolean, boolean | string> = original.orElse(alternative)
      const expected: Validated<boolean, boolean | string> = Validated.error(false)
      expect(toVerify).toEqual(expected)
    })

    it('should return the alternative value if the original value is invalid but the alternative is not', () => {
      const original: Validated<number, boolean> = Validated.error(4)
      const alternative: Validated<boolean, string> = Validated.ok('Yeah')
      const toVerify: Validated<boolean, boolean | string> = original.orElse(alternative)
      const expected: Validated<boolean, boolean | string> = Validated.ok('Yeah')
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
