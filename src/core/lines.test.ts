import { expect, test } from "vitest";
import { across, type Box, curve, down, linesOf } from "./lines.js";

const box = (left: number, top: number, right: number, bottom: number): Box => ({
  left,
  top,
  right,
  bottom,
});

// An anchor skill x above two columns: a in the first, b and c in the second.
const BOXES = new Map<string, Box>([
  ["x", box(0, 0, 100, 40)],
  ["a", box(0, 100, 100, 140)],
  ["b", box(160, 100, 260, 140)],
  ["c", box(160, 160, 260, 200)],
]);
const NONE = new Set<string>();

test("a curve leaves its start straight down and comes into its end straight down", () => {
  expect(curve({ x: 50, y: 40 }, { x: 90, y: 100 })).toBe("M50 40C50 70 90 70 90 100");
  expect(curve({ x: 1.04, y: 2.06 }, { x: 3.15, y: 4.01 })).toBe("M1 2.1C1 3 3.2 3 3.2 4");
});

test("a line across leaves its start level and comes into its end level, reaching out at most 48 pixels", () => {
  expect(across({ x: 100, y: 20 }, { x: 300, y: 60 })).toBe("M100 20C148 20 252 60 300 60");
  expect(across({ x: 0, y: 0 }, { x: 40, y: 10 })).toBe("M0 0C20 0 20 10 40 10");
});

test("an anchor skill's line goes down, over to the gap, down it, and turns into the tile's side", () => {
  expect(down({ x: 50, y: 40 }, { x: 300, y: 200 }, 280)).toBe(
    "M50 40C50 64 280 64 280 88L280 188Q280 200 292 200L300 200",
  );
});

test("with the tiers as columns, a line runs from a prerequisite's right side into the skill's left side", () => {
  const lines = linesOf([{ from: "a", to: "c" }], BOXES, "columns", NONE, 60);
  expect(lines.map(({ from, to, start, end }) => ({ from, to, start, end }))).toEqual([
    { from: "a", to: "c", start: { x: 100, y: 120 }, end: { x: 160, y: 180 } },
  ]);
  expect(lines[0]?.d).toBe(across({ x: 100, y: 120 }, { x: 160, y: 180 }));
});

test("with the tiers as columns, an anchor skill's line runs down the middle of the gap before the skill's column", () => {
  const [line] = linesOf([{ from: "x", to: "b" }], BOXES, "columns", new Set(["x"]), 60);
  expect(line?.start).toEqual({ x: 50, y: 40 });
  expect(line?.end).toEqual({ x: 160, y: 120 });
  expect(line?.d).toBe(down({ x: 50, y: 40 }, { x: 160, y: 120 }, 130));
});

test("with the tiers as bands, every line runs down from a tile's bottom into the next one's top", () => {
  const lines = linesOf(
    [
      { from: "x", to: "a" },
      { from: "a", to: "c" },
    ],
    BOXES,
    "bands",
    new Set(["x"]),
    60,
  );
  expect(lines.map(({ start, end }) => [start, end])).toEqual([
    [
      { x: 50, y: 40 },
      { x: 50, y: 100 },
    ],
    [
      { x: 50, y: 140 },
      { x: 210, y: 160 },
    ],
  ]);
  expect(lines[1]?.d).toBe(curve({ x: 50, y: 140 }, { x: 210, y: 160 }));
});

test("the ends are rounded to a tenth of a CSS pixel, as the curve is", () => {
  const boxes = new Map<string, Box>([
    ["p", box(0.04, 0, 1.06, 10.03)],
    ["q", box(0, 20.07, 3, 30)],
  ]);
  const [line] = linesOf([{ from: "p", to: "q" }], boxes, "bands", NONE, 0);
  expect(line?.start).toEqual({ x: 0.6, y: 10 });
  expect(line?.end).toEqual({ x: 1.5, y: 20.1 });
});

test("a link with a tile without a box has no line", () => {
  const links = [
    { from: "a", to: "b" },
    { from: "gone", to: "b" },
    { from: "a", to: "gone" },
  ];
  expect(linesOf(links, BOXES, "columns", NONE, 60).map(({ from, to }) => [from, to])).toEqual([
    ["a", "b"],
  ]);
});
