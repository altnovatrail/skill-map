// The package's one entry point: importing it registers <novatrail-skill-map>, the element app
// draws a module's skill map with (R04; R36 spec). Its properties, attributes, event and tree come
// with the tasks that follow (RUN.md, T13); here it is the element with its shadow root.

/** The element's name. */
export const TAG = "novatrail-skill-map";

/** The skill map of one module: its skills in tiers, with the learner model's state over them. */
export class NovatrailSkillMap extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
}

// A second copy of this module, from a second copy of the package, finds the name taken and
// leaves the first registration in place, rather than throwing when the page imports it. It says
// so, though: elements of the page are then built by the other copy, of whatever version it is.
// A module runs once, so the name taken is never this copy's own class.
if (customElements.get(TAG) === undefined) {
  customElements.define(TAG, NovatrailSkillMap);
} else {
  console.warn(
    `<${TAG}> is already registered by another copy of @altnovatrail/skill-map; this copy's element is not used`,
  );
}

declare global {
  interface HTMLElementTagNameMap {
    [TAG]: NovatrailSkillMap;
  }
}
