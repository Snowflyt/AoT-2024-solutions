import { describe, equal, expect, it } from "typroof";

import type { Apply, ApplyAll, Cap, Extends, Filter, Push } from "./23";

describe("Apply", () => {
  it("should capitalize a string with `Cap`", () => {
    expect<Apply<Cap, "hello">>().to(equal<"Hello">);
  });

  it("should push an element to a tuple with `Push`", () => {
    expect<Apply<Apply<Push, "world">, ["hello"]>>().to(equal<["hello", "world"]>);
  });

  it("should apply an operation to all inputs with `ApplyAll`", () => {
    expect<Apply<Apply<ApplyAll, Cap>, Apply<Apply<Push, "world">, ["hello"]>>>().to(
      equal<["Hello", "World"]>,
    );
  });

  it("should filter a tuple with `Filter`", () => {
    expect<Apply<Apply<Filter, Apply<Extends, number>>, [1, "foo", 2, 3, "bar", true]>>().to(
      equal<[1, 2, 3]>,
    );
  });

  it("should work with a complex example", () => {
    type Station1 = Apply<Cap, "robot">;
    type Station2 = Apply<Apply<Push, Station1>, ["Tablet", "teddy bear"]>;
    type Station3 = Apply<Apply<Filter, Apply<Extends, Apply<Cap, string>>>, Station2>;
    expect<Station3>().to(equal<["Tablet", "Robot"]>);
  });
});
