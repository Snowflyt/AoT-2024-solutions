import { describe, equal, expect, it } from "typroof";

import type { Excuse } from "./11";

const existingExcuses = {
  karaoke: ["Kendrick Lamar, Opeth"],
  margarita: "Peppermint-Jalapeño Mojito",
};

const helpingTheReindeer = { helping: "the reindeer" } as const;
declare const Excuse0: Excuse<typeof helpingTheReindeer>;

const eatingFudge = { eating: "fudge" } as const;
declare const Excuse1: Excuse<typeof eatingFudge>;

describe("Excuse", () => {
  it("should create an excuse", () => {
    expect(new Excuse0({ ...existingExcuses, ...helpingTheReindeer })).to(
      equal<"helping: the reindeer">,
    );
    expect(new Excuse1({ ...existingExcuses, ...eatingFudge })).to(equal<"eating: fudge">);
  });
});
