import { describe, equal, expect, it } from "typroof";

import { createRoute } from "./07";

describe("createRoute", () => {
  it("should return a value of the narrowed type as the `route` argument (2nd argument)", () => {
    expect(createRoute("💨Dasher", ["Atherton", "Scarsdale", "Cherry Hills Village"]).route).to(
      equal<["Atherton", "Scarsdale", "Cherry Hills Village"]>,
    );
    expect(createRoute("🌟Vixen", ["Detroit", "Cleveland", "Dayton"]).route).to(
      equal<["Detroit", "Cleveland", "Dayton"]>,
    );
  });
});
