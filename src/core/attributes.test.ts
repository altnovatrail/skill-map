import { expect, test } from "vitest";
import { headingLevel, viewOf } from "./attributes.js";

test("view is learner or adult, and anything else, or nothing, is no view", () => {
  expect(viewOf("learner")).toBe("learner");
  expect(viewOf("adult")).toBe("adult");
  for (const other of [null, "", "Learner", "child", " adult"]) expect(viewOf(other)).toBeNull();
});

test("the level of headings is 2 to 6 as written, and 3 otherwise", () => {
  expect(["2", "3", "4", "5", "6"].map(headingLevel)).toEqual([2, 3, 4, 5, 6]);
  for (const other of [null, "", "1", "7", "02", "3.0", " 4", "four"]) {
    expect(headingLevel(other)).toBe(3);
  }
});
