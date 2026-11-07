import { expect, test } from "vitest";

interface Result {
  readonly violations: readonly string[];
  readonly display: string;
  readonly sheets: number;
  readonly inline: number;
  readonly lines: number;
}

/** A frame under a strict consumer's policy: styles and scripts from its own origin alone. */
async function strictFrame(): Promise<{ frame: HTMLIFrameElement; result: Result }> {
  const fixture = new URL("./csp.fixture.ts", import.meta.url).href;
  const frame = document.createElement("iframe");
  frame.srcdoc = `<!doctype html><html><head>
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self'">
<script type="module" src="${fixture}"></script></head><body></body></html>`;
  document.body.append(frame);
  const window = () => frame.contentWindow as (Window & { cspResult?: Result }) | null;
  await expect.poll(() => window()?.cspResult, { timeout: 10_000 }).toBeDefined();
  return { frame, result: window()?.cspResult as Result };
}

test("under a policy without 'unsafe-inline' the map is styled, its lines drawn, and nothing is refused", async () => {
  const { frame, result } = await strictFrame();
  try {
    expect(result).toEqual({ violations: [], display: "flex", sheets: 1, inline: 0, lines: 2 });
  } finally {
    frame.remove();
  }
});

test("the policy holds in that frame: an attribute style is refused", async () => {
  const { frame } = await strictFrame();
  try {
    const document = frame.contentDocument as Document;
    const refused = new Promise<string>((resolve) => {
      document.addEventListener("securitypolicyviolation", (event) =>
        resolve(event.violatedDirective),
      );
    });
    const element = document.querySelector("novatrail-skill-map") as HTMLElement;
    element.shadowRoot?.querySelector("ul")?.setAttribute("style", "display: block");
    expect(await refused).toBe("style-src-attr");
  } finally {
    frame.remove();
  }
});
