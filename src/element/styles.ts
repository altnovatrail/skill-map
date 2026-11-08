// The element's styles: one constructed sheet, which the shadow root adopts. No <style> and no
// attribute style in the tree, so that a consumer's CSP lets them through without 'unsafe-inline'
// (the second amendment of 2026-11-02 to R36 spec; R09 in docs/decisions.md).
//
// The look holds the standard of the packages of the interface, WCAG 2.2 AA with 2.5.5 and 2.3.3
// (R90 spec; R10). The theme is the consumer's, by three custom properties the shadow tree
// inherits: --novatrail-skill-map-paper, the map's ground, --novatrail-skill-map-ink, its text,
// frames and icons, and --novatrail-skill-map-accent, the expanded tile, the frames of the tiles
// linked to it, the details and the ring of the focus. Their defaults stand in each var(), not in
// :host: a declaration there would set the property on the host, and a value the page gives the
// host's ancestors would never reach the shadow tree. A value that is not a colour gives none: the
// property is then as if unset, and the text takes the host's colour, the ground none. A state has
// no colour of its own: its word and its icon name it (1.4.1). With forced colours the system's
// colours stand in for the theme. The expanded skill's lines lie under the bands, in the accent,
// and their places are attributes of SVG (R11). Nothing moves: no transition and no animation, the
// lines' too, so there is nothing for prefers-reduced-motion to stop. The size of text is the consumer's, in em and rem,
// and a target is 44 by 44 CSS pixels at least.

/** The defaults of the theme: light, as canvas's. The accent is 6.7:1 against the paper. */
const PAPER = "#fff";
const INK = "#111";
const ACCENT = "#1d4ed8";

const paper = `var(--novatrail-skill-map-paper, ${PAPER})`;
const ink = `var(--novatrail-skill-map-ink, ${INK})`;
const accent = `var(--novatrail-skill-map-accent, ${ACCENT})`;

const CSS = `
:host {
  display: block;
}
:host([hidden]) {
  display: none;
}
.map {
  position: relative;
  background: ${paper};
  color: ${ink};
  overflow-wrap: anywhere;
}
/* The lines fill the map under its bands: a band is positioned, and comes after them. */
/* The lines are drawn in the colour of .lines, the accent, and so fall back to the ink when the
   accent is no colour, as the tiles do. */
.lines {
  color: ${accent};
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
  pointer-events: none;
}
.lines path {
  fill: none;
  stroke: currentColor;
  stroke-width: 2px;
}
.lines circle {
  fill: currentColor;
}
.band {
  position: relative;
}
/* A band's heading covers the lines that pass under it, as a tile does, but no wider than its text:
   a line across a tier stays in sight beside it (RUN.md, Д5). */
.band > :is(h2, h3, h4, h5, h6) {
  width: fit-content;
  margin: 1rem 0 0.5rem;
  background: ${paper};
}
.band > ul {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 0;
  padding: 0;
  list-style: none;
}
.band > ul > li {
  max-width: 100%;
}
/* The parts of a tile stay inline: a block or an element out of the flow would put a space into
   its accessible name, "Quarters , Locked" (R09). */
.tile,
.practise {
  box-sizing: border-box;
  min-width: 44px;
  min-height: 44px;
  max-width: 100%;
  margin: 0;
  padding: 0.5rem 0.75rem;
  font: inherit;
  line-height: 1.4;
  text-align: start;
  border-radius: 0.5rem;
  cursor: pointer;
}
.tile {
  color: inherit;
  background: ${paper};
  border: 1px solid currentColor;
}
.tile .title {
  font-weight: 600;
}
.tile.locked {
  border-style: dashed;
}
.tile.linked {
  border-width: 2px;
  border-color: ${accent};
  padding: calc(0.5rem - 1px) calc(0.75rem - 1px);
}
.tile[aria-expanded="true"] {
  color: ${paper};
  background: ${accent};
  border-color: ${accent};
}
.tile:focus-visible,
.practise:focus-visible {
  outline: 3px solid ${accent};
  outline-offset: 2px;
}
.icon {
  width: 1.25em;
  height: 1.25em;
  margin-inline-end: 0.25em;
  vertical-align: -0.3em;
  fill: currentColor;
}
.details {
  box-sizing: border-box;
  flex-basis: 100%;
  padding: 0.75rem;
  background: ${paper};
  border: 2px solid ${accent};
  border-radius: 0.5rem;
}
.details p,
.details ul {
  margin: 0 0 0.5rem;
}
.details ul {
  padding-inline-start: 1.5em;
}
.practise {
  color: ${paper};
  background: ${accent};
  border: 1px solid ${accent};
}
@media (forced-colors: active) {
  .map,
  .details {
    background: Canvas;
    color: CanvasText;
  }
  .details {
    border-color: CanvasText;
  }
  .band > :is(h2, h3, h4, h5, h6) {
    background: Canvas;
  }
  .tile,
  .practise {
    background: ButtonFace;
    color: ButtonText;
    border-color: ButtonBorder;
  }
  .tile.linked {
    border-color: Highlight;
  }
  .tile[aria-expanded="true"] {
    background: Highlight;
    color: HighlightText;
    border-color: Highlight;
  }
  .tile:focus-visible,
  .practise:focus-visible {
    outline-color: Highlight;
  }
  /* The lines take the system's highlight, as the frames of the tiles they link do. */
  .lines {
    color: Highlight;
  }
}
`;

let sheet: CSSStyleSheet | undefined;

/** The sheet of this copy of the module, made once, the first time an element needs it. */
export function styles(): CSSStyleSheet {
  if (sheet === undefined) {
    sheet = new CSSStyleSheet();
    sheet.replaceSync(CSS);
  }
  return sheet;
}
