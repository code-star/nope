export function keys<O>(o: O): Array<keyof O> {
  return Object.keys(o) as Array<keyof O>
}
