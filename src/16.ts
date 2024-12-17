export declare function DynamicParamsCurrying<Params extends unknown[], R>(
  f: (...args: Params) => R,
): Curry<Params, R>;

// This version is enough if you don’t care about preserving parameter names:
// type Curry<Unscanned extends unknown[], R, Scanned extends unknown[] = [], Result = unknown> =
//   Unscanned extends [infer Head, ...infer Tail] ?
//     Curry<Tail, R, [...Scanned, Head], Result & ((...args: Scanned) => Curry<Unscanned, R>)>
//   : Result & ((...args: Scanned) => R);

// This is a more complex version that preserves parameter names:
type Curry<Unscanned extends unknown[], R, Scanned extends unknown[] = [], Result = unknown> =
  Unscanned extends [] ? Result & ((...args: Scanned) => R)
  : Curry<
      Tail<Unscanned>,
      R,
      // Use `...HeadPart` to preserve labels
      [...Scanned, ...HeadPart<Unscanned>],
      Result & ((...args: Scanned) => Curry<Unscanned, R>)
    >;

type Tail<TS extends unknown[]> = TS extends [unknown, ...infer Tail] ? Tail : [];

type HeadPart<TS extends unknown[]> = TS extends [unknown] ? TS : HeadPart<Init<TS>>;
type Init<TS extends unknown[]> = TS extends [...infer Init, unknown] ? Init : [];
