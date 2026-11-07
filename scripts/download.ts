// A file of a release, downloaded into memory, for the scripts that hold it to a pinned digest
// (R09, R12 in docs/decisions.md). A run of CI meets a failure of the network now and then — a
// connection refused, a reset, a server's error — and a check main requires should not fail for one:
// such a failure is tried again, a few times, after a pause that grows. An answer that will not
// change, such as 404, is not. The error names what failed, the cause of a failed fetch too, which
// fetch itself hides behind "fetch failed".

/** How a download is tried: the tests give their own fetch and pause. */
export interface Tries {
  readonly attempts: number;
  /** The pause before the second attempt, in milliseconds; each next one is twice as long. */
  readonly wait: number;
  readonly get: (url: string) => Promise<Response>;
  readonly pause: (milliseconds: number) => Promise<void>;
}

const TRIES: Tries = {
  attempts: 3,
  wait: 2000,
  get: (url) => fetch(url),
  pause: (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds)),
};

/** What a failed fetch says, with its cause: "fetch failed (ECONNRESET)". */
export function described(error: unknown): string {
  if (!(error instanceof Error)) return String(error);
  const cause = error.cause as { code?: unknown; message?: unknown } | undefined;
  const why = cause?.code ?? cause?.message;
  return typeof why === "string" ? `${error.message} (${why})` : error.message;
}

/** An answer worth asking again: the server's error, or too many requests. */
const passing = (status: number) => status >= 500 || status === 429;

/** The bytes at a URL, tried again on a failure that may pass. */
export async function download(url: string, tries: Partial<Tries> = {}): Promise<Uint8Array> {
  const { attempts, wait, get, pause } = { ...TRIES, ...tries };
  let failure = "";
  for (let attempt = 1; attempt <= attempts; attempt++) {
    if (attempt > 1) await pause(wait * 2 ** (attempt - 2));
    let response: Response;
    try {
      response = await get(url);
    } catch (error) {
      failure = described(error);
      continue;
    }
    if (response.ok) return new Uint8Array(await response.arrayBuffer());
    failure = `HTTP ${response.status}`;
    if (!passing(response.status)) throw new Error(`${url}: ${failure}`);
  }
  throw new Error(`${url}: ${failure}, after ${attempts} attempts`);
}
