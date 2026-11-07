import { expect, test } from "vitest";
import { EIGHT_TIERS, tiersOf } from "./eight-tiers.ts";

test("tiers are the longest chain of the module's prerequisites a skill ends, and an anchor skill counts for none", () => {
  expect(
    tiersOf({
      skills: {
        a: { title: "A", assessability: "verdict" },
        b: { title: "B", assessability: "verdict", prerequisites: ["a", "core.x"] },
        c: { title: "C", assessability: "verdict", prerequisites: ["a", "b"] },
        d: { title: "D", assessability: "verdict", prerequisites: ["core.x"] },
      },
    }),
  ).toEqual({ a: 1, b: 2, c: 3, d: 1 });
});

test("the page's own graph has eight tiers, each with a skill", () => {
  const tiers = tiersOf(EIGHT_TIERS);
  expect(new Set(Object.values(tiers))).toEqual(new Set([1, 2, 3, 4, 5, 6, 7, 8]));
  expect(tiers.proportion).toBe(8);
  expect(tiers.multiply).toBe(4);
});
