/* eslint-disable @typescript-eslint/require-await */

import { describe, equal, expect, it } from "typroof";

import type { PerfReview } from "./14";

describe("PerfReview", () => {
  it("should extract the yield type from an async generator", () => {
    async function* numberAsyncGenerator() {
      yield 1;
      yield 2;
      yield 3;
    }
    expect<PerfReview<ReturnType<typeof numberAsyncGenerator>>>().to(equal<1 | 2 | 3>);

    async function* stringAsyncGenerator() {
      yield "1%";
      yield "2%";
    }
    expect<PerfReview<ReturnType<typeof stringAsyncGenerator>>>().to(equal<"1%" | "2%">);
  });
});
