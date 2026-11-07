import type { Manifest } from "@altnovatrail/spec/formatv0/open";
import { expect, test } from "vitest";
import { GRAPH, MODULE, NOW, SKILL_MAP, TIERS } from "../src/core/fair-shares.fixture.ts";
import { mapStates } from "../src/core/states.ts";
import { EIGHT_TIERS, tiersOf } from "./eight-tiers.ts";
import { stateOf } from "./states.ts";

const manifest = (id: string) =>
  ({
    id,
    languages: { explanation: "en" },
    bands: [{ id: "b1", title: "Starter" }],
  }) as unknown as Manifest;

/** The state on the map of each skill of verdict, by the core's rule. */
function states(answer: ReturnType<typeof stateOf>, graph = GRAPH) {
  const map = mapStates(graph, answer, NOW);
  return Object.fromEntries(
    [...map.skills]
      .filter(([, skill]) => skill.assessability === "verdict")
      .map(([id, skill]) => [id, skill.state]),
  );
}

test("no state gives the map none, and the example's own answer is the example's alone", () => {
  expect(stateOf("none", GRAPH, TIERS, manifest(MODULE), NOW)).toBeNull();
  expect(stateOf("example", GRAPH, TIERS, manifest(MODULE), NOW)).toBe(SKILL_MAP);
  expect(stateOf("example", EIGHT_TIERS, tiersOf(EIGHT_TIERS), manifest("x/y"), NOW)).toBeNull();
});

test("a new learner has no answers: tier 1 is ready to start and the rest locked", () => {
  expect(states(stateOf("new", GRAPH, TIERS, manifest(MODULE), NOW))).toEqual({
    "count-objects": "ready",
    halves: "locked",
    "equal-groups": "locked",
    "share-with-remainder": "locked",
    quarters: "locked",
  });
});

test("on the way: tier 1 mastered, its first due for review, and the first of tier 2 in progress", () => {
  expect(states(stateOf("on-the-way", GRAPH, TIERS, manifest(MODULE), NOW))).toEqual({
    "count-objects": "review",
    "equal-groups": "practising",
    halves: "ready",
    "share-with-remainder": "locked",
    quarters: "locked",
  });
});

test("everything mastered, the anchor skills held, on any graph", () => {
  const tiers = tiersOf(EIGHT_TIERS);
  const answer = stateOf("mastered", EIGHT_TIERS, tiers, manifest("x/y"), NOW);
  expect(new Set(Object.values(states(answer, EIGHT_TIERS)))).toEqual(new Set(["mastered"]));
  expect(
    mapStates(EIGHT_TIERS, answer, NOW).anchors.get("core.multiplication-table")?.holding,
  ).toBe("held");
});
