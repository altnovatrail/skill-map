// The synthetic module of docs/architecture.md, sections 3.2 and 3.4: example/fair-shares, its graph
// as the open view gives it and a synthetic answer of GetSkillMap at the device's time
// 2026-11-07T12:00Z. No learner's data: every value is made up (RULES.md, Hard rules).

import type {
  AnchorSkillHolding,
  AnchorSkillReason,
  AnchorSkillState,
  GetSkillMapResponse,
  SkillState,
} from "@altnovatrail/contracts/novatrail/api/v1/progress_pb.js";
import type { SkillGraph } from "@altnovatrail/spec/formatv0/open";

export const MODULE = "example/fair-shares";
export const NOW = new Date("2026-11-07T12:00:00Z");

export const GRAPH: SkillGraph = {
  tiers: ["Counting", "Sharing"],
  skills: {
    "count-objects": { title: "Count objects", assessability: "verdict" },
    "draw-shares": { title: "Draw shares", assessability: "none" },
    halves: {
      title: "Halves",
      assessability: "verdict",
      prerequisites: ["count-objects"],
      teaches: ["core.fractions-of-a-whole"],
    },
    "equal-groups": {
      title: "Equal groups",
      assessability: "verdict",
      prerequisites: ["count-objects"],
    },
    "explain-sharing": {
      title: "Explain how you shared",
      assessability: "rubric",
      prerequisites: ["count-objects"],
      teaches: ["core.division-with-remainder"],
    },
    "share-with-remainder": {
      title: "Share with a remainder",
      assessability: "verdict",
      prerequisites: ["equal-groups", "core.multiplication-table"],
    },
    quarters: {
      title: "Quarters",
      assessability: "verdict",
      prerequisites: ["halves", "explain-sharing"],
    },
  },
};

/** A moment of the contract, to the nanosecond. */
export function timestamp(iso: string, nanos = 0): NonNullable<SkillState["reviewDate"]> {
  const milliseconds = Date.parse(iso);
  return {
    $typeName: "google.protobuf.Timestamp",
    seconds: BigInt(Math.floor(milliseconds / 1000)),
    nanos: (milliseconds % 1000) * 1_000_000 + nanos,
  };
}

/** The state of a skill, as the contract gives it: what is not named is empty or absent. */
export function skillState(
  fields: Pick<SkillState, "skill"> & Partial<Omit<SkillState, "$typeName">>,
): SkillState {
  return {
    $typeName: "novatrail.api.v1.SkillState",
    evidenceCount: 0,
    masteryBand: "",
    reviewDue: false,
    ...fields,
  };
}

/** The state of an anchor skill, as the contract gives it. */
export function anchorState(
  anchorSkill: string,
  holding: AnchorSkillHolding,
  reason: AnchorSkillReason,
): AnchorSkillState {
  return {
    $typeName: "novatrail.api.v1.AnchorSkillState",
    anchorSkill,
    holding,
    reason,
    teachingSkills: [],
  };
}

/** An answer of GetSkillMap. */
export function skillMap(
  skills: readonly SkillState[],
  anchorSkills: readonly AnchorSkillState[] = [],
): GetSkillMapResponse {
  return {
    $typeName: "novatrail.api.v1.GetSkillMapResponse",
    packageDigest: "sha256:0000000000000000000000000000000000000000000000000000000000000000",
    skills: [...skills],
    anchorSkills: [...anchorSkills],
  };
}

/** The synthetic answer of section 3.2. */
export const SKILL_MAP = skillMap(
  [
    skillState({
      skill: "count-objects",
      evidenceCount: 9,
      masteryBand: "b1",
      reviewDate: timestamp("2026-11-20T00:00:00Z"),
    }),
    skillState({ skill: "halves", evidenceCount: 4 }),
    skillState({ skill: "equal-groups", evidenceCount: 7, masteryBand: "b1", reviewDue: true }),
    skillState({ skill: "share-with-remainder" }),
    skillState({ skill: "quarters" }),
  ],
  [
    anchorState("core.multiplication-table", 1, 0),
    anchorState("core.fractions-of-a-whole", 2, 1),
    anchorState("core.division-with-remainder", 3, 4),
  ],
);
