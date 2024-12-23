export type Apply<Operation, T> =
  Operation extends { tag: "Push"; value: infer U } ? _Push<T, U>
  : Operation extends { tag: "Push" } ? { tag: "Push"; value: T }
  : Operation extends { tag: "Extends"; expected: infer U } ? _Extends<T, U>
  : Operation extends { tag: "Extends" } ? { tag: "Extends"; expected: T }
  : Operation extends { tag: "Filter"; operation: infer O } ? _Filter<T, O>
  : Operation extends { tag: "Filter" } ? { tag: "Filter"; operation: T }
  : Operation extends { tag: "ApplyAll"; operation: infer O } ? _ApplyAll<T, O>
  : Operation extends { tag: "ApplyAll" } ? { tag: "ApplyAll"; operation: T }
  : Operation extends { tag: "Cap" } ? _Cap<T>
  : never;

/** Push an element to a tuple */
export type Push = { tag: "Push" };
type _Push<T, U> = T extends unknown[] ? [...T, U] : never;

/** Filter a tuple */
export type Filter = { tag: "Filter" };
type _Filter<TS, Operation, Result extends unknown[] = []> =
  TS extends [infer Head, ...infer Tail] ?
    Apply<Operation, Head> extends true ?
      _Filter<Tail, Operation, [...Result, Head]>
    : _Filter<Tail, Operation, Result>
  : Result;

/** Determine if the given type extends another */
export type Extends = { tag: "Extends" };
type _Extends<T, U> = [T] extends [U] ? true : false;

/** Apply an operation to all inputs */
export type ApplyAll = { tag: "ApplyAll" };
type _ApplyAll<T, Operation> =
  T extends unknown[] ? { [I in keyof T]: Apply<Operation, T[I]> } : never;

/** Capitalize a string */
export type Cap = { tag: "Cap" };
type _Cap<T> = T extends string ? Capitalize<T> : never;
