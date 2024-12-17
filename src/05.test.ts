import { describe, equal, expect, it } from "typroof";

import { createRoute } from "./05";
import { pin } from "./utils/test-utils";

describe("createRoute", () => {
  it("should return a value of the same type as the `route` argument (2nd argument)", () => {
    expect(pin(createRoute("💨Dasher", 100_000_000))).to(equal<100_000_000>);
    expect(pin(createRoute("💃Dancer", 2))).to(equal<2>);
    expect(pin(createRoute("💃Dancer", 2))).to(equal<2>);
    expect(pin(createRoute("🌟Vixen", "1"))).to(equal<"1">);
    expect(pin(createRoute("☄️Comet", true))).to(equal<true>);
    expect(pin(createRoute("❤️Cupid", [1]))).to(equal<number[]>);
    expect(pin(createRoute("🌩️Donner", { 1: 1 }))).to(equal<{ 1: number }>);
    expect(pin(createRoute("⚡Blitzen", Symbol("🔴 === evil")))).to(equal<symbol>);
  });
});
