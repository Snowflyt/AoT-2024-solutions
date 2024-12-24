/*************
 * Utilities *
 *************/
/** Represent a value that may not exist. */
export type MaybeResult = { success: true; data: unknown } | { success: false };

/*********************
 * Mapper and Parser *
 *********************/
export interface Mapper<T = unknown> {
  data: T;
}
type ApplyMapper<M, Data> =
  M & { data: Data } extends { map: (...args: any) => infer R } ? R : never;

/**
 * A parser that accepts a string and returns a {@linkcode ParsingResult}.
 */
export type Parser = { tag: string } | (() => Parser);
type ParsingResult = { success: true; data: unknown; rest: string } | { success: false };

/**************************
 * Parser implementations *
 **************************/
export type Parse<A, B> =
  A extends Parser ?
    B extends string ?
      ApplyParser<A, B>
    : never
  : BuildParser<A, B>;
type ApplyParser<P extends Parser, S extends string> =
  // If `A` is a lazied parser, extract the parser and recursively call `Parse` with it
  P extends (() => infer P extends Parser) ? ApplyParser<P, S>
  : // Otherwise, apply the parser
  P extends { tag: "EOF" } ? ParseEOF<S>
  : P extends { tag: "Choice"; parsers: infer Parsers extends Parser[] } ? ParseChoice<S, Parsers>
  : P extends { tag: "Just"; token: infer Token extends string } ? ParseJust<S, Token>
  : P extends { tag: "Many0"; parser: infer P extends Parser } ? ParseMany0<S, P>
  : P extends { tag: "Many1"; parser: infer P extends Parser } ? ParseMany1<S, P>
  : P extends (
    { tag: "MapResult"; parser: infer P extends Parser; mappers: infer Mappers extends Mapper[] }
  ) ?
    ParseMapResult<S, P, Mappers>
  : P extends { tag: "Maybe"; parser: infer P extends Parser } ? ParseMaybe<S, P>
  : P extends { tag: "NoneOf"; token: infer Token extends string } ? ParseNoneOf<S, Token>
  : P extends { tag: "Pair"; left: infer L extends Parser; right: infer R extends Parser } ?
    ParsePair<S, L, R>
  : P extends { tag: "Seq"; parsers: infer Parsers extends Parser[] } ? ParseSeq<S, Parsers>
  : P extends { tag: "Left"; left: infer L extends Parser; right: infer R extends Parser } ?
    ParseLeft<S, L, R>
  : P extends { tag: "Right"; left: infer L extends Parser; right: infer R extends Parser } ?
    ParseRight<S, L, R>
  : P extends (
    { tag: "SepBy0"; parser: infer P extends Parser; separator: infer Sep extends Parser }
  ) ?
    ParseSepBy0<S, P, Sep>
  : never;
type BuildParser<Id, T> =
  Id extends { id: "Choice" } ? { tag: "Choice"; parsers: T }
  : Id extends { id: "Just" } ? { tag: "Just"; token: T }
  : Id extends { id: "Many0" } ? { tag: "Many0"; parser: T }
  : Id extends { id: "Many1" } ? { tag: "Many1"; parser: T }
  : Id extends { id: "MapResult" } ?
    T extends [infer P, ...infer MS] ?
      { tag: "MapResult"; parser: P; mappers: MS }
    : never
  : Id extends { id: "Maybe" } ? { tag: "Maybe"; parser: T }
  : Id extends { id: "NoneOf" } ? { tag: "NoneOf"; token: T }
  : Id extends { id: "Pair" } ?
    T extends [unknown, unknown] ?
      { tag: "Pair"; left: T[0]; right: T[1] }
    : never
  : Id extends { id: "Seq" } ? { tag: "Seq"; parsers: T }
  : Id extends { id: "Left" } ?
    T extends [unknown, unknown] ?
      { tag: "Left"; left: T[0]; right: T[1] }
    : never
  : Id extends { id: "Right" } ?
    T extends [unknown, unknown] ?
      { tag: "Right"; left: T[0]; right: T[1] }
    : never
  : Id extends { id: "SepBy0" } ?
    T extends [unknown, unknown] ?
      { tag: "SepBy0"; parser: T[0]; separator: T[1] }
    : never
  : never;

/**
 * Matches the end of the input string and returns a success if it is reached, or a failure if there
 * are still characters left.
 */
export type EOF = { tag: "EOF" };
type ParseEOF<Remaining extends string> =
  Remaining extends "" ? { success: true; data: null; rest: "" } : { success: false };

/**
 * Tries a list of parsers in order, returning the result of the first successful one, or a failure
 * if none of them succeed.
 */
export type Choice = { id: "Choice" };
type ParseChoice<Remaining extends string, Parsers extends Parser[]> =
  Parsers extends [infer Head extends Parser, ...infer Tail extends Parser[]] ?
    ApplyParser<Head, Remaining> extends (
      { success: true; data: infer Data; rest: infer Rest extends string }
    ) ?
      { success: true; data: Data; rest: Rest }
    : ParseChoice<Remaining, Tail>
  : { success: false };

/**
 * Matches a single character (or token) from the input string and returns it.
 */
export type Just = { id: "Just" };
type ParseJust<Remaining extends string, Token extends string> =
  Remaining extends `${infer S extends Token}${infer Rest}` ? { success: true; data: S; rest: Rest }
  : { success: false };

/**
 * Matches zero or more occurrences of a parser and returns a list of the results.
 */
export type Many0 = { id: "Many0" };
type ParseMany0<Remaining extends string, P extends Parser, Result extends unknown[] = []> =
  ApplyParser<P, Remaining> extends (
    { success: true; data: infer Data; rest: infer Rest extends string }
  ) ?
    ParseMany0<Rest, P, [...Result, Data]>
  : { success: true; data: Result; rest: Remaining };

/**
 * Matches one or more occurrences of a parser and returns a list of the results.
 */
export type Many1 = { id: "Many1" };
type ParseMany1<Remaining extends string, P extends Parser, Result extends unknown[] = []> =
  ApplyParser<P, Remaining> extends (
    { success: true; data: infer Data; rest: infer Rest extends string }
  ) ?
    ParseMany1<Rest, P, [...Result, Data]>
  : Result extends [] ? { success: false }
  : { success: true; data: Result; rest: Remaining };

/**
 * Matches a parser and then applies a list of mappers to the result.
 */
export type MapResult = { id: "MapResult" };
type ParseMapResult<Remaining extends string, P extends Parser, Mappers extends Mapper[]> =
  ApplyParser<P, Remaining> extends (
    { success: true; data: infer Data; rest: infer Rest extends string }
  ) ?
    { success: true; data: CallMappers<Mappers, Data>; rest: Rest }
  : { success: false };
type CallMappers<MS, Data> =
  MS extends [infer Head, ...infer Tail] ? CallMappers<Tail, ApplyMapper<Head, Data>> : Data;

/**
 * Matches 0 or 1 occurrence of a parser and returns the result in a {@linkcode MaybeResult}.
 */
export type Maybe = { id: "Maybe" };
type ParseMaybe<Remaining extends string, P extends Parser> =
  ApplyParser<P, Remaining> extends (
    { success: true; data: infer Data; rest: infer Rest extends string }
  ) ?
    { success: true; data: { success: true; data: Data }; rest: Rest }
  : { success: true; data: { success: false }; rest: Remaining };

/**
 * Matches a single character that does not extend the given token and returns it.
 */
export type NoneOf = { id: "NoneOf" };
type ParseNoneOf<Remaining extends string, Token extends string> =
  Remaining extends `${infer Char}${infer Rest}` ?
    Char extends Token ?
      { success: false }
    : { success: true; data: Char; rest: Rest }
  : { success: false };

/**
 * Matches 2 parsers and returns a pair of the results.
 *
 * It is actually a special case of {@linkcode Seq} but is separated for better readability.
 */
export type Pair = { id: "Pair" };
type ParsePair<Remaining extends string, L extends Parser, R extends Parser> =
  ApplyParser<L, Remaining> extends (
    { success: true; data: infer Left; rest: infer Rest extends string }
  ) ?
    ApplyParser<R, Rest> extends (
      { success: true; data: infer Right; rest: infer Rest2 extends string }
    ) ?
      { success: true; data: [Left, Right]; rest: Rest2 }
    : { success: false }
  : { success: false };

/**
 * Matches a list of parsers and returns a list of the results.
 */
export type Seq = { id: "Seq" };
type ParseSeq<Remaining extends string, PS extends Parser[], Result extends unknown[] = []> =
  PS extends [infer Head extends Parser, ...infer Tail extends Parser[]] ?
    ApplyParser<Head, Remaining> extends (
      { success: true; data: infer Data; rest: infer Rest extends string }
    ) ?
      ParseSeq<Rest, Tail, [...Result, Data]>
    : { success: false }
  : { success: true; data: Result; rest: Remaining };

/**
 * Matches 2 parsers and returns the result of the first one.
 */
export type Left = { id: "Left" };
type ParseLeft<Remaining extends string, L extends Parser, R extends Parser> =
  ApplyParser<L, Remaining> extends (
    { success: true; data: infer Left; rest: infer Rest extends string }
  ) ?
    ApplyParser<R, Rest> extends { success: true; rest: infer Rest2 extends string } ?
      { success: true; data: Left; rest: Rest2 }
    : { success: false }
  : { success: false };

/**
 * Matches 2 parsers and returns the result of the second one.
 */
export type Right = { id: "Right" };
type ParseRight<Remaining extends string, L extends Parser, R extends Parser> =
  ApplyParser<L, Remaining> extends { success: true; rest: infer Rest extends string } ?
    ApplyParser<R, Rest> extends (
      { success: true; data: infer Right; rest: infer Rest2 extends string }
    ) ?
      { success: true; data: Right; rest: Rest2 }
    : { success: false }
  : { success: false };

/**
 * Matches 0 or more occurrences of a parser separated by another parser and returns a list of the
 * results.
 */
export type SepBy0 = { id: "SepBy0" };
type ParseSepBy0<Remaining extends string, P extends Parser, Sep extends Parser> =
  // If the first parser succeeds, try to parse [Sep, P] repeatedly
  ApplyParser<P, Remaining> extends (
    { success: true; data: infer Data; rest: infer Rest extends string }
  ) ?
    ParseSepBy0Rest<Rest, P, Sep, [Data]> extends [infer Result, infer Rest2] ?
      { success: true; data: Result; rest: Rest2 }
    : never
  : // If the first parser fails, return an empty list.
    { success: true; data: []; rest: Remaining };
// Parse [Sep, P] repeatedly
type ParseSepBy0Rest<
  Remaining extends string,
  P extends Parser,
  Sep extends Parser,
  Result extends unknown[],
> =
  ApplyParser<Sep, Remaining> extends { success: true; rest: infer Rest extends string } ?
    ApplyParser<P, Rest> extends (
      { success: true; data: infer Data; rest: infer Rest2 extends string }
    ) ?
      ParseSepBy0Rest<Rest2, P, Sep, [...Result, Data]>
    : [Result, Remaining]
  : [Result, Remaining];
