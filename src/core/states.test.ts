import type {
  AnchorSkillHolding,
  AnchorSkillReason,
} from "@altnovatrail/contracts/novatrail/api/v1/progress_pb.js";
import type { SkillGraph } from "@altnovatrail/spec/formatv0/open";
import { describe, expect, test } from "vitest";
import {
  anchorState,
  GRAPH,
  NOW,
  SKILL_MAP,
  skillMap,
  skillState,
  timestamp,
} from "./fair-shares.fixture.js";
import { mapStates } from "./states.js";

/** Each skill's state, openness and what it waits for, in the order of the graph. */
function table(states: ReturnType<typeof mapStates>) {
  return [...states.skills.values()].map(({ id, state, open, waitsFor }) => ({
    id,
    state,
    open,
    waitsFor,
  }));
}

describe("example/fair-shares, as in section 3.2 of docs/architecture.md", () => {
  const states = mapStates(GRAPH, SKILL_MAP, NOW);

  test("each skill of verdict has its state, and every skill but quarters is open", () => {
    expect(table(states)).toEqual([
      { id: "count-objects", state: "mastered", open: true, waitsFor: [] },
      { id: "draw-shares", state: null, open: true, waitsFor: [] },
      { id: "halves", state: "practising", open: true, waitsFor: [] },
      { id: "equal-groups", state: "review", open: true, waitsFor: [] },
      { id: "explain-sharing", state: null, open: true, waitsFor: [] },
      // equal-groups is mastered, though due for review, and the anchor skill holds nothing back.
      { id: "share-with-remainder", state: "ready", open: true, waitsFor: [] },
      // halves is not mastered; explain-sharing, of rubric, holds nothing back.
      { id: "quarters", state: "locked", open: false, waitsFor: ["halves"] },
    ]);
  });

  test("the skills of rubric and none keep their assessability for their marks", () => {
    expect(states.skills.get("draw-shares")?.assessability).toBe("none");
    expect(states.skills.get("explain-sharing")?.assessability).toBe("rubric");
  });

  test("each anchor skill the graph names has its holding and reason, as first named", () => {
    expect([...states.anchors.values()]).toEqual([
      {
        id: "core.fractions-of-a-whole",
        holding: "not-held",
        reason: "not-mastered",
        prerequisite: false,
      },
      {
        id: "core.division-with-remainder",
        holding: "unknown",
        reason: "only-unassessable",
        prerequisite: false,
      },
      { id: "core.multiplication-table", holding: "held", reason: null, prerequisite: true },
    ]);
  });
});

describe("a map without state", () => {
  const states = mapStates(GRAPH, null, NOW);

  test("has the same skills, with no state, and none open", () => {
    expect(table(states)).toEqual(
      Object.keys(GRAPH.skills).map((id) => ({ id, state: null, open: false, waitsFor: [] })),
    );
  });

  test("keeps the assessability that gives the marks of rubric and none: they come from the graph", () => {
    expect(states.skills.get("explain-sharing")?.assessability).toBe("rubric");
  });

  test("has the anchor skills, with no holding, and the one prerequisite still before tier 1", () => {
    expect(
      [...states.anchors.values()].map(({ holding, reason, prerequisite }) => [
        holding,
        reason,
        prerequisite,
      ]),
    ).toEqual([
      [null, null, false],
      [null, null, false],
      [null, null, true],
    ]);
  });
});

/** A chain of two skills of verdict, prerequisite and skill. */
const CHAIN: SkillGraph = {
  skills: {
    base: { title: "Base", assessability: "verdict" },
    next: { title: "Next", assessability: "verdict", prerequisites: ["base"] },
  },
};

const stateOfNext = (...records: Parameters<typeof skillState>[0][]) =>
  mapStates(CHAIN, skillMap(records.map(skillState)), NOW).skills.get("next");

test("a skill of verdict the answer does not name reads as one without evidence", () => {
  const states = mapStates(CHAIN, skillMap([]), NOW);
  expect(states.skills.get("base")).toMatchObject({ state: "ready", open: true });
  expect(states.skills.get("next")).toMatchObject({
    state: "locked",
    open: false,
    waitsFor: ["base"],
  });
  expect(stateOfNext({ skill: "base", masteryBand: "b1" })?.state).toBe("ready");
});

test("a review date at the device's very moment is due; a nanosecond later it is not", () => {
  const due = (nanos: number) =>
    mapStates(
      CHAIN,
      skillMap([
        skillState({
          skill: "base",
          masteryBand: "b1",
          reviewDate: timestamp(NOW.toISOString(), nanos),
        }),
      ]),
      NOW,
    ).skills.get("base")?.state;
  expect(due(0)).toBe("review");
  expect(due(1)).toBe("mastered");
});

test("a review date before the epoch compares exactly too", () => {
  const before = new Date("1969-12-31T23:59:59.500Z");
  const at = (nanos: number) =>
    mapStates(
      CHAIN,
      skillMap([
        skillState({
          skill: "base",
          masteryBand: "b1",
          reviewDate: {
            $typeName: "google.protobuf.Timestamp",
            seconds: -1n,
            nanos: 500_000_000 + nanos,
          },
        }),
      ]),
      before,
    ).skills.get("base")?.state;
  expect(at(0)).toBe("review");
  expect(at(1)).toBe("mastered");
});

test("a device's time that is no time makes no review due by its date, and breaks nothing", () => {
  const invalid = new Date(Number.NaN);
  const records = [
    skillState({ skill: "base", masteryBand: "b1", reviewDate: timestamp("2026-11-01T00:00:00Z") }),
    skillState({ skill: "next", masteryBand: "b1", reviewDue: true }),
  ];
  const states = mapStates(CHAIN, skillMap(records), invalid);
  expect(states.skills.get("base")?.state).toBe("mastered");
  expect(states.skills.get("next")?.state).toBe("review");
});

test("a mastered prerequisite due for review does not lock the skill: time does not take mastery away", () => {
  expect(stateOfNext({ skill: "base", masteryBand: "b1", reviewDue: true })?.state).toBe("ready");
  expect(
    stateOfNext({
      skill: "base",
      masteryBand: "b1",
      reviewDate: timestamp("2026-11-01T00:00:00Z"),
    })?.state,
  ).toBe("ready");
});

test("a skill with evidence is open, though its prerequisite is not mastered or has lost it", () => {
  expect(
    stateOfNext({ skill: "base", evidenceCount: 3 }, { skill: "next", evidenceCount: 1 }),
  ).toMatchObject({
    state: "practising",
    open: true,
    waitsFor: [],
  });
  expect(
    stateOfNext({ skill: "next", evidenceCount: 5, masteryBand: "b2", reviewDue: true }),
  ).toMatchObject({ state: "review", open: true });
});

test("a due review without a mastery band is no review: the skill is in practice", () => {
  expect(
    mapStates(
      CHAIN,
      skillMap([skillState({ skill: "base", evidenceCount: 2, reviewDue: true })]),
      NOW,
    ).skills.get("base")?.state,
  ).toBe("practising");
});

test("the first state the answer gives a skill counts, and a skill not in the graph is left out", () => {
  const first = skillState({ skill: "base", masteryBand: "b1" });
  const states = mapStates(
    CHAIN,
    skillMap([
      first,
      skillState({ skill: "base" }),
      skillState({ skill: "retired", masteryBand: "b1" }),
    ]),
    NOW,
  );
  expect(states.skills.get("base")?.state).toBe("mastered");
  // The record the state comes from, for the adult's details.
  expect(states.skills.get("base")?.record).toBe(first);
  expect(states.skills.get("next")?.record).toBeUndefined();
  expect([...states.skills.keys()]).toEqual(["base", "next"]);
});

test("a prerequisite that only looks like a property of an object is an anchor skill, not a skill", () => {
  const graph: SkillGraph = {
    skills: { odd: { title: "Odd", assessability: "verdict", prerequisites: ["constructor"] } },
  };
  const states = mapStates(graph, skillMap([]), NOW);
  expect(states.skills.get("odd")?.state).toBe("ready");
  expect([...states.anchors.keys()]).toEqual(["constructor"]);
});

describe("the anchor skills' enums, as progress.proto says to read them", () => {
  const ONE: SkillGraph = {
    skills: { s: { title: "S", assessability: "verdict", prerequisites: ["core.a"] } },
  };
  const anchor = (holding: number, reason: number) =>
    mapStates(
      ONE,
      skillMap(
        [],
        [anchorState("core.a", holding as AnchorSkillHolding, reason as AnchorSkillReason)],
      ),
      NOW,
    ).anchors.get("core.a");

  test("each holding and reason this build knows has its name", () => {
    expect(anchor(2, 2)).toEqual({
      id: "core.a",
      holding: "not-held",
      reason: "no-evidence",
      prerequisite: true,
    });
    expect(anchor(3, 3)).toEqual({
      id: "core.a",
      holding: "unknown",
      reason: "nobody-teaches",
      prerequisite: true,
    });
  });

  test("a holding this build does not know, or the one never sent, is unknown", () => {
    expect(anchor(7, 4)).toMatchObject({ holding: "unknown", reason: "only-unassessable" });
    expect(anchor(0, 0)).toMatchObject({ holding: "unknown", reason: null });
  });

  test("a reason this build does not know is not shown, nor one beside an anchor skill held", () => {
    expect(anchor(2, 9)).toMatchObject({ holding: "not-held", reason: null });
    expect(anchor(1, 1)).toMatchObject({ holding: "held", reason: null });
  });

  test("a reason that does not go with the holding is not shown", () => {
    expect(anchor(2, 3)).toMatchObject({ holding: "not-held", reason: null });
    expect(anchor(3, 1)).toMatchObject({ holding: "unknown", reason: null });
    expect(anchor(7, 2)).toMatchObject({ holding: "unknown", reason: null });
  });

  test("an anchor skill the answer leaves out is unknown, with no reason, and one the graph does not name is left out", () => {
    const states = mapStates(ONE, skillMap([], [anchorState("core.b", 1, 0)]), NOW);
    expect([...states.anchors.values()]).toEqual([
      { id: "core.a", holding: "unknown", reason: null, prerequisite: true },
    ]);
  });

  test("the first state the answer gives an anchor skill counts", () => {
    const states = mapStates(
      ONE,
      skillMap([], [anchorState("core.a", 1, 0), anchorState("core.a", 2, 1)]),
      NOW,
    );
    expect(states.anchors.get("core.a")).toEqual({
      id: "core.a",
      holding: "held",
      reason: null,
      prerequisite: true,
    });
  });
});
