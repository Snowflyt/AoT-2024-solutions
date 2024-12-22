type BlankChar = " " | "\t" | "\n" | "\r";

type Digit = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
type DigitChar = `${Digit}`;

type Punctuation = "{" | "}" | "[" | "]" | "," | ":";

/*************
 * Tokenizer *
 *************/
type Token =
  | { type: "String"; value: string }
  | { type: "Number"; value: number }
  | { type: "Boolean"; value: true | false }
  | { type: "Null" }
  | { type: "Punctuation"; value: Punctuation }
  | { type: "Unknown"; value: string };

// Get the first string literal and the remaining string of the input.
// Assumes the first quote is already consumed.
type ExtractString<
  QuoteStyle extends '"' | "'",
  Remaining extends string,
  Result extends string = "",
> =
  Remaining extends `${infer C}${infer Rest}` ?
    C extends "\\" ?
      Rest extends `${infer Escaped}${infer Rest}` ?
        Escaped extends "n" ? ExtractString<QuoteStyle, Rest, `${Result}\n`>
        : Escaped extends "r" ? ExtractString<QuoteStyle, Rest, `${Result}\r`>
        : Escaped extends "t" ? ExtractString<QuoteStyle, Rest, `${Result}\t`>
        : Escaped extends "b" ? ExtractString<QuoteStyle, Rest, `${Result}\b`>
        : Escaped extends "f" ? ExtractString<QuoteStyle, Rest, `${Result}\f`>
        : Escaped extends '"' | "'" | "\\" ? ExtractString<QuoteStyle, Rest, `${Result}${Escaped}`>
        : never // Bad escaped character
      : never
    : C extends QuoteStyle ? [Result, Rest]
    : ExtractString<QuoteStyle, Rest, `${Result}${C}`>
  : never;

// Get the first number literal and the remaining string of the input.
type ExtractNumber<Remaining extends string, Result extends string = ""> =
  Remaining extends `${infer C}${infer Rest}` ?
    C extends "_" ? ExtractNumber<Rest, Result>
    : C extends `${Digit}` ? ExtractNumber<Rest, `${Result}${C}`>
    : [_StringToNumber<Result>, Remaining]
  : [_StringToNumber<Result>, Remaining];
type _StringToNumber<S extends string> = S extends `${infer N extends number}` ? N : never;

type Tokenize<S extends string> = _Tokenize<S, []>;
type _Tokenize<Remaining extends string, Tokens extends Token[]> =
  Remaining extends "" ? Tokens
  : Remaining extends `${infer C}${infer Rest}` ?
    C extends BlankChar ? _Tokenize<Rest, Tokens>
    : C extends '"' | "'" ?
      ExtractString<C, Rest> extends [infer String extends string, infer Rest extends string] ?
        _Tokenize<Rest, [...Tokens, { type: "String"; value: String }]>
      : never
    : C extends DigitChar ?
      ExtractNumber<Remaining> extends [infer Number extends number, infer Rest extends string] ?
        _Tokenize<Rest, [...Tokens, { type: "Number"; value: Number }]>
      : never
    : C extends "t" | "f" ?
      Remaining extends `true${infer Rest}` ?
        _Tokenize<Rest, [...Tokens, { type: "Boolean"; value: true }]>
      : Remaining extends `false${infer Rest}` ?
        _Tokenize<Rest, [...Tokens, { type: "Boolean"; value: false }]>
      : _Tokenize<Rest, [...Tokens, { type: "Unknown"; value: C }]>
    : C extends "n" ?
      Remaining extends `null${infer Rest}` ?
        _Tokenize<Rest, [...Tokens, { type: "Null" }]>
      : _Tokenize<Rest, [...Tokens, { type: "Unknown"; value: C }]>
    : C extends Punctuation ? _Tokenize<Rest, [...Tokens, { type: "Punctuation"; value: C }]>
    : _Tokenize<Rest, [...Tokens, { type: "Unknown"; value: C }]>
  : never;

/**********
 * Parser *
 **********/
// Assumes the 1st token `[` is already consumed
type _ParseArray<Remaining extends Token[], Result extends unknown[] = []> =
  Remaining extends [{ type: "Punctuation"; value: "]" }, ...infer Rest extends Token[]] ?
    [Result, Rest]
  : Remaining extends [{ type: "Punctuation"; value: "," }, ...infer Rest extends Token[]] ?
    _ParseArray<Rest, Result>
  : _Parse<Remaining> extends [infer Value, infer Rest extends Token[]] ?
    _ParseArray<Rest, [...Result, Value]>
  : never;

// Assumes the 1st token `{` is already consumed
type _ParseObject<Remaining extends Token[], Pairs extends [string | number, unknown][] = []> =
  Remaining extends [{ type: "Punctuation"; value: "}" }, ...infer Rest extends Token[]] ?
    [{ [Pair in Pairs[number] as Pair[0]]: Pair[1] }, Rest]
  : Remaining extends [{ type: "Punctuation"; value: "," }, ...infer Rest extends Token[]] ?
    _ParseObject<Rest, Pairs>
  : Remaining extends (
    [
      { type: "String"; value: infer Key extends string },
      { type: "Punctuation"; value: ":" },
      ...infer Rest extends Token[],
    ]
  ) ?
    _Parse<Rest> extends [infer Value, infer Rest extends Token[]] ?
      _ParseObject<Rest, [...Pairs, [Key, Value]]>
    : never
  : Remaining extends (
    [
      { type: "Number"; value: infer Key extends number },
      { type: "Punctuation"; value: ":" },
      ...infer Rest extends Token[],
    ]
  ) ?
    _Parse<Rest> extends [infer Value, infer Rest extends Token[]] ?
      _ParseObject<Rest, [...Pairs, [Key, Value]]>
    : never
  : never;

export type Parse<S extends string> = _Parse<Tokenize<S>>[0];
type _Parse<Remaining extends Token[]> =
  Remaining extends [infer T extends Token, ...infer Rest extends Token[]] ?
    T extends { type: "String"; value: infer S } ? [S, Rest]
    : T extends { type: "Number"; value: infer N } ? [N, Rest]
    : T extends { type: "Boolean"; value: infer B } ? [B, Rest]
    : T extends { type: "Null" } ? [null, Rest]
    : T extends { type: "Punctuation"; value: "[" } ? _ParseArray<Rest>
    : T extends { type: "Punctuation"; value: "{" } ? _ParseObject<Rest>
    : never
  : never;
