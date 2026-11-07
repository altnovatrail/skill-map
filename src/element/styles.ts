// The element's styles: one constructed sheet, which the shadow root adopts. No <style> and no
// attribute style in the tree, so that a consumer's CSP lets them through without 'unsafe-inline'
// (the second amendment of 2026-11-02 to R36 spec; R09 in docs/decisions.md). Colours, contrast and
// the size of targets come with RUN.md, T14.

const CSS = `
:host {
  display: block;
}
.band > ul {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 0;
  padding: 0;
  list-style: none;
}
/* The parts of a tile stay inline: a block or an element out of the flow would put a space into
   its accessible name, "Quarters , Locked" (RUN.md, T13). */
.tile {
  font: inherit;
  text-align: start;
}
.details {
  flex-basis: 100%;
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
