import { describe, equal, expect, it } from "typroof";

import type { Child, List, Status } from "santas-special-list";

import "./09";

describe("santas-special-list", () => {
  it("should export the correct types", () => {
    expect<Status>().to(equal<"naughty" | "nice">);
    expect<Child>().to(equal<{ name: string; status: Status }>);
    expect<List>().to(equal<Child[]>);
  });
});
