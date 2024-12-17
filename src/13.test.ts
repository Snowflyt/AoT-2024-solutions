/* eslint-disable no-self-assign */

import { describe, equal, error, expect, it } from "typroof";

import type { Demand } from "./13";

declare let demand1: Demand<unknown>;
declare let demand2: Demand<string>;
declare let demand3: Demand<"Immediate 4% Pay Increase">;
declare let demand4: Demand<"3 Days Paid Time Off Per Year">;

describe("Demand", () => {
  it("should create a demand of correct type", () => {
    expect(demand1).to(equal<{ demand: unknown }>);
    expect(demand2).to(equal<{ demand: string }>);
    expect(demand3).to(equal<{ demand: "Immediate 4% Pay Increase" }>);
    expect(demand4).to(equal<{ demand: "3 Days Paid Time Off Per Year" }>);
  });

  it("should create an invariant demand", () => {
    expect((demand1 = demand1)).not.to(error); // ✅
    // @ts-expect-error
    expect((demand1 = demand2)).to(error);
    // @ts-expect-error
    expect((demand1 = demand3)).to(error);
    // @ts-expect-error
    expect((demand1 = demand4)).to(error);

    // @ts-expect-error
    expect((demand2 = demand1)).to(error);
    expect((demand2 = demand2)).not.to(error); // ✅
    // @ts-expect-error
    expect((demand2 = demand3)).to(error);
    // @ts-expect-error
    expect((demand2 = demand4)).to(error);

    // @ts-expect-error
    expect((demand3 = demand1)).to(error);
    // @ts-expect-error
    expect((demand3 = demand2)).to(error);
    expect((demand3 = demand3)).not.to(error); // ✅
    // @ts-expect-error
    expect((demand3 = demand4)).to(error);

    // @ts-expect-error
    expect((demand4 = demand1)).to(error);
    // @ts-expect-error
    expect((demand4 = demand2)).to(error);
    // @ts-expect-error
    expect((demand4 = demand3)).to(error);
    expect((demand4 = demand4)).not.to(error); // ✅
  });
});
