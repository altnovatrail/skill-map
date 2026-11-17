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

A component of [NovaTrail](https://github.com/altnovatrail/spec), a universal open platform for adaptive learning, interactive lessons and AI tutoring. It belongs to stage 2, First slice with learners, with tutor, canvas, api, app and infra.

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

Importing `@altnovatrail/skill-map` registers the element `<novatrail-skill-map>`. Beside it, `@altnovatrail/skill-map/states` gives the rule the map draws its states by as one function, `skillStates(graph, skillMap, now)`, for a view that shows them without the map, as the app's module card does; importing it registers nothing. Section 3.3 of [docs/architecture.md](docs/architecture.md) describes both.

A pull request that changes the lock file has spec's recipe check it, as NovaTrail's rules ask of every package of `@altnovatrail`: `just -f spec/justfile release-verify-npm package-lock.json`, from a checkout of spec at a tag. It takes the archive from the registry only if it is the same bytes as the file of skill-map's release, signed by .github's shared release at the call of skill-map's `release.yml` on `main`.

## Documents

- [docs/architecture.md](docs/architecture.md) — the component: what it does and does not do, its data and links, what was left to decide and is now decided or deferred on purpose, and how the package is built.
- [docs/decisions.md](docs/decisions.md) — the decision log: what was decided, why, and what was rejected.
- [docs/sources.md](docs/sources.md) — the external facts the documents rest on, each with its source, the date it was read and a quote.
- [docs/measurements.md](docs/measurements.md) — the results of measurements: what the Claude Code sessions of the repository spend.
- [RUN.md](RUN.md) — the work plan, in epics.
- `run/` — the plan's other tables: [the epics for later](run/EPICS.md), [the open questions](run/QUESTIONS.md), [the technical debt](run/DEBT.md) and [the tasks outside an epic](run/TASKS.md).

The working rules, for people and coding agents alike, are in [CLAUDE.md](CLAUDE.md) and [AGENTS.md](AGENTS.md). The platform's shared vocabulary, formats, contracts and decisions are in [spec](https://github.com/altnovatrail/spec), checked out here as a git submodule: clone this repository with `git clone --recurse-submodules`.
