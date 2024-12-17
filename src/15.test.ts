import { describe, equal, expect, it } from "typroof";

import type { GetRoute } from "./15";

describe("GetRoute", () => {
  it("should parse a route string into a tuple of pairs of locations and distances", () => {
    expect<GetRoute<"north_pole--candycane_forest----gumdrop_sea-------hawaii">>().to(
      equal<[["north_pole", 0], ["candycane_forest", 2], ["gumdrop_sea", 4], ["hawaii", 7]]>,
    );
    expect<GetRoute<"a-b-c-d">>().to(equal<[["a", 0], ["b", 1], ["c", 1], ["d", 1]]>);
    expect<GetRoute<"🎅--🎄---🏠----🤶">>().to(equal<[["🎅", 0], ["🎄", 2], ["🏠", 3], ["🤶", 4]]>);
  });

  it("should return an empty tuple for an empty string", () => {
    expect<GetRoute<"">>().to(equal<[]>);
  });

  it("should return a single-element tuple for a single location", () => {
    expect<GetRoute<"north_pole">>().to(equal<[["north_pole", 0]]>);
  });

  it("should handle non-increasing distances", () => {
    expect<GetRoute<"a--b----c-d---e">>().to(
      equal<[["a", 0], ["b", 2], ["c", 4], ["d", 1], ["e", 3]]>,
    );
  });

  it("should ignore leading and trailing separators", () => {
    expect<GetRoute<"--a-b">>().to(equal<[["a", 0], ["b", 1]]>);
    expect<GetRoute<"a-b--">>().to(equal<[["a", 0], ["b", 1]]>);
  });

  it("should treat spaces and dots as valid characters", () => {
    expect<GetRoute<"north pole-candy.cane">>().to(equal<[["north pole", 0], ["candy.cane", 1]]>);
  });

  it("should handle very long distances", () => {
    expect<GetRoute<"a--------------------------------------------------b">>().to(
      equal<[["a", 0], ["b", 50]]>,
    );
  });

  it("should allow multiple locations with the same name", () => {
    expect<GetRoute<"a--a-a---a">>().to(equal<[["a", 0], ["a", 2], ["a", 1], ["a", 3]]>);
  });
});
