// The element's styles: one constructed sheet, which the shadow root adopts. No <style> and no
// attribute style in the tree, so that a consumer's CSP lets them through without
// 'unsafe-inline'; the places the element computes, the margins of the columns' tiles and the
// card's room, it sets through the CSSOM, which a CSP does not govern.
//
// The look holds the standard of the packages of the interface, WCAG 2.2 AA with 2.5.5 and 2.3.3.
// The theme is the consumer's, by three custom properties the shadow tree inherits:
// --novatrail-skill-map-paper, the map's ground and the card's, --novatrail-skill-map-ink, its
// text, and --novatrail-skill-map-accent, the chosen tile, the chain's lines, «Practise» and the
// ring of the focus. Their defaults stand in each var(), not in :host: a declaration there would
// set the property on the host, and a value the page gives the host's ancestors would never reach
// the shadow tree. A value that is not a colour gives none: the property is then as if unset. Each
// state, mark and holding has its own fill, frame and word colour, the package's, each word at
// 4.5:1 on its fill at least; the icon and the word name it, so that no colour alone does (1.4.1).
// With forced colours the system's colours stand in for all of them. Nothing moves: no transition
// and no animation, so there is nothing for prefers-reduced-motion to stop. The size of text is
// the consumer's, in em and rem, and a target is 44 by 44 CSS pixels at least.

/** The defaults of the theme: light, as canvas's. The accent is 6.7:1 against the paper. */
const PAPER = "#fff";
const INK = "#1d1d1f";
const ACCENT = "#1d4ed8";
/** The text of a tile and a chip, on the package's own fills: not the consumer's ink, which a dark
 * theme makes light. Dimmed, 4.9:1 on the dimmed fill. */
const TILE_INK = "#1d1d1f";
const DIM_INK = "#6e6e73";

const paper = `var(--novatrail-skill-map-paper, ${PAPER})`;
const ink = `var(--novatrail-skill-map-ink, ${INK})`;
const accent = `var(--novatrail-skill-map-accent, ${ACCENT})`;

/** The look of each value: the tile's fill, its frame, and the colour of its word and icon. */
const LOOK: Readonly<Record<string, readonly [string, string, string]>> = {
  mastered: ["#eaf8ee", "#b7e4c3", "#1e7a35"],
  review: ["#fff4e5", "#ffd8a8", "#b25000"],
  practising: ["#e8f1fe", "#b9d7ff", "#0058b8"],
  ready: ["#f3f8ff", "#d6e7ff", "#0058b8"],
  locked: ["#f5f5f7", "#e5e5ea", "#6e6e73"],
  rubric: ["#f7f0fc", "#e3ccf2", "#7a2ea8"],
  none: ["#f5f5f7", "#e5e5ea", "#6e6e73"],
  held: ["#ffffff", "#b7e4c3", "#1e7a35"],
  "not-held": ["#ffffff", "#ffd8a8", "#b25000"],
  unknown: ["#ffffff", "#d1d1d6", "#6e6e73"],
};

/** The square of each value in the legend and under a tier's heading, as app's card of the module. */
const DOT: Readonly<Record<string, string>> = {
  mastered: "background: #30a14e;",
  review: "background: #ff9500;",
  practising: "background: #0071e3;",
  ready: "border: 1.5px dashed #0071e3;",
  locked: "background: #e5e5ea;",
  rubric: "background: #d9b3f0;",
  none: "border: 1px solid #c7c7cc;",
};

const looks = Object.entries(LOOK)
  .map(
    ([value, [fill, frame, word]]) => `
.is-${value} {
  --fill: ${fill};
  --frame: ${frame};
  --word: ${word};
}`,
  )
  .join("");

const dots = Object.entries(DOT)
  .map(([value, look]) => `.dot[data-state="${value}"] { ${look} }`)
  .join("\n");

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
.map.chosen {
  padding-block-end: var(--room, 16rem);
}
.map.chosen .tile {
  scroll-margin-block: 0.5rem calc(var(--room, 16rem) + 0.5rem);
}
${looks}
/* The lines: under the tiles, those not of the chain, grey, or green from a prerequisite held; over
   the dimmed tiles and under the chain's, the chain's in the accent. */
.lines {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
  pointer-events: none;
}
.lines path {
  fill: none;
  stroke-width: 1.3px;
  stroke-linecap: round;
  stroke: #dadadf;
}
.lines path.walked {
  stroke: #bfe6c9;
}
.map.chosen .lines.under {
  opacity: 0.3;
}
.lines.over {
  display: none;
  z-index: 1;
  color: ${accent};
}
.map.chosen .lines.over {
  display: block;
}
/* The words of the map lie over every line, on the paper and as wide as they are: a line across a
   tier passes under its heading. Only a dimmed tile lies under the chain's lines. */
.legend,
.band > :is(h2, h3, h4, h5, h6),
.progress {
  position: relative;
  z-index: 2;
}
.band > :is(h2, h3, h4, h5, h6),
.progress {
  width: fit-content;
  background: ${paper};
}
.lines.over path {
  stroke: currentColor;
  stroke-width: 2.4px;
}
.ruler {
  position: absolute;
  inset-inline: 0;
  inset-block-start: 0;
  height: 0;
}
.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 0 0 1rem;
  padding: 0;
  list-style: none;
  font-size: 0.8125rem;
}
.legend li {
  display: flex;
  align-items: center;
  gap: 0.4375rem;
  min-height: 1.875rem;
  padding: 0 0.75rem 0 0.625rem;
  border-radius: 0.9375rem;
  box-shadow: 0 0 0 0.5px rgba(0, 0, 0, 0.12);
}
.legend b {
  font-weight: 600;
}
.dot {
  box-sizing: border-box;
  display: inline-block;
  flex: none;
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 2px;
  background: #e5e5ea;
}
.legend .dot {
  width: 0.625rem;
  height: 0.625rem;
}
${dots}
.band {
  position: relative;
  margin-block-end: 1.5rem;
}
.band > :is(h2, h3, h4, h5, h6) {
  margin: 0 0 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: color-mix(in srgb, ${ink} 72%, ${paper});
}
.progress {
  display: flex;
  flex-direction: column;
  gap: 0.4375rem;
  margin: 0 0 0.75rem;
  font-size: 0.75rem;
}
.progress[hidden] {
  display: none;
}
.dots {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
}
.band > ul {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(9rem, 1fr));
  gap: 0.5rem;
  margin: 0;
  padding: 0;
  list-style: none;
}
.band > ul > li {
  min-width: 0;
}
/* The tiers side by side: a column each, the tiles one under another, each at the margin the
   element gives it; the anchor skills in a row above them. */
.map.columns .tiers {
  display: grid;
  grid-template-columns: repeat(var(--tiers, 1), minmax(0, 1fr));
  column-gap: 3.5rem;
  align-items: start;
}
/* One tier, one column: no wider than a column of a map of a few. */
.map.columns .tiers.single {
  grid-template-columns: minmax(0, 30rem);
}
.map.columns .band:not(.anchors) > ul {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.map.columns .anchors > ul {
  display: flex;
  flex-wrap: wrap;
}
/* A tile of the row, not the card, which stands in the row after a chosen anchor skill. */
.map.columns .anchors > ul > li:not(.card) {
  width: 15rem;
}
.tile,
.chip {
  position: relative;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  grid-template-rows: auto auto;
  column-gap: 0.5625rem;
  align-items: center;
  width: 100%;
  min-width: 44px;
  min-height: 3.375rem;
  margin: 0;
  padding: 0.375rem 0.625rem 0.375rem 0.5rem;
  font: inherit;
  line-height: 1.2;
  text-align: start;
  color: ${TILE_INK};
  background: var(--fill, ${paper});
  border: 1px solid var(--frame, currentColor);
  border-radius: 1rem;
  cursor: pointer;
}
.tile.anchor {
  border-style: dashed;
  border-width: 1.5px;
}
.badge {
  grid-row: 1 / span 2;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.875rem;
  height: 1.875rem;
  border-radius: 50%;
  background: #fff;
  color: var(--word, ${TILE_INK});
}
.name {
  align-self: end;
  font-size: 0.84375rem;
  font-weight: 600;
}
.word {
  align-self: start;
  font-size: 0.71875rem;
  color: var(--word, ${TILE_INK});
}
.tile:not(:has(.word)) .name {
  grid-row: 1 / span 2;
  align-self: center;
}
/* The separator is for the accessible name alone: "Quarters, Locked". It is inline, clipped out
   of sight: an inline block would put spaces around it in the name. */
.separator {
  clip-path: inset(50%);
  white-space: pre;
}
.icon {
  width: 1.125rem;
  height: 1.125rem;
  fill: currentColor;
}
/* A chosen skill: its chain stands out and the rest dims, opaque, so that a line of the chain
   runs over a dimmed tile and not through it. */
.tile.dim {
  --fill: #fafafb;
  --frame: #ededf0;
  --word: ${DIM_INK};
  color: ${DIM_INK};
}
.tile.lit {
  z-index: 2;
  box-shadow: 0 4px 12px rgba(17, 24, 39, 0.08);
}
.tile[aria-expanded="true"] {
  z-index: 3;
  box-shadow:
    0 0 0 2.5px ${accent},
    0 8px 20px rgba(17, 24, 39, 0.16);
}
.tile:focus-visible,
.chip:focus-visible,
.practise:focus-visible,
.close:focus-visible {
  outline: 3px solid ${accent};
  outline-offset: 2px;
}
/* The chosen skill's card: at the bottom of the window, as wide as the map, two parts side by side
   when the tiers are columns; a sheet from the bottom when they are bands. */
.card {
  position: fixed;
  z-index: 10;
  inset-block-end: 1rem;
  inset-inline: var(--card-left, 1rem) var(--card-right, 1rem);
  box-sizing: border-box;
  max-height: 62vh;
  overflow: auto;
  padding: 1.125rem;
  background: ${paper};
  color: ${ink};
  border-radius: 1.25rem;
  box-shadow:
    0 0 0 0.5px rgba(0, 0, 0, 0.08),
    0 16px 48px rgba(17, 24, 39, 0.16);
}
.map.columns .card {
  display: grid;
  grid-template-columns: minmax(0, 18rem) minmax(0, 1fr);
  column-gap: 1.75rem;
}
.map:not(.columns) .card {
  inset-inline: 0;
  inset-block-end: 0;
  padding: 3.5rem 1rem 1.75rem;
  border-radius: 1.75rem 1.75rem 0 0;
}
.card-main {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 0;
}
.card p {
  margin: 0;
}
.card-title {
  padding-inline-end: 3rem;
  font-size: 1.1875rem;
  font-weight: 700;
  line-height: 1.25;
}
.card .card-status {
  margin-block-start: 0.5rem;
}
.status {
  display: inline-flex;
  align-items: center;
  gap: 0.3125rem;
  min-height: 1.625rem;
  padding: 0 0.625rem 0 0.375rem;
  border-radius: 0.8125rem;
  background: var(--fill);
  color: var(--word);
  font-size: 0.8125rem;
  font-weight: 600;
}
.card .card-note {
  margin-block-start: 0.625rem;
  font-size: 0.875rem;
  line-height: 1.4;
}
.card .waits {
  align-self: stretch;
  margin-block-start: 0.875rem;
  padding: 0.6875rem 0.75rem;
  border-radius: 0.75rem;
  background: #f5f5f7;
  font-size: 0.84375rem;
  line-height: 1.35;
}
.card-links {
  min-width: 0;
  padding-inline-end: 2.25rem;
}
.card .label {
  margin-block-start: 0.625rem;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  opacity: 0.72;
}
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  margin: 0.25rem 0 0;
  padding: 0;
  list-style: none;
}
.chip {
  display: inline-flex;
  width: auto;
  min-height: 44px;
  gap: 0.375rem;
  padding: 0 0.75rem 0 0.25rem;
  border-radius: 22px;
}
.chip .badge {
  width: 1.75rem;
  height: 1.75rem;
  background: transparent;
}
.chip .name {
  align-self: center;
  font-weight: 500;
}
/* A chip shows the icon of its value, not its word; the word stays in its name, out of sight. */
.chip .word {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
.teaches {
  margin: 0.25rem 0 0;
  padding-inline-start: 1.25em;
  font-size: 0.875rem;
}
.card .number {
  margin-block-start: 0.375rem;
  font-size: 0.875rem;
}
.practise,
.close {
  box-sizing: border-box;
  min-width: 44px;
  min-height: 44px;
  margin: 0;
  font: inherit;
  cursor: pointer;
}
.practise {
  align-self: stretch;
  margin-block-start: 0.875rem;
  padding: 0 1rem;
  color: ${paper};
  background: ${accent};
  border: 1px solid ${accent};
  border-radius: 0.75rem;
  font-weight: 600;
}
/* Close: a cross drawn by two bars, at the card's top right. */
.close {
  position: absolute;
  inset-block-start: 0.375rem;
  inset-inline-end: 0.375rem;
  width: 44px;
  padding: 0;
  color: inherit;
  background: transparent;
  border: 0;
  border-radius: 50%;
}
.close::before,
.close::after {
  content: "";
  position: absolute;
  inset-block-start: 50%;
  inset-inline-start: calc(50% - 0.4375rem);
  width: 0.875rem;
  height: 2px;
  border-radius: 1px;
  background: currentColor;
  opacity: 0.6;
  transform: rotate(45deg);
}
.close::after {
  transform: rotate(-45deg);
}
@media (forced-colors: active) {
  .map,
  .card,
  .band > :is(h2, h3, h4, h5, h6),
  .progress {
    background: Canvas;
    color: CanvasText;
  }
  .card {
    border: 1px solid CanvasText;
  }
  .tile,
  .chip,
  .practise {
    background: ButtonFace;
    color: ButtonText;
    border-color: ButtonBorder;
  }
  .badge,
  .word,
  .status {
    background: transparent;
    color: inherit;
  }
  .tile.dim {
    color: GrayText;
  }
  .tile.lit {
    border-color: Highlight;
  }
  .tile[aria-expanded="true"] {
    background: Highlight;
    color: HighlightText;
    border-color: Highlight;
  }
  .tile:focus-visible,
  .chip:focus-visible,
  .practise:focus-visible,
  .close:focus-visible {
    outline-color: Highlight;
  }
  .lines path {
    stroke: GrayText;
  }
  .lines.over path {
    stroke: Highlight;
  }
  .dot {
    border: 1px solid CanvasText;
  }
  .close::before,
  .close::after {
    background: ButtonText;
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
