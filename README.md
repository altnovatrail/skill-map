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

The NovaTrail skill map: a UI package that draws a module's skill graph — its skills in tiers, linked by their prerequisites — and the learner model's state over it: what is mastered, what opens next and what each skill builds on. It fetches nothing, computes no mastery and chooses no task: when the learner picks a skill on the map, the engine chooses what comes next.

A component of [NovaTrail](https://github.com/altnovatrail/spec), a universal open platform for adaptive learning, interactive lessons and AI tutoring. Its card is section 3.3 of spec's [architecture](https://github.com/altnovatrail/spec/blob/main/docs/architecture.md), and its links are these:

- **api** prepares the data it draws: the skill graph and its tiers, and the learner model's state of each skill, which learner-model computes inside api;
- **app** takes that data from api, hands it to the map and builds the package in as the web component `<novatrail-skill-map>`, from npm under `@altnovatrail`; site later gets a build of its own;
- **spec** holds the module format and the contracts whose types the map reads.

Its own documents, its decisions and its plan are in [docs/](docs/README.md).
