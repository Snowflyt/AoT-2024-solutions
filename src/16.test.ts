import { describe, error, expect, it } from "typroof";

import { DynamicParamsCurrying } from "./16";

describe("DynamicParamsCurrying", () => {
  it("should create an arbitrarily curried version of the original function", () => {
    const originalCurry = (
      ingredient1: number,
      ingredient2: string,
      ingredient3: boolean,
      ingredient4: Date,
    ) => true;

    const spikedCurry = DynamicParamsCurrying(originalCurry);

    expect(spikedCurry(0, "Ziltoid", true, new Date())).not.to(error);
    expect(spikedCurry(1)("The", false, new Date())).not.to(error);
    expect(spikedCurry(0, "Omniscient", true)(new Date())).not.to(error);
    expect(spikedCurry()()()()(0, "Captain", true)()()()(new Date())).not.to(error);
    expect(spikedCurry(0, "Spectacular", true)).not.to(error);

    // @ts-expect-error - Arguments provided in the wrong order
    expect(spikedCurry("Nebulo9", 0, true)(new Date())).to(error);
  });
});
