import type { DomoAuth } from "../auth/index.js";
import type { DomoResult } from "./types.js";
import { ok, fail } from "./types.js";

export async function listUsers(
  auth: DomoAuth,
  opts: { limit?: number; offset?: number } = {}
): Promise<DomoResult> {
  const res = await auth.fetch(
    `/api/content/v2/users?limit=${opts.limit ?? 50}&offset=${opts.offset ?? 0}`
  );
  if (!res.ok) return fail(res);
  return ok(await res.json());
}

export async function getUser(auth: DomoAuth, userId: string): Promise<DomoResult> {
  const res = await auth.fetch(`/api/content/v2/users/${userId}`);
  if (!res.ok) return fail(res);
  return ok(await res.json());
}

export async function whoami(auth: DomoAuth): Promise<DomoResult> {
  const res = await auth.fetch("/api/content/v2/users/me");
  if (!res.ok) return fail(res);
  return ok(await res.json());
}
