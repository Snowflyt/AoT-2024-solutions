/**
 * This solution uses higher-kinded types (HKT) to implement parser combinators, instead of
 * implementing the logic to apply each parser directly in the `Parse` type.
 *
 * For a simpler version that is (possibly) easier to understand, see `./24.ts`.
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
type ApplyMapper<M, Data> =
  M & { data: Data } extends { map: (...args: any) => infer R } ? R : never;

/**
 * A parser can be an {@linkcode EagerParser} which is literally a {@linkcode Mapper} that accepts a
 * string and returns a {@linkcode ParsingResult}, or a lazied one which is a function that returns
 * a {@linkcode Parser}.
 */
export type Parser = EagerParser | (() => Parser);
interface EagerParser extends Mapper<string> {}
type ParsingResult = { success: true; data: unknown; rest: string } | { success: false };
type ApplyParser<P, Data> = P extends () => infer P ? ApplyParser<P, Data> : ApplyMapper<P, Data>;

/**************************
 * Parser implementations *
 **************************/
export type Parse<A, B> = A extends Parser ? ApplyParser<A, B> : BuildParser<A, B>;
type BuildParser<Id, T> =
  Id extends Choice ? ChoiceParser<T>
  : Id extends Just ? JustParser<T>
  : Id extends Many0 ? Many0Parser<T>
  : Id extends Many1 ? Many1Parser<T>
  : Id extends MapResult ? MapResultParser<T>
  : Id extends Maybe ? MaybeParser<T>
  : Id extends NoneOf ? NoneOfParser<T>
  : Id extends Pair ? PairParser<T>
  : Id extends Seq ? SeqParser<T>
  : Id extends Left ? LeftParser<T>
  : Id extends Right ? RightParser<T>
  : Id extends SepBy0 ? SepBy0Parser<T>
  : never;

/**
 * Matches the end of the input string and returns a success if it is reached, or a failure if there
 * are still characters left.
 */
export interface EOF extends EagerParser {
  map: (remaining: this["data"]) => ParseEOF<typeof remaining>;
}
type ParseEOF<Remaining extends string> =
  Remaining extends "" ? { success: true; data: null; rest: "" } : { success: false };

/**
 * Tries a list of parsers in order, returning the result of the first successful one, or a failure
 * if none of them succeed.
 */
export type Choice = { id: "Choice" };
interface ChoiceParser<PS> extends EagerParser {
  map: (remaining: this["data"]) => ParseChoice<typeof remaining, PS>;
}
type ParseChoice<Remaining extends string, PS> =
  PS extends [infer Head, ...infer Tail] ?
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
interface JustParser<Token> extends EagerParser {
  map: (
    remaining: this["data"],
  ) => [Token] extends [string] ? ParseJust<typeof remaining, Token> : never;
}
type ParseJust<Remaining extends string, Token extends string> =
  Remaining extends `${infer S extends Token}${infer Rest}` ? { success: true; data: S; rest: Rest }
  : { success: false };

/**
 * Matches zero or more occurrences of a parser and returns a list of the results.
 */
export type Many0 = { id: "Many0" };
interface Many0Parser<P> extends EagerParser {
  map: (remaining: this["data"]) => ParseMany0<typeof remaining, P>;
}
type ParseMany0<Remaining extends string, P, Result extends unknown[] = []> =
  ApplyParser<P, Remaining> extends (
    { success: true; data: infer Data; rest: infer Rest extends string }
  ) ?
    ParseMany0<Rest, P, [...Result, Data]>
  : { success: true; data: Result; rest: Remaining };

/**
 * Matches one or more occurrences of a parser and returns a list of the results.
 */
export type Many1 = { id: "Many1" };
interface Many1Parser<P> extends EagerParser {
  map: (remaining: this["data"]) => ParseMany1<typeof remaining, P>;
}
type ParseMany1<Remaining extends string, P, Result extends unknown[] = []> =
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
interface MapResultParser<ParserAndMappers> extends EagerParser {
  map: (
    remaining: this["data"],
  ) => ParserAndMappers extends [infer P, ...infer MS] ? ParseMapResult<typeof remaining, P, MS>
  : never;
}
type ParseMapResult<Remaining extends string, P, MS> =
  ApplyParser<P, Remaining> extends (
    { success: true; data: infer Data; rest: infer Rest extends string }
  ) ?
    { success: true; data: PipeMappers<Data, MS>; rest: Rest }
  : { success: false };
type PipeMappers<Data, MS> =
  MS extends [infer Head, ...infer Tail] ? PipeMappers<ApplyMapper<Head, Data>, Tail> : Data;

/**
 * Matches 0 or 1 occurrence of a parser and returns the result in a {@linkcode MaybeResult}.
 */
export type Maybe = { id: "Maybe" };
interface MaybeParser<P> extends EagerParser {
  map: (remaining: this["data"]) => ParseMaybe<typeof remaining, P>;
}
type ParseMaybe<Remaining extends string, P> =
  ApplyParser<P, Remaining> extends (
    { success: true; data: infer Data; rest: infer Rest extends string }
  ) ?
    { success: true; data: { success: true; data: Data }; rest: Rest }
  : { success: true; data: { success: false }; rest: Remaining };

/**
 * Matches a single character that does not extend the given token and returns it.
 */
export type NoneOf = { id: "NoneOf" };
interface NoneOfParser<Token> extends EagerParser {
  map: (
    remaining: this["data"],
  ) => [Token] extends [string] ? ParseNoneOf<typeof remaining, Token> : never;
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
export type Pair = { id: "Pair" };
interface PairParser<LR> extends EagerParser {
  map: (
    remaining: this["data"],
  ) => LR extends [infer L, infer R] ? ParsePair<typeof remaining, L, R> : never;
}
type ParsePair<Remaining extends string, L, R> =
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
interface SeqParser<PS> extends EagerParser {
  map: (remaining: this["data"]) => ParseSeq<typeof remaining, PS>;
}
type ParseSeq<Remaining extends string, PS, Result extends unknown[] = []> =
  PS extends [infer Head, ...infer Tail] ?
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
interface LeftParser<LR> extends EagerParser {
  map: (
    remaining: this["data"],
  ) => LR extends [infer L, infer R] ? ParseLeft<typeof remaining, L, R> : never;
}
type ParseLeft<Remaining extends string, L, R> =
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
interface RightParser<LR> extends EagerParser {
  map: (
    remaining: this["data"],
  ) => LR extends [infer L, infer R] ? ParseRight<typeof remaining, L, R> : never;
}
type ParseRight<Remaining extends string, L, R> =
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
interface SepBy0Parser<PAndSep> extends EagerParser {
  map: (
    remaining: this["data"],
  ) => PAndSep extends [infer P, infer Sep] ? ParseSepBy0<typeof remaining, P, Sep> : never;
}
type ParseSepBy0<Remaining extends string, P, Sep> =
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
type ParseSepBy0Rest<Remaining extends string, P, Sep, Result extends unknown[]> =
  ApplyParser<Sep, Remaining> extends { success: true; rest: infer Rest extends string } ?
    ApplyParser<P, Rest> extends (
      { success: true; data: infer Data; rest: infer Rest2 extends string }
    ) ?
      ParseSepBy0Rest<Rest2, P, Sep, [...Result, Data]>
    : [Result, Remaining]
  : [Result, Remaining];
