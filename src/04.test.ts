import { describe, equal, error, expect, it } from "typroof";

import { survivalRatio } from "./04";

describe("survivalRatio", () => {
  it("should accept numbers like `2009` and return a value of type `number`", () => {
    expect(survivalRatio(2009)).not.to(error);
    expect(survivalRatio(2009)).to(equal<number>);
    expect(survivalRatio(2024)).not.to(error);
    expect(survivalRatio(2024)).to(equal<number>);
  });

  it("should accept strings like `'2009 Q1'` and return a value of type `number`", () => {
    expect(survivalRatio("2009 Q1")).not.to(error);
    expect(survivalRatio("2009 Q1")).to(equal<number>);
    expect(survivalRatio("2024 Q2")).not.to(error);
    expect(survivalRatio("2024 Q2")).to(equal<number>);
  });

  it("should not accept values other than `number`s or `string`s", () => {
    // @ts-expect-error
    expect(survivalRatio(true)).to(error);
    // @ts-expect-error
    expect(survivalRatio([1])).to(error);
    // @ts-expect-error
    expect(survivalRatio({ 1: 1 })).to(error);
  });
});
