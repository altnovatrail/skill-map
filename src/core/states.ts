// The states on the map (R03; docs/architecture.md, section 3.2): what each skill of a module shows,
// worked out from the open view of its graph, the answer of GetSkillMap and the time of the device.
// The map counts no mastery: it matches the marks learner-model has made against the graph.

import type {
  AnchorSkillHolding,
  AnchorSkillReason,
  AnchorSkillState,
  GetSkillMapResponse,
  SkillState,
} from "@altnovatrail/contracts/novatrail/api/v1/progress_pb.js";
import type { SkillGraph } from "@altnovatrail/spec/formatv0/open";

/**
 * The state on the map of a skill whose assessability is `verdict`, in the order the first that
 * holds is taken: «пора повторить», «освоено», «в работе», «можно начинать», «ещё закрыт».
 */
export type MapState = "review" | "mastered" | "practising" | "ready" | "locked";

/** A skill's assessability, as the graph gives it (concepts 4 spec). */
export type Assessability = SkillGraph["skills"][string]["assessability"];

/** What the map shows of a skill of the module. */
export interface SkillOnMap {
  /** The skill's local ID. */
  readonly id: string;
  /** Its assessability, from the graph. */
  readonly assessability: Assessability;
  /**
   * The state on the map of a skill of `verdict`, and null for one of `rubric` or `none`, which
   * has a mark instead, and for every skill on a map without state.
   */
  readonly state: MapState | null;
  /**
   * Whether the learner may choose the skill on the learner's view: there is state, and the skill
   * is not «ещё закрыт». A skill of `rubric` or `none` is open whenever there is state.
   */
  readonly open: boolean;
  /**
   * What a locked skill waits for: its prerequisites among the module's skills of `verdict` whose
   * mastery band is empty, in the order the graph lists them. Empty for every other skill.
   */
  readonly waitsFor: readonly string[];
  /**
   * The record of the answer the state comes from, the first that names the skill (R03), for the
   * adult's details; absent for a skill the answer does not name, and on a map without state.
   */
  readonly record?: SkillState;
}

/** A moment of the contract, google.protobuf.Timestamp, as the contracts give it. */
type Timestamp = NonNullable<SkillState["reviewDate"]>;

/** Whether the learner holds an anchor skill: «владеет», «не владеет», «неизвестно». */
export type Holding = "held" | "not-held" | "unknown";

/** Why the learner does not hold an anchor skill, or why it is unknown. */
export type Reason = "not-mastered" | "no-evidence" | "nobody-teaches" | "only-unassessable";

/** What the map shows of an anchor skill the graph names. */
export interface AnchorOnMap {
  /** The anchor skill's ID, "core.multiplication-table". */
  readonly id: string;
  /** Whether the learner holds it, and null on a map without state. */
  readonly holding: Holding | null;
  /**
   * Why not, or why it is unknown: null beside one held, for a reason this build does not know,
   * and for one that does not go with the holding.
   */
  readonly reason: Reason | null;
  /**
   * Whether a skill of the module has it as a prerequisite, and so it stands before tier 1; one
   * the graph names only in `teaches` is shown in the details of the skills that teach it (R03).
   */
  readonly prerequisite: boolean;
}

/** The states of a map: each skill of the module and each anchor skill its graph names. */
export interface MapStates {
  /** The module's skills, in the order of the graph, by local ID. */
  readonly skills: ReadonlyMap<string, SkillOnMap>;
  /** The anchor skills the graph names as prerequisites or in `teaches`, by ID, as first named. */
  readonly anchors: ReadonlyMap<string, AnchorOnMap>;
}

/** An object with one key, a value of an enum, and the name this build gives it. */
type Named<Value extends number, Name> = { readonly [Key in Value]: Name };

/**
 * The values of the contract's enums this build knows. The package takes the contracts' types
 * alone, so the values are its own (R08 in docs/decisions.md); `satisfies` holds each to its
 * member of the contract's: a value renumbered, two swapped, one added or one gone is a type error
 * here.
 */
const HOLDINGS = {
  1: "held",
  2: "not-held",
  3: "unknown",
} as const satisfies Named<AnchorSkillHolding.HELD, "held"> &
  Named<AnchorSkillHolding.NOT_HELD, "not-held"> &
  Named<AnchorSkillHolding.UNKNOWN, "unknown"> &
  Record<Exclude<AnchorSkillHolding, AnchorSkillHolding.UNSPECIFIED>, Holding>;
const REASONS = {
  1: "not-mastered",
  2: "no-evidence",
  3: "nobody-teaches",
  4: "only-unassessable",
} as const satisfies Named<AnchorSkillReason.NOT_MASTERED, "not-mastered"> &
  Named<AnchorSkillReason.NO_EVIDENCE, "no-evidence"> &
  Named<AnchorSkillReason.NOBODY_TEACHES, "nobody-teaches"> &
  Named<AnchorSkillReason.ONLY_UNASSESSABLE, "only-unassessable"> &
  Record<Exclude<AnchorSkillReason, AnchorSkillReason.UNSPECIFIED>, Reason>;

/** The reasons that explain each holding, as `progress.proto` spec gives them. */
const REASONS_OF: Readonly<Record<Holding, readonly Reason[]>> = {
  held: [],
  "not-held": ["not-mastered", "no-evidence"],
  unknown: ["nobody-teaches", "only-unassessable"],
};

/**
 * The states of a module's map at a time of the device (R03). Without the answer of GetSkillMap,
 * a map for site and the authors' tools, no skill has a state or is open, and no anchor skill a
 * holding.
 */
export function mapStates(
  graph: SkillGraph,
  skillMap: GetSkillMapResponse | null,
  now: Date,
): MapStates {
  const records = firstBy(skillMap?.skills ?? [], (record) => record.skill);
  const mastered = (id: string) => (records.get(id)?.masteryBand ?? "") !== "";

  const skills = new Map<string, SkillOnMap>();
  for (const [id, skill] of Object.entries(graph.skills)) {
    const { assessability } = skill;
    if (skillMap === null) {
      skills.set(id, { id, assessability, state: null, open: false, waitsFor: [] });
    } else if (assessability !== "verdict") {
      skills.set(id, { id, assessability, state: null, open: true, waitsFor: [] });
    } else {
      // A prerequisite of rubric or none and an anchor skill do not hold the skill back: the map
      // cannot see them mastered, and the engine keeps the author's order (R03).
      const waitsFor = (skill.prerequisites ?? []).filter(
        (prerequisite) =>
          Object.hasOwn(graph.skills, prerequisite) &&
          graph.skills[prerequisite]?.assessability === "verdict" &&
          !mastered(prerequisite),
      );
      // A skill the answer does not name reads as one without evidence (R03).
      const record = records.get(id);
      const state = stateOf(record, waitsFor.length === 0, now);
      skills.set(id, {
        id,
        assessability,
        state,
        open: state !== "locked",
        waitsFor: state === "locked" ? waitsFor : [],
        ...(record === undefined ? {} : { record }),
      });
    }
  }

  // The anchor skills, as the graph first names them; one named as a prerequisite anywhere stands
  // before tier 1.
  const prerequisites = new Set<string>();
  const ids: string[] = [];
  for (const skill of Object.values(graph.skills)) {
    for (const id of skill.prerequisites ?? []) prerequisites.add(id);
    for (const id of [...(skill.prerequisites ?? []), ...(skill.teaches ?? [])]) {
      if (!Object.hasOwn(graph.skills, id) && !ids.includes(id)) ids.push(id);
    }
  }
  const named = firstBy(skillMap?.anchorSkills ?? [], (record) => record.anchorSkill);
  const anchors = new Map<string, AnchorOnMap>();
  for (const id of ids) {
    const prerequisite = prerequisites.has(id);
    anchors.set(
      id,
      skillMap === null
        ? { id, holding: null, reason: null, prerequisite }
        : { id, ...holdingOf(named.get(id)), prerequisite },
    );
  }
  return { skills, anchors };
}

/** The first state that holds, by R03. */
function stateOf(
  record: SkillState | undefined,
  prerequisitesMastered: boolean,
  now: Date,
): MapState {
  if (record !== undefined && record.masteryBand !== "") {
    const due =
      record.reviewDue || (record.reviewDate !== undefined && notAfter(record.reviewDate, now));
    return due ? "review" : "mastered";
  }
  if (record !== undefined && record.evidenceCount > 0) return "practising";
  return prerequisitesMastered ? "ready" : "locked";
}

/**
 * Whether a moment of the contract is not later than a time of the device, compared exactly: the
 * device's time to the millisecond, the contract's to the nanosecond. A time that is no time, an
 * invalid Date, is later than no moment: the review falls due by `review_due` alone.
 */
function notAfter(moment: Timestamp, now: Date): boolean {
  const milliseconds = now.getTime();
  if (!Number.isFinite(milliseconds)) return false;
  const seconds = BigInt(Math.floor(milliseconds / 1000));
  const nanos = (milliseconds - Number(seconds) * 1000) * 1_000_000;
  return moment.seconds < seconds || (moment.seconds === seconds && moment.nanos <= nanos);
}

/**
 * The holding and reason of an anchor skill the graph names, from its record in the answer. A
 * holding this build does not know, the one never sent and an anchor skill the answer leaves out
 * read as «неизвестно»; a reason it does not know is not shown, and neither is one that does not
 * go with the holding — beside «владеет» there is none (`progress.proto` spec).
 */
function holdingOf(record: AnchorSkillState | undefined): Pick<AnchorOnMap, "holding" | "reason"> {
  const holding: Holding = known(HOLDINGS, record?.holding) ?? "unknown";
  const reason = known(REASONS, record?.reason);
  return {
    holding,
    reason: reason !== undefined && REASONS_OF[holding].includes(reason) ? reason : null,
  };
}

/** The name of a value of an enum, if this build knows it. */
function known<T extends string>(
  names: Readonly<Record<number, T>>,
  value: number | undefined,
): T | undefined {
  return value === undefined ? undefined : names[value];
}

/** The records of a list by a key, the first of each key counting (R03). */
function firstBy<T>(records: readonly T[], key: (record: T) => string): Map<string, T> {
  const byKey = new Map<string, T>();
  for (const record of records) {
    if (!byKey.has(key(record))) byKey.set(key(record), record);
  }
  return byKey;
}
