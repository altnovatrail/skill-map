// The package's second entry point, ./states: the state or mark of each skill of a module, by the
// rule the map draws by, for app's module card, so that the card and the map never part (R03, R08;
// R148 spec). It is one function, not the core: it sees neither the DOM nor the element, and
// importing it registers nothing.

import type { GetSkillMapResponse } from "@altnovatrail/contracts/novatrail/api/v1/progress_pb.js";
import type { SkillGraph } from "@altnovatrail/spec/formatv0/open";
import { mapStates, type Shown, shownOf } from "./states.js";

/**
 * What the map shows of a skill of the module, named as spec's values of a skill's status: one of the five states of a skill whose assessability is `verdict`, or the mark of one of
 * `rubric`, "feedback-by-criteria", or of `none`, "not-assessed".
 */
export type SkillStatus =
  | "time-to-review"
  | "mastered"
  | "in-progress"
  | "ready-to-start"
  | "locked"
  | "feedback-by-criteria"
  | "not-assessed";

/** The value of each state of the map, and of each mark by its assessability. */
const STATUSES: Readonly<Record<Shown, SkillStatus>> = {
  review: "time-to-review",
  mastered: "mastered",
  practising: "in-progress",
  ready: "ready-to-start",
  locked: "locked",
  rubric: "feedback-by-criteria",
  none: "not-assessed",
};

/**
 * The state or mark of each skill of a module at a time of the device, by local ID in the order of
 * the graph: the same that `<novatrail-skill-map>` shows on the same graph, answer of GetSkillMap
 * and time, by the same shownOf (R03). The anchor skills are not the module's, and are not in it.
 */
export function skillStates(
  graph: SkillGraph,
  skillMap: GetSkillMapResponse,
  now: Date,
): ReadonlyMap<string, SkillStatus> {
  const statuses = new Map<string, SkillStatus>();
  for (const [id, skill] of mapStates(graph, skillMap, now).skills) {
    // With an answer, a skill of verdict always has its state (R03). Only JavaScript that passes
    // null past the types gets a skill of verdict without one: it is left out, never undefined.
    const shown = shownOf(skill);
    if (shown !== null) statuses.set(id, STATUSES[shown]);
  }
  return statuses;
}
