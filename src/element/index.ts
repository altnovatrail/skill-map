// The package's one entry point: importing it registers <novatrail-skill-map>, the element app
// draws a module's skill map with (R04; R36 spec). Data comes in by properties, the view, the
// language and the level of headings by attributes, and the choice of a skill goes out by the
// event skillchoose; there are no methods. The map keeps nothing of a learner's beyond its memory
// while it is on the page (R03).

import type { GetSkillMapResponse } from "@altnovatrail/contracts/novatrail/api/v1/progress_pb.js";
import type { Manifest, SkillGraph } from "@altnovatrail/spec/formatv0/open";
import { headingLevel, type View, viewOf } from "../core/attributes.js";
import { styles } from "./styles.js";
import { MapTree } from "./tree.js";
import { wordsFor } from "./words.js";

/** The element's name. */
export const TAG = "novatrail-skill-map";

/** The view of the map, by the attribute `view`: the learner's or the adult's (R03). */
export type SkillMapView = View;

/** What skillchoose carries: the full ID of the skill the learner chose, for ChooseNext. */
export interface SkillChoose {
  /** The module's ID, `skill` and the skill's ID in the module, joined by `/` (R04). */
  readonly skill: string;
}

/** The event the map sends when the learner chooses a skill to practise. */
export type SkillChooseEvent = CustomEvent<SkillChoose>;

/** The skill map of one module: its skills in tiers, with the learner model's state over them. */
export class NovatrailSkillMap extends HTMLElement {
  static readonly observedAttributes = ["view", "lang", "heading-level"];

  #graph: SkillGraph | null = null;
  #tiers: Readonly<Record<string, number>> | null = null;
  #manifest: Manifest | null = null;
  #skillMap: GetSkillMapResponse | null = null;
  #scheduled = false;
  readonly #tree: MapTree;

  constructor() {
    super();
    // A property a page set before the package registered the element is an own property of it,
    // which hides the accessor: it is taken out and assigned again, through the accessor.
    const own = this as unknown as Record<string, unknown>;
    const early: [string, unknown][] = [];
    for (const name of ["graph", "tiers", "manifest", "skillMap"]) {
      if (Object.hasOwn(this, name)) {
        early.push([name, own[name]]);
        delete own[name];
      }
    }
    const root = this.attachShadow({ mode: "open" });
    root.adoptedStyleSheets = [styles()];
    this.#tree = new MapTree(root, (skill) => {
      this.dispatchEvent(
        new CustomEvent<SkillChoose>("skillchoose", {
          bubbles: true,
          composed: true,
          detail: Object.freeze({ skill }),
        }),
      );
    });
    for (const [name, value] of early) Reflect.set(this, name, value);
  }

  /** The open view of the module's skill graph, as GetSkillGraph gives it (R04). */
  get graph(): SkillGraph | null {
    return this.#graph;
  }
  set graph(graph: SkillGraph | null) {
    this.#graph = graph;
    this.#schedule();
  }

  /** The tiers of the graph's skills, `skill_tiers` of GetSkillGraph, by the skill's local ID. */
  get tiers(): Readonly<Record<string, number>> | null {
    return this.#tiers;
  }
  set tiers(tiers: Readonly<Record<string, number>> | null) {
    this.#tiers = tiers;
    this.#schedule();
  }

  /** The open view of the module's manifest: its ID, explanation language and bands. */
  get manifest(): Manifest | null {
    return this.#manifest;
  }
  set manifest(manifest: Manifest | null) {
    this.#manifest = manifest;
    this.#schedule();
  }

  /** The answer of GetSkillMap, or null for a map without state (R03). */
  get skillMap(): GetSkillMapResponse | null {
    return this.#skillMap;
  }
  set skillMap(skillMap: GetSkillMapResponse | null) {
    this.#skillMap = skillMap;
    this.#schedule();
  }

  attributeChangedCallback(): void {
    this.#schedule();
  }

  /**
   * Updates the map once for whatever one task assigned, after it: app assigns the graph, the
   * tiers, the manifest and the state one after another, and the map follows them in place.
   */
  #schedule(): void {
    if (this.#scheduled) return;
    this.#scheduled = true;
    queueMicrotask(() => {
      this.#scheduled = false;
      this.#render();
    });
  }

  #render(): void {
    const graph = this.#graph;
    const tiers = this.#tiers;
    const manifest = this.#manifest;
    this.#tree.render(
      graph === null || tiers === null || manifest === null
        ? null
        : {
            graph,
            tiers,
            manifest,
            skillMap: this.#skillMap,
            view: viewOf(this.getAttribute("view")),
            headingLevel: headingLevel(this.getAttribute("heading-level")),
            now: new Date(),
            words: wordsFor(this.getAttribute("lang")),
          },
    );
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
  // The event bubbles and leaves the shadow tree: its type holds on the element, on its ancestors
  // and on the document alike.
  interface GlobalEventHandlersEventMap {
    skillchoose: SkillChooseEvent;
  }
}
