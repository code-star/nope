export function identity<A>(a: A): A {
  return a
}

export function always<A>(a: A): () => A {
  return () => a
}
