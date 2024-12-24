/**
 * This file contains solutions to the [modified version](./24-modified.question.md) of the problem.
 *
 * For the original problem, see `./24.ts`.
 */

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
type CallMapper<M, Data> =
  M & { data: Data } extends { map: (...args: any) => infer R } ? R : never;

/**
 * A parser is a {@linkcode Mapper} that accepts a string and returns a {@linkcode ParsingResult}.
 */
export interface Parser extends Mapper<string> {}
type ParsingResult = { success: true; data: unknown; rest: string } | { success: false };

/**************************
 * Parser implementations *
 **************************/
export type Parse<P extends Parser, S extends string> =
  P extends (() => infer P extends Parser) ? Parse<P, S> : CallMapper<P, S>;

/**
 * Matches the end of the input string and returns a success if it is reached, or a failure if there
 * are still characters left.
 */
export interface EOF extends Parser {
  map: (remaining: this["data"]) => DoEOF<typeof remaining>;
}
type DoEOF<Remaining extends string> =
  Remaining extends "" ? { success: true; data: null; rest: "" } : { success: false };

/**
 * Tries a list of parsers in order, returning the result of the first successful one, or a failure
 * if none of them succeed.
 */
export interface Choice<Parsers extends Parser[]> extends Parser {
  map: (remaining: this["data"]) => ParseChoice<typeof remaining, Parsers>;
}
type ParseChoice<Remaining extends string, Parsers> =
  Parsers extends [infer Head extends Parser, ...infer Tail] ?
    Parse<Head, Remaining> extends (
      { success: true; data: infer Data; rest: infer Rest extends string }
    ) ?
      { success: true; data: Data; rest: Rest }
    : ParseChoice<Remaining, Tail>
  : { success: false };

/**
 * Matches a single character (or token) from the input string and returns it.
 */
export interface Just<Token extends string> extends Parser {
  map: (remaining: this["data"]) => ParseJust<typeof remaining, Token>;
}
type ParseJust<Remaining extends string, Token extends string> =
  Remaining extends `${infer S extends Token}${infer Rest}` ? { success: true; data: S; rest: Rest }
  : { success: false };

/**
 * Matches zero or more occurrences of a parser and returns a list of the results.
 */
export interface Many0<P extends Parser> extends Parser {
  map: (remaining: this["data"]) => ParseMany0<typeof remaining, P>;
}
type ParseMany0<Remaining extends string, P extends Parser, Result extends unknown[] = []> =
  Parse<P, Remaining> extends { success: true; data: infer Data; rest: infer Rest extends string } ?
    ParseMany0<Rest, P, [...Result, Data]>
  : { success: true; data: Result; rest: Remaining };

/**
 * Matches one or more occurrences of a parser and returns a list of the results.
 */
export interface Many1<P extends Parser> extends Parser {
  map: (remaining: this["data"]) => ParseMany1<typeof remaining, P>;
}
type ParseMany1<Remaining extends string, P extends Parser, Result extends unknown[] = []> =
  Parse<P, Remaining> extends { success: true; data: infer Data; rest: infer Rest extends string } ?
    ParseMany1<Rest, P, [...Result, Data]>
  : Result extends [] ? { success: false }
  : { success: true; data: Result; rest: Remaining };

/**
 * Matches a parser and then applies a list of mappers to the result.
 */
export interface MapResult<P extends Parser, Mappers extends Mapper[]> extends Parser {
  map: (remaining: this["data"]) => ParseMapResult<typeof remaining, P, Mappers>;
}
type ParseMapResult<Remaining extends string, P extends Parser, Mappers extends Mapper[]> =
  Parse<P, Remaining> extends { success: true; data: infer Data; rest: infer Rest extends string } ?
    { success: true; data: CallMappers<Mappers, Data>; rest: Rest }
  : { success: false };
type CallMappers<MS, Data> =
  MS extends [infer Head, ...infer Tail] ? CallMappers<Tail, CallMapper<Head, Data>> : Data;

/**
 * Matches 0 or 1 occurrence of a parser and returns the result in a {@linkcode MaybeResult}.
 */
export interface Maybe<P extends Parser> extends Parser {
  map: (remaining: this["data"]) => ParseMaybe<typeof remaining, P>;
}
type ParseMaybe<Remaining extends string, P extends Parser> =
  Parse<P, Remaining> extends { success: true; data: infer Data; rest: infer Rest extends string } ?
    { success: true; data: { success: true; data: Data }; rest: Rest }
  : { success: true; data: { success: false }; rest: Remaining };

/**
 * Matches a single character that does not extend the given token and returns it.
 */
export interface NoneOf<Token extends string> extends Parser {
  map: (remaining: this["data"]) => ParseNoneOf<typeof remaining, Token>;
}
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
export interface Pair<L extends Parser, R extends Parser> extends Parser {
  map: (remaining: this["data"]) => ParsePair<typeof remaining, L, R>;
}
type ParsePair<Remaining extends string, L extends Parser, R extends Parser> =
  Parse<L, Remaining> extends { success: true; data: infer Left; rest: infer Rest extends string } ?
    Parse<R, Rest> extends { success: true; data: infer Right; rest: infer Rest2 extends string } ?
      { success: true; data: [Left, Right]; rest: Rest2 }
    : { success: false }
  : { success: false };

/**
 * Matches a list of parsers and returns a list of the results.
 */
export interface Seq<Parsers extends Parser[]> extends Parser {
  map: (remaining: this["data"]) => ParseSeq<typeof remaining, Parsers>;
}
type ParseSeq<Remaining extends string, Parsers extends Parser[], Result extends unknown[] = []> =
  Parsers extends [infer Head extends Parser, ...infer Tail extends Parser[]] ?
    Parse<Head, Remaining> extends (
      { success: true; data: infer Data; rest: infer Rest extends string }
    ) ?
      ParseSeq<Rest, Tail, [...Result, Data]>
    : { success: false }
  : { success: true; data: Result; rest: Remaining };

/**
 * Matches 2 parsers and returns the result of the first one.
 */
export interface Left<L extends Parser, R extends Parser> extends Parser {
  map: (remaining: this["data"]) => ParseLeft<typeof remaining, L, R>;
}
type ParseLeft<Remaining extends string, L extends Parser, R extends Parser> =
  Parse<L, Remaining> extends { success: true; data: infer Left; rest: infer Rest extends string } ?
    Parse<R, Rest> extends { success: true; rest: infer Rest2 extends string } ?
      { success: true; data: Left; rest: Rest2 }
    : { success: false }
  : { success: false };

/**
 * Matches 2 parsers and returns the result of the second one.
 */
export interface Right<L extends Parser, R extends Parser> extends Parser {
  map: (remaining: this["data"]) => ParseRight<typeof remaining, L, R>;
}
type ParseRight<Remaining extends string, L extends Parser, R extends Parser> =
  Parse<L, Remaining> extends { success: true; rest: infer Rest extends string } ?
    Parse<R, Rest> extends { success: true; data: infer Right; rest: infer Rest2 extends string } ?
      { success: true; data: Right; rest: Rest2 }
    : { success: false }
  : { success: false };

/**
 * Matches 0 or more occurrences of a parser separated by another parser and returns a list of the
 * results.
 */
export interface SepBy0<P extends Parser, Sep extends Parser> extends Parser {
  map: (remaining: this["data"]) => ParseSepBy0<typeof remaining, P, Sep>;
}
type ParseSepBy0<Remaining extends string, P extends Parser, Sep extends Parser> =
  // If the first parser succeeds, try to parse [Sep, P] repeatedly
  Parse<P, Remaining> extends { success: true; data: infer Data; rest: infer Rest extends string } ?
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
  Parse<Sep, Remaining> extends { success: true; rest: infer Rest extends string } ?
    Parse<P, Rest> extends { success: true; data: infer Data; rest: infer Rest2 extends string } ?
      ParseSepBy0Rest<Rest2, P, Sep, [...Result, Data]>
    : [Result, Remaining]
  : [Result, Remaining];
