export declare function DynamicParamsCurrying<Params extends unknown[], R>(
  f: (...args: Params) => R,
): Curry<Params, R>;

type Curry<Unscanned extends unknown[], R, Scanned extends unknown[] = [], Result = unknown> =
  Unscanned extends [infer Head, ...infer Tail] ?
    Curry<Tail, R, [...Scanned, Head], Result & ((...args: Scanned) => Curry<Unscanned, R>)>
  : Result & ((...args: Scanned) => R);
