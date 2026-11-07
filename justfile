# skill-map's own recipes: the package's build, and the four checks .github's typescript.yml runs in
# CI, one job each, in a new container of the toolchain stage of .devcontainer/Dockerfile — as the
# runner's user, with HOME=/tmp and with CI from the step's environment (R08 in docs/decisions.md).
# Only ci-licenses reads spec/: it runs spec's recipes licenses-check-repo and release-verify-npm,
# and the licenses job alone gets the submodule. The code and its tests read nothing of spec/, and
# the documents are checked by spec's own recipe, just -f spec/justfile docs-check-repo.

set shell := ["bash", "-euo", "pipefail", "-c"]

# The tools are the packages package-lock.json pins, run from where npm ci puts them: nothing is
# fetched on the fly.
bin := "node_modules/.bin"

# Run the four checks CI runs, before a pull request.
ci: ci-lint ci-test ci-vuln ci-licenses

# Fail on code Biome would format or flag, on a type error in any of the three programs — the
# DOM-free part sees neither the DOM nor Node, the element sees the DOM, and the scripts, the
# configuration and the tests see Node too (R08) — on icons and a NOTICE that are not what the set
# package-lock.json pins gives (R10), and on titles of anchor skills that are not what the pinned
# format file of spec's release gives (R09). That check downloads the file from the release, so the
# network has to be reachable.
ci-lint: _install
    {{ bin }}/biome ci
    {{ bin }}/tsc --noEmit -p tsconfig.core.json
    {{ bin }}/tsc --noEmit -p tsconfig.element.json
    {{ bin }}/tsc --noEmit -p tsconfig.node.json
    node scripts/icons.ts --check
    node scripts/taxonomy.ts --check

# Build the package, run the tests in Node and in Chromium with their coverage, which .github's
# TypeScript wrapper sends to Codecov from coverage/lcov.info, and check the package the way a
# consumer takes it: its files, and its declarations under a consumer's TypeScript (R09).
ci-test: build
    {{ bin }}/vitest run --coverage
    node scripts/package.ts
    node scripts/consumer.ts

# Fail on a published advisory, high or above, for a package the package ships with. Of the tools
# of development, Dependabot's alerts tell (R08). npm audit reads the lock file and asks the
# registry, so nothing is installed first.
ci-vuln:
    npm audit --omit=dev --audit-level=high

# The checks of package-lock.json. First, fail if a package of it, the tools of development too,
# carries a license that spec's list does not allow and is no exception that licenses.json names
# (R39 spec; R08). The list, the reading of SPDX expressions and the rule of an exception are
# spec's, at the tag spec/ is on: an exception off the list holds only for a package the lock file
# marks dev, and covers the builds for each platform it names in optionalDependencies while they
# are dev too and under the same license. That reads the lock file, licenses.json and spec/ at its
# tag, and installs nothing. Then, fail unless each package of @altnovatrail in the lock file is the
# signed file of its release: spec's release-verify-npm checks the archive at the lock file's
# resolved address against the release's bundle, by Sigstore's trust root, and the lock file's
# integrity against the verified bytes (R77 spec). RULES.md asks it of each pull request that
# changes the lock file; here it runs on every one, inside a check main requires. It installs
# spec/tools from spec's lock file and reads Sigstore, the registry and GitHub: when one of them
# cannot be read, the package is refused. So spec/ has to be checked out, and the network
# reachable. spec's recipes run under this same just.
ci-licenses:
    {{ quote(just_executable()) }} -f spec/justfile licenses-check-repo package-lock.json licenses.json
    {{ quote(just_executable()) }} -f spec/justfile release-verify-npm package-lock.json

# Build the package into lib/: JavaScript and its declarations. lib/ is emptied first, so that no
# file of an older build ships.
build: _install
    rm -rf lib
    {{ bin }}/tsc -p tsconfig.build.json

# Write the English titles of the anchor skills, src/element/anchor-titles.ts, anew from the format
# file of the release of spec that scripts/taxonomy.ts names: after a move to a new tag of spec
# (R09). The recipe downloads the file and its bundle into node_modules/.taxonomy, the folder the
# script names, and removes it after; the script verifies them by spec's release-verify, so spec/ has to be checked out, and
# pins the file's sha256, which ci-lint holds it to from then on.
taxonomy:
    #!/usr/bin/env bash
    set -euo pipefail
    folder=node_modules/.taxonomy
    rm -rf "$folder"
    mkdir -p "$folder"
    trap 'rm -rf "$folder"' EXIT
    urls="$(node scripts/taxonomy.ts --urls)"
    for url in $urls; do
        curl --fail --silent --show-error --location --output "$folder/${url##*/}" "$url"
    done
    JUST={{ quote(just_executable()) }} node scripts/taxonomy.ts --write

# Write the icons of the map's states, marks and holdings, src/element/icons.ts, and NOTICE anew from
# the set of Material Symbols that package-lock.json pins: after a new version of the set, or a new
# icon in scripts/icons.ts's table (R10). Nothing goes to the network.
icons: _install
    node scripts/icons.ts

# Serve the page to try the map on by hand — with a mouse, the keyboard or a screen reader — on
# Vite's dev server at 127.0.0.1:5173, which VS Code forwards to a browser outside the container
# (R12; RUN.md, T16). It serves the page, the element's sources and the packages they import, and
# nothing else of the repository, and builds nothing. At its start it downloads the graphs of the
# modules of the pinned index and the vectors of tiers of spec's format file, held to their pinned
# digests in memory, so the network has to be reachable.
demo: _install
    {{ bin }}/vite --config demo/vite.config.ts

# Build the same page into demo/dist, the graphs inside it, for a tablet: any server of files
# serves the folder, and it needs no network. It never ships and is never released.
demo-build: _install
    {{ bin }}/vite build --config demo/vite.config.ts

# Verify the module index of the release of modules that scripts/demo-data.ts names by spec's
# release-verify, and pin its sha256 in demo/release.ts, which the demo holds the index to from
# then on: after a move to a new release of modules. The recipe downloads the index and its bundle
# into node_modules/.demo-pin, the folder the script names, and removes it after.
demo-pin: _install
    #!/usr/bin/env bash
    set -euo pipefail
    folder=node_modules/.demo-pin
    rm -rf "$folder"
    mkdir -p "$folder"
    trap 'rm -rf "$folder"' EXIT
    urls="$(node scripts/demo-data.ts --urls)"
    for url in $urls; do
        curl --fail --silent --show-error --location --output "$folder/${url##*/}" "$url"
    done
    JUST={{ quote(just_executable()) }} node scripts/demo-data.ts --pin

# Format and fix the code in place, the way ci-lint checks it.
fmt: _install
    {{ bin }}/biome check --write

# Install the packages from package-lock.json, again whenever package.json or the lock file changes:
# the stamp holds their hashes, as spec's _tools does. In CI each job starts from a fresh checkout,
# so it always installs. Package scripts never run: .npmrc sets ignore-scripts, and the flag says it
# again.
[private]
_install:
    #!/usr/bin/env bash
    set -euo pipefail
    stamp=node_modules/.installed-from
    wanted="$(sha256sum package.json package-lock.json)"
    if [[ ! -f "$stamp" || "$(cat "$stamp")" != "$wanted" ]]; then
        npm ci --ignore-scripts --no-audit --no-fund
        printf '%s\n' "$wanted" > "$stamp"
    fi
