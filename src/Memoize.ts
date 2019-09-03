export type Equality<A> = (l: A, r: A) => boolean
export type Equalities<M extends any[]> = { [K in keyof M]: Equality<M[K]> }

function tripleEquals<A>(l: A, r: A): boolean {
  return l === r
}

function orTripleEquals<P>(equality: Equality<P> | undefined): Equality<P> {
  return equality || tripleEquals
}

function metaOrTripleEquals<M extends any[]>(equalities: Partial<Equalities<M>>): Equality<M> {
  return (lefts, rights) => {
    if (lefts.length !== rights.length) {
      return false
    }

    return lefts.every((left, index) => {
      const right = rights[index]
      const equality = orTripleEquals(equalities[index])
      return equality(left, right)
    })
  }
}

type Memoized<P, M extends any[], Result> = {
  (p: P, ...meta: M): Result
  fork(): Memoized<P, M, Result>
}

export function memoize<P, M extends any[], Result>(
  fn: (p: P, ...meta: M) => Result,
  pConfig: Equality<P> | undefined,
  metaConfig: Partial<Equalities<M>>
): Memoized<P, M, Result> {
  const pEquality = orTripleEquals(pConfig)
  const metaEquality = metaOrTripleEquals(metaConfig)

  type LastCall = Readonly<{
    p: P
    meta: M
    result: Result
  }>
  let lastCall: LastCall | null = null
  const memoized = (p: P, ...meta: M): Result => {
    if (lastCall !== null && pEquality(lastCall.p, p) && metaEquality(lastCall.meta, meta)) {
      return lastCall.result
    } else {
      const result = fn(p, ...meta)
      lastCall = { p, meta, result }
      return result
    }
  }
  memoized.fork = () => memoize(fn, pConfig, metaConfig)
  return memoized
}
