// The words of the map: the package's own table, in each language of the interface, English and
// Russian (R91 spec, R92 spec; R10 in docs/decisions.md). The table is data alone. A phrase with
// something in it is a template with named places, {tier} or {skills}, which the tree fills with
// text or with nodes of their own language, so that a language orders it as it needs: no phrase is
// glued from pieces. A phrase with a number has a form for each category of CLDR the language
// uses, and `other` always. No phrase tells the learner's gender. The language is the element's own
// attribute `lang`, found in the table by languageOf of the core, and English otherwise.

import { languageOf } from "../core/attributes.js";
import type { Holding, MapState, Reason } from "../core/states.js";

/** A phrase with a number in {count}: a form for each plural category of CLDR, and `other`. */
export type Plural = { readonly other: string } & Partial<
  Readonly<Record<Exclude<Intl.LDMLPluralRule, "other">, string>>
>;

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
  /** The adult's details: the number of answers, in {count}. */
  readonly evidence: Plural;
  /** The day of the last answer, with {date}. */
  readonly lastPractised: string;
  /** The mastery band, with {band}: its title from the manifest. */
  readonly band: string;
  /** The day of the next review, with {date}. */
  readonly reviewOn: string;
  readonly reviewDue: string;
}

/** The words in English, the code's own language: those of any language the table has not. */
const EN: Words = {
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
  evidence: { one: "{count} answer", other: "{count} answers" },
  lastPractised: "Last practised {date}",
  band: "Mastery band: {band}",
  reviewOn: "Review on {date}",
  reviewDue: "Time to review",
};

const RU: Words = {
  lang: "ru",
  tier: "Ярус {tier}",
  tierNamed: "Ярус {tier} · {name}",
  anchors: "Навыки других модулей",
  separator: ", ",
  states: {
    review: "Пора повторить",
    mastered: "Освоено",
    practising: "В работе",
    ready: "Можно начинать",
    locked: "Ещё закрыт",
  },
  marks: { rubric: "Отзыв по критериям", none: "Без оценки" },
  holdings: { held: "Владеет", "not-held": "Не владеет", unknown: "Неизвестно" },
  reasons: {
    "not-mastered": "не освоен навык, который ему учит",
    "no-evidence": "у навыков, которые ему учат, ещё нет ответов",
    "nobody-teaches": "ему не учит ни один модуль",
    "only-unassessable": "ему учат только навыки без вердикта",
  },
  neededBefore: "нужен раньше",
  opensAfter: "откроется после",
  buildsOn: "Опирается на",
  opens: "Открывает",
  teaches: "Учит",
  neededBy: "Нужен для",
  notMastered: "{skill} — ещё не освоен",
  holdingReason: "{holding} — {reason}",
  taught: "{skill} — {holding}",
  practise: "Заниматься",
  waitsFor: "Ждёт: {skills}",
  evidence: {
    one: "{count} ответ",
    few: "{count} ответа",
    many: "{count} ответов",
    other: "{count} ответа",
  },
  lastPractised: "Последнее занятие: {date}",
  band: "Полоса освоения: {band}",
  reviewOn: "Повторить {date}",
  reviewDue: "Пора повторить",
};

/**
 * The words by language, each a language tag in lower case. A map, not an object: a tag such as
 * "constructor" finds nothing of an object's prototype in it.
 */
export const WORDS: ReadonlyMap<string, Words> = new Map([
  ["en", EN],
  ["ru", RU],
]);

const LANGUAGES: ReadonlySet<string> = new Set(WORDS.keys());

/** The words of the language an attribute `lang` names, and English when the table has none. */
export function wordsFor(attribute: string | null): Words {
  const lang = languageOf(attribute, LANGUAGES);
  return (lang === null ? undefined : WORDS.get(lang)) ?? EN;
}

/** How a language writes lists, numbers and days, made once for each language. */
export interface Formats {
  readonly list: Intl.ListFormat;
  readonly plural: Intl.PluralRules;
  readonly number: Intl.NumberFormat;
  readonly date: Intl.DateTimeFormat;
}

const FORMATS = new Map<string, Formats>();

/** The formats of the language of a table of words. */
export function formatsOf(words: Words): Formats {
  let formats = FORMATS.get(words.lang);
  if (formats === undefined) {
    formats = {
      list: new Intl.ListFormat(words.lang, { type: "conjunction" }),
      plural: new Intl.PluralRules(words.lang),
      number: new Intl.NumberFormat(words.lang),
      date: new Intl.DateTimeFormat(words.lang, { dateStyle: "medium" }),
    };
    FORMATS.set(words.lang, formats);
  }
  return formats;
}

/** The form of a phrase with a number that the language's plural rules choose for it. */
export function formOf(phrase: Plural, count: number, formats: Formats): string {
  const category = formats.plural.select(count);
  return category === "other" ? phrase.other : (phrase[category] ?? phrase.other);
}
