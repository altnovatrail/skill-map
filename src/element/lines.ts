// The drawing of the expanded skill's lines (R06; R11 in docs/decisions.md): one SVG under the
// bands of the map, with a path and a point at each end for each line that linesOf of the core
// gives. One unit of the drawing is a CSS pixel of the map: the SVG has no view box. Places come
// from attributes of SVG alone — d, cx and cy — and no attribute style, so that a consumer's CSP lets them through (R09). The SVG is hidden from the tree of
// accessibility: what is linked to what the details and the tiles' labels say in words.

import type { Line, Point } from "../core/lines.js";

/** The namespace of SVG. */
export const SVG = "http://www.w3.org/2000/svg";

/** The radius of the point at each end of a line, in CSS pixels. */
const POINT = 4;

/** The nodes of one line, kept while the line is drawn. */
interface LineNodes {
  readonly group: SVGGElement;
  readonly path: SVGPathElement;
  readonly start: SVGCircleElement;
  readonly end: SVGCircleElement;
}

/** The lines of one element's map. */
export class Lines {
  readonly svg: SVGSVGElement;
  readonly #document: Document;
  readonly #lines = new Map<string, LineNodes>();

  constructor(document: Document) {
    this.#document = document;
    this.svg = document.createElementNS(SVG, "svg");
    this.svg.setAttribute("class", "lines");
    this.svg.setAttribute("aria-hidden", "true");
    this.svg.setAttribute("focusable", "false");
  }

  /** Draws the lines given, and nothing else. */
  draw(lines: readonly Line[]): void {
    const drawn = new Set<string>();
    for (const line of lines) {
      const key = `${line.from}\n${line.to}`;
      drawn.add(key);
      const nodes = this.#lines.get(key) ?? this.#make(line);
      nodes.path.setAttribute("d", line.d);
      place(nodes.start, line.start);
      place(nodes.end, line.end);
    }
    for (const [key, nodes] of this.#lines) {
      if (!drawn.has(key)) {
        nodes.group.remove();
        this.#lines.delete(key);
      }
    }
  }

  #make(line: Line): LineNodes {
    const group = this.#document.createElementNS(SVG, "g");
    group.setAttribute("data-from", line.from);
    group.setAttribute("data-to", line.to);
    const path = this.#document.createElementNS(SVG, "path");
    const [start, end] = [0, 1].map(() => {
      const point = this.#document.createElementNS(SVG, "circle");
      point.setAttribute("r", String(POINT));
      return point;
    }) as [SVGCircleElement, SVGCircleElement];
    group.append(path, start, end);
    this.svg.append(group);
    const nodes = { group, path, start, end };
    this.#lines.set(`${line.from}\n${line.to}`, nodes);
    return nodes;
  }
}

/** Puts a point of a line where it belongs: the core has rounded it as it rounds the curve. */
function place(point: SVGCircleElement, at: Point): void {
  point.setAttribute("cx", String(at.x));
  point.setAttribute("cy", String(at.y));
}
