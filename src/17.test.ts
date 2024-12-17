import { describe, equal, expect, it } from "typroof";

import { compose, firstChar, firstItem, lowerCase, makeBox, makeTuple, upperCase } from "./17";

describe("compose", () => {
  it("should compose 3 function from left to right", () => {
    expect(compose(upperCase, makeTuple, makeBox)("hello!").value[0]).to(equal<"HELLO!">);
    expect(compose(makeTuple, firstItem, makeBox)("hello!" as const).value).to(equal<"hello!">);
    expect(compose(upperCase, firstChar, lowerCase)("hello!")).to(equal<"h">);
  });
});
