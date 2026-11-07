import { expect, test } from "vitest";
import { fullSkillId } from "./index.js";

test("a skill's full ID is the module's ID, skill and its ID in the module, joined by a slash", () => {
  expect(fullSkillId("example/fair-shares", "share-with-remainder")).toBe(
    "example/fair-shares/skill/share-with-remainder",
  );
});
