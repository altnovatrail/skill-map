# skill-map — sources

> The facts of the outside world the repository's documents under `docs/` rest on and no run of ours checks: a law, a regulator, a standard's normative text, a provider's terms and policies, a price, a license, a page that changes in place with no version, a text outside the repositories. Here are their records — the address, the date it was read and a quote in the source's language — and [architecture.md](architecture.md) and the decision log hold the claim and a citation of its one record by its number, `sources 1.1`, not a chain. A record's heading names its topic, not a task.
>
> No record is needed for a library's documentation or code at a version or commit — a link beside the claim —, for a behaviour a test or a measurement checks — they are its evidence —, or for spec's tags and the files of NovaTrail's and MathTrail's repositories — git, at a commit.
>
> A record is a subsection "N.M" of a topic: one source, or one reading of several sources for one decision. A record's number never changes and is never given again: a new one goes at the end of its topic, a new topic at the end of the file, and a record removed leaves a gap. A source read again with the same text changes the record's date; with another text, the claims and decisions on it are rewritten in the same change and the record holds the new reading alone — where a decision waits on the author, an open question, and both readings stand until it is closed. The model is `spec/docs/sources.md`. The results of measurements are not here but in `docs/measurements.md`, which the first measurement starts.
>
> The end of [architecture.md](architecture.md) lists these records by topic.

## 2. Web standards

### 2.1. WCAG 2.2 for the layout

[Web Content Accessibility Guidelines (WCAG) 2.2](https://www.w3.org/TR/WCAG22/), W3C Recommendation 12 December 2024, read 2026-11-07:
- 1.4.10 Reflow: «Content can be presented without loss of information or functionality, and without requiring scrolling in two dimensions for: Vertical scrolling content at a width equivalent to 320 CSS pixels; Horizontal scrolling content at a height equivalent to 256 CSS pixels. Except for parts of the content which require two-dimensional layout for usage or meaning». Note 2 of [Understanding 1.4.10](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html): «Examples of content which requires two-dimensional layout are images required for understanding (such as maps and diagrams), video, games, presentations, data tables (not individual cells), and interfaces where it is necessary to keep toolbars in view»;
- 2.5.7 Dragging Movements: «All functionality that uses dragging movements can be operated by single pointer activation without dragging, unless dragging is essential»;
- 1.3.1 Info and Relationships: «Information, structure, and relationships conveyed through presentation can be programmatically determined or are available in text» — for the level of the bands' headings;
- 1.3.2 Meaningful Sequence: «When the sequence in which content is presented affects its meaning, a correct reading sequence can be programmatically determined»;
- 2.4.3 Focus Order: «focusable components receive focus in an order that preserves meaning and operability»;
- 2.4.11 Focus Not Obscured (Minimum): «When a user interface component receives keyboard focus, the component is not entirely hidden due to author-created content»;
- 1.4.1 Use of Color: «Color is not used as the only visual means of conveying information»;
- 1.4.11 Non-text Contrast: «a contrast ratio of at least 3:1 against adjacent color(s): User Interface Components and Graphical Objects».

### 2.2. WCAG 2.2 for the look of the map

[Web Content Accessibility Guidelines (WCAG) 2.2](https://www.w3.org/TR/WCAG22/), W3C Recommendation 12 December 2024, read 2026-11-07:
- 1.4.3 Contrast (Minimum): «The visual presentation of text and images of text has a contrast ratio of at least 4.5:1»;
- 1.4.11 Non-text Contrast: «Visual information required to identify user interface components and states» — «a contrast ratio of at least 3:1 against adjacent color(s)»;
- 1.4.12 Text Spacing: «no loss of content or functionality occurs by setting all of the following and by changing no other style property: Line height (line spacing) to at least 1.5 times the font size»;
- 2.4.7 Focus Visible: «Any keyboard operable user interface has a mode of operation where the keyboard focus indicator is visible»;
- 2.5.5 Target Size (Enhanced): «The size of the target for pointer inputs is at least 44 by 44 CSS pixels»;
- 2.3.3 Animation from Interactions: «Motion animation triggered by interaction can be disabled, unless the animation is essential to the functionality or the information being conveyed».

### 2.3. Forced colours and CSS custom properties

Read 2026-11-07:
- [Media Queries Level 5](https://www.w3.org/TR/mediaqueries-5/), W3C Working Draft 19 February 2026, `forced-colors`: «active — Indicates that forced colors mode is active: the user agent enforces a user-chosen limited color palette on the page» and «When forced colors mode is active, the only colors that are available to the author are system colors»;
- [CSS Custom Properties for Cascading Variables Level 1](https://www.w3.org/TR/css-variables-1/), CR Snapshot 16 June 2022, section 3.1: the value of a property invalid after the substitution of `var()` is «Either the property's inherited value or its initial value depending on whether the property is inherited or not, respectively, as if the property's value had been specified as the unset keyword».

### 2.4. Resize Observer

[Resize Observer](https://www.w3.org/TR/resize-observer/), W3C First Public Working Draft 11 February 2020, read 2026-11-07: «Observation will fire when observation starts if Element is being rendered, and Element's size is not 0,0»; «Observations do not fire for non-replaced inline Elements» — so the tiles' buttons, the details and the map itself are observed, not the inline parts of the tiles.

## 3. Packages

### 3.1. Layout libraries

The npm registry, `npm view <package> version license description` and the package's README, read 2026-11-07:
- [`@dagrejs/dagre`](https://www.npmjs.com/package/@dagrejs/dagre) 3.1.3, MIT: «Dagre is a JavaScript library that makes it easy to lay out directed graphs on the client-side»; the former package `dagre` is 0.8.5, and the README says that only the one in the DagreJs organization is updated;
- [`elkjs`](https://www.npmjs.com/package/elkjs) 0.12.1, `EPL-2.0 OR GPL-3.0-or-later`: «Automatic graph layout based on Sugiyama's algorithm»; «elkjs is not a diagramming framework itself - it computes positions for the elements of a diagram»;
- [`d3-dag`](https://www.npmjs.com/package/d3-dag) 1.3.0, MIT: «`d3-dag` provides layered graph layout algorithms for directed acyclic graphs».

### 3.2. typescript-eslint and TypeScript 7

The npm registry, `npm view <package>@<version> license time` and `peerDependencies`, read 2026-11-07: `typescript` 7.0.2 — Apache-2.0, the latest; `typescript-eslint` 8.72.1 requires `"typescript": ">=4.8.4 <6.1.0"`.
