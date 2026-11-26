// The DOM-free part of the skill map: the rules the element draws by, the same in a browser and in
// Node. It is no entry point of the package: the element is the contract with app, and
// this part is what it is built from. Of it only the rule of the states goes out, as one function
// at ./states, skill-states.ts.

/**
 * The full ID of a skill, as ChooseNext takes it in its field `skill`: the module's ID, `skill` and
 * the skill's ID in the module, joined by `/` — `example/fair-shares/skill/halves`.
 */
export function fullSkillId(moduleId: string, skillId: string): string {
  return `${moduleId}/skill/${skillId}`;
}

export * from "./attributes.js";
export * from "./columns.js";
export * from "./layout.js";
export * from "./lines.js";
export * from "./states.js";
