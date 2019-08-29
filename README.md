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

The type of `isFloat` is `ValidationRule<string, string, number>`. The output of this validation rule is `number` (the third type parameter).

How do we use it?

```typescript
const validated = isInt.apply('123.456789')
if (validated.isValid()) {
  console.log(`${validated.value.toFixed(2)} is a positive number!`)
} else {
  console.error(`Error: ${validated.error}`)
}
```

Note the call to `toFixed`, which we are only able to do because `value` is a `number`.

### Chaining

We can combine the two rules into one:

```typescript
const isPositiveFloat = isFloat.composeWith(isPositive)
```

This validation rule takes a `string` and tries to parse it as a `number`. If it succeeds, it will verify that the number is positive. We can get one of two errors:

* An error stating that the `string` does not contain a number. For example: `'Dog is not a number'`
* An error stating that the `number` is negative. For example: `'-123.4 is negative`

There are many ways to combine simple validation rules into more complex validation rules. Take a look at the documentation for `combine`, `test` or `many` for example.

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

Coming soon...