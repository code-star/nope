# Nope

## Introduction

### Simple validation

Let's say we want to verify that a number is positive. We can define the following _validation rule_:

```typescript
const isPositive = ValidationRule.test((n: number) => {
  return n >= 0 
    ? Validated.ok() 
    : Validated.error(`${n} is negative`)
})
```

This results in a `ValidationRule<number, string>`. The input is a `number` (the first type parameter), and validation might result in a error of the type `string` (the second type parameter).

How do we use it?

```typescript
const validated = isPositive.apply(-4)

if (validated.isValid()) {
  console.log(`${validated.value} is positive!`)
} else {
  console.error(`Error: ${validated.error}`)
}
```

### Transformations

Let's suppose we want to make sure that a `string` represents a valid number:

```typescript
const isFloat = ValidationRule.test((s: string) => {
  const n = Number.parseFloat(s)
  return isNaN(n) 
    ? Validated.error(`${s} is not a number`) 
    : Validated.ok()
})
```

That's cool, but there's something inefficient about this. We do all this work to parse the `string` as a valid `number`, only to throw that `number` (the fruit of our labour) away once we've verified that it _is_ a `number`. It is likely that we might want to use that number at some later point, and it feels inefficient to parse it twice (once to verify that it is a `number`, and afterwards again to actually be able to use it). To this end, we can create a validation rule with a return a value with `ValidationRule.create`:

```typescript
const isFloat = ValidationRule.create((s: string) => {
  const n = Number.parseFloat(s)
  return isNaN(n) 
    ? Validated.error(`${s} is not a number`) 
    : Validated.ok(n)
})
```

The type of `isFloat` is `ValidationRule<string, string, number>`. The input is a `string` (the first type parameter) which we try to parse, and validation might result in a error of the type `string` (the second type parameter). The output of this validation rule is `number` (the third type parameter).

How do we use it?

```typescript
const validated = isFloat.apply('123.456789')

if (validated.isValid()) {
  console.log(`${validated.value.toFixed(2)} is a number!`)
} else {
  console.error(`Error: ${validated.error}`)
}
```

Note the call to `toFixed`, which we are only able to do because `value` is a `number`.

The return value of a validation rule is where Nope differs from [Yup](https://github.com/jquense/yup). In Yup, the validation (is something valid or not) and the transformation to a valid value are two separate steps. In Nope, this is a single step. This makes it easy to create validation rules that build upon each other, as we'll see next.

### Chaining

We can combine the two rules into one:

```typescript
const isPositiveFloat = isFloat.composeWith(isPositive)
```

This validation rule takes a `string` and tries to parse it as a `number`. If it succeeds, it will verify that the number is positive. We can get one of two errors:

* An error stating that the `string` does not contain a number. For example: `'Dog is not a number'`
* An error stating that the `number` is negative. For example: `'-123.4 is negative`

There are many ways to combine simple validation rules into more complex validation rules. Take a look at the documentation for [`combine`](#validationrulecombine), [`test`]($validationruletest) or [`many`](#validationrulemany) for example.

### Meta data

It's not uncommon to need some meta data to properly validate your data. Take the example where we want to verify that a given `Date` is in the past. We need to know the current time to be able to do this:

```typescript
const isInPast = ValidationRule.test((date: Date, now: Date) => {
  return date <= now
    ? Validated.ok()
    : Validated.error(`${date} is after current time (${now})`)
})
```

This results in a `ValidationRule<Date, string, Date, [Date]>`. The input is a `Date` (the first type parameter), and validation might result in a error of the type `string` (the second type parameter). Because we are using `ValidationRule.test` (and not `ValidationRule.create`), validation will result in a `Date` (the third type parameter) which is the original `Date` we pass in. Lastly, the meta data is specified by the parameter list `[Date]` (the fourth type parameter). We can pass as many values in as we'd like.

How do we use it?

```typescript
const date = new Date(2019, 4, 3, 14, 12)
const now = new Date(2019, 4, 3, 23, 59)
const validated = isInPast.apply(date, now)

if (validated.isValid()) {
  console.log(`${date} is in the past!`)
} else {
  console.error(`Error: ${validated.error}`)
}
```

## API

Note that this documentation is not yet complete. Explore the API to learn more about what is possible. Help making the documentation complete is very welcome.

- [API](#API)
  - `ValidationRule`
    - [`ValidationRule.combine`](#validationrulecombine)
    - [`ValidationRule.composeWith`](#validationrulecomposewith)
    - [`ValidationRule.many`](#validationrulemany)
    - [`ValidationRule.test`](#validationruletest)
    - [`ValidationRule.optional`](#validationruleoptional)
    - [`ValidationRule.required`](#validationrulerequired)
  - `Numbers`
    - [`Numbers.fromNumber`](#numbersfromnumber)
    - [`Numbers.fromUnknown`](#numbersfromunknown)
    - [`Numbers.positive`](#numberspositive)
  - `Undefineds`
    - [`Undefineds.optional`](#undefinedsoptional)
    - [`Undefineds.required`](#undefinedsrequired)

#### `ValidationRule.combine`

Creates a `ValidationRule` for an object. Define the keys of the object and the validation rules for those keys. 

```typescript
const isPerson = ValidationRule.combine({
  age: Numbers.fromNumber().composeWith(Numbers.positive()),
  name: Strings.fromString().composeWith(Strings.notEmpty())
})
```

Using this validation rule results in a valid object of shape

```typescript
{
  age: number,
  name: string
}
```

or an error of shape

```typescript
{
  age?: NotPositive,
  name?: EmptyString
}
```

#### `ValidationRule.composeWith`

Compose two validation rules. Produces either of the two errors of the individual validation rules.

For example,

```typescript
Numbers.fromUnknown().composeWith(Numbers.positive())
```

will produce either a `NotANumber` error or a `NotPositive` error when it fails.

You can chain as many `composeWith`-calls as you like. The following will check whether an `unknown` value is a string which contains a positive float:

```typescript
const containsPositiveFloat = Strings.fromUnknown()
  .composeWith(Strings.notEmpty())
  .composeWith(Strings.containsFloat())
  .composeWith(Numbers.positive())
```

This validation rule can result in either:

* A `NotAString` error
* An `EmptyString` error
* A `DoesNotContainFloat` error
* A `NotPositive` error

#### `ValidationRule.many`

From a `ValidationRule` for a type `A`, creates a `ValidationRule` for type `A[]`.

```typescript
const areAllPositive = Numbers.positive().many()
```

Using this validation rule results in a valid `Array<number>` when all input values are positive, or an error of shape `Array<NotPositive | undefined>`. The error `Array` will only have values at the indices where the negative numbers are located.

#### ValidationRule.test

Combining validation rules like `composeWith` produces a union of errors. We can expect _either_ an error of this shape, _or_ an error of that shape. We can never get both errors at the same time.

`ValidationRule.test` allows you to run multiple validation rules at the same time (producing possibly many errors). Those validation rules are used purely for their errors. The values returned from the individual validation rules are discarded.

#### `ValidationRule.optional`

See [`Undefineds.optional`](#undefinedsoptional)

#### `ValidationRule.required`

See [`Undefineds.required`](#undefinedsrequired)

#### `Numbers.fromNumber`

`ValidationRule` that takes a `number` and produces a `number`. This rule will not produce any errors. It is usually used as a starting point for more complex validation rules.

#### `Numbers.fromUnknown`

`ValidationRule` that ensures that a given value (of type `unknown`) is a `number`. May produce a `NotANumber` error.

#### `Numbers.positive`

`ValidationRule` that ensures that a given `number` is positive. May produce a `NotPositive` error.

#### `Undefineds.optional`

Allows optional values (but doesn't raise an error). Mostly used to wrap a `composeWith`-chain to make the _whole_ chain optional.

```typescript
const isOptionalNumber = Undefineds.optional(Numbers.fromNumber())

isOptionalNumber.apply(undefined) // OK!
```

#### `Undefineds.required`

Allows optional inputs, but raises an error if the input is `undefined`. Mostly used at the beginning of a `composeWith`-chain.

```typescript
const isNumber = Undefineds.required<number>()

isNumber.apply(undefined) // Results in `IsUndefined` error.
```