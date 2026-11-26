// The drawing of the map's lines: one SVG of paths, each the line linesOf of the core gives. The
// map has two: one under the tiles, and one over the dimmed tiles and under the chosen skill's
// chain, so that the chain's lines run unbroken. One unit of the drawing is a CSS pixel of the
// map: the SVG has no view box. Places come from attributes of SVG alone, and no attribute style,
// so that a consumer's CSP lets them through. The SVG is hidden from the tree of accessibility:
// the tiles and the card say in words what is linked to what.

import type { Line } from "../core/lines.js";

/** The namespace of SVG. */
export const SVG = "http://www.w3.org/2000/svg";

/** The lines of one layer of one element's map. */
export class Lines {
  readonly svg: SVGSVGElement;
  readonly #document: Document;
  readonly #paths = new Map<string, SVGPathElement>();

  constructor(document: Document, name: string) {
    this.#document = document;
    this.svg = document.createElementNS(SVG, "svg");
    this.svg.setAttribute("class", `lines ${name}`);
    this.svg.setAttribute("aria-hidden", "true");
    this.svg.setAttribute("focusable", "false");
  }

  /** Draws the lines given, each with the class its kind gives it, and nothing else. */
  draw(lines: readonly Line[], kindOf: (line: Line) => string = () => ""): void {
    const drawn = new Set<string>();
    for (const line of lines) {
      const key = `${line.from}\n${line.to}`;
      drawn.add(key);
      let path = this.#paths.get(key);
      if (path === undefined) {
        path = this.#document.createElementNS(SVG, "path");
        path.setAttribute("data-from", line.from);
        path.setAttribute("data-to", line.to);
        this.svg.append(path);
        this.#paths.set(key, path);
      }
      path.setAttribute("d", line.d);
      const kind = kindOf(line);
      if (kind === "") path.removeAttribute("class");
      else path.setAttribute("class", kind);
    }
    for (const [key, path] of this.#paths) {
      if (!drawn.has(key)) {
        path.remove();
        this.#paths.delete(key);
      }
    }
  }
}
