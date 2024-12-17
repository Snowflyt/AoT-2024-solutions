import { describe, error, expect, it } from "typroof";

import type { Gift } from "./10";

const test = <F extends Gift>(flag: F) => flag;

describe("Gift", () => {
  it("should represent each gift with 1 unique bit", () => {
    expect(test<Gift.Coal>(0)).not.to(error);
    expect(test<Gift.Train>(1)).not.to(error);
    expect(test<Gift.Bicycle>(2)).not.to(error);
    expect(test<Gift.SuccessorToTheNintendoSwitch>(4)).not.to(error);
    expect(test<Gift.TikTokPremium>(8)).not.to(error);
    expect(test<Gift.Vape>(16)).not.to(error);

    // @ts-expect-error
    expect(test<Gift.Coal>(10)).to(error);
    // @ts-expect-error
    expect(test<Gift.Train>(11)).to(error);
    // @ts-expect-error
    expect(test<Gift.Bicycle>(12)).to(error);
    // @ts-expect-error
    expect(test<Gift.SuccessorToTheNintendoSwitch>(14)).to(error);
    // @ts-expect-error
    expect(test<Gift.TikTokPremium>(18)).to(error);
    // @ts-expect-error
    expect(test<Gift.Vape>(116)).to(error);
  });

  it("should represent combinations of gifts with multiple bits", () => {
    expect(test<Gift.Traditional>(3)).not.to(error);
    expect(test<Gift.OnTheMove>(26)).not.to(error);
    expect(test<Gift.OnTheCouch>(28)).not.to(error);

    // @ts-expect-error
    expect(test<Gift.Traditional>(13)).to(error);
    // @ts-expect-error
    expect(test<Gift.OnTheMove>(126)).to(error);
    // @ts-expect-error
    expect(test<Gift.OnTheCouch>(124)).to(error);
  });
});
