import { expect, test } from "vitest";
import { type Box, curve, linesOf } from "./lines.js";

const box = (left: number, top: number, right: number, bottom: number): Box => ({
  left,
  top,
  right,
  bottom,
});

// Two bands: a and b above, e below them with its details, and c, d further down.
const BOXES = new Map<string, Box>([
  ["a", box(0, 0, 100, 40)],
  ["b", box(120, 0, 200, 40)],
  ["e", box(60, 100, 180, 140)],
  ["c", box(0, 300, 80, 340)],
  ["d", box(100, 300, 220, 340)],
]);
const DETAILS = box(0, 148, 400, 260);

test("a curve leaves its start straight down and comes into its end straight down", () => {
  expect(curve({ x: 50, y: 40 }, { x: 90, y: 100 })).toBe("M50 40C50 70 90 70 90 100");
  expect(curve({ x: 1.04, y: 2.06 }, { x: 3.15, y: 4.01 })).toBe("M1 2.1C1 3 3.2 3 3.2 4");
});

test("lines come from the bottom of each prerequisite into the top of the expanded tile, spread across it", () => {
  const lines = linesOf("e", { buildsOn: ["a", "b"], opens: [], teaches: [] }, BOXES, DETAILS);
  expect(lines.map(({ from, to, start, end }) => ({ from, to, start, end }))).toEqual([
    { from: "a", to: "e", start: { x: 50, y: 40 }, end: { x: 100, y: 100 } },
    { from: "b", to: "e", start: { x: 160, y: 40 }, end: { x: 140, y: 100 } },
  ]);
  expect(lines[0]?.d).toBe("M50 40C50 70 100 70 100 100");
});

test("lines go out of the details' bottom, spread across the tile's width, into the top of each tile it opens", () => {
  const lines = linesOf("e", { buildsOn: [], opens: ["c", "d"], teaches: [] }, BOXES, DETAILS);
  expect(lines.map(({ from, to, start, end }) => ({ from, to, start, end }))).toEqual([
    { from: "e", to: "c", start: { x: 100, y: 260 }, end: { x: 40, y: 300 } },
    { from: "e", to: "d", start: { x: 140, y: 260 }, end: { x: 160, y: 300 } },
  ]);
});

test("one line takes the middle of the tile's width", () => {
  const [line] = linesOf("e", { buildsOn: [], opens: ["c"], teaches: [] }, BOXES, DETAILS);
  expect(line?.start).toEqual({ x: 120, y: 260 });
});

test("the ends on the expanded tile go left to right as the other ends do, whatever the order of the links", () => {
  const lines = linesOf(
    "e",
    { buildsOn: ["b", "a"], opens: ["d", "c"], teaches: [] },
    BOXES,
    DETAILS,
  );
  expect(
    lines.map(({ from, to, end, start }) => [from, to, from === "e" ? start.x : end.x]),
  ).toEqual([
    ["b", "e", 140],
    ["a", "e", 100],
    ["e", "d", 140],
    ["e", "c", 100],
  ]);
});

test("the ends are rounded to a tenth of a CSS pixel, as the curve is", () => {
  const boxes = new Map<string, Box>([
    ["p", box(0.04, 0, 1.06, 10.03)],
    ["x", box(0, 20.07, 3, 30)],
  ]);
  const [line] = linesOf("x", { buildsOn: ["p"], opens: [], teaches: [] }, boxes, DETAILS);
  expect(line?.start).toEqual({ x: 0.6, y: 10 });
  expect(line?.end).toEqual({ x: 1.5, y: 20.1 });
});

test("a tile without a box has no line, and neither has a skill whose own tile has none", () => {
  const links = { buildsOn: ["a", "gone"], opens: ["gone"], teaches: [] };
  expect(linesOf("e", links, BOXES, DETAILS).map(({ from }) => from)).toEqual(["a"]);
  expect(linesOf("gone", links, BOXES, DETAILS)).toEqual([]);
});
