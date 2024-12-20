import { describe, equal, expect, it } from "typroof";

import type { AnalyzeScope } from "./20";

describe("Parse", () => {
  it("should parse variable declarations (`let`, `const`, `var`)", () => {
    expect<
      AnalyzeScope<`
        let teddyBear = "standard_model";
      `>
    >().to(
      equal<{
        declared: ["teddyBear"];
        used: [];
      }>,
    );
  });

  it("should parse function calls with one argument", () => {
    expect<
      AnalyzeScope<`
        buildToy(teddyBear);
      `>
    >().to(
      equal<{
        declared: [];
        used: ["teddyBear"];
      }>,
    );
  });

  it("should handle multiple statements", () => {
    expect<
      AnalyzeScope<`
        let robotDog = "deluxe_model";
        assembleToy(robotDog);
      `>
    >().to(
      equal<{
        declared: ["robotDog"];
        used: ["robotDog"];
      }>,
    );

    expect<
      AnalyzeScope<`
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
        declared: ["robotDog", "giftBox", "ribbon123"];
        used: ["giftBox", "ribbon123"];
      }>,
    );
  });

  it("should ignore blank characters", () => {
    expect<AnalyzeScope<"\n\t\r \t\r ">>().to(equal<{ declared: []; used: [] }>);
  });
});
