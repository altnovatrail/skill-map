// The DOM-free part of the skill map: the rules the element draws by, the same in a browser and in
// Node (R08 in docs/decisions.md). It is no entry point of the package: the element is the one
// contract with app (R04), and this part is what it is built from.

/**
 * The full ID of a skill, as ChooseNext takes it in its field `skill`: the module's ID, `skill` and
 * the skill's ID in the module, joined by `/` — `example/fair-shares/skill/halves` (R04; the
 * format's text, section 10).
 */
export function fullSkillId(moduleId: string, skillId: string): string {
  return `${moduleId}/skill/${skillId}`;
}

export * from "./states.js";
