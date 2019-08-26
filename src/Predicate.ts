import { Validated } from './Validated'

export type Predicate<P, E> = (p: P) => Validated<E>
