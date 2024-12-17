import { equal, expect, test } from "typroof";

import type { Demand } from "./01";

test("Demand", () => {
  expect<Demand>().to(equal<number>);
});
