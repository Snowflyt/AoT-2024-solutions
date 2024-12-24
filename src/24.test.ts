import { beFalse, describe, equal, expect, it } from "typroof";

import type {
  Choice,
  EOF,
  Just,
  Left,
  Many0,
  Many1,
  MapResult,
  Mapper,
  Maybe,
  MaybeResult,
  NoneOf,
  Pair,
  Parse,
  Parser,
  Right,
  SepBy0,
  Seq,
} from "./24";

describe("IntParser", () => {
  it("should parse only integers and return the rest of the string", () => {
    expect<Parse<IntParser, "123.4ff">>().to(equal<{ data: 123; rest: ".4ff"; success: true }>);
  });
});

describe("JSONParser", () => {
  it("should parse JSON strings", () => {
    expect<Parse<JSONParser, '"hello"'>["data"]>().to(equal<"hello">);
  });

  it("should parse JSON strings with escape characters", () => {
    expect<Parse<JSONParser, '"hello\\nworld"'>["data"]>().to(equal<"hello\nworld">);
  });

  it("should parse simple JSON objects", () => {
    expect<Parse<JSONParser, '{"hello": "world"}'>["data"]>().to(equal<{ hello: "world" }>);
  });

  it("should parse JSON arrays", () => {
    expect<Parse<JSONParser, '[1, "hello", null, 4, "world"]'>["data"]>().to(
      equal<[1, "hello", null, 4, "world"]>,
    );
  });

  it("should parse nested JSON objects", () => {
    expect<Parse<JSONParser, '{ "a": { "b": "c" } }'>["data"]>().to(equal<{ a: { b: "c" } }>);
  });

  it("should parse JSON arrays of objects", () => {
    expect<Parse<JSONParser, '[{"foo": "bar"}, {"foo": "baz"}, {"foo": 123}]'>["data"]>().to(
      equal<[{ foo: "bar" }, { foo: "baz" }, { foo: 123 }]>,
    );
  });

  it("should not parse invalid JSON", () => {
    expect<Parse<JSONParser, "[1, 2, 3">["success"]>().to(beFalse);
    expect<Parse<JSONParser, "{ foo: 123 }">["success"]>().to(beFalse);
    expect<Parse<JSONParser, "{">["success"]>().to(beFalse);
    expect<Parse<JSONParser, "[1, 2, 3,]">["success"]>().to(beFalse);
    expect<Parse<JSONParser, "\\,">["success"]>().to(beFalse);
  });
});

/****************
 * Base Parsers *
 ****************/
type Whitespace = " " | "\t" | "\n";

type Whitespace0 = Parse<Many0, Parse<Just, Whitespace>>;

type Digit = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";

type Digits0 = Parse<Many0, Parse<Just, Digit>>;
type Digits1 = Parse<Many1, Parse<Just, Digit>>;

type Between<L extends Parser, R extends Parser, P extends Parser> = Parse<
  Left,
  [Parse<Right, [L, P]>, R]
>;

type Str<T extends string, Acc extends Parser[] = []> =
  T extends `${infer Head}${infer Rest}` ? Str<Rest, [...Acc, Parse<Just, Head>]>
  : Parse<MapResult, [Parse<Seq, Acc>, Join]>;

type Padded<P extends Parser> = Parse<Left, [P, Whitespace0]>;

type Sym<T extends string> = Padded<Str<T>>;

/**************
 * Int Parser *
 **************/
type DigitParser = Parse<Just, Digit>;
type IntParser = Parse<MapResult, [Parse<Many1, DigitParser>, Join, StringToNumber]>;

/***************
 * JSON Parser *
 ***************/
type JSONParser = Between<Whitespace0, EOF, JSONValueParser>;

type JSONValueParser = () => Padded<
  Parse<
    Choice,
    [
      JSONNullParser,
      JSONBooleanParser,
      JSONStringParser,
      JSONNumberParser,
      JSONArrayParser,
      JSONObjectParser,
    ]
  >
>;

// `null`
type JSONNullParser = Parse<MapResult, [Str<"null">, ToLiteral<null>]>;

// boolean
type JSONBooleanParser = Parse<
  Choice,
  [
    Parse<MapResult, [Str<"true">, ToLiteral<true>]>,
    Parse<MapResult, [Str<"false">, ToLiteral<false>]>,
  ]
>;

// string
type JSONStringParser = Parse<
  MapResult,
  [
    Between<
      Parse<Just, '"'>,
      Parse<Just, '"'>,
      Parse<
        Many0,
        Parse<
          Choice,
          [
            Parse<NoneOf, '"' | "\\">,
            Parse<
              Right,
              [
                Parse<Just, "\\">,
                Parse<
                  Choice,
                  [
                    Parse<Just, "\\">,
                    Parse<Just, "/">,
                    Parse<Just, '"'>,
                    Parse<MapResult, [Parse<Just, "b">, ToLiteral<"\u0008">]>,
                    Parse<MapResult, [Parse<Just, "f">, ToLiteral<"\u000c">]>,
                    Parse<MapResult, [Parse<Just, "n">, ToLiteral<"\n">]>,
                    Parse<MapResult, [Parse<Just, "r">, ToLiteral<"\r">]>,
                    Parse<MapResult, [Parse<Just, "t">, ToLiteral<"\t">]>,
                  ]
                >,
              ]
            >,
          ]
        >
      >
    >,
    Join,
  ]
>;

// number
type JSONNumberParser = Parse<
  MapResult,
  [
    Parse<
      Seq,
      [
        Parse<Maybe, Parse<Just, "-">>,
        Parse<Choice, [Parse<Just, "0">, Parse<Pair, [Parse<Just, Exclude<Digit, "0">>, Digits0]>]>,
        Parse<Maybe, Parse<Pair, [Parse<Just, ".">, Digits1]>>,
      ]
    >,
    UnwrapMaybe,
    Flatten,
    Join,
    StringToNumber,
  ]
>;

// array
type JSONArrayParser = Between<Sym<"[">, Sym<"]">, Parse<SepBy0, [JSONValueParser, Sym<",">]>>;

// object
type JSONObjectParser = Between<
  Sym<"{">,
  Sym<"}">,
  Parse<
    MapResult,
    [
      Parse<
        SepBy0,
        [
          Parse<
            MapResult,
            [
              Parse<Pair, [Parse<Left, [Padded<JSONStringParser>, Sym<":">]>, JSONValueParser]>,
              MakeObject,
            ]
          >,
          Sym<",">,
        ]
      >,
      IntersectAll,
    ]
  >
>;

/***********
 * Mappers *
 ***********/
interface ToLiteral<T> extends Mapper {
  map: () => T;
}

interface Flatten extends Mapper {
  map: (data: this["data"]) => typeof data extends unknown[] ? DoFlatten<typeof data> : never;
}

type DoFlatten<Array extends readonly unknown[]> =
  Array extends [infer Head, ...infer Rest] ?
    Head extends readonly unknown[] ?
      [...DoFlatten<Head>, ...DoFlatten<Rest>]
    : [Head, ...DoFlatten<Rest>]
  : [];

interface UnwrapMaybe extends Mapper {
  map: (data: this["data"]) => typeof data extends unknown[] ? DoUnwrapMaybe<typeof data> : never;
}

type DoUnwrapMaybe<T extends unknown[], Acc extends unknown[] = []> =
  T extends [infer Head, ...infer Rest] ?
    DoUnwrapMaybe<
      Rest,
      Head extends MaybeResult ?
        Head extends { success: true; data: infer Data } ?
          [...Acc, Data]
        : Acc
      : [...Acc, Head]
    >
  : Acc;

interface StringToNumber extends Mapper {
  map: (data: this["data"]) => typeof data extends string ? DoStringToNumber<typeof data> : never;
}

type DoStringToNumber<T extends string> = T extends `${infer N extends number}` ? N : never;

interface MakeObject extends Mapper {
  map: (
    data: this["data"],
  ) => typeof data extends [PropertyKey, unknown] ? { [Key in (typeof data)[0]]: (typeof data)[1] }
  : never;
}

interface IntersectAll extends Mapper {
  map: (data: this["data"]) => typeof data extends object[] ? DoIntersectAll<typeof data> : never;
}

type DoIntersectAll<T extends object[], Acc extends object = {}> =
  T extends [infer Head, ...infer Rest extends object[]] ? DoIntersectAll<Rest, Acc & Head>
  : Omit<Acc, never>;

export interface Join extends Mapper {
  map: (data: this["data"]) => typeof data extends string[] ? DoJoin<typeof data> : never;
}

type DoJoin<T extends string[], Acc extends string = ""> =
  T extends [infer Head extends string, ...infer Rest extends string[]] ?
    DoJoin<Rest, `${Acc}${Head}`>
  : Acc;
