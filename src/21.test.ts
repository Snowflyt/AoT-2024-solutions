import { describe, equal, expect, it } from "typroof";

import type { Lint } from "./21";

describe("Parse", () => {
  it("should parse variable declarations (`let`, `const`, `var`)", () => {
    expect<
      Lint<`
        let teddyBear = "standard_model";
      `>
    >().to(
      equal<{
        scope: { declared: ["teddyBear"]; used: [] };
        unused: ["teddyBear"];
      }>,
    );
  });

  it("should parse function calls with one argument", () => {
    expect<
      Lint<`
        buildToy(teddyBear);
      `>
    >().to(
      equal<{
        scope: { declared: []; used: ["teddyBear"] };
        unused: [];
      }>,
    );
  });

  it("should handle multiple statements", () => {
    expect<
      Lint<`
        let robotDog = "deluxe_model";
        assembleToy(robotDog);
      `>
    >().to(
      equal<{
        scope: { declared: ["robotDog"]; used: ["robotDog"] };
        unused: [];
      }>,
    );

    expect<
      Lint<`
        let robotDog = "standard_model";
        const giftBox = "premium_wrap";
          var ribbon123 = "silk";

        \t
        wrapGift(giftBox);
        \r\n
            addRibbon(ribbon123);
      `>
    >().to(
      equal<{
        scope: { declared: ["robotDog", "giftBox", "ribbon123"]; used: ["giftBox", "ribbon123"] };
        unused: ["robotDog"];
      }>,
    );
  });

  it("should ignore blank characters", () => {
    expect<Lint<"\n\t\r \t\r ">>().to(
      equal<{
        scope: { declared: []; used: [] };
        unused: [];
      }>,
    );
  });
});
