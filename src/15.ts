type TrimDash<S extends string> =
  S extends `-${infer Rest}` ? TrimDash<Rest>
  : S extends `${infer Rest}-` ? TrimDash<Rest>
  : S;

// `_GetRoute` assumes:
//   - No padding or trailing dashes
//   - `T` is not empty string
type _GetRoute<
  S extends string,
  CurrDistance extends void[] = [],
  CurrName extends string = "",
  Result extends [string, number][] = [],
> =
  S extends `${infer C}${infer Rest}` ?
    C extends "-" ?
      CurrName extends "" ?
        _GetRoute<Rest, [...CurrDistance, void], "", Result>
      : _GetRoute<Rest, [void], "", [...Result, [CurrName, CurrDistance["length"]]]>
    : _GetRoute<Rest, CurrDistance, `${CurrName}${C}`, Result>
  : [...Result, [CurrName, CurrDistance["length"]]];

export type GetRoute<S extends string> = TrimDash<S> extends "" ? [] : _GetRoute<TrimDash<S>>;
