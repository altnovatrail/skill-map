// The words of the map: the package's own table (R91 spec; R09 in docs/decisions.md). A phrase
// with something in it is a template with named places, {tier} or {skills}, which the tree fills
// with text or with nodes of their own language, so that a language orders it as it needs: no
// phrase is glued from pieces. English alone for now; Russian, the forms of numbers by CLDR and
// the choice by the attribute `lang` come with RUN.md, T14.

import type { Holding, MapState, Reason } from "../core/states.js";

/** The words of one language. */
export interface Words {
  /** The language's tag, the lang of the map's own words. */
  readonly lang: string;
  /** The heading of a tier's band without a name, with {tier}: "Tier 3". */
  readonly tier: string;
  /** The heading of a tier's band with a name, with {tier} and {name}: "Tier 2 · Sharing". */
  readonly tierNamed: string;
  /** The heading of the band of anchor skills. */
  readonly anchors: string;
  /** Between the parts of a tile's accessible name: "Quarters, Locked". */
  readonly separator: string;
  readonly states: Readonly<Record<MapState, string>>;
  /** The marks of a skill of rubric or none. */
  readonly marks: Readonly<Record<"rubric" | "none", string>>;
  readonly holdings: Readonly<Record<Holding, string>>;
  readonly reasons: Readonly<Record<Reason, string>>;
  /** The labels of the tiles linked to the expanded one. */
  readonly neededBefore: string;
  readonly opensAfter: string;
  /** The parts of the details. */
  readonly buildsOn: string;
  readonly opens: string;
  readonly teaches: string;
  readonly neededBy: string;
  /** A prerequisite of a locked skill, with {skill}. */
  readonly notMastered: string;
  /** An anchor skill's holding with its reason, with {holding} and {reason}. */
  readonly holdingReason: string;
  /** An anchor skill a skill teaches, with {skill} and {holding}. */
  readonly taught: string;
  /** The button that chooses the skill for a lesson. */
  readonly practise: string;
  /** What a locked skill waits for, with {skills}: its prerequisites' titles as a list. */
  readonly waitsFor: string;
  /** The language whose lists join the titles of {skills}. */
  readonly list: Intl.ListFormat;
  /** The adult's details. */
  readonly evidence: (count: number) => string;
  readonly lastPractised: (date: Date) => string;
  /** The mastery band, with {band}: its title from the manifest. */
  readonly band: string;
  readonly reviewOn: (date: Date) => string;
  readonly reviewDue: string;
}

const DATE = new Intl.DateTimeFormat("en", { dateStyle: "medium" });
const PLURAL = new Intl.PluralRules("en");

export const EN: Words = {
  lang: "en",
  tier: "Tier {tier}",
  tierNamed: "Tier {tier} · {name}",
  anchors: "Skills from other modules",
  separator: ", ",
  states: {
    review: "Time to review",
    mastered: "Mastered",
    practising: "In progress",
    ready: "Ready to start",
    locked: "Locked",
  },
  marks: { rubric: "Feedback by criteria", none: "Not assessed" },
  holdings: { held: "Held", "not-held": "Not held", unknown: "Unknown" },
  reasons: {
    "not-mastered": "a skill that teaches it is not mastered yet",
    "no-evidence": "no skill that teaches it has answers yet",
    "nobody-teaches": "no module teaches it",
    "only-unassessable": "only skills without a verdict teach it",
  },
  neededBefore: "needed before",
  opensAfter: "opens after",
  buildsOn: "Builds on",
  opens: "Opens",
  teaches: "Teaches",
  neededBy: "Needed by",
  notMastered: "{skill} — not mastered yet",
  holdingReason: "{holding} — {reason}",
  taught: "{skill} — {holding}",
  practise: "Practise",
  waitsFor: "Waits for: {skills}",
  list: new Intl.ListFormat("en", { type: "conjunction" }),
  evidence: (count) => (PLURAL.select(count) === "one" ? `${count} answer` : `${count} answers`),
  lastPractised: (date) => `Last practised ${DATE.format(date)}`,
  band: "Mastery band: {band}",
  reviewOn: (date) => `Review on ${DATE.format(date)}`,
  reviewDue: "Time to review",
};
