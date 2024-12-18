import { describe, equal, error, expect, it } from "typroof";

import { createStreetLight } from "./18";

const colors = ["red" as const, "yellow" as const, "green" as const];
type Color = (typeof colors)[number];

describe("createStreetLight", () => {
  it("should return a value of the same type as the elements of the `colors` array", () => {
    expect(createStreetLight(colors, "red")).to(equal<Color>);
  });

  it("should not allow `defaultColor` to be a value that is not in the `colors` array", () => {
    // @ts-expect-error
    expect(createStreetLight(colors, "blue")).to(error);
  });

  it("should allow providing a type parameter to specify the type of the `colors` elements", () => {
    expect(createStreetLight<Color>(colors, "red")).to(equal<Color>);
    // @ts-expect-error
    expect(createStreetLight<Color>(colors, "blue")).to(error);
  });

  it("should only allow one type parameter", () => {
    // @ts-expect-error
    expect(createStreetLight<Color, "red">(colors, "red")).to(error);
    // @ts-expect-error
    expect(createStreetLight<Color, "blue">(colors, "blue")).to(error);
  });
});
