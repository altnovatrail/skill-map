// Synthetic answers of GetSkillMap for any graph of the page (R12 in docs/decisions.md): as the
// contract gives them, made up, of no learner. The map reads them as it reads api's.

import type {
  AnchorSkillState,
  GetSkillMapResponse,
  SkillState,
} from "@altnovatrail/contracts/novatrail/api/v1/progress_pb.js";
import type { Manifest, SkillGraph } from "@altnovatrail/spec/formatv0/open";
import {
  anchorState,
  MODULE,
  SKILL_MAP,
  skillMap,
  skillState,
} from "../src/core/fair-shares.fixture.js";

/** The states the page offers. */
export const PRESETS = {
  none: "No state",
  new: "New learner: no answers",
  "on-the-way": "On the way: tier 1 mastered, one due, one in progress",
  mastered: "Everything mastered",
  example: "The example's own answer (example/fair-shares alone)",
} as const;

export type Preset = keyof typeof PRESETS;

/** A moment of the contract, so many days from now. */
function daysFrom(now: Date, days: number): NonNullable<SkillState["reviewDate"]> {
  const milliseconds = now.getTime() + days * 86_400_000;
  return {
    $typeName: "google.protobuf.Timestamp",
    seconds: BigInt(Math.floor(milliseconds / 1000)),
    nanos: 0,
  };
}

/** The anchor skills the graph's skills build on. */
const anchorsOf = (graph: SkillGraph) => [
  ...new Set(
    Object.values(graph.skills)
      .flatMap((skill) => skill.prerequisites ?? [])
      .filter((id) => !Object.hasOwn(graph.skills, id)),
  ),
];

/**
 * The answer of a preset for a graph, or null for a map without state. The example's own answer
 * names the example's skills, and so is the example's alone: another graph gets none.
 */
export function stateOf(
  preset: Preset,
  graph: SkillGraph,
  tiers: Readonly<Record<string, number>>,
  manifest: Manifest,
  now: Date,
): GetSkillMapResponse | null {
  if (preset === "none") return null;
  if (preset === "example") return manifest.id === MODULE ? SKILL_MAP : null;
  const band = manifest.bands?.[0]?.id ?? "b1";
  const verdict = Object.entries(graph.skills)
    .filter(([, skill]) => skill.assessability === "verdict")
    .map(([id]) => id)
    .sort((a, b) => (tiers[a] ?? 0) - (tiers[b] ?? 0) || Number(a > b) - Number(a < b));
  const mastered = (skill: string, due = false) =>
    skillState({
      skill,
      evidenceCount: 6,
      masteryBand: band,
      reviewDue: due,
      lastPracticedAt: daysFrom(now, -3),
      ...(due ? {} : { reviewDate: daysFrom(now, 14) }),
    });
  let skills: SkillState[];
  let anchors: AnchorSkillState[];
  if (preset === "new") {
    skills = verdict.map((skill) => skillState({ skill }));
    anchors = anchorsOf(graph).map((id) => anchorState(id, 2, 2));
  } else if (preset === "mastered") {
    skills = verdict.map((skill) => mastered(skill));
    anchors = anchorsOf(graph).map((id) => anchorState(id, 1, 0));
  } else {
    const first = verdict.filter((id) => tiers[id] === 1);
    const second = verdict.find((id) => tiers[id] === 2);
    skills = verdict.map((skill) =>
      first.includes(skill)
        ? mastered(skill, skill === first[0])
        : skill === second
          ? skillState({ skill, evidenceCount: 3, lastPracticedAt: daysFrom(now, -1) })
          : skillState({ skill }),
    );
    anchors = anchorsOf(graph).map((id, i) =>
      i % 2 === 0 ? anchorState(id, 1, 0) : anchorState(id, 3, 3),
    );
  }
  return skillMap(skills, anchors);
}
