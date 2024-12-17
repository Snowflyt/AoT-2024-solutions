import { describe, error, expect, it } from "typroof";

import { survivalRatio } from "./03";

describe("survivalRatio", () => {
  it("should accept numbers", () => {
    expect(survivalRatio(2009)).not.to(error);
    expect(survivalRatio(2010)).not.to(error);
    expect(survivalRatio(2011)).not.to(error);
    expect(survivalRatio(2012)).not.to(error);
    expect(survivalRatio(2013)).not.to(error);
    expect(survivalRatio(2014)).not.to(error);
    expect(survivalRatio(2015)).not.to(error);
    expect(survivalRatio(2016)).not.to(error);
    expect(survivalRatio(2017)).not.to(error);
    expect(survivalRatio(2018)).not.to(error);
    expect(survivalRatio(2019)).not.to(error);
    expect(survivalRatio(2020)).not.to(error);
    expect(survivalRatio(2021)).not.to(error);
    expect(survivalRatio(2022)).not.to(error);
    expect(survivalRatio(2023)).not.to(error);
  });

  it("should not accept values other than numbers", () => {
    // @ts-expect-error
    expect(survivalRatio("1")).to(error);
    // @ts-expect-error
    expect(survivalRatio(true)).to(error);
    // @ts-expect-error
    expect(survivalRatio([1])).to(error);
    // @ts-expect-error
    expect(survivalRatio({ 1: 1 })).to(error);
  });
});
