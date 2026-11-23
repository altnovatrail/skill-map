---
paths:
  - "src/**"
  - "scripts/**"
  - "demo/**"
  - "/package.json"
  - "/package-lock.json"
  - "/tsconfig*.json"
  - "/vitest.config.ts"
  - "/biome.json"
  - "/licenses.json"
  - "/.npmrc"
  - "/.sonarcloud.properties"
  - "/justfile"
  - "/NOTICE"
  - ".github/**"
  - ".devcontainer/**"
---

# The package `@altnovatrail/skill-map`

The code is the package `@altnovatrail/skill-map` in the root: the element `<novatrail-skill-map>` in `src/element/`, its core without the DOM in `src/core/`, the scripts of the build and of the checks in `scripts/`, and the page to try the map by hand in `demo/`. How it is built is in [docs/architecture.md](../../docs/architecture.md), and why in the decision log, [docs/decisions.md](../../docs/decisions.md). `just --list` names every recipe.

- **The checks.** `just ci` runs the five checks CI runs, each a job of `.github`'s shared `typescript.yml` in a stage of `.devcontainer/Dockerfile` — `ci-test` and `ci-engines` in `toolchain`, with the browsers, the other three, which start no browser, in `toolchain-core`, without them: `ci-lint` — Biome, the types of the three programs, and the icons and the titles of the anchor skills against what their pins give; `ci-test` — the build, the tests in Node and in Chromium with their coverage, and the package as a consumer takes it; `ci-engines` — the element's tests in WebKit and Firefox, without the coverage; `ci-vuln` — the advisories of what the package ships with; `ci-licenses` — the licenses of the lock file by spec's `licenses-check-repo`, with the exceptions of `licenses.json`, and each package of `@altnovatrail` by `release-verify-npm`. `ci-lint`, `ci-vuln` and `ci-licenses` need the network, and `ci-licenses` needs `spec/`. A task that touches this part ends with `just ci` green.
- **Tests.** Code comes with its tests, and the merge waits for `codecov/patch`, at least 90% of the changed lines covered.
- **Versions.** Exact, and a third-party one at least three days old when it is installed, transitive ones too; the packages of `@altnovatrail` are the version of the tag of `spec/`, without the pause. `playwright` is the version of the Chrome Headless Shell of the `toolchain` stage, and a raise of one raises the other in the same pull request.
- **Generated files.** After a raise of the icon set — only by a row of COORDINATION.md of spec, with `canvas` and `app`, since Dependabot ignores it —, `just icons` writes `src/element/icons.ts` and `NOTICE` anew; after a move to a new tag of spec, `just taxonomy` writes `src/element/anchor-titles.ts` from that release's format file. Neither is edited by hand.
- **The demo.** `just demo` serves the page, `just demo-build` writes it for a tablet, and `just demo-pin` pins the index of a release of `modules`. It never ships.
- **The release.** `just release-files <version>` writes into `dist/` what a release holds. A release comes out by itself once CI passes on `main` and a path it is built from has changed, and the same archive goes to npm by trusted publishing.
