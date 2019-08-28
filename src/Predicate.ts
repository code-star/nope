import { Validated } from './Validated'

export type Predicate<P, E, M extends any[] = []> = (p: P, ...meta: M) => Validated<E>
