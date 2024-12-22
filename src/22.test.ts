import { describe, equal, expect, it } from "typroof";

import type { Parse } from "./22";

describe("Parse", () => {
  it("should parse a JSON string", () => {
    expect<
      Parse<`{
        "a": 1, 
        "b": false, 
        "c": [
          true,
          false,
          "hello",
          {
            "a": "b",
            "b": false
          },
        ],
        "nil": null,
      }`>
    >().to(
      equal<{
        a: 1;
        b: false;
        c: [
          true,
          false,
          "hello",
          {
            a: "b";
            b: false;
          },
        ];
        nil: null;
      }>,
    );
  });

  it("should parse simple JSON strings", () => {
    expect<Parse<"1">>().to(equal<1>);
    expect<Parse<"{}">>().to(equal<{}>);
    expect<Parse<"[]">>().to(equal<[]>);
    expect<Parse<"[1]">>().to(equal<[1]>);
    expect<Parse<"true">>().to(equal<true>);
    expect<Parse<'["Hello", true, false, null]'>>().to(equal<["Hello", true, false, null]>);
  });

  it("should preserve blank characters in strings", () => {
    expect<
      Parse<`{
        "hello\\r\\n\\b\\f": "world",
      }`>
    >().to(equal<{ "hello\r\n\b\f": "world" }>);
  });

  it("should parse number keys", () => {
    expect<Parse<'{ 1: "world" }'>>().to(equal<{ 1: "world" }>);
  });

  it("should ignore blank characters that are not part of a string", () => {
    expect<
      Parse<`{
        "altitude": 123,
        "warnings": [
          "low_fuel",\t\n
          "strong_winds",
        ],
      }`>
    >().to(equal<{ altitude: 123; warnings: ["low_fuel", "strong_winds"] }>);
  });
});
