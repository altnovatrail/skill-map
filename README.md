# skill-map

[![CI](https://github.com/altnovatrail/skill-map/actions/workflows/ci.yml/badge.svg)](https://github.com/altnovatrail/skill-map/actions/workflows/ci.yml)
[![Release](https://github.com/altnovatrail/skill-map/actions/workflows/release.yml/badge.svg)](https://github.com/altnovatrail/skill-map/actions/workflows/release.yml)
[![CodeQL](https://github.com/altnovatrail/skill-map/actions/workflows/codeql.yml/badge.svg)](https://github.com/altnovatrail/skill-map/actions/workflows/codeql.yml)
[![Latest release](https://img.shields.io/github/v/release/altnovatrail/skill-map)](https://github.com/altnovatrail/skill-map/releases/latest)
[![TypeScript version](https://img.shields.io/github/package-json/dependency-version/altnovatrail/skill-map/dev/typescript)](package.json)
[![Coverage](https://codecov.io/gh/altnovatrail/skill-map/branch/main/graph/badge.svg)](https://codecov.io/gh/altnovatrail/skill-map)
[![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/altnovatrail/skill-map/badge)](https://scorecard.dev/viewer/?uri=github.com/altnovatrail/skill-map)
[![License](https://img.shields.io/github/license/altnovatrail/skill-map)](LICENSE)

[![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=altnovatrail_skill-map&metric=code_smells)](https://sonarcloud.io/summary/new_code?id=altnovatrail_skill-map)
[![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=altnovatrail_skill-map&metric=reliability_rating)](https://sonarcloud.io/summary/new_code?id=altnovatrail_skill-map)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=altnovatrail_skill-map&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=altnovatrail_skill-map)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=altnovatrail_skill-map&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=altnovatrail_skill-map)
[![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=altnovatrail_skill-map&metric=vulnerabilities)](https://sonarcloud.io/summary/new_code?id=altnovatrail_skill-map)

The NovaTrail skill map: a UI package that draws a module's skill graph — its skills in tiers, linked by their prerequisites — and the learner model's state over it: what is mastered, what opens next and what each skill builds on. It draws from data that api has prepared and app hands it: it fetches nothing, computes no mastery and chooses no task, and when the learner picks a skill on the map, the engine chooses what comes next. It goes into app as a web component, built in at an exact version from npm, under `@altnovatrail`, and later site gets a build of its own.

A component of [NovaTrail](https://github.com/altnovatrail/spec/tree/v0.15.0), a universal open platform for adaptive learning, interactive lessons and AI tutoring. It belongs to stage 2, First slice with learners, with tutor, canvas, api, app and infra.

## Status

Detailing done. The first epic of the plan, now in [docs/plan/E1.md](docs/plan/E1.md), decided what the component's card left open, and section 3 of [docs/architecture.md](docs/architecture.md) describes the package. The first code, epic E2, now in [docs/plan/E2.md](docs/plan/E2.md), built the element `<novatrail-skill-map>` of the package `@altnovatrail/skill-map` — its tree, its words in English and Russian, its icons, its look and the lines of an expanded skill — with its tools, CI and demo page, and its first releases, in npm from v0.1.0. Epic E3 moved it to spec v0.9.8, and later moves to v0.9.9 and v0.15.0. Inside the devcontainer, `just ci` runs the four checks CI runs — lint and types, the tests in Node and in Chromium with their coverage, advisories and licenses. `just release-files v0.1.0` writes the files a release would hold into `dist/` — the package's archive at that version, checked as a consumer takes it, `LICENSE` and `SHA256SUMS` — and a release comes out by itself after CI passes on `main`, when a path it is built from has changed: the package's archive, with its NOTICE, LICENSE and their sums, built, signed and checked by .github's shared release. The same archive goes to npm: the first version, v0.1.0, by hand, and the later ones by the release's own npm step, through trusted publishing, with no long-lived token. A pull request from a branch of this repository tries the release and publishes nothing.

To try the map by hand, `just demo` serves a page at http://127.0.0.1:5173, which VS Code forwards to a browser outside the container. It draws the tests' example, a graph of eight tiers, the modules of the first slice and spec's vectors of tiers, with switches for the view, the language, the state, the theme and the width. For a tablet, `just demo-build` writes the same page into `demo/dist/`, with the graphs inside it, and any server of files on your network serves that folder — for one, `python3 -m http.server -d demo/dist` on your computer. A browser loads no modules from `file://`.

## Theme and accessibility

The map holds the standard of NovaTrail's packages of the interface: WCAG 2.2 AA, with targets of 44 by 44 CSS pixels and no motion triggered by interaction, as R90 spec decides. A consumer fits it to its theme by three custom properties, which the element's shadow tree inherits; their defaults are light:

| Property | What | Default |
|---|---|---|
| `--novatrail-skill-map-paper` | the ground of the map, its tiles and the details | `#fff` |
| `--novatrail-skill-map-ink` | text, frames and icons | `#111` |
| `--novatrail-skill-map-accent` | the expanded tile, the frames of the tiles linked to it and of the details, the button that chooses a skill, the ring of the focus | `#1d4ed8` |

The contrast of a theme the consumer sets is the consumer's to check. With forced colours the system's colours stand in for the theme. The map's own words are in English and Russian, by the element's attribute `lang`, and English for any other language. What the package does not meet yet is declared in section 3.8 of [docs/architecture.md](docs/architecture.md): nothing so far. The icons are Material Symbols, by Google, under the Apache License 2.0, as [NOTICE](NOTICE) says.

## Install

The app takes the package from npm at an exact version, and the packages of spec whose types the element's contract is in — the module format's `@altnovatrail/spec`, at the version the package has in its `dependencies`, and the contracts' `@altnovatrail/contracts`, the app's own, at the same version:

```sh
npm install --save-exact @altnovatrail/skill-map@<version>
npm install --save-exact --save-dev @altnovatrail/spec@<its version>
```

A pull request that changes the lock file has spec's recipe check it, as NovaTrail's rules ask of every package of `@altnovatrail`: `just -f spec/justfile release-verify-npm package-lock.json`, from a checkout of spec at a tag. It takes the archive from the registry only if it is the same bytes as the file of skill-map's release, signed by .github's shared release at the call of skill-map's `release.yml` on `main`.

## Documents

The documents are in Russian.

- [docs/architecture.md](docs/architecture.md) — the component: what it does and does not do, its data and links, what was left to decide and is now decided or deferred on purpose, and how the package is built.
- [docs/decisions.md](docs/decisions.md) — the decision log: what was decided, why, and what was rejected.
- [RUN.md](RUN.md) — the work plan, in epics.

The working rules, for people and coding agents alike, are in [CLAUDE.md](CLAUDE.md) and [AGENTS.md](AGENTS.md). The platform's shared vocabulary, formats, contracts and decisions are in [spec](https://github.com/altnovatrail/spec/tree/v0.15.0), checked out here as a git submodule at `v0.15.0`: clone this repository with `git clone --recurse-submodules`.

## License

[Apache-2.0](LICENSE).
