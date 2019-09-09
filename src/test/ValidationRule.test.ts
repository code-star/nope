import { ValidationRule } from '../ValidationRule'
import { Validated } from '../Validated'

describe('ValidationRule', () => {
  describe('map', () => {
    function stringLength(s: string): number {
      return s.length
    }

    it('should apply the function when the value is valid', () => {
      const alwaysValid: ValidationRule<string, string, string> = ValidationRule.create(s => Validated.ok(s))
      const toVerify: Validated<string, number> = alwaysValid.map(stringLength).apply('Cool')
      const expected: Validated<string, number> = Validated.ok(4)
      expect(toVerify).toEqual(expected)
    })

    it('should return the original error when the value is not valid', () => {
      const alwaysInvalid: ValidationRule<string, string, string> = ValidationRule.create(s => Validated.error(s))
      const toVerify: Validated<string, number> = alwaysInvalid.map(stringLength).apply('Nah')
      const expected: Validated<string, number> = Validated.error('Nah')
      expect(toVerify).toEqual(expected)
    })
  })

  describe('mapError', () => {
    function stringLength(s: string): number {
      return s.length
    }

    it('should not apply the function when the value is valid', () => {
      const alwaysValid: ValidationRule<string, string, string> = ValidationRule.create(s => Validated.ok(s))
      const toVerify: Validated<number, string> = alwaysValid.mapError(stringLength).apply('Cool')
      const expected: Validated<number, string> = Validated.ok('Cool')
      expect(toVerify).toEqual(expected)
    })

    it('should apply the function when the value is not valid', () => {
      const alwaysInvalid: ValidationRule<string, string, string> = ValidationRule.create(s => Validated.error(s))
      const toVerify: Validated<number, string> = alwaysInvalid.mapError(stringLength).apply('Nah')
      const expected: Validated<number, string> = Validated.error(3)
      expect(toVerify).toEqual(expected)
    })
  })

  describe('composeWith', () => {
    const isNumber = ValidationRule.create(
      (s: string): Validated<string, number> => {
        const n = parseInt(s, 10)
        if (isNaN(n)) {
          return Validated.error(`${s} is not a number`)
        } else {
          return Validated.ok(n)
        }
      }
    )

    it('should return the left error if the left value is invalid', () => {
      const alwaysInvalid: ValidationRule<boolean, boolean, string> = ValidationRule.create(b => Validated.error(b))
      const toVerify: Validated<boolean | string, number> = alwaysInvalid.composeWith(isNumber).apply(false)
      const expected: Validated<boolean | string, number> = Validated.error(false)
      expect(toVerify).toEqual(expected)
    })

    it('should return the inner error if the outer value is valid but the inner is not', () => {
      const alwaysValid: ValidationRule<string, boolean, string> = ValidationRule.create(s => Validated.ok(s))
      const toVerify: Validated<boolean | string, number> = alwaysValid.composeWith(isNumber).apply('NaN')
      const expected: Validated<boolean | string, number> = Validated.error(`NaN is not a number`)
      expect(toVerify).toEqual(expected)
    })

    it('should return the inner value if both the outer value and the inner value are valid', () => {
      const alwaysValid: ValidationRule<string, boolean, string> = ValidationRule.create(s => Validated.ok(s))
      const toVerify: Validated<boolean | string, number> = alwaysValid.composeWith(isNumber).apply('44')
      const expected: Validated<boolean | string, number> = Validated.ok(44)
      expect(toVerify).toEqual(expected)
    })

    it('should give both validation rules access to the same meta-data', () => {
      const left = ValidationRule.create<boolean, string, number, [number, string]>((p, n, _s) => Validated.ok((p ? -1 : +1) * n))
      const right = ValidationRule.create<number, string, string, [number, string]>((p, _n, s) => Validated.ok(p + ' ' + s))
      const toVerify: Validated<string, string> = left.composeWith(right).apply(true, 4, 'dash')
      const expected: Validated<string, string> = Validated.ok('-4 dash')
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
      const alwaysValid: ValidationRule<number, boolean, number> = ValidationRule.create(n => Validated.ok(n))
      const toVerify: Validated<boolean | string, number> = alwaysValid.filter(isEven, numberNotEven).apply(2)
      const expected: Validated<boolean | string, number> = Validated.ok(2)
      expect(toVerify).toEqual(expected)
    })

    it('should return the original error if the original value is invalid', () => {
      const alwaysInvalid: ValidationRule<boolean, boolean, number> = ValidationRule.create(b => Validated.error(b))
      const toVerify: Validated<boolean | string, number> = alwaysInvalid.filter(isEven, numberNotEven).apply(false)
      const expected: Validated<boolean | string, number> = Validated.error(false)
      expect(toVerify).toEqual(expected)
    })

    it('should return the newly supplied error if the original value is valid but the predicate returns false', () => {
      const alwaysValid: ValidationRule<number, boolean, number> = ValidationRule.create(n => Validated.ok(n))
      const toVerify: Validated<boolean | string, number> = alwaysValid.filter(isEven, numberNotEven).apply(3)
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
      const alwaysValid: ValidationRule<boolean, number, boolean> = ValidationRule.create(b => Validated.ok(b))
      const toVerify: Validated<never, boolean | string> = alwaysValid.recover(toValidString).apply(true)
      const expected: Validated<never, boolean | string> = Validated.ok(true)
      expect(toVerify).toEqual(expected)
    })

    it('should return the recovered value if the original value is invalid', () => {
      const alwaysInvalid: ValidationRule<number, number, boolean> = ValidationRule.create(n => Validated.error(n))
      const toVerify: Validated<never, boolean | string> = alwaysInvalid.recover(toValidString).apply(3)
      const expected: Validated<never, boolean | string> = Validated.ok('Now valid 3')
      expect(toVerify).toEqual(expected)
    })
  })

  describe('orElse', () => {
    it('should return the original value if the original value is valid, even if the alternative is invalid', () => {
      const original: ValidationRule<number, boolean, string> = ValidationRule.create(n => Validated.ok(`Number ${n}`))
      const alternative: ValidationRule<number, number, boolean> = ValidationRule.create(n => Validated.error(n))
      const toVerify: Validated<number, boolean | string> = original.orElse(alternative).apply(4)
      const expected: Validated<number, boolean | string> = Validated.ok('Number 4')
      expect(toVerify).toEqual(expected)
    })

    it('should return the original value if the original value is valid, even if the alternative is valid', () => {
      const original: ValidationRule<number, boolean, string> = ValidationRule.create(n => Validated.ok(`Number ${n}`))
      const alternative: ValidationRule<number, number, boolean> = ValidationRule.create(n => Validated.ok(n >= 0))
      const toVerify: Validated<number, boolean | string> = original.orElse(alternative).apply(4)
      const expected: Validated<number, boolean | string> = Validated.ok('Number 4')
      expect(toVerify).toEqual(expected)
    })

    it('should return the alternative error if both the original value and the altnerative are invalid', () => {
      const original: ValidationRule<number, boolean, string> = ValidationRule.create(n => Validated.error(n >= 0))
      const alternative: ValidationRule<number, number, boolean> = ValidationRule.create(n => Validated.error(n))
      const toVerify: Validated<number, boolean | string> = original.orElse(alternative).apply(4)
      const expected: Validated<number, boolean | string> = Validated.error(4)
      expect(toVerify).toEqual(expected)
    })

    it('should return the alternative value if the original value is invalid but the alternative is not', () => {
      const original: ValidationRule<number, boolean, string> = ValidationRule.create(n => Validated.error(n >= 0))
      const alternative: ValidationRule<number, number, boolean> = ValidationRule.create(n => Validated.ok(n >= 0))
      const toVerify: Validated<number, boolean | string> = original.orElse(alternative).apply(4)
      const expected: Validated<number, boolean | string> = Validated.ok(true)
      expect(toVerify).toEqual(expected)
    })
  })

  describe('combine', () => {
    it('should return a valid object if all values are valid', () => {
      type ToCombine = Readonly<{
        koala: ValidationRule<string, boolean, string>
        tiger: ValidationRule<number, string, number>
        duck: ValidationRule<boolean, number, boolean>
      }>

      const alwaysAllValid: ToCombine = {
        koala: ValidationRule.create<string, boolean, string>(Validated.ok),
        tiger: ValidationRule.create<number, string, number>(Validated.ok),
        duck: ValidationRule.create<boolean, number, boolean>(Validated.ok)
      }

      const toVerify = ValidationRule.combine<ToCombine>(alwaysAllValid).apply({
        koala: 'Munch',
        tiger: 4,
        duck: true
      })
      const expected = Validated.ok({
        koala: 'Munch',
        tiger: 4,
        duck: true
      })
      expect(toVerify).toEqual(expected)
    })

    it('should return a partial valid object if some values are invalid', () => {
      type ToCombine = Readonly<{
        koala: ValidationRule<boolean, boolean, string>
        tiger: ValidationRule<number, string, number>
        duck: ValidationRule<number, number, boolean>
      }>

      const alwaysSomeInvalid: ToCombine = {
        koala: ValidationRule.create<boolean, boolean, string>(Validated.error),
        tiger: ValidationRule.create<number, string, number>(Validated.ok),
        duck: ValidationRule.create<number, number, boolean>(Validated.error)
      }
      const toVerify = ValidationRule.combine<ToCombine>(alwaysSomeInvalid).apply({
        koala: true,
        tiger: 4,
        duck: 11
      })
      const expected = Validated.error({
        koala: true,
        duck: 11
      })
      expect(toVerify).toEqual(expected)
    })

    it('should return a complete valid object if all values are invalid', () => {
      type ToCombine = Readonly<{
        koala: ValidationRule<boolean, boolean, string>
        tiger: ValidationRule<string, string, number>
        duck: ValidationRule<number, number, boolean>
      }>

      const alwaysAllInvalid: ToCombine = {
        koala: ValidationRule.create(Validated.error),
        tiger: ValidationRule.create(Validated.error),
        duck: ValidationRule.create(Validated.error)
      }
      const toVerify = ValidationRule.combine<ToCombine>(alwaysAllInvalid).apply({
        koala: true,
        tiger: 'Woah',
        duck: 11
      })
      const expected = Validated.error({
        koala: true,
        tiger: 'Woah',
        duck: 11
      })
      expect(toVerify).toEqual(expected)
    })

    it('should allow each validation rule to have meta-data', () => {
      type ToCombine = Readonly<{
        koala: ValidationRule<string, boolean, number, [number]>
        tiger: ValidationRule<number, string, number, [number]>
        duck: ValidationRule<boolean, number, number, [number]>
      }>
      const alwaysAllValid: ToCombine = {
        koala: ValidationRule.create<string, boolean, number, [number]>((s, i) => Validated.ok(s.length + i)),
        tiger: ValidationRule.create<number, string, number, [number]>((n, i) => Validated.ok(n * i)),
        duck: ValidationRule.create<boolean, number, number, [number]>((b, i) => Validated.ok(b ? -i : +i))
      }

      const toVerify = ValidationRule.combine<ToCombine>(alwaysAllValid).apply(
        {
          koala: 'Munch',
          tiger: 4,
          duck: true
        },
        3
      )
      const expected = Validated.ok({
        koala: 8,
        tiger: 12,
        duck: -3
      })
      expect(toVerify).toEqual(expected)
    })
  })

  describe('test', () => {
    const isEven = ValidationRule.test(
      (n: number): Validated<string> => {
        return n % 2 === 0 ? Validated.ok() : Validated.error(`${n} is not even`)
      }
    )

    const isPositive = ValidationRule.test(
      (n: number): Validated<boolean> => {
        return n > 0 ? Validated.ok() : Validated.error(false)
      }
    )

    it('should return the original value if the original value is valid if the predicates return true', () => {
      const alwaysValid: ValidationRule<number, number> = ValidationRule.create<number, number>(Validated.ok)
      const toVerify: Validated<number | Array<boolean | string>, number> = alwaysValid.test<string | boolean>(isEven, isPositive).apply(2)
      const expected: Validated<number | Array<boolean | string>, number> = Validated.ok(2)
      expect(toVerify).toEqual(expected)
    })

    it('should return the original error if the original value is invalid', () => {
      const alwaysInvalid: ValidationRule<number, number> = ValidationRule.create<number, number>(Validated.error)
      const toVerify: Validated<number | Array<boolean | string>, number> = alwaysInvalid.test<string | boolean>(isEven, isPositive).apply(2)
      const expected: Validated<number | Array<boolean | string>, number> = Validated.error(2)
      expect(toVerify).toEqual(expected)
    })

    it('should return the newly supplied error if the original value is valid but one of the the predicates returns false', () => {
      const alwaysValid: ValidationRule<number, number> = ValidationRule.create<number, number>(Validated.ok)
      const toVerify: Validated<number | Array<boolean | string>, number> = alwaysValid.test<string | boolean>(isEven, isPositive).apply(3)
      const expected: Validated<number | Array<boolean | string>, number> = Validated.error(['3 is not even'])
      expect(toVerify).toEqual(expected)
    })

    it('should return multiple newly supplied errors if the original value is valid but many of the the predicates return false', () => {
      const alwaysValid: ValidationRule<number, number> = ValidationRule.create<number, number>(Validated.ok)
      const toVerify: Validated<number | Array<boolean | string>, number> = alwaysValid.test<string | boolean>(isEven, isPositive).apply(-3)
      const expected: Validated<number | Array<boolean | string>, number> = Validated.error(['-3 is not even', false])
      expect(toVerify).toEqual(expected)
    })
  })
})
