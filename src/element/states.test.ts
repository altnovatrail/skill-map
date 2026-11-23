import { describe, expect, test } from "vitest";
import { GRAPH, NOW, SKILL_MAP, skillMap, skillState } from "../core/fair-shares.fixture.js";
import { type SkillStatus, skillStates } from "../core/skill-states.js";
import { button, mount, useMap } from "./map.fixture.js";
import { wordsFor } from "./words.js";

useMap();

const { states, marks } = wordsFor("en");

/** The English word of each value of ./states, as the element names a state or a mark. */
const WORD: Readonly<Record<SkillStatus, string>> = {
  "time-to-review": states.review,
  mastered: states.mastered,
  "in-progress": states.practising,
  "ready-to-start": states.ready,
  locked: states.locked,
  "feedback-by-criteria": marks.rubric,
  "not-assessed": marks.none,
};

describe("on the same data, the map and ./states give each skill one state", () => {
  const answers = {
    "the answer of the example": SKILL_MAP,
    "an answer that names no skill": skillMap([]),
    "every skill of verdict mastered": skillMap(
      ["count-objects", "halves", "equal-groups", "share-with-remainder", "quarters"].map((skill) =>
        skillState({ skill, masteryBand: "b1", evidenceCount: 3 }),
      ),
    ),
  };
  for (const [name, answer] of Object.entries(answers)) {
    test(name, async () => {
      await mount({ view: "learner" }, answer);
      const statuses = skillStates(GRAPH, answer, NOW);
      expect([...statuses.keys()]).toEqual(Object.keys(GRAPH.skills));
      for (const [id, status] of statuses) {
        const title = GRAPH.skills[id]?.title;
        expect(button(`${title}, ${WORD[status]}`)).toBeTruthy();
      }
    });
  }
});
