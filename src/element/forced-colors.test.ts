import { expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { button, mount, mounted, tile, useMap } from "./map.fixture.js";

// The map with forced colours, in a browser context that is in the mode from the start (R90 spec;
// R10 in docs/decisions.md): the system's colours stand in for the consumer's theme, and the
// expanded tile stays apart from the others by the system's highlight. vitest.config.ts runs this
// file alone, in a project of its own, as canvas does.

useMap();

/** The colour a system colour keyword computes to here, read off an element of the page. */
function system(keyword: string): string {
  const swatch = document.createElement("div");
  swatch.style.color = keyword;
  document.body.append(swatch);
  const colour = getComputedStyle(swatch).color;
  swatch.remove();
  return colour;
}

test("with forced colours the tiles are the system's buttons, whatever the consumer's theme", async () => {
  expect(matchMedia("(forced-colors: active)").matches).toBe(true);
  const theme = document.createElement("div");
  theme.style.setProperty("--novatrail-skill-map-paper", "rgb(10, 20, 30)");
  theme.style.setProperty("--novatrail-skill-map-ink", "rgb(240, 0, 0)");
  theme.style.setProperty("--novatrail-skill-map-accent", "rgb(0, 200, 0)");
  document.body.append(theme);
  try {
    await mount({ view: "learner" }, undefined, theme);
    const quarters = button("Quarters, Locked");
    // Read now, as strings: the declaration getComputedStyle gives is live.
    const { color, backgroundColor, borderTopColor } = getComputedStyle(quarters);
    expect(color).toBe(system("ButtonText"));
    expect(backgroundColor).toBe(system("ButtonFace"));
    expect(borderTopColor).toBe(system("ButtonBorder"));
    // The icon is drawn in its tile's colour.
    expect(getComputedStyle(quarters.querySelector("svg") as Element).fill).toBe(
      system("ButtonText"),
    );

    await userEvent.click(tile("Quarters, Locked"));
    const expanded = getComputedStyle(quarters);
    expect(expanded.backgroundColor).toBe(system("Highlight"));
    expect(expanded.color).toBe(system("HighlightText"));
    expect(expanded.backgroundColor).not.toBe(backgroundColor);
    expect(expanded.color).not.toBe(color);
    expect(getComputedStyle(button("Halves, In progress, needed before")).borderTopColor).toBe(
      system("Highlight"),
    );
    const details = mounted().shadowRoot?.getElementById("details") as HTMLElement;
    expect(getComputedStyle(details).color).toBe(system("CanvasText"));
    expect(getComputedStyle(details).backgroundColor).toBe(system("Canvas"));
  } finally {
    mounted().remove();
    theme.remove();
  }
});
