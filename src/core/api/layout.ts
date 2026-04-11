import type { DomoAuth } from "../auth/index.js";
import type { DomoResult } from "./types.js";
import { ok, fail } from "./types.js";

export async function getLayoutStack(auth: DomoAuth, viewId: string): Promise<DomoResult> {
  const res = await auth.fetch(`/api/content/v3/stacks/${viewId}`);
  if (!res.ok) return fail(res);
  return ok(await res.json());
}

export async function lockLayout(auth: DomoAuth, layoutId: string): Promise<DomoResult> {
  const res = await auth.fetch(`/api/content/v4/pages/layouts/${layoutId}/writelock`, {
    method: "PUT",
    body: "{}",
  });
  if (!res.ok) return fail(res);
  return ok(await res.json());
}

export async function updateLayout(auth: DomoAuth, layoutId: string, body: unknown): Promise<DomoResult> {
  const res = await auth.fetch(`/api/content/v4/pages/layouts/${layoutId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json;charset=utf-8" },
    body: JSON.stringify(body),
  });
  if (!res.ok) return fail(res);
  return ok(await res.json());
}

export async function unlockLayout(auth: DomoAuth, layoutId: string): Promise<DomoResult> {
  const res = await auth.fetch(`/api/content/v4/pages/layouts/${layoutId}/writelock`, {
    method: "DELETE",
  });
  if (!res.ok) return fail(res);
  return ok({ success: true, message: "Lock released successfully." });
}
