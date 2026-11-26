// The tree of the map in the element's shadow root: the legend, then a band for the anchor skills
// and one for each tier — a heading, how many of its skills are mastered, and a list of tiles —,
// a tile a button that chooses the skill, and the chosen skill's card an item of the list right
// after its tile. The tree is the map's text alternative too: the order of the DOM is the order of
// reading, band after band and tile after tile, the card after the chosen tile. Where the map is
// wide enough for its tiers side by side they stand as columns, each tile level with the skills it
// builds on, and every link has its line; where it is not they are bands top to bottom, and only
// the chosen skill's chain has lines. A chosen skill lights its chain and dims the rest; its card
// stands at the bottom of the window. On new data the tree is updated in place, by the skill's ID,
// so that the focus and the chosen skill stay.

import type {
  GetSkillMapResponse,
  SkillState,
} from "@altnovatrail/contracts/novatrail/api/v1/progress_pb.js";
import type { Manifest, SkillGraph } from "@altnovatrail/spec/formatv0/open";
import type { View } from "../core/attributes.js";
import { columnTops } from "../core/columns.js";
import { fullSkillId } from "../core/index.js";
import {
  allLinks,
  type Band,
  chainOf,
  focusAfter,
  type Layout,
  type Link,
  type Links,
  layout,
  linksOf,
} from "../core/layout.js";
import { type Arrangement, type Box, type Line, linesOf } from "../core/lines.js";
import {
  type AnchorOnMap,
  type MapStates,
  mapStates,
  type Shown,
  shownOf,
} from "../core/states.js";
import { ANCHOR_TITLES } from "./anchor-titles.js";
import { ICONS, type IconValue } from "./icons.js";
import { Lines, SVG } from "./lines.js";
import { formatsOf, formOf, type Words } from "./words.js";

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
  readonly progress: HTMLParagraphElement;
  readonly list: HTMLUListElement;
}

/** The nodes of a tile, kept across updates. */
interface TileNodes {
  readonly item: HTMLLIElement;
  readonly button: HTMLButtonElement;
}

/** The ID of the card, the one item that a tile's aria-controls names. */
const DETAILS = "details";

/** The width of a column, at least, and of the gap between two, in rem. */
const COLUMN = 11;
const GAP = 3.5;

/** The gap between two tiles of a column, in rem, as the style has it. */
const TILE_GAP = 0.5;

/** The values a tile's look and the legend go by, in the legend's order. */
const LEGEND: readonly Shown[] = [
  "mastered",
  "review",
  "practising",
  "ready",
  "locked",
  "rubric",
  "none",
];

/** The values from which a link has been walked: its prerequisite is held. */
const WALKED: ReadonlySet<IconValue> = new Set(["mastered", "review", "held"]);

/** The tree of one element's map. */
export class MapTree {
  readonly #root: ShadowRoot;
  readonly #choose: (skill: string) => void;
  readonly #container: HTMLDivElement;
  readonly #legend: HTMLUListElement;
  readonly #tiersBox: HTMLDivElement;
  readonly #bands = new Map<string, BandNodes>();
  readonly #tiles = new Map<string, TileNodes>();
  /** The skill of each node the focus can be on: a tile, a chip of the card, or «Practise». */
  readonly #skillOf = new WeakMap<Element, string>();
  readonly #details: HTMLLIElement;
  readonly #practise: HTMLButtonElement;
  readonly #close: HTMLButtonElement;
  #expanded: string | null = null;
  /** The full ID of the skill «Practise» chooses, set when it is drawn. */
  #chosen = "";
  #layout: Layout | null = null;
  #states: MapStates | null = null;
  /** Each icon, built once from its paths, and cloned wherever it stands. */
  readonly #icons = new Map<IconValue, SVGSVGElement>();
  #data: MapData | null = null;
  /** The chosen skill's chain, or null with none chosen. */
  #chain: ReadonlySet<string> | null = null;
  /** The lines under the tiles, and those of the chain over the dimmed ones. */
  readonly #under: Lines;
  readonly #over: Lines;
  /**
   * Lays the columns out and draws the lines anew whenever the map's width, a tile or the card
   * changes its size: the width of the page, its zoom, a font that came late. It watches only while
   * the element is on a page.
   */
  readonly #observer = new ResizeObserver(() => this.#measure());
  /**
   * An empty row as wide as the map, watched for the map's width: the map itself is not, for the
   * layout changes its height, and a size the observer's own notice changes above the tiles would
   * be a loop.
   */
  readonly #ruler: HTMLElement;
  #connected = false;

  constructor(root: ShadowRoot, choose: (skill: string) => void) {
    this.#root = root;
    this.#choose = choose;
    this.#container = this.#element("div", "map");
    this.#legend = this.#element("ul", "legend");
    this.#tiersBox = this.#element("div", "tiers");
    this.#ruler = this.#element("div", "ruler");
    this.#details = this.#element("li", "card");
    this.#details.id = DETAILS;
    this.#practise = this.#element("button", "practise");
    this.#practise.type = "button";
    this.#practise.addEventListener("click", () => this.#choose(this.#chosen));
    this.#close = this.#element("button", "close");
    this.#close.type = "button";
    this.#close.addEventListener("click", () => this.#pick(null));
    this.#container.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && this.#expanded !== null) {
        event.preventDefault();
        this.#pick(null);
      }
    });
    const document = root.ownerDocument;
    this.#under = new Lines(document, "under");
    this.#over = new Lines(document, "over");
    root.append(this.#container);
  }

  /**
   * The element is on a page: the map, the card and each tile are watched from now on. A node
   * starts to be watched with a first notice, which lays the map out anew.
   */
  connect(): void {
    this.#connected = true;
    this.#observer.observe(this.#ruler);
    this.#observer.observe(this.#details);
    for (const { button } of this.#tiles.values()) this.#observer.observe(button);
  }

  /** The element is off the page: nothing is watched until it is back. */
  disconnect(): void {
    this.#connected = false;
    this.#observer.disconnect();
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
      for (const { button } of this.#tiles.values()) this.#observer.unobserve(button);
      this.#tiles.clear();
      this.#expanded = null;
      this.#layout = null;
      this.#states = null;
      this.#chain = null;
      return;
    }

    // The package's words are of their own language, which the titles' lang overrides (WCAG 3.1.2).
    this.#container.lang = data.words.lang;
    const map = layout(data.graph, data.tiers);
    const states = mapStates(data.graph, data.skillMap, data.now);
    if (this.#expanded !== null && !map.places.has(this.#expanded)) this.#expanded = null;
    const chain = this.#expanded === null ? null : chainOf(data.graph, map, this.#expanded);
    this.#layout = map;
    this.#states = states;
    this.#chain = chain;

    this.#drawLegend(map, states, data.words);
    const anchors: HTMLElement[] = [];
    const tiers: HTMLElement[] = [];
    const bandsUsed = new Set<string>();
    const tilesUsed = new Set<string>();
    for (const band of map.bands) {
      const key = band.kind === "anchors" ? "anchors" : `tier ${band.tier}`;
      bandsUsed.add(key);
      const nodes = this.#band(key, band, states, data);
      const items: HTMLLIElement[] = [];
      for (const id of band.skills) {
        tilesUsed.add(id);
        const tile = this.#tile(id);
        this.#drawTile(tile, id, band, states, data);
        items.push(tile.item);
        if (id === this.#expanded) {
          this.#drawCard(id, band, states, linksOf(data.graph, map, id), data);
          items.push(this.#details);
        }
      }
      place(nodes.list, items);
      (band.kind === "anchors" ? anchors : tiers).push(nodes.section);
    }
    place(this.#tiersBox, tiers);
    this.#tiersBox.style.setProperty("--tiers", String(tiers.length));
    // The lines lie first in the map, under the legend and the bands, and are drawn once the tiles
    // have their places.
    place(this.#container, [
      this.#under.svg,
      this.#over.svg,
      this.#legend,
      ...anchors,
      this.#tiersBox,
      this.#ruler,
    ]);
    this.#container.classList.toggle("chosen", this.#expanded !== null);
    for (const key of [...this.#bands.keys()]) if (!bandsUsed.has(key)) this.#bands.delete(key);
    for (const [id, { button }] of [...this.#tiles]) {
      if (!tilesUsed.has(id)) {
        this.#observer.unobserve(button);
        this.#tiles.delete(id);
      }
    }
    this.#measure();

    // A node the focus was on stays focused where it still is, though it was moved; one that is
    // gone hands the focus to the tile focusAfter gives.
    if (active instanceof HTMLElement && focused !== undefined) {
      if (active.isConnected && active.getRootNode() === this.#root) {
        if (this.#root.activeElement !== active) active.focus({ preventScroll: true });
      } else if (before !== null) {
        const target = focusAfter(before, map, focused);
        if (target !== null) this.#tiles.get(target)?.button.focus({ preventScroll: true });
      }
    }
  }

  /** Chooses a skill, or none, and puts the focus on its tile, or on the tile that was chosen. */
  #pick(id: string | null): void {
    const was = this.#expanded;
    this.#expanded = id;
    this.render(this.#data);
    const target = id ?? was;
    const button = target === null ? undefined : this.#tiles.get(target)?.button;
    if (button === undefined) return;
    if (id === null) {
      button.focus();
      return;
    }
    // The card at the bottom of the window may cover the tile chosen: the tile is scrolled above
    // it, by its margin of scrolling, as tall as the card.
    button.focus({ preventScroll: true });
    button.scrollIntoView({ block: "nearest", inline: "nearest" });
  }

  /**
   * Stands the tiers as columns where they fit side by side, lays the columns out by the tiles'
   * heights, and draws the lines, by the places of the tiles as they are measured now.
   */
  #measure(): void {
    const data = this.#data;
    const map = this.#layout;
    if (data === null || map === null || !this.#connected) {
      this.#under.draw([]);
      this.#over.draw([]);
      return;
    }
    const rem = Number.parseFloat(getComputedStyle(this.#container).fontSize) || 16;
    const count = map.bands.filter((band) => band.kind === "tier").length;
    const width = this.#container.clientWidth;
    const arrangement: Arrangement =
      count > 1 && width >= (count * COLUMN + (count - 1) * GAP) * rem ? "columns" : "bands";
    this.#container.classList.toggle("columns", arrangement === "columns");

    const origin = this.#container.getBoundingClientRect();
    const box = (node: Element): Box => {
      const { left, top, right, bottom } = node.getBoundingClientRect();
      return {
        left: left - origin.left,
        top: top - origin.top,
        right: right - origin.left,
        bottom: bottom - origin.top,
      };
    };
    this.#layOut(map, data, arrangement, rem, box);

    const boxes = new Map<string, Box>(
      [...this.#tiles].map(([id, { button }]) => [id, box(button)]),
    );
    const anchors = new Set(map.bands.find((band) => band.kind === "anchors")?.skills ?? []);
    const chain = this.#chain;
    const all = allLinks(data.graph, map);
    const lit = (link: Link) => chain?.has(link.from) === true && chain.has(link.to);
    const shown = arrangement === "columns" ? all : all.filter(lit);
    const lines = linesOf(shown, boxes, arrangement, anchors, GAP * rem);
    const kindOf = (line: Line) => {
      const value = this.#valueOf(line.from, map);
      return value !== null && WALKED.has(value) ? "walked" : "";
    };
    this.#under.draw(
      lines.filter((line) => !lit(line)),
      kindOf,
    );
    this.#over.draw(lines.filter(lit));

    // The card stands at the bottom of the window, as wide as the map; the map leaves room under
    // its last tiles to scroll them above it.
    if (this.#expanded !== null) {
      const style = this.#container.style;
      style.setProperty("--card-left", `${Math.round(origin.left)}px`);
      style.setProperty(
        "--card-right",
        `${Math.round(this.#root.ownerDocument.documentElement.clientWidth - origin.right)}px`,
      );
      style.setProperty("--room", `${Math.ceil(this.#details.offsetHeight + rem)}px`);
    }
  }

  /**
   * With the tiers as columns, each tile goes down to where columnTops puts it, by a margin before
   * it; with the tiers as bands, no tile has one.
   */
  #layOut(
    map: Layout,
    data: MapData,
    arrangement: Arrangement,
    rem: number,
    box: (node: Element) => Box,
  ): void {
    const columns = map.bands.flatMap((band, index) => (band.kind === "tier" ? [index] : []));
    for (const { item } of this.#tiles.values()) item.style.removeProperty("margin-block-start");
    if (arrangement !== "columns") return;
    const lists = columns.map((index) => {
      const band = map.bands[index] as Band;
      return (this.#bands.get(`tier ${(band as { tier: number }).tier}`) as BandNodes).list;
    });
    const starts = columns.map((band, i) => ({ band, top: box(lists[i] as Element).top }));
    const heights = new Map<string, number>(
      [...this.#tiles].map(([id, { button }]) => [id, button.offsetHeight]),
    );
    const gap = TILE_GAP * rem;
    const tops = columnTops(data.graph, map, starts, heights, gap);
    starts.forEach(({ band, top }) => {
      let next = top;
      for (const id of (map.bands[band] as Band).skills) {
        const at = tops.get(id);
        const tile = this.#tiles.get(id);
        if (at === undefined || tile === undefined) break;
        const margin = Math.round(at - next);
        if (margin > 0) tile.item.style.setProperty("margin-block-start", `${margin}px`);
        next = at + (heights.get(id) ?? 0) + gap;
      }
    });
  }

  /** The value a skill's tile shows: its state, its mark, or an anchor skill's holding. */
  #valueOf(id: string, map: Layout): IconValue | null {
    const states = this.#states;
    if (states === null) return null;
    const place = map.places.get(id);
    if (place === undefined) return null;
    if (map.bands[place.band]?.kind === "anchors") return states.anchors.get(id)?.holding ?? null;
    const skill = states.skills.get(id);
    return skill === undefined ? null : shownOf(skill);
  }

  /** The legend: each value a tile of the module shows, with how many show it. */
  #drawLegend(map: Layout, states: MapStates, words: Words): void {
    const counts = new Map<Shown, number>();
    for (const band of map.bands) {
      if (band.kind !== "tier") continue;
      for (const id of band.skills) {
        const skill = states.skills.get(id);
        const value = skill === undefined ? null : shownOf(skill);
        if (value !== null) counts.set(value, (counts.get(value) ?? 0) + 1);
      }
    }
    this.#legend.setAttribute("aria-label", words.legend);
    const formats = formatsOf(words);
    this.#legend.replaceChildren(
      ...LEGEND.filter((value) => counts.has(value)).map((value) => {
        const item = this.#element("li");
        const mark = this.#element("i", "dot");
        mark.dataset.state = value;
        const count = this.#element("b");
        count.textContent = formats.number.format(counts.get(value) ?? 0);
        item.append(mark, wordOf(value, words), " ", count);
        return item;
      }),
    );
  }

  #band(key: string, band: Band, states: MapStates, data: MapData): BandNodes {
    let nodes = this.#bands.get(key);
    if (nodes === undefined) {
      const section = this.#element("section", band.kind === "anchors" ? "band anchors" : "band");
      const list = this.#element("ul");
      nodes = {
        section,
        heading: this.#element("h3"),
        progress: this.#element("p", "progress"),
        list,
      };
      section.append(nodes.heading, nodes.progress, list);
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
    if (band.kind === "anchors") {
      nodes.progress.hidden = true;
      nodes.progress.replaceChildren();
      return nodes;
    }
    // How many of the tier's skills are mastered, in words, and a square for each skill in the
    // colour of what its tile shows, as on app's card of the module.
    const shown = band.skills.map((id) => {
      const skill = states.skills.get(id);
      return skill === undefined ? null : shownOf(skill);
    });
    const formats = formatsOf(words);
    const count = band.skills.length;
    const stated = shown.some((value) => value !== null && value !== "rubric" && value !== "none");
    const text = stated
      ? fill(words.tierProgress, {
          mastered: formats.number.format(shown.filter((value) => value === "mastered").length),
          count: formats.number.format(count),
        })
      : fill(formOf(words.tierCount, count, formats), { count: formats.number.format(count) });
    const dots = this.#element("span", "dots");
    dots.setAttribute("aria-hidden", "true");
    for (const value of shown) {
      const dot = this.#element("i", "dot");
      if (value !== null) dot.dataset.state = value;
      dots.append(dot);
    }
    const label = this.#element("span");
    label.append(...text);
    nodes.progress.hidden = false;
    nodes.progress.replaceChildren(label, dots);
    return nodes;
  }

  #tile(id: string): TileNodes {
    let nodes = this.#tiles.get(id);
    if (nodes === undefined) {
      const item = this.#element("li");
      const button = this.#element("button", "tile");
      button.type = "button";
      button.addEventListener("click", () => this.#pick(this.#expanded === id ? null : id));
      this.#skillOf.set(button, id);
      if (this.#connected) this.#observer.observe(button);
      item.append(button);
      nodes = { item, button };
      this.#tiles.set(id, nodes);
    }
    return nodes;
  }

  #drawTile(tile: TileNodes, id: string, band: Band, states: MapStates, data: MapData): void {
    const anchor = band.kind === "anchors";
    const skill = states.skills.get(id);
    const value = anchor
      ? (states.anchors.get(id)?.holding ?? null)
      : skill === undefined
        ? null
        : shownOf(skill);
    tile.button.replaceChildren(...this.#face(id, anchor, value, data));
    tile.button.className = `tile${value === null ? "" : ` is-${value}`}${anchor ? " anchor" : ""}`;
    const chain = this.#chain;
    tile.button.classList.toggle("dim", chain !== null && !chain.has(id));
    tile.button.classList.toggle("lit", chain?.has(id) === true);
    const expanded = id === this.#expanded;
    tile.button.setAttribute("aria-expanded", String(expanded));
    if (expanded) tile.button.setAttribute("aria-controls", DETAILS);
    else tile.button.removeAttribute("aria-controls");
  }

  /**
   * What a tile or a chip shows: the icon of its value in a round badge, the title, and under it
   * the value's word. Its accessible name is "title, word": the separator is there for the name,
   * out of sight.
   */
  #face(id: string, anchor: boolean, value: IconValue | null, data: MapData): Node[] {
    const name = this.#element("span", "name");
    name.append(this.#title(id, anchor, data));
    if (value === null) return [this.#element("span", "badge"), name];
    const separator = this.#element("span", "separator");
    separator.textContent = data.words.separator;
    name.append(separator);
    const word = this.#element("span", "word");
    word.textContent = wordOf(value, data.words);
    const badge = this.#element("span", "badge");
    badge.append(this.#icon(value));
    return [badge, name, word];
  }

  #drawCard(id: string, band: Band, states: MapStates, links: Links, data: MapData): void {
    const { words, graph } = data;
    const anchor = band.kind === "anchors";
    const main: Node[] = [this.#paragraph([this.#title(id, anchor, data)], "card-title")];
    const parts: Node[] = [];
    let action: Node | null = null;
    this.#close.setAttribute("aria-label", words.close);

    if (anchor) {
      const holding = states.anchors.get(id);
      if (holding !== undefined && holding.holding !== null) {
        main.push(this.#paragraph([this.#status(holding.holding, words)], "card-status"));
        if (holding.reason !== null)
          main.push(
            this.#paragraph([sentence(words.reasons[holding.reason], words.lang)], "card-note"),
          );
      }
      parts.push(...this.#chips(words.neededBy, links.opens, data));
    } else {
      const skill = states.skills.get(id);
      const value = skill === undefined ? null : shownOf(skill);
      if (value !== null) main.push(this.#paragraph([this.#status(value, words)], "card-status"));
      const description = graph.skills[id]?.description;
      if (description !== undefined) {
        main.push(
          this.#paragraph(
            [this.#text("span", description, data.manifest.languages.explanation)],
            "card-note",
          ),
        );
      }
      parts.push(...this.#chips(words.buildsOn, links.buildsOn, data));
      parts.push(...this.#chips(words.opens, links.opens, data));
      parts.push(...this.#teaches(links.teaches, states, data));
      // GetSkillMap gives state only to a skill of verdict: one of rubric or none has no numbers.
      if (data.view === "adult" && data.skillMap !== null && skill?.assessability === "verdict") {
        parts.push(...this.#numbers(skill.record, data));
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
          action = this.#paragraph(
            fill(words.waitsFor, { skills: this.#titles(waiting, data) }),
            "waits",
          );
        }
      }
    }

    // The button «Practise» stays where it is while it stays: moving it would take the focus off it.
    // Close comes last, so that the focus goes from the tile to «Practise» and the links first; it
    // stands at the card's corner all the same.
    const card = this.#details;
    let head = card.firstElementChild as HTMLElement | null;
    let rest = (head?.nextElementSibling ?? null) as HTMLElement | null;
    if (head === null || rest === null) {
      head = this.#element("div", "card-main");
      rest = this.#element("div", "card-links");
      card.replaceChildren(head, rest, this.#close);
    }
    if (action === this.#practise && this.#practise.parentNode === head) {
      for (const child of [...head.childNodes]) if (child !== this.#practise) child.remove();
      this.#practise.before(...main);
    } else {
      head.replaceChildren(...main, ...(action === null ? [] : [action]));
    }
    rest.replaceChildren(...parts);
  }

  /** A part of the card: a label, and a chip for each skill it names that chooses it. */
  #chips(label: string, ids: readonly string[], data: MapData): Node[] {
    if (ids.length === 0) return [];
    const map = this.#layout as Layout;
    const list = this.#element("ul", "chips");
    for (const id of ids) {
      const item = this.#element("li");
      const chip = this.#element("button", "chip");
      chip.type = "button";
      const anchor = !Object.hasOwn(data.graph.skills, id);
      const value = this.#valueOf(id, map);
      chip.className = `chip${value === null ? "" : ` is-${value}`}`;
      chip.append(...this.#face(id, anchor, value, data));
      chip.addEventListener("click", () => this.#pick(id));
      this.#skillOf.set(chip, id);
      item.append(chip);
      list.append(item);
    }
    return [this.#paragraph([label], "label"), list];
  }

  /** What a skill teaches: each anchor skill of its teaches, with its holding if there is one. */
  #teaches(ids: readonly string[], states: MapStates, data: MapData): Node[] {
    if (ids.length === 0) return [];
    const list = this.#element("ul", "teaches");
    for (const id of ids) {
      const item = this.#element("li");
      const title = this.#title(id, true, data);
      const anchor = states.anchors.get(id);
      item.append(
        ...(anchor === undefined || anchor.holding === null
          ? [title]
          : fill(data.words.taught, {
              skill: title,
              holding: holdingPhrase(this.#status(anchor.holding, data.words), anchor, data.words),
            })),
      );
      list.append(item);
    }
    return [this.#paragraph([data.words.teaches], "label"), list];
  }

  /** The adult's details of a skill of verdict: no estimate, uncertainty or retention. */
  #numbers(state: SkillState | undefined, data: MapData): Node[] {
    const { words, manifest } = data;
    const formats = formatsOf(words);
    const count = state?.evidenceCount ?? 0;
    const lines: (string | Node)[][] = [
      fill(formOf(words.evidence, count, formats), { count: formats.number.format(count) }),
    ];
    if (state?.lastPracticedAt !== undefined) {
      lines.push(
        fill(words.lastPractised, { date: formats.date.format(dateOf(state.lastPracticedAt)) }),
      );
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
        lines.push(fill(words.reviewOn, { date: formats.date.format(dateOf(state.reviewDate)) }));
    }
    return lines.map((line) => this.#paragraph(line, "number"));
  }

  /** The title of a skill of the module in its language, or an anchor skill's in English. */
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
    return formatsOf(data.words)
      .list.formatToParts(ids)
      .map((part) =>
        part.type === "element"
          ? this.#title(part.value, false, data)
          : this.#root.ownerDocument.createTextNode(part.value),
      );
  }

  /**
   * A value's icon, hidden from the tree of accessibility and with no title, drawn in the text's
   * colour by attributes of SVG alone: no attribute style.
   */
  #icon(value: IconValue): Node {
    let icon = this.#icons.get(value);
    if (icon === undefined) {
      const { viewBox, paths } = ICONS[value];
      icon = this.#root.ownerDocument.createElementNS(SVG, "svg");
      icon.setAttribute("class", "icon");
      icon.setAttribute("viewBox", viewBox);
      icon.setAttribute("aria-hidden", "true");
      icon.setAttribute("focusable", "false");
      for (const d of paths) {
        const path = this.#root.ownerDocument.createElementNS(SVG, "path");
        path.setAttribute("d", d);
        icon.append(path);
      }
      this.#icons.set(value, icon);
    }
    return icon.cloneNode(true);
  }

  /** A state, a mark or a holding: its icon, then its word, which names it. */
  #status(value: IconValue, words: Words): HTMLElement {
    const status = this.#element("span", `status is-${value}`);
    status.append(this.#icon(value), wordOf(value, words));
    return status;
  }

  #paragraph(children: readonly (Node | string)[], name?: string): HTMLParagraphElement {
    const paragraph = this.#element("p", name);
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

/** The word of a state, a mark or a holding. */
function wordOf(value: IconValue, words: Words): string {
  const named: Readonly<Record<IconValue, string>> = {
    ...words.states,
    ...words.marks,
    ...words.holdings,
  };
  return named[value];
}

/** A phrase as a sentence of its own: its first letter capital, in its language. */
function sentence(text: string, lang: string): string {
  return text.charAt(0).toLocaleUpperCase(lang) + text.slice(1);
}

/** An anchor skill's holding — its word, or its icon and word — with its reason, if it has one. */
function holdingPhrase(
  holding: string | Node,
  anchor: AnchorOnMap,
  words: Words,
): (string | Node)[] {
  return anchor.reason === null
    ? [holding]
    : fill(words.holdingReason, { holding, reason: words.reasons[anchor.reason] });
}

/** A moment of the contract as a Date of the device. */
function dateOf(moment: NonNullable<SkillState["reviewDate"]>): Date {
  return new Date(Number(moment.seconds) * 1000 + Math.floor(moment.nanos / 1_000_000));
}
