import { expect, test } from "vitest";
import { userEvent } from "vitest/browser";
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

// The expanded skill's lines (R06; R11 in docs/decisions.md): from the tiles it builds on into its
// tile's top edge, and out of its details' bottom edge into the tiles it opens, each a curve with a
// point at both ends, under the bands; drawn anew when the sizes change.

useMap();

/** Two frames: a ResizeObserver tells of a change in the frame after it. */
const frames = () =>
  new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

interface Drawn {
  readonly from: string;
  readonly to: string;
  readonly start: { x: number; y: number };
  readonly end: { x: number; y: number };
}

/** The lines the map draws, by the ends' points. */
function lines(): Drawn[] {
  return [...shadow().querySelectorAll(".lines g")].map((group) => {
    const [start, end] = [...group.querySelectorAll("circle")].map((point) => ({
      x: Number(point.getAttribute("cx")),
      y: Number(point.getAttribute("cy")),
    }));
    return {
      from: group.getAttribute("data-from") ?? "",
      to: group.getAttribute("data-to") ?? "",
      start: start as Drawn["start"],
      end: end as Drawn["end"],
    };
  });
}

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

const details = () => shadow().getElementById("details") as HTMLElement;

/** The tile of a skill, by its ID, found by its button in the tree. */
const tileOf = (name: string) => button(name);

/** A line comes from the middle of a box's bottom edge. */
function fromBottom(line: Drawn | undefined, node: Element): void {
  const box = boxOf(node);
  expect(line?.start.x).toBeCloseTo((box.left + box.right) / 2, 0);
  expect(line?.start.y).toBeCloseTo(box.bottom, 0);
}

/** A line comes into a box's top edge, within its width. */
function intoTop(line: Drawn | undefined, node: Element): void {
  const box = boxOf(node);
  expect(line?.end.y).toBeCloseTo(box.top, 0);
  expect(line?.end.x).toBeGreaterThan(box.left);
  expect(line?.end.x).toBeLessThan(box.right);
}

test("quarters, expanded, has a line from halves and one from explain-sharing into its top edge", async () => {
  await mount();
  await userEvent.click(tile("Quarters, Locked"));
  const drawn = lines();
  expect(drawn.map(({ from, to }) => `${from} → ${to}`)).toEqual([
    "explain-sharing → quarters",
    "halves → quarters",
  ]);
  const quarters = tileOf("Quarters, Locked");
  fromBottom(drawn[0], tileOf("Explain how you shared, Feedback by criteria, needed before"));
  fromBottom(drawn[1], tileOf("Halves, In progress, needed before"));
  for (const line of drawn) intoTop(line, quarters);
  // Two ends on one edge are spread across it, left to right as the lines' other ends are.
  const [one, two] = drawn as [Drawn, Drawn];
  expect(one.end.x).not.toBe(two.end.x);
  expect(one.start.x < two.start.x).toBe(one.end.x < two.end.x);
});

test("share-with-remainder has a line from equal-groups and one from the anchor skill's band", async () => {
  await mount();
  await userEvent.click(tile("Share with a remainder, Ready to start"));
  const drawn = lines();
  expect(drawn.map(({ from }) => from)).toEqual(["core.multiplication-table", "equal-groups"]);
  fromBottom(drawn[0], tileOf("Multiplication table, Held, needed before"));
  fromBottom(drawn[1], tileOf("Equal groups, Time to review, needed before"));
});

test("count-objects has lines out of its details' bottom edge into the three tiles it opens", async () => {
  await mount();
  await userEvent.click(tile("Count objects, Mastered"));
  const drawn = lines();
  expect(drawn.map(({ to }) => to)).toEqual(["equal-groups", "explain-sharing", "halves"]);
  const below = boxOf(details());
  const own = boxOf(tileOf("Count objects, Mastered"));
  for (const line of drawn) {
    expect(line.start.y).toBeCloseTo(below.bottom, 0);
    expect(line.start.x).toBeGreaterThan(own.left);
    expect(line.start.x).toBeLessThan(own.right);
  }
  intoTop(drawn[0], tileOf("Equal groups, Time to review, opens after"));
  intoTop(drawn[2], tileOf("Halves, In progress, opens after"));
});

test("an expanded anchor skill has a line to the skill that needs it; closing takes the lines off", async () => {
  await mount();
  await userEvent.click(tile("Multiplication table, Held"));
  expect(lines().map(({ from, to }) => `${from} → ${to}`)).toEqual([
    "core.multiplication-table → share-with-remainder",
  ]);
  await userEvent.click(tile("Multiplication table, Held"));
  expect(lines()).toEqual([]);
});

test("each line is a path with a point at both ends, by SVG's attributes alone, hidden from the tree of accessibility", async () => {
  await mount();
  await userEvent.click(tile("Quarters, Locked"));
  const svg = shadow().querySelector("svg.lines") as SVGSVGElement;
  expect(svg.getAttribute("aria-hidden")).toBe("true");
  expect(svg.querySelectorAll("path")).toHaveLength(2);
  expect(svg.querySelectorAll("circle")).toHaveLength(4);
  for (const node of [svg, ...svg.querySelectorAll("*")])
    expect(node.hasAttribute("style")).toBe(false);
  expect(svg.querySelector("path")?.getAttribute("d")).toMatch(/^M[\d.]+ [\d.]+C/);
  // The lines lie under the bands: a tile is drawn over them.
  const quarters = tileOf("Quarters, Locked");
  const { left, top } = quarters.getBoundingClientRect();
  expect(
    shadow()
      .elementFromPoint(left + 2, top + 2)
      ?.closest("button"),
  ).toBe(quarters);
});

test("a narrower map draws the lines anew to where the tiles now stand", async () => {
  const frame = document.createElement("div");
  frame.style.width = "900px";
  document.body.append(frame);
  try {
    await mount({ view: "learner" }, undefined, frame);
    await userEvent.click(tile("Count objects, Mastered"));
    await frames();
    const wide = lines();
    frame.style.width = "320px";
    await frames();
    const narrow = lines();
    expect(narrow.map(({ to }) => to)).toEqual(wide.map(({ to }) => to));
    expect(narrow).not.toEqual(wide);
    intoTop(narrow[2], tileOf("Halves, In progress, opens after"));
    expect(narrow[0]?.start.y).toBeCloseTo(boxOf(details()).bottom, 0);
  } finally {
    mounted().remove();
    frame.remove();
  }
});

test("a new language draws the lines to the tiles' new widths", async () => {
  await mount();
  await userEvent.click(tile("Quarters, Locked"));
  mounted().setAttribute("lang", "ru");
  await settled();
  intoTop(lines()[1], button("Quarters, Ещё закрыт"));
  fromBottom(lines()[1], button("Halves, В работе, нужен раньше"));
});

test("a map taken off the page and put back draws its lines where the tiles are", async () => {
  const map = await mount();
  await userEvent.click(tile("Quarters, Locked"));
  map.remove();
  document.body.prepend(map);
  await frames();
  intoTop(lines()[0], tileOf("Quarters, Locked"));
  fromBottom(lines()[1], tileOf("Halves, In progress, needed before"));
});

/** The relative luminance of a computed colour, as WCAG 2.2 defines it. */
function luminance(colour: string): number {
  const [r, g, b] = (colour.match(/\d+(\.\d+)?/g) ?? []).slice(0, 3).map((channel) => {
    const c = Number(channel) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * (r ?? 0) + 0.7152 * (g ?? 0) + 0.0722 * (b ?? 0);
}

test("a line and its points are 3:1 at least against the map's ground, and nothing moves", async () => {
  await mount();
  await userEvent.click(tile("Quarters, Locked"));
  const ground = luminance(
    getComputedStyle(shadow().querySelector(".map") as Element).backgroundColor,
  );
  const path = shadow().querySelector(".lines path") as Element;
  const point = shadow().querySelector(".lines circle") as Element;
  for (const colour of [getComputedStyle(path).stroke, getComputedStyle(point).fill]) {
    const line = luminance(colour);
    const ratio = (Math.max(line, ground) + 0.05) / (Math.min(line, ground) + 0.05);
    expect(ratio).toBeGreaterThanOrEqual(3);
  }
  expect(getComputedStyle(path).strokeWidth).toBe("2px");
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
  expect(lines().map(({ from }) => from)).toEqual(["explain-sharing", "halves"]);
  intoTop(lines()[0], tileOf("Quarters, Locked"));
});

test("an accent that is no colour gives the lines the ink's colour, as it gives the tiles", async () => {
  const theme = document.createElement("div");
  theme.style.setProperty("--novatrail-skill-map-accent", "not a colour");
  theme.style.setProperty("--novatrail-skill-map-ink", "rgb(0, 100, 0)");
  document.body.append(theme);
  try {
    await mount({ view: "learner" }, undefined, theme);
    await userEvent.click(tile("Quarters, Locked"));
    const path = shadow().querySelector(".lines path") as Element;
    expect(getComputedStyle(path).stroke).toBe("rgb(0, 100, 0)");
    expect(getComputedStyle(shadow().querySelector(".lines circle") as Element).fill).toBe(
      "rgb(0, 100, 0)",
    );
  } finally {
    mounted().remove();
    theme.remove();
  }
});

test("a band's heading lies over the lines, as wide as its text: a line across a tier passes under its words", async () => {
  await mount();
  await userEvent.click(tile("Share with a remainder, Ready to start"));
  const heading = [...shadow().querySelectorAll("h3")].find(
    (node) => node.textContent === "Tier 2 · Sharing",
  ) as HTMLElement;
  expect(getComputedStyle(heading).backgroundColor).toBe("rgb(255, 255, 255)");
  const band = (heading.parentElement as HTMLElement).getBoundingClientRect();
  expect(heading.getBoundingClientRect().width).toBeLessThan(band.width);
  // The line from the anchor skill's band to tier 3 crosses tier 2's heading row, within the
  // heading's width, and under it: the SVG comes first in the map, unlayered, and the bands after it
  // are positioned, so they paint over it.
  const line = lines().find(({ from }) => from === "core.multiplication-table");
  const box = boxOf(heading);
  expect(line?.start.y).toBeLessThan(box.top);
  expect(line?.end.y).toBeGreaterThan(box.bottom);
  expect(Math.min(line?.start.x ?? 0, line?.end.x ?? 0)).toBeLessThan(box.right);
  const map = shadow().querySelector(".map") as HTMLElement;
  const svg = shadow().querySelector("svg.lines") as SVGSVGElement;
  expect(map.firstElementChild).toBe(svg);
  expect(getComputedStyle(svg).zIndex).toBe("auto");
  expect(getComputedStyle(heading.parentElement as HTMLElement).position).toBe("relative");
});
