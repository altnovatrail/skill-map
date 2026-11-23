# skill-map — measurements

> The results of the repository's measurements: what was measured, how, on what, and what numbers came out. The documents that describe how things are built — [architecture.md](architecture.md) and the decision log — refer here and hold no numbers of measurements themselves. A claim cites its one measurement by number: `measurements 1.1`. The model is `spec/docs/measurements.md`.
>
> An external fact a measurement rests on is a record of [sources.md](sources.md).

## 1. Claude Code sessions

How much the Claude Code sessions of `skill-map` spend, measured by spec's recipe `tokens-report` on the transcripts of `-workspaces-skill-map` on the author's machine (measurements 1.1 spec). The figures here are only sums. There is no text of transcripts, neither here nor in the recipe's output.

### 1.1. Before and after the restructuring

What spec's restructuring of the documents and the plan changed in the sessions of `skill-map`: the restructuring here — `.claude/settings.json` with the hook of one task in one session, the rule of the part `package`, `DEBT.md`, `docs/sources.md` — and the translation of `docs/` into English. Measured 2026-11-12. "Before" is the row of `skill-map` in measurements 1.9 spec; "after" is `just -f spec/justfile tokens-report --since 2026-11-12T20:30 --row`, from the start of the session of the restructuring, and the two windows do not overlap. The columns are those of measurements 1.9 spec.

| Project | Window, UTC | Sessions | Calls, main / subagents | Context of a call, k, main / subagents | Compactions | Cost at API prices |
|---|---|---|---|---|---|---|
| `-workspaces-skill-map` — before, measurements 1.9 spec | 2026-10-13T00:00 … 2026-11-12T14:27 | 6 | 1,313 / 402 | 329.5 / 81.4 | 1 | $162.58 |
| `-workspaces-skill-map` — after: the move to v0.16.3 and the translation | 2026-11-12T20:30 … 2026-11-12T22:12 | 2 | 198 / 237 | 177.0 / 88.1 | 0 | $25.21 |

- The context of a main call fell from 329.5 to 177.0 thousand, −46%; that of a subagent's call rose from 81.4 to 88.1.
- The windows differ in work: "before" holds the detailing, the first code and the moves to tags of epics E1–E3, to v0.9.9 and v0.15.0, and the raise of `playwright`; "after" holds the move to v0.16.3 with the restructuring, pull request #37, and the translation of 265 KB of Russian text by seven subagents — five translators and two blind readers —, which make most of its calls of subagents.
- With 198 main calls the row is below the 300 main calls from which spec's threshold takes a row as a reference, so it is not one: the reference of `skill-map` is its row after in measurements 1.9 spec.

## 2. The speed of CI

How long the checks of `skill-map` take on GitHub Actions, read by `gh run view <run> --json jobs` from the times each job and step started and completed. The model is measurements 3.1 spec, which measured `skill-map` 2026-11-15 on `.github` `v0.1.15`: CI 2.2–3.3 minutes, the longest job `TypeScript / lint` at 97 s, the image of the stage `toolchain` built in each job in 75–85 s.

### 2.1. Before and after the image from the cache

What the move to `.github` `v0.1.24` changed, whose jobs take the image of the stage `toolchain` from the cache of GitHub Actions by the sha256 of `.devcontainer/Dockerfile`. Measured 2026-11-16, on the runs of CI after a push to `main`; a run's time is from its creation to its last job's end.

| Run | Commit of `main` | `.github` | CI | `lint` | `test` | `licenses` | `vuln` | `docs-check-repo` | The image in a job |
|---|---|---|---|---|---|---|---|---|---|
| 43799443476 | `a28a9da` | `v0.1.15` | 273 s | 208 s | 200 s | 207 s | 200 s | 206 s | built |
| 43813288938 | `732ad79` | `v0.1.24` | 169 s | 67 s | 68 s | 63 s | 53 s | 75 s | from the cache: the restore 10–18 s, `docker load` 30–38 s |

- In the run on `v0.1.24`, the step `ci-lint` took 10 s, `ci-test` 13 s and `ci-vuln` 1 s: the rest of each job is the image, and the image is what the next release of `.github` and the stage `toolchain-core` still change, measured below.
- The release after that CI, run 43813588207, took 6 min 12 s from its creation, its job 5 min 25 s: the release still builds the whole stage `toolchain`, with the browsers.

### 2.2. Before and after `.github` v0.1.30

What the move to `.github` `v0.1.30` changed, without the stage `toolchain-core`, which came next. Measured 2026-11-16 as the measurement above is, on runs of CI of a pull request, before and after, and on its run of `main`; all four took the image from the cache, by the same hash of `.devcontainer/Dockerfile`. The run of a pull request also waits for runners, so its time from creation is less comparable than its jobs'.

| Run | Commit | `.github` | CI | `toolchain` | `lint` | `test` | `licenses` | `vuln` | `docs-check-repo` | The image in a job: restore + `docker load` |
|---|---|---|---|---|---|---|---|---|---|---|
| 43812285944 | `d8b5a5a`, pull request #51 | `v0.1.24` | 476 s | — | 60 s | 74 s | 70 s | 65 s | 73 s | 14–18 s + 30–36 s |
| 43813288938 | `732ad79`, `main` | `v0.1.24` | 169 s | — | 67 s | 68 s | 63 s | 53 s | 75 s | 10–19 s + 30–38 s |
| 43856964964 | `122db35`, pull request #52 | `v0.1.30` | 114 s | 14 s | 78 s | 67 s | 76 s | 82 s | 89 s | 10–20 s + 30–57 s |
| 43862869688 | `f3ec9d5`, pull request #52 | `v0.1.30` | 93 s | 8 s | 69 s | 66 s | 68 s | 66 s | 66 s | 11–18 s + 29–37 s |

- On a hit of the cache `v0.1.30` shortens no job: the restore and `docker load` are the same steps, and their spread, 30–57 s for `docker load` of one file, is the runners'. It lengthens the path of the checks of TypeScript instead: the job `toolchain`, 8–14 s, only looks the entry up, and the four checks start after it, 13–20 s after the run, where at `v0.1.24` nothing held them. On a hit, the usual case, the checks of TypeScript so end some 10–20 s later, not sooner; 93–114 s against 476 s is the queue of runners that pull request #51 waited in, not the release of `.github`.
- What `v0.1.30` gives is on a miss, which no run here had: two jobs build the image, "TypeScript / toolchain" for the four checks and "Documents / docs-check-repo" its own, not five, and the repository keeps one entry of the cache instead of two, which only a push to `main` saves (sources 3.6). The release signs its files eight at once, which saves little at the six files of a release of `skill-map`.
- The trial release of pull request #52, run 43856965051, did not finish: its step "Work out the version", which builds the whole stage `toolchain` from the network, spent 34 minutes in apt, and was cancelled. `snapshot.ubuntu.com` answered 503 — the index of the snapshot `20261021T000000Z` came at 275 kB/s, «Fetched 67.6 MB in 4min 6s», and of the packages 240 lines are «Ign:», about 5.6 s each. The trial of the next commit, run 43862869784, ran into the same outage, «Fetched 67.6 MB in 4min 16s (264 kB/s)» and 334 lines «Ign:», and ended at the job's 45 minutes. The shared `release.yml` takes no cache of the image, so an outage of the snapshot holds the release and nothing else; the stage `toolchain-core`, which came next, takes the release off apt.

### 2.3. Before and after the stage `toolchain-core`

What the move to `spec` v0.18.4 and `.github` v0.1.31 changed: the release builds the stage `toolchain-core`, "TypeScript / lint", "vuln" and "licenses" and "Documents / docs-check-repo" run in it, and apt of `toolchain` reads the snapshot alone. Measured 2026-11-16 as the measurements above are. "Before" is runs on `main` and of pull request #53, on `.github` `v0.1.24` and `v0.1.30`, whose release builds all of `toolchain` either way, and whose CI took the image from the cache; "after" is the two runs of pull request #54, which missed the cache, the Dockerfile being new and a pull request saving nothing, and built both stages.

| Run | Commit | `.github` | Cache | CI | `toolchain` | `lint` | `test` | `licenses` | `vuln` | `docs-check-repo` |
|---|---|---|---|---|---|---|---|---|---|---|
| 43888358632 | `e9f38bc`, `main` | `v0.1.30` | hit | 134 s | 5 s | 59 s | 91 s | 80 s | 76 s | 85 s |
| 43913863930 | `07dd416`, pull request #54 | `v0.1.31` | miss | 405 s | 231 s | 46 s | 97 s | 47 s | 38 s | 51 s, failed |
| 43915573838 | `6ac9613`, pull request #54 | `v0.1.31` | miss | 467 s | 278 s | 98 s | 99 s | 48 s | 43 s | 43 s |

| Release run | Commit | `.github` | Event | The run | "Work out the version" | "Build the files" | "Publish to npm" |
|---|---|---|---|---|---|---|---|
| 43813588207 | `732ad79`, `main` | `v0.1.24` | after CI | 372 s | 178 s | 4 s | 85 s |
| 43880186760 | `0e5d06b`, `main` | `v0.1.30` | after CI | 1,923 s | 1,557 s | 6 s | 323 s |
| 43888758134 | `e9f38bc`, `main` | `v0.1.30` | after CI | 1,165 s | 787 s | 7 s | 323 s |
| 43885679717 | `d88764a`, pull request #53 | `v0.1.30` | trial | 821 s | 797 s | 4 s | 0 s |
| 43913864034 | `07dd416`, pull request #54 | `v0.1.31` | trial | 101 s | 31 s | 4 s | 0 s |
| 43915573781 | `6ac9613`, pull request #54 | `v0.1.31` | trial | 46 s | 25 s | 6 s | 0 s |

- **The release.** "Work out the version" builds the image the release's recipes run in: before, all of `toolchain` with the browsers and apt, 178–1,557 s on either release of `.github`; after, `toolchain-core` alone, 25–31 s, with no apt. "Build the files" builds the same stage again from the runner's build cache, and the trial publishes nothing. A release on `main` after the merge so takes about 30 s plus the npm step, which waits for the registry (sources 3.5); it is not measured here.
- **The image on a miss.** In the first run "TypeScript / toolchain" built `toolchain` from the new Dockerfile in 125 s: the core, its `RUN` 17 s, then the browsers' three `COPY`, 4 s, and apt, 84 s — «Fetched 33.6 MB in 14s (2485 kB/s)» of indexes, from the snapshot alone, against 67.6 MB with `--snapshot` (measurements 3.1 spec), and «Fetched 203 MB in 55s» of packages; the core again from the build cache, 0.4 s. Its uploads took 40 s and 49 s for `toolchain`, 1,151,649,973 bytes, and 18 s and 22 s for the core, 489,188,588 bytes. "Documents / docs-check-repo" built the core itself, 21–24 s for its step "Toolchain image"; in the first run it then failed on a citation of the documents of that commit, which the next one fixed, so its 51 s is no time of a full check.
- **The checks in the core.** `vuln` and `licenses` loaded the core's 489 MB, 21–30 s for "Toolchain image", against 36–57 s for `toolchain` in `test` of the same runs and 30–58 s in the jobs of the run before; they are 32–38 s shorter than before, though their image came by an artifact and not from the cache. `lint` took 46 s and 98 s: the download of the artifact took 9 s in the first run and 61 s in the second, the runners' spread. A run as a whole was longer, 405–467 s, because of the miss: "TypeScript / toolchain" built and uploaded both stages before any check started. A run on a hit, with both entries saved after the merge on `main`, is not measured here.

## 3. The tests in three engines

What the element's tests do in WebKit and Firefox beside Chromium, the engines of the stage `toolchain`: Chrome Headless Shell of revision 1254, WebKit 2388 and Firefox 1572 under `PLAYWRIGHT_BROWSERS_PATH=/ms-playwright`. Measured 2026-11-17 in the devcontainer of this repository, 20 processors, by `vitest run --project '*(<engine>)'` of Vitest 5.1.0, once each project of the element had an instance per engine; a duration is Vitest's own, "Duration".

### 3.1. What failed in WebKit and Firefox, and the time

The tests of the element, ten files, 77 tests in each engine, the projects `browser` and `forced colors`: the failures as the tests were before the two fixes below, the durations after them.

| Engine | Failed before | Duration after |
|---|---|---|
| Chromium | 0 | 2.31 s |
| WebKit | 0 | 2.72 s |
| Firefox | 3 | 6.61 s |

- **WebKit** passes all of them, `forced colors` too: `matchMedia("(forced-colors: active)")` is true in a context with `forcedColors: "active"`.
- **Firefox, `lines.test.ts`.** `shadowRoot.elementFromPoint(left + 2, top + 2)` of the tile "Quarters" gave its `li`, not the button: the point is in the tile's corner, rounded by `border-radius: 0.5rem`, and Firefox does not hit the button there; `elementsFromPoint` there gave `LI`, `UL`, `SECTION.band`, `DIV.map`. The test now probes a line's end, 2 px under the tile's top edge, with the SVG made to take the pointer for the probe; with the SVG lifted over the tiles by `z-index` it fails in all three engines.
- **Firefox, `csp.test.ts`, both tests.** In a frame of `srcdoc` whose `<meta>` policy is `default-src 'self'; script-src 'self'; style-src 'self'`, the module of the fixture, from the page's own origin, did not run, and the test waited 10 s for its result; with `script-src 'self'` alone too. With the page's origin written out in place of `'self'`, or with no policy, it ran, and drew the map with no violation. Chromium and WebKit run it under `'self'`. In Firefox alone the test now writes the origin out, the same policy for a consumer's page served from that origin; Chromium and WebKit keep `'self'`.
- `ci-test`, Node and Chromium with the coverage, ran 185 tests in 3.23 s and `ci-engines`, WebKit and Firefox, 154 tests in 7.27 s; in CI they are two jobs side by side.
