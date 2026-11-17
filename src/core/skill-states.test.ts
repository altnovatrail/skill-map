import type { GetSkillMapResponse } from "@altnovatrail/contracts/novatrail/api/v1/progress_pb.js";
import type { SkillGraph } from "@altnovatrail/spec/formatv0/open";
import { expect, test } from "vitest";
import { GRAPH, NOW, SKILL_MAP, skillMap } from "./fair-shares.fixture.js";
import { skillStates } from "./skill-states.js";

test("example/fair-shares: each skill's state or mark, as in section 3.2 of docs/architecture.md", () => {
  expect([...skillStates(GRAPH, SKILL_MAP, NOW)]).toEqual([
    ["count-objects", "mastered"],
    ["draw-shares", "not-assessed"],
    ["halves", "in-progress"],
    ["equal-groups", "time-to-review"],
    ["explain-sharing", "feedback-by-criteria"],
    ["share-with-remainder", "ready-to-start"],
    ["quarters", "locked"],
  ]);
});

test("the module's level and when an adult set it change no state or mark of the rule", () => {
  const set: GetSkillMapResponse = {
    ...SKILL_MAP,
    levelBand: "b2",
    levelSetAt: { $typeName: "google.protobuf.Timestamp", seconds: 1_800_000_000n, nanos: 0 },
  };
  expect([...skillStates(GRAPH, set, NOW)]).toEqual([...skillStates(GRAPH, SKILL_MAP, NOW)]);
});

test("null past the types gives the marks alone: no skill of verdict, and no undefined", () => {
  const statuses = skillStates(GRAPH, null as unknown as GetSkillMapResponse, NOW);
  expect([...statuses]).toEqual([
    ["draw-shares", "not-assessed"],
    ["explain-sharing", "feedback-by-criteria"],
  ]);
});

test("an answer that names no skill still gives each skill its state, and the anchor skills none", () => {
  const graph: SkillGraph = {
    skills: {
      base: { title: "Base", assessability: "verdict", prerequisites: ["core.counting"] },
      next: { title: "Next", assessability: "verdict", prerequisites: ["base"] },
    },
  };
  expect([...skillStates(graph, skillMap([]), NOW)]).toEqual([
    ["base", "ready-to-start"],
    ["next", "locked"],
  ]);
});
