import { describe, equal, expect, it } from "typroof";

import type { Parse } from "./19";

describe("Parse", () => {
  it("should parse variable declarations (`let`, `const`, `var`)", () => {
    expect<
      Parse<`
        let teddyBear = "standard_model";
      `>
    >().to(
      equal<
        [
          {
            id: "teddyBear";
            type: "VariableDeclaration";
          },
        ]
      >,
    );
  });

  it("should parse function calls with one argument", () => {
    expect<
      Parse<`
        buildToy(teddyBear);
      `>
    >().to(
      equal<
        [
          {
            argument: "teddyBear";
            type: "CallExpression";
          },
        ]
      >,
    );
  });

  it("should handle multiple statements", () => {
    expect<
      Parse<`
        let robotDog = "deluxe_model";
        assembleToy(robotDog);
      `>
    >().to(
      equal<
        [
          {
            id: "robotDog";
            type: "VariableDeclaration";
          },
          {
            argument: "robotDog";
            type: "CallExpression";
          },
        ]
      >,
    );

    expect<
      Parse<`
        const giftBox = "premium_wrap";
          var ribbon123 = "silk";
        
        \t
        wrapGift(giftBox);
        \r\n
            addRibbon(ribbon123);
      `>
    >().to(
      equal<
        [
          {
            id: "giftBox";
            type: "VariableDeclaration";
          },
          {
            id: "ribbon123";
            type: "VariableDeclaration";
          },
          {
            argument: "giftBox";
            type: "CallExpression";
          },
          {
            argument: "ribbon123";
            type: "CallExpression";
          },
        ]
      >,
    );
  });

  it("should ignore blank characters", () => {
    expect<Parse<"\n\t\r \t\r ">>().to(equal<[]>);
  });
});
