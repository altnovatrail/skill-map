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

The code is the package `@altnovatrail/skill-map` in the root: the element `<novatrail-skill-map>` in `src/element/`, its core without the DOM in `src/core/`, the scripts of the build and of the checks in `scripts/`, and the page to try the map by hand in `demo/`. How it is built is sections 3.3, 3.4, 3.7 and 3.8 of [docs/architecture.md](../../docs/architecture.md); why, R08–R13 and R17 of the decision log. `just --list` names every recipe.

- **The checks.** `just ci` runs the four checks CI runs, each a job of `.github`'s shared `typescript.yml` in the `toolchain` stage of `.devcontainer/Dockerfile` (R08): `ci-lint` — Biome, the types of the three programs, and the icons and the titles of the anchor skills against what their pins give; `ci-test` — the build, the tests in Node and in Chromium with their coverage, and the package as a consumer takes it; `ci-vuln` — the advisories of what the package ships with; `ci-licenses` — the licenses of the lock file by spec's `licenses-check-repo`, with the exceptions of `licenses.json`, and each package of `@altnovatrail` by `release-verify-npm`. `ci-lint`, `ci-vuln` and `ci-licenses` need the network, and `ci-licenses` needs `spec/`. A task that touches this part ends with `just ci` green.
- **Tests.** Code comes with its tests, and the merge waits for `codecov/patch`, at least 90% of the changed lines covered (R48 spec).
- **Versions.** Exact, and a third-party one at least three days old when it is installed, transitive ones too; the packages of `@altnovatrail` are the version of the tag of `spec/`, without the pause (R08). `playwright` is the version of the Chrome Headless Shell of the `toolchain` stage, and a raise of one raises the other in the same pull request (R17; R79 spec).
- **Generated files.** After a raise of the icon set, `just icons` writes `src/element/icons.ts` and `NOTICE` anew (R10); after a move to a new tag of spec, `just taxonomy` writes `src/element/anchor-titles.ts` from that release's format file (R09). Neither is edited by hand.
- **The demo.** `just demo` serves the page, `just demo-build` writes it for a tablet, and `just demo-pin` pins the index of a release of `modules` (R12). It never ships.
- **The release.** `just release-files <version>` writes into `dist/` what a release holds. A release comes out by itself once CI passes on `main` and a path it is built from has changed, and the same archive goes to npm by trusted publishing (R13).
