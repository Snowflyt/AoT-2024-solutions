import { describe, equal, error, expect, it } from "typroof";

import { createRoute } from "./06";
import { pin } from "./utils/test-utils";

describe("createRoute", () => {
  it("should return a value of the same type as the `route` argument (2nd argument)", () => {
    expect(pin(createRoute("🌩️Donner", 100_000_000))).to(equal<100_000_000>);
    expect(pin(createRoute("🔴Rudolph", 2))).to(equal<2>);
    expect(pin(createRoute("💨Dasher", "3"))).to(equal<"3">);
  });

  it("should accept only `number`s and `string`s", () => {
    // @ts-expect-error
    expect(createRoute("🌟Vixen", true)).to(error);
    // @ts-expect-error
    expect(createRoute("💃Dancer", [1])).to(error);
    // @ts-expect-error
    expect(createRoute("☄️Comet", { 1: 1 })).to(error);
  });
});
