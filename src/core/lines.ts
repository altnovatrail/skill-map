// The lines of the map: where each starts and ends, and the curve between, from the boxes the
// element measured. When the tiers are columns every link has its line, from the right edge of a
// prerequisite's tile into the left edge of the skill's, and an anchor skill's, from the row above
// the columns, runs down the gap before the skill's column and into its side. When the tiers are
// bands only the chosen skill's chain has lines, each down from the bottom edge of one tile into
// the top edge of the next.

import type { Link } from "./layout.js";

/** A box of the map, in CSS pixels from the map's top left corner. */
export interface Box {
  readonly left: number;
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
}

/** A point of the map. */
export interface Point {
  readonly x: number;
  readonly y: number;
}

/** A line between two tiles: the skills it links, its ends, and its path in SVG. */
export interface Line {
  readonly from: string;
  readonly to: string;
  readonly start: Point;
  readonly end: Point;
  readonly d: string;
}

/** How the map stands: its tiers as columns left to right, or as bands top to bottom. */
export type Arrangement = "columns" | "bands";

/** A number of the drawing, to a tenth of a CSS pixel. */
const tenth = (value: number) => Math.round(value * 10) / 10;

/** A point to a tenth of a CSS pixel. */
const rounded = ({ x, y }: Point): Point => ({ x: tenth(x), y: tenth(y) });

/** The cubic curve from one point down to another: both ends leave and come in upright. */
export function curve(start: Point, end: Point): string {
  const middle = tenth((start.y + end.y) / 2);
  const [sx, sy, ex, ey] = [start.x, start.y, end.x, end.y].map(tenth);
  return `M${sx} ${sy}C${sx} ${middle} ${ex} ${middle} ${ex} ${ey}`;
}

/** How far a line runs level out of a tile and into the next, at most, in CSS pixels. */
const REACH = 48;

/** The cubic curve from one point across to another: both ends leave and come in level. */
export function across(start: Point, end: Point): string {
  const reach = Math.min(REACH, Math.abs(end.x - start.x) / 2);
  const [sx, sy, ex, ey] = [tenth(start.x), tenth(start.y), tenth(end.x), tenth(end.y)];
  return `M${sx} ${sy}C${tenth(sx + reach)} ${sy} ${tenth(ex - reach)} ${ey} ${ex} ${ey}`;
}

/** The radius of the turns of an anchor skill's line, in CSS pixels. */
const TURN = 12;

/**
 * An anchor skill's line when the tiers are columns: down from the tile in the row above them,
 * over to the gap before the skill's column at x, down that gap, and with a turn into the side of
 * the skill's tile.
 */
export function down(start: Point, end: Point, x: number): string {
  const [sx, sy, ex, ey, gx] = [
    tenth(start.x),
    tenth(start.y),
    tenth(end.x),
    tenth(end.y),
    tenth(x),
  ];
  const level = tenth(Math.min(sy + 2 * TURN, ey - TURN));
  const bend = tenth(Math.min(sy + 4 * TURN, ey - TURN));
  return `M${sx} ${sy}C${sx} ${level} ${gx} ${level} ${gx} ${bend}L${gx} ${tenth(ey - TURN)}Q${gx} ${ey} ${tenth(gx + TURN)} ${ey}L${ex} ${ey}`;
}

const rightOf = (box: Box): Point => ({ x: box.right, y: (box.top + box.bottom) / 2 });
const leftOf = (box: Box): Point => ({ x: box.left, y: (box.top + box.bottom) / 2 });
const bottomOf = (box: Box): Point => ({ x: (box.left + box.right) / 2, y: box.bottom });
const topOf = (box: Box): Point => ({ x: (box.left + box.right) / 2, y: box.top });

/**
 * The lines of the links given, one for each whose two tiles have boxes. With the tiers as
 * columns, a line of an anchor skill — one of those named — runs down the gap before the skill's
 * column, `gap` wide; every other goes across. With the tiers as bands each goes down.
 */
export function linesOf(
  links: readonly Link[],
  boxes: ReadonlyMap<string, Box>,
  arrangement: Arrangement,
  anchors: ReadonlySet<string>,
  gap: number,
): Line[] {
  return links.flatMap(({ from, to }) => {
    const [a, b] = [boxes.get(from), boxes.get(to)];
    if (a === undefined || b === undefined) return [];
    let start: Point;
    let end: Point;
    let d: string;
    if (arrangement === "bands") {
      [start, end] = [bottomOf(a), topOf(b)];
      d = curve(start, end);
    } else if (anchors.has(from)) {
      [start, end] = [bottomOf(a), leftOf(b)];
      d = down(start, end, b.left - gap / 2);
    } else {
      [start, end] = [rightOf(a), leftOf(b)];
      d = across(start, end);
    }
    return [{ from, to, start: rounded(start), end: rounded(end), d }];
  });
}
