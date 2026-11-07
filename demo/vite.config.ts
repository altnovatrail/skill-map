// The server of the page to try the map on by hand, just demo, and its build for a tablet, just
// demo-build (RUN.md, T16; R12 in docs/decisions.md): Vite, on the loopback of this machine alone,
// as canvas's demo. It serves the page, the element's sources and the packages they import, and
// nothing else of the repository: without a list of its own Vite serves the whole workspace. The
// graphs of the modules and of spec's vectors come in as the module virtual:demo-graphs, loaded at
// the start and held to their pinned digests in memory by scripts/demo-data.ts: a digest that does
// not hold, or no network, stops the server and the build with the reason. The build goes to
// demo/dist, with relative paths, so that any server of files serves it; it never ships.

import { fileURLToPath } from "node:url";
import { defineConfig, type Plugin } from "vite";
import { type DemoGraph, loadGraphs } from "../scripts/demo-data.ts";

/** A folder of the repository, by its path from this file's. */
const folder = (path: string) => fileURLToPath(new URL(path, import.meta.url));

const ID = "virtual:demo-graphs";

/** The graphs of the demo as a module of their own, loaded once, at the start. */
function graphs(): Plugin {
  let loaded: Promise<DemoGraph[]> | undefined;
  return {
    name: "demo-graphs",
    async buildStart() {
      loaded ??= loadGraphs();
      await loaded;
    },
    resolveId: (id) => (id === ID ? `\0${ID}` : undefined),
    async load(id) {
      if (id !== `\0${ID}`) return undefined;
      loaded ??= loadGraphs();
      return `export default ${JSON.stringify(await loaded)};`;
    },
  };
}

export default defineConfig({
  root: folder("."),
  base: "./",
  plugins: [graphs()],
  server: {
    host: "127.0.0.1",
    port: 5173,
    strictPort: true,
    fs: { strict: true, allow: [folder("."), folder("../src"), folder("../node_modules")] },
  },
  build: { outDir: folder("dist"), emptyOutDir: true },
});
