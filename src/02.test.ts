import { describe, equal, expect, it } from "typroof";

import type { Demand } from "./02";

describe("Demand", () => {
  it("should be equal to number literal type `900_000`", () => {
    expect<Demand>().to(equal<900_000>);
  });

  it("should not be equal to `number`", () => {
    expect<Demand>().not.to(equal<number>);
  });
});
