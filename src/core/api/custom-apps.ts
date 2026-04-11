import type { DomoAuth } from "../auth/index.js";
import type { DomoResult } from "./types.js";
import { ok, fail } from "./types.js";

export async function listCustomApps(
  auth: DomoAuth,
  opts: { limit?: number; offset?: number } = {}
): Promise<DomoResult> {
  const res = await auth.fetch(
    `/api/content/v1/custom-apps?limit=${opts.limit ?? 50}&offset=${opts.offset ?? 0}`
  );
  if (!res.ok) return fail(res);
  return ok(await res.json());
}
