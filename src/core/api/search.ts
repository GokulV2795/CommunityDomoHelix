import type { DomoAuth } from "../auth/index.js";
import type { DomoResult } from "./types.js";
import { ok, fail } from "./types.js";

export async function search(
  auth: DomoAuth,
  query: string,
  opts: { entities?: string[]; limit?: number } = {}
): Promise<DomoResult> {
  const entities = opts.entities ?? ["CARD", "PAGE", "DATASET"];
  const params = new URLSearchParams({ q: query, limit: String(opts.limit ?? 20) });
  for (const e of entities) params.append("entity", e);
  const res = await auth.fetch(`/api/search/v1/query?${params}`);
  if (!res.ok) return fail(res);
  return ok(await res.json());
}
