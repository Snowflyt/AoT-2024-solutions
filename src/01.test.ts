import { equal, expect, test } from "typroof";

import type { Demand } from "./1";

test("Demand", () => {
  expect<Demand>().to(equal<number>);
});
