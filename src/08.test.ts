import { equal, expect, test } from "typroof";

import "./08";

test("`process.env` should have the declared members with the correct types", () => {
  expect(process.env.MOOD_LIGHTS).to(equal<"true">);
  expect(process.env.BATH_TEMPERATURE).to(equal<"327.59">);
  expect(process.env.STRAWBERRIES).to(equal<"chocolate">);
});
