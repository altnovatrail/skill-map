import { expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { GRAPH, SKILL_MAP, TIERS } from "../core/fair-shares.fixture.js";
import { TAG } from "./index.js";
import {
  adopt,
  button,
  MANIFEST,
  mount,
  mounted,
  settled,
  shadow,
  tile,
  useMap,
} from "./map.fixture.js";

// The map's lines. With the tiers as columns, every link has its line, under the tiles, from a
// prerequisite's right side into the skill's left side; an anchor skill's runs down the gap before
// the skill's column. With the tiers as bands only the chosen skill's chain has lines, down from a
// tile's bottom into the next one's top. A chosen skill's chain is drawn again over the dimmed
// tiles, in the accent. Drawn anew when the sizes change.

useMap();

/** Two frames: a ResizeObserver tells of a change in the frame after it. */
const frames = () =>
  new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

interface Drawn {
  readonly from: string;
  readonly to: string;
  readonly kind: string;
  readonly start: { x: number; y: number };
  readonly end: { x: number; y: number };
}

/** The lines of one layer, by the ends of their paths: the first point and the last. */
function lines(layer: "under" | "over"): Drawn[] {
  return [...shadow().querySelectorAll(`.lines.${layer} path`)].map((path) => {
    const numbers = (path.getAttribute("d")?.match(/-?[\d.]+/g) ?? []).map(Number);
    const [sx = Number.NaN, sy = Number.NaN] = numbers;
    const [ex = Number.NaN, ey = Number.NaN] = numbers.slice(-2);
    return {
      from: path.getAttribute("data-from") ?? "",
      to: path.getAttribute("data-to") ?? "",
      kind: path.getAttribute("class") ?? "",
      start: { x: sx, y: sy },
      end: { x: ex, y: ey },
    };
  });
}

const links = (drawn: readonly Drawn[]) => drawn.map(({ from, to }) => `${from} → ${to}`);

/** A node's box in the map's own coordinates. */
function boxOf(node: Element) {
  const origin = (shadow().querySelector(".map") as Element).getBoundingClientRect();
  const { left, top, right, bottom } = node.getBoundingClientRect();
  return {
    left: left - origin.left,
    top: top - origin.top,
    right: right - origin.left,
    bottom: bottom - origin.top,
  };
}

/** A line comes from the middle of a box's bottom edge, or of its right side. */
function from(line: Drawn | undefined, node: Element, side: "bottom" | "right"): void {
  const box = boxOf(node);
  if (side === "bottom") {
    expect(line?.start.x).toBeCloseTo((box.left + box.right) / 2, 0);
    expect(line?.start.y).toBeCloseTo(box.bottom, 0);
  } else {
    expect(line?.start.x).toBeCloseTo(box.right, 0);
    expect(line?.start.y).toBeCloseTo((box.top + box.bottom) / 2, 0);
  }
}

/** A line comes into the middle of a box's top edge, or of its left side. */
function into(line: Drawn | undefined, node: Element, side: "top" | "left"): void {
  const box = boxOf(node);
  if (side === "top") {
    expect(line?.end.x).toBeCloseTo((box.left + box.right) / 2, 0);
    expect(line?.end.y).toBeCloseTo(box.top, 0);
  } else {
    expect(line?.end.x).toBeCloseTo(box.left, 0);
    expect(line?.end.y).toBeCloseTo((box.top + box.bottom) / 2, 0);
  }
}

/** A map in a frame wide enough for its three tiers to stand as columns, the test given it. */
async function inColumns(test: (frame: HTMLElement) => Promise<void>): Promise<void> {
  const frame = document.createElement("div");
  frame.style.width = "900px";
  document.body.append(frame);
  try {
    await mount({ view: "learner" }, undefined, frame);
    await frames();
    await test(frame);
  } finally {
    mounted().remove();
    frame.remove();
  }
}

const CHAIN = [
  "count-objects → explain-sharing",
  "count-objects → halves",
  "explain-sharing → quarters",
  "halves → quarters",
];

test("with the tiers as bands, only the chosen skill's chain has lines, each down from one tile into the next", async () => {
  await mount();
  expect(shadow().querySelector(".map")?.classList.contains("columns")).toBe(false);
  expect(lines("under")).toEqual([]);
  expect(lines("over")).toEqual([]);
  await userEvent.click(tile("Quarters, Locked"));
  const drawn = lines("over");
  expect(links(drawn)).toEqual(CHAIN);
  expect(lines("under")).toEqual([]);
  from(drawn[2], button("Explain how you shared, Feedback by criteria"), "bottom");
  into(drawn[3], button("Quarters, Locked"), "top");
  await userEvent.click(page.getByRole("button", { name: "Close" }));
  expect(lines("over")).toEqual([]);
});

test("with the tiers as columns, every link has its line, green from a prerequisite mastered or held", async () => {
  await inColumns(async () => {
    expect(shadow().querySelector(".map")?.classList.contains("columns")).toBe(true);
    const drawn = lines("under");
    expect(drawn.map(({ from, to, kind }) => `${from} → ${to} ${kind}`.trim())).toEqual([
      "count-objects → equal-groups walked",
      "count-objects → explain-sharing walked",
      "count-objects → halves walked",
      "core.multiplication-table → share-with-remainder walked",
      "equal-groups → share-with-remainder walked",
      "explain-sharing → quarters",
      "halves → quarters",
    ]);
    expect(lines("over")).toEqual([]);
    from(drawn[0], button("Count objects, Mastered"), "right");
    into(drawn[0], button("Equal groups, Time to review"), "left");
    // The anchor skill's line: down from its tile, and into the side of the skill's.
    from(drawn[3], button("Multiplication table, Held"), "bottom");
    into(drawn[3], button("Share with a remainder, Ready to start"), "left");
  });
});

test("with the tiers as columns, a tile stands level with the skills it builds on, where its column lets it", async () => {
  await inColumns(async () => {
    const middle = (name: string) => {
      const { top, bottom } = boxOf(button(name));
      return (top + bottom) / 2;
    };
    const tops = ["Count objects, Mastered", "Equal groups, Time to review"].map(
      (name) => boxOf(button(name)).top,
    );
    expect(tops[1]).toBeCloseTo(tops[0] ?? 0, 0);
    expect(middle("Quarters, Locked")).toBeCloseTo(
      (middle("Halves, In progress") + middle("Explain how you shared, Feedback by criteria")) / 2,
      0,
    );
  });
});

test("a chosen skill's chain is drawn again over the dimmed tiles, and the rest stays under", async () => {
  await inColumns(async () => {
    await userEvent.click(tile("Quarters, Locked"));
    expect(links(lines("over"))).toEqual(CHAIN);
    expect(links(lines("under"))).toEqual([
      "count-objects → equal-groups",
      "core.multiplication-table → share-with-remainder",
      "equal-groups → share-with-remainder",
    ]);
    const over = shadow().querySelector(".lines.over") as Element;
    expect(getComputedStyle(over).zIndex).toBe("1");
    expect(getComputedStyle(button("Draw shares, Not assessed")).zIndex).toBe("auto");
    expect(getComputedStyle(button("Halves, In progress")).zIndex).toBe("2");
  });
});

test("the lines are paths, by SVG's attributes alone, hidden from the tree of accessibility", async () => {
  await inColumns(async () => {
    await userEvent.click(tile("Quarters, Locked"));
    const svgs = [...shadow().querySelectorAll("svg.lines")];
    expect(svgs).toHaveLength(2);
    for (const svg of svgs) {
      expect(svg.getAttribute("aria-hidden")).toBe("true");
      for (const node of [svg, ...svg.querySelectorAll("*")]) {
        expect(node.hasAttribute("style")).toBe(false);
        expect(node.tagName.toLowerCase()).toMatch(/^(svg|path)$/);
      }
      expect(svg.querySelector("path")?.getAttribute("d")).toMatch(/^M[\d.]+ [\d.]+C/);
    }
    // The lines lie under the tiles: the probe is a line's end, 2 px inside the tile's side. The
    // SVG takes no pointer, so for the probe alone it is made to: were it over the tile, it would
    // be hit.
    const quarters = button("Quarters, Locked");
    const origin = (shadow().querySelector(".map") as Element).getBoundingClientRect();
    const svg = shadow().querySelector("svg.lines.over") as SVGSVGElement;
    const { end } = lines("over")[3] as Drawn;
    svg.style.pointerEvents = "auto";
    const hit = shadow().elementFromPoint(origin.left + end.x + 2, origin.top + end.y);
    svg.removeAttribute("style");
    expect(hit?.closest("button")).toBe(quarters);
  });
});

test("one tier stands as a column where two would fit, no wider than 30 rem, and as a band narrower", async () => {
  await inColumns(async (frame) => {
    mounted().tiers = Object.fromEntries(Object.keys(TIERS).map((id) => [id, 1]));
    await frames();
    const map = shadow().querySelector(".map");
    expect(map?.classList.contains("columns")).toBe(true);
    const list = shadow().querySelector(".tiers.single .band > ul");
    expect(list?.getBoundingClientRect().width).toBeLessThanOrEqual(30 * 16);
    const widths = [...shadow().querySelectorAll(".tiers .tile")].map(
      (t) => t.getBoundingClientRect().width,
    );
    expect(new Set(widths).size).toBe(1);
    // Its card is as wide as the map, not the window.
    await userEvent.click(tile("Halves, In progress"));
    await frames();
    const card = shadow().querySelector(".card")?.getBoundingClientRect();
    const box = frame.getBoundingClientRect();
    expect(card?.left).toBeGreaterThanOrEqual(box.left);
    expect(card?.right).toBeLessThanOrEqual(box.right + 1);
    frame.style.width = "380px";
    await frames();
    expect(map?.classList.contains("columns")).toBe(false);
  });
});

test("a narrower map stands its tiers as bands and draws the lines anew", async () => {
  await inColumns(async (frame) => {
    await userEvent.click(tile("Quarters, Locked"));
    const wide = lines("over");
    frame.style.width = "320px";
    await frames();
    expect(shadow().querySelector(".map")?.classList.contains("columns")).toBe(false);
    const narrow = lines("over");
    expect(links(narrow)).toEqual(links(wide));
    expect(narrow).not.toEqual(wide);
    into(narrow[3], button("Quarters, Locked"), "top");
    expect(lines("under")).toEqual([]);
  });
});

test("a new language draws the lines to the tiles' new places", async () => {
  await mount();
  await userEvent.click(tile("Quarters, Locked"));
  mounted().setAttribute("lang", "ru");
  await settled();
  into(lines("over")[3], button("Quarters, Ещё закрыт"), "top");
  from(lines("over")[3], button("Halves, В работе"), "bottom");
});

test("a map taken off the page and put back draws its lines where the tiles are", async () => {
  const map = await mount();
  await userEvent.click(tile("Quarters, Locked"));
  map.remove();
  document.body.prepend(map);
  await frames();
  into(lines("over")[2], button("Quarters, Locked"), "top");
  from(lines("over")[3], button("Halves, In progress"), "bottom");
});

/** The relative luminance of a computed colour, as WCAG 2.2 defines it. */
function luminance(colour: string): number {
  const [r, g, b] = (colour.match(/\d+(\.\d+)?/g) ?? []).slice(0, 3).map((channel) => {
    const c = Number(channel) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * (r ?? 0) + 0.7152 * (g ?? 0) + 0.0722 * (b ?? 0);
}

test("a line of the chain is 3:1 at least against the map's ground, and nothing moves", async () => {
  await mount();
  await userEvent.click(tile("Quarters, Locked"));
  const ground = luminance(
    getComputedStyle(shadow().querySelector(".map") as Element).backgroundColor,
  );
  const path = shadow().querySelector(".lines.over path") as Element;
  const line = luminance(getComputedStyle(path).stroke);
  expect((Math.max(line, ground) + 0.05) / (Math.min(line, ground) + 0.05)).toBeGreaterThanOrEqual(
    3,
  );
  expect(getComputedStyle(path).strokeWidth).toBe("2.4px");
  expect(shadow().getAnimations()).toEqual([]);
});

test("a map drawn before it is on a page draws its lines once it is", async () => {
  const map = adopt(document.createElement(TAG));
  map.setAttribute("view", "learner");
  map.graph = GRAPH;
  map.tiers = TIERS;
  map.manifest = MANIFEST;
  map.skillMap = SKILL_MAP;
  await settled();
  document.body.append(map);
  await userEvent.click(tile("Quarters, Locked"));
  expect(links(lines("over"))).toEqual(CHAIN);
  into(lines("over")[3], button("Quarters, Locked"), "top");
});

test("an accent that is no colour gives the chain's lines the ink's colour", async () => {
  const theme = document.createElement("div");
  theme.style.setProperty("--novatrail-skill-map-accent", "not a colour");
  theme.style.setProperty("--novatrail-skill-map-ink", "rgb(0, 100, 0)");
  document.body.append(theme);
  try {
    await mount({ view: "learner" }, undefined, theme);
    await userEvent.click(tile("Quarters, Locked"));
    const path = shadow().querySelector(".lines.over path") as Element;
    expect(getComputedStyle(path).stroke).toBe("rgb(0, 100, 0)");
  } finally {
    mounted().remove();
    theme.remove();
  }
});

test("a band's heading lies over the lines, on the paper and as wide as its text", async () => {
  await inColumns(async () => {
    const heading = [...shadow().querySelectorAll("h3")].find(
      (node) => node.textContent === "Tier 2 · Sharing",
    ) as HTMLElement;
    expect(getComputedStyle(heading).backgroundColor).toBe("rgb(255, 255, 255)");
    expect(getComputedStyle(heading).zIndex).toBe("2");
    const band = (heading.parentElement as HTMLElement).getBoundingClientRect();
    expect(heading.getBoundingClientRect().width).toBeLessThan(band.width);
    const map = shadow().querySelector(".map") as HTMLElement;
    expect(map.firstElementChild?.matches("svg.lines.under")).toBe(true);
    expect(getComputedStyle(map.firstElementChild as Element).zIndex).toBe("auto");
  });
});
