// The page to try the map on by hand (RUN.md, T16; R12 in docs/decisions.md). It gives the element
// the graph, the tiers, the manifest and the state the controls choose, and its view, language and
// level of headings by attributes, as app is to; the theme by the element's custom properties, and
// the width by its frame. The skills chosen by Practise are listed as skillchoose tells them, with
// the time. The page keeps nothing once it is closed.

import "../src/element/index.js";
import { MODULE } from "../src/core/fair-shares.fixture.js";
import { type NovatrailSkillMap, TAG } from "../src/element/index.js";
import { CHOICES } from "./graphs.js";
import { PRESETS, type Preset, stateOf } from "./states.js";

const element = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const map = document.querySelector(TAG) as NovatrailSkillMap;
const graph = element<HTMLSelectElement>("graph");
const view = element<HTMLSelectElement>("view");
const lang = element<HTMLSelectElement>("lang");
const state = element<HTMLSelectElement>("state");
const theme = element<HTMLSelectElement>("theme");
const heading = element<HTMLSelectElement>("heading");
const width = element<HTMLSelectElement>("width");

graph.append(...CHOICES.map(({ name }, i) => new Option(name, String(i))));
state.append(...Object.entries(PRESETS).map(([key, title]) => new Option(title, key)));
state.value = "on-the-way";

/**
 * The data the controls choose, by properties: the graph, its tiers and manifest, and the state.
 * The example's own answer is the example's alone, and another graph does not offer it.
 */
function drawData(): void {
  const choice = CHOICES[Number(graph.value)] ?? CHOICES[0];
  if (choice === undefined) return;
  const example = state.querySelector<HTMLOptionElement>('option[value="example"]');
  if (example !== null) example.disabled = choice.name !== MODULE;
  if (example?.disabled && state.value === "example") state.value = "on-the-way";
  element("source").textContent = `${choice.name} — ${choice.source}`;
  map.graph = choice.graph;
  map.tiers = choice.tiers;
  map.manifest = choice.manifest;
  map.skillMap = stateOf(
    state.value as Preset,
    choice.graph,
    choice.tiers,
    choice.manifest,
    new Date(),
  );
}

/** The rest the controls choose: the view, the language and the level of headings by attributes,
 * the theme by the custom properties of the page's class, and the width by the element's frame. */
function drawLook(): void {
  for (const [name, value] of [
    ["view", view.value],
    ["lang", lang.value],
    ["heading-level", heading.value],
  ] as const) {
    if (value === "") map.removeAttribute(name);
    else map.setAttribute(name, value);
  }
  document.body.classList.toggle("dark", theme.value === "dark");
  element("frame").classList.toggle("narrow", width.value === "narrow");
}

for (const control of [graph, state]) control.addEventListener("change", drawData);
for (const control of [view, lang, theme, heading, width]) {
  control.addEventListener("change", drawLook);
}
map.addEventListener("skillchoose", (event) => {
  const item = document.createElement("li");
  item.textContent = `${new Date().toLocaleTimeString()} — ${event.detail.skill}`;
  element("chosen").prepend(item);
});
drawData();
drawLook();
