import type { DomoAuth } from "../auth/index.js";
import type { DomoResult } from "./types.js";
import { ok, fail } from "./types.js";

export async function listCustomApps(
  auth: DomoAuth,
  opts: { limit?: number; offset?: number } = {}
): Promise<DomoResult> {
  const res = await auth.fetch(
    "/api/apps/v1/designs?deleted=false&checkAdminAuthority=false"
  );

  if (!res.ok) return fail(res);

  const data: unknown = await res.json();

  if (Array.isArray(data)) {
    const offset = Math.max(0, Math.floor(opts.offset ?? 0));
    const limit = Math.max(0, Math.floor(opts.limit ?? 50));
    return ok(data.slice(offset, offset + limit));
  }

  return ok(data);
}
