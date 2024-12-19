type BlankChar = " " | "\t" | "\n" | "\r";

// prettier-ignore
type Letter = "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h" | "i" | "j" | "k" | "l" 
            | "m" | "n" | "o" | "p" | "q" | "r" | "s" | "t" | "u" | "v" | "w" | "x"
            | "y" | "z" | "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J"
            | "K" | "L" | "M" | "N" | "O" | "P" | "Q" | "R" | "S" | "T" | "U" | "V"
            | "W" | "X" | "Y" | "Z";
type Digit = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

type Keyword = "var" | "let" | "const";
type Punctuation = "(" | ")" | ";";
type Operator = "=";

/*************
 * Tokenizer *
 *************/
type Token =
  | { type: "Keyword"; value: Keyword }
  | { type: "Identifier"; value: string }
  | { type: "Operator"; value: Operator }
  | { type: "StringLiteral"; value: string }
  | { type: "NumberLiteral"; value: number }
  | { type: "Punctuation"; value: Punctuation }
  | { type: "Unknown"; value: string };

// Get the first identifier and the remaining string of the input.
// NOTE: It assumes that the string is started with a letter or an underscore,
//       so make sure the string is not started with a digit.
type ExtractIdentifier<Remaining extends string, Result extends string = ""> =
  Remaining extends `${infer C extends Letter | `${Digit}` | "_"}${infer Rest}` ?
    ExtractIdentifier<Rest, `${Result}${C}`>
  : [Result, Remaining];

// Get the first string literal and the remaining string of the input.
// Assumes the first quote is already consumed.
type ExtractStringLiteral<
  QuoteStyle extends '"' | "'",
  Remaining extends string,
  Result extends string = "",
> =
  Remaining extends `${infer C}${infer Rest}` ?
    C extends "\\" ?
      Rest extends `${infer Escaped}${infer Rest}` ?
        ExtractStringLiteral<QuoteStyle, Rest, `${Result}${C}${Escaped}`>
      : never
    : C extends QuoteStyle ? [Result, Rest]
    : ExtractStringLiteral<QuoteStyle, Rest, `${Result}${C}`>
  : never;

// Get the first number literal and the remaining string of the input.
type ExtractNumberLiteral<Remaining extends string, Result extends string = ""> =
  Remaining extends `${infer C}${infer Rest}` ?
    C extends "_" ? ExtractNumberLiteral<Rest, Result>
    : C extends `${Digit}` ? ExtractNumberLiteral<Rest, `${Result}${C}`>
    : [_StringToNumber<Result>, Remaining]
  : [_StringToNumber<Result>, Remaining];
type _StringToNumber<S extends string> = S extends `${infer N extends number}` ? N : never;

type Tokenize<S extends string> = _Tokenize<S, []>;
type _Tokenize<Remaining extends string, Tokens extends Token[]> =
  Remaining extends "" ? Tokens
  : Remaining extends `${infer C}${infer Rest}` ?
    C extends BlankChar ? _Tokenize<Rest, Tokens>
    : C extends Letter | "_" ?
      ExtractIdentifier<Remaining> extends (
        [infer Identifier extends string, infer Rest extends string]
      ) ?
        _Tokenize<
          Rest,
          [
            ...Tokens,
            Identifier extends Keyword ? { type: "Keyword"; value: Identifier }
            : { type: "Identifier"; value: Identifier },
          ]
        >
      : never
    : C extends '"' | "'" ?
      ExtractStringLiteral<C, Rest> extends (
        [infer StringLiteral extends string, infer Rest extends string]
      ) ?
        _Tokenize<Rest, [...Tokens, { type: "StringLiteral"; value: StringLiteral }]>
      : never
    : C extends `${Digit}` ?
      ExtractNumberLiteral<Remaining> extends (
        [infer NumberLiteral extends number, infer Rest extends string]
      ) ?
        _Tokenize<Rest, [...Tokens, { type: "NumberLiteral"; value: NumberLiteral }]>
      : never
    : C extends Operator ? _Tokenize<Rest, [...Tokens, { type: "Operator"; value: C }]>
    : C extends Punctuation ? _Tokenize<Rest, [...Tokens, { type: "Punctuation"; value: C }]>
    : _Tokenize<Rest, [...Tokens, { type: "Unknown"; value: C }]>
  : never;

/**********
 * Parser *
 **********/
export type Parse<S extends string> = _Parse<Tokenize<S>, []>;
type _Parse<Tokens extends Token[], Result extends unknown[]> =
  Tokens extends [infer T extends Token, ...infer Rest extends Token[]] ?
    T extends { type: "Keyword"; value: "var" | "let" | "const" } ?
      Rest extends [{ type: "Identifier"; value: infer Id }, ...infer Rest extends Token[]] ?
        _Parse<Rest, [...Result, { id: Id; type: "VariableDeclaration" }]>
      : never
    : Rest extends [{ type: "Punctuation"; value: "(" }, ...infer Rest] ?
      Rest extends [{ type: "Identifier"; value: infer Argument }, ...infer Rest extends Token[]] ?
        _Parse<Rest, [...Result, { argument: Argument; type: "CallExpression" }]>
      : never
    : _Parse<Rest, Result>
  : Result;
