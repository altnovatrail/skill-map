// The tree of the map in the element's shadow root (R06; docs/architecture.md, section 3.4): a band
// is a heading and a list of tiles, a tile is a button that expands the skill, and the details are
// an item of the list right after it. The tree is the map's text alternative too: the order of the
// DOM is the order on the screen. On new data it is updated in place, by the skill's ID, so that
// the focus and the expanded skill stay (the second amendment of 2026-11-07 to R04).

import type {
  GetSkillMapResponse,
  SkillState,
} from "@altnovatrail/contracts/novatrail/api/v1/progress_pb.js";
import type { Manifest, SkillGraph } from "@altnovatrail/spec/formatv0/open";
import type { View } from "../core/attributes.js";
import { fullSkillId } from "../core/index.js";
import { type Band, focusAfter, type Layout, type Links, layout, linksOf } from "../core/layout.js";
import {
  type AnchorOnMap,
  type Holding,
  type MapStates,
  mapStates,
  type SkillOnMap,
} from "../core/states.js";
import { ANCHOR_TITLES } from "./anchor-titles.js";
import type { Words } from "./words.js";

/** What the tree is drawn from. */
export interface MapData {
  readonly graph: SkillGraph;
  readonly tiers: Readonly<Record<string, number>>;
  readonly manifest: Manifest;
  readonly skillMap: GetSkillMapResponse | null;
  readonly view: View | null;
  readonly headingLevel: number;
  readonly now: Date;
  readonly words: Words;
}

/** The nodes of a band, kept across updates. */
interface BandNodes {
  readonly section: HTMLElement;
  heading: HTMLElement;
  readonly list: HTMLUListElement;
}

/** The nodes of a tile, kept across updates. */
interface TileNodes {
  readonly item: HTMLLIElement;
  readonly button: HTMLButtonElement;
}

/** The ID of the details, the one item that a tile's aria-controls names. */
const DETAILS = "details";

/** The tree of one element's map. */
export class MapTree {
  readonly #root: ShadowRoot;
  readonly #choose: (skill: string) => void;
  readonly #container: HTMLDivElement;
  readonly #bands = new Map<string, BandNodes>();
  readonly #tiles = new Map<string, TileNodes>();
  /** The skill of each node the focus can be on: a tile, or the button «Practise». */
  readonly #skillOf = new WeakMap<Element, string>();
  readonly #details: HTMLLIElement;
  readonly #practise: HTMLButtonElement;
  #expanded: string | null = null;
  /** The full ID of the skill «Practise» chooses, set when it is drawn. */
  #chosen = "";
  #layout: Layout | null = null;
  #data: MapData | null = null;

  constructor(root: ShadowRoot, choose: (skill: string) => void) {
    this.#root = root;
    this.#choose = choose;
    this.#container = root.ownerDocument.createElement("div");
    this.#container.className = "map";
    this.#details = this.#element("li", "details");
    this.#details.id = DETAILS;
    this.#practise = this.#element("button", "practise");
    this.#practise.type = "button";
    this.#practise.addEventListener("click", () => this.#choose(this.#chosen));
    root.append(this.#container);
  }

  /** Draws the map from new data, or clears it without any. */
  render(data: MapData | null): void {
    const active = this.#root.activeElement;
    const focused = active === null ? undefined : this.#skillOf.get(active);
    const before = this.#layout;
    this.#data = data;
    if (data === null) {
      this.#container.replaceChildren();
      this.#bands.clear();
      this.#tiles.clear();
      this.#expanded = null;
      this.#layout = null;
      return;
    }

    // The package's words are of their own language, which the titles' lang overrides (3.1.2).
    this.#container.lang = data.words.lang;
    const map = layout(data.graph, data.tiers);
    const states = mapStates(data.graph, data.skillMap, data.now);
    if (this.#expanded !== null && !map.places.has(this.#expanded)) this.#expanded = null;
    const links = this.#expanded === null ? null : linksOf(data.graph, map, this.#expanded);

    const sections: HTMLElement[] = [];
    const bandsUsed = new Set<string>();
    const tilesUsed = new Set<string>();
    for (const band of map.bands) {
      const key = band.kind === "anchors" ? "anchors" : `tier ${band.tier}`;
      bandsUsed.add(key);
      const nodes = this.#band(key, band, data);
      const items: HTMLLIElement[] = [];
      for (const id of band.skills) {
        tilesUsed.add(id);
        const tile = this.#tile(id);
        this.#drawTile(tile, id, band, states, links, data);
        items.push(tile.item);
        if (id === this.#expanded) {
          this.#drawDetails(id, band, states, links ?? linksOf(data.graph, map, id), data);
          items.push(this.#details);
        }
      }
      place(nodes.list, items);
      sections.push(nodes.section);
    }
    place(this.#container, sections);
    for (const key of [...this.#bands.keys()]) if (!bandsUsed.has(key)) this.#bands.delete(key);
    for (const id of [...this.#tiles.keys()]) if (!tilesUsed.has(id)) this.#tiles.delete(id);
    this.#layout = map;

    // A node the focus was on stays focused where it still is, though it was moved; one that is
    // gone hands the focus to a tile by R06.
    if (active instanceof HTMLElement && focused !== undefined) {
      if (active.isConnected && active.getRootNode() === this.#root) {
        if (this.#root.activeElement !== active) active.focus({ preventScroll: true });
      } else if (before !== null) {
        const target = focusAfter(before, map, focused);
        if (target !== null) this.#tiles.get(target)?.button.focus({ preventScroll: true });
      }
    }
  }

  #band(key: string, band: Band, data: MapData): BandNodes {
    let nodes = this.#bands.get(key);
    if (nodes === undefined) {
      const section = this.#element("section", "band");
      const list = this.#element("ul");
      nodes = { section, heading: this.#element("h3"), list };
      section.append(nodes.heading, list);
      this.#bands.set(key, nodes);
    }
    const tag = `H${data.headingLevel}`;
    if (nodes.heading.tagName !== tag) {
      const heading = this.#element(`h${data.headingLevel}` as "h3");
      nodes.heading.replaceWith(heading);
      nodes.heading = heading;
    }
    const { words } = data;
    nodes.heading.replaceChildren(
      ...(band.kind === "anchors"
        ? [words.anchors]
        : band.name === null
          ? fill(words.tier, { tier: String(band.tier) })
          : fill(words.tierNamed, {
              tier: String(band.tier),
              name: this.#text("span", band.name, data.manifest.languages.explanation),
            })),
    );
    return nodes;
  }

  #tile(id: string): TileNodes {
    let nodes = this.#tiles.get(id);
    if (nodes === undefined) {
      const item = this.#element("li");
      const button = this.#element("button", "tile");
      button.type = "button";
      button.addEventListener("click", () => {
        this.#expanded = this.#expanded === id ? null : id;
        this.render(this.#data);
      });
      this.#skillOf.set(button, id);
      item.append(button);
      nodes = { item, button };
      this.#tiles.set(id, nodes);
    }
    return nodes;
  }

  #drawTile(
    tile: TileNodes,
    id: string,
    band: Band,
    states: MapStates,
    links: Links | null,
    data: MapData,
  ): void {
    const { words } = data;
    const parts: string[] = [];
    const skill = states.skills.get(id);
    const state =
      band.kind === "anchors"
        ? anchorWord(states, id, words)
        : skill === undefined
          ? null
          : skillWord(skill, words);
    if (state !== null) parts.push(state);
    if (links?.buildsOn.includes(id)) parts.push(words.neededBefore);
    if (links?.opens.includes(id)) parts.push(words.opensAfter);
    tile.button.replaceChildren(
      this.#title(id, band.kind === "anchors", data),
      ...parts.flatMap((part) => [words.separator, this.#text("span", part)]),
    );
    const expanded = id === this.#expanded;
    tile.button.setAttribute("aria-expanded", String(expanded));
    if (expanded) tile.button.setAttribute("aria-controls", DETAILS);
    else tile.button.removeAttribute("aria-controls");
  }

  #drawDetails(id: string, band: Band, states: MapStates, links: Links, data: MapData): void {
    const { words, graph } = data;
    const content: Node[] = [this.#paragraph([this.#title(id, band.kind === "anchors", data)])];
    let action: Node | null = null;

    if (band.kind === "anchors") {
      const anchor = states.anchors.get(id);
      if (anchor !== undefined && anchor.holding !== null) {
        content.push(this.#paragraph(anchorPhrase(anchor.holding, anchor, words)));
      }
      content.push(...this.#list(words.neededBy, links.opens, data));
    } else {
      const skill = states.skills.get(id);
      const description = graph.skills[id]?.description;
      if (description !== undefined) {
        content.push(
          this.#paragraph([this.#text("span", description, data.manifest.languages.explanation)]),
        );
      }
      const word = skill === undefined ? null : skillWord(skill, words);
      if (word !== null) content.push(this.#paragraph([word]));
      content.push(...this.#list(words.buildsOn, links.buildsOn, data, skill?.waitsFor));
      content.push(...this.#list(words.opens, links.opens, data));
      content.push(...this.#teaches(links.teaches, states, data));
      // GetSkillMap gives state only to a skill of verdict: one of rubric or none has no numbers.
      if (data.view === "adult" && data.skillMap !== null && skill?.assessability === "verdict") {
        content.push(...this.#numbers(skill.record, data));
      }
      if (data.view === "learner" && data.skillMap !== null && skill !== undefined) {
        if (skill.open) {
          this.#practise.textContent = words.practise;
          this.#skillOf.set(this.#practise, id);
          this.#chosen = fullSkillId(data.manifest.id, id);
          action = this.#practise;
        } else {
          // In the order of the layout, as Builds on: the order of the graph carries no meaning.
          const waiting = links.buildsOn.filter((other) => skill.waitsFor.includes(other));
          action = this.#paragraph(fill(words.waitsFor, { skills: this.#titles(waiting, data) }));
        }
      }
    }

    // The button «Practise» stays where it is while it stays: moving it would take the focus off it.
    if (action === this.#practise && this.#practise.parentNode === this.#details) {
      for (const child of [...this.#details.childNodes])
        if (child !== this.#practise) child.remove();
      this.#practise.before(...content);
    } else {
      this.#details.replaceChildren(...content, ...(action === null ? [] : [action]));
    }
  }

  /** A part of the details: a label and the titles of the tiles it names, if there are any. */
  #list(label: string, ids: readonly string[], data: MapData, notMastered: readonly string[] = []) {
    if (ids.length === 0) return [];
    const list = this.#element("ul");
    for (const id of ids) {
      const item = this.#element("li");
      const title = this.#title(id, !Object.hasOwn(data.graph.skills, id), data);
      item.append(
        ...(notMastered.includes(id) ? fill(data.words.notMastered, { skill: title }) : [title]),
      );
      list.append(item);
    }
    return [this.#paragraph([label]), list];
  }

  /** What a skill teaches: each anchor skill of its teaches, with its holding if there is one. */
  #teaches(ids: readonly string[], states: MapStates, data: MapData): Node[] {
    if (ids.length === 0) return [];
    const list = this.#element("ul");
    for (const id of ids) {
      const item = this.#element("li");
      const title = this.#title(id, true, data);
      const anchor = states.anchors.get(id);
      item.append(
        ...(anchor === undefined || anchor.holding === null
          ? [title]
          : fill(data.words.taught, {
              skill: title,
              holding: anchorPhrase(anchor.holding, anchor, data.words),
            })),
      );
      list.append(item);
    }
    return [this.#paragraph([data.words.teaches]), list];
  }

  /** The adult's details of a skill of verdict (R03): no estimate, uncertainty or retention. */
  #numbers(state: SkillState | undefined, data: MapData): Node[] {
    const { words, manifest } = data;
    const lines: (string | Node)[][] = [[words.evidence(state?.evidenceCount ?? 0)]];
    if (state?.lastPracticedAt !== undefined) {
      lines.push([words.lastPractised(dateOf(state.lastPracticedAt))]);
    }
    if (state !== undefined && state.masteryBand !== "") {
      const band = manifest.bands?.find(({ id }) => id === state.masteryBand);
      const title =
        band === undefined
          ? state.masteryBand
          : this.#text("span", band.title, manifest.languages.explanation);
      lines.push(fill(words.band, { band: title }));
      if (state.reviewDue) lines.push([words.reviewDue]);
      else if (state.reviewDate !== undefined)
        lines.push([words.reviewOn(dateOf(state.reviewDate))]);
    }
    return lines.map((line) => this.#paragraph(line));
  }

  /** The title of a skill of the module in its language, or an anchor skill's in English (R04). */
  #title(id: string, anchor: boolean, data: MapData): HTMLElement {
    return anchor
      ? this.#text("span", ANCHOR_TITLES[id] ?? id, "en", "title")
      : this.#text(
          "span",
          data.graph.skills[id]?.title ?? id,
          data.manifest.languages.explanation,
          "title",
        );
  }

  /** The titles of skills of the module, as a list of the words' language. */
  #titles(ids: readonly string[], data: MapData): Node[] {
    return data.words.list
      .formatToParts(ids)
      .map((part) =>
        part.type === "element"
          ? this.#title(part.value, false, data)
          : this.#root.ownerDocument.createTextNode(part.value),
      );
  }

  #paragraph(children: readonly (Node | string)[]): HTMLParagraphElement {
    const paragraph = this.#element("p");
    paragraph.append(...children);
    return paragraph;
  }

  #text(tag: "span", text: string, lang: string | null = null, name?: string): HTMLElement {
    const node = this.#element(tag, name);
    node.textContent = text;
    if (lang !== null) node.lang = lang;
    return node;
  }

  #element<K extends keyof HTMLElementTagNameMap>(tag: K, name?: string): HTMLElementTagNameMap[K] {
    const node = this.#root.ownerDocument.createElement(tag);
    if (name !== undefined) node.className = name;
    return node;
  }
}

/** Puts the children of a node in order, moving only those that are not where they belong. */
function place(parent: Element, children: readonly Element[]): void {
  children.forEach((child, index) => {
    const there = parent.children[index];
    if (there !== child) parent.insertBefore(child, there ?? null);
  });
  while (parent.children.length > children.length) parent.lastElementChild?.remove();
}

/** A template's text with its places filled: {name} by text or by a node. */
export function fill(
  template: string,
  values: Readonly<Record<string, string | Node | readonly (string | Node)[]>>,
): (string | Node)[] {
  return template.split(/(\{[a-z]+\})/).flatMap((piece) => {
    const value = /^\{([a-z]+)\}$/.exec(piece)?.[1];
    if (value === undefined) return piece === "" ? [] : [piece];
    const filled = values[value] ?? piece;
    return typeof filled === "string" || filled instanceof Node ? [filled] : [...filled];
  });
}

/** The word of a skill of the module's state or mark, or null on a map without state. */
function skillWord(skill: SkillOnMap, words: Words): string | null {
  if (skill.assessability !== "verdict") return words.marks[skill.assessability];
  return skill.state === null ? null : words.states[skill.state];
}

/** The word of an anchor skill's holding, or null on a map without state. */
function anchorWord(states: MapStates, id: string, words: Words): string | null {
  const holding = states.anchors.get(id)?.holding ?? null;
  return holding === null ? null : words.holdings[holding];
}

/** An anchor skill's holding with its reason, if it has one. */
function anchorPhrase(held: Holding, anchor: AnchorOnMap, words: Words): (string | Node)[] {
  const holding = words.holdings[held];
  return anchor.reason === null
    ? [holding]
    : fill(words.holdingReason, { holding, reason: words.reasons[anchor.reason] });
}

/** A moment of the contract as a Date of the device. */
function dateOf(moment: NonNullable<SkillState["reviewDate"]>): Date {
  return new Date(Number(moment.seconds) * 1000 + Math.floor(moment.nanos / 1_000_000));
}
