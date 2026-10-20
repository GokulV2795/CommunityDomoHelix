import type { DomoAuth } from "../auth/index.js";
import type { DomoResult } from "./types.js";
import { ok, fail } from "./types.js";

export async function listApps(auth: DomoAuth, opts: { limit?: number } = {}): Promise<DomoResult> {
  const res = await auth.fetch(`/api/content/v1/dataapps?limit=${opts.limit ?? 50}`);
  if (!res.ok) return fail(res);
  return ok(await res.json());
}

/**
 * List App Studio apps with only the fields needed for discovery.
 * The API may ignore its limit parameter, so enforce the limit locally.
 */
export async function listAppSummaries(
  auth: DomoAuth,
  opts: { limit?: number } = {}
): Promise<DomoResult> {
  const result = await listApps(auth, opts);
  if (!result.ok) return result;

  if (!Array.isArray(result.data)) return ok(result.data);

  const limit = Math.max(0, Math.floor(opts.limit ?? 50));

  return ok(
    result.data.slice(0, limit).map((item: Record<string, unknown>) => ({
      dataAppId: item.dataAppId,
      title: item.title,
      description: item.description,
      created: item.created,
      lastUpdated: item.lastUpdated,
      enabled: item.enabled,
      canEdit: item.canEdit,
    }))
  );
}

export async function createApp(
  auth: DomoAuth,
  opts: { title: string; description?: string }
): Promise<DomoResult> {
  const res = await auth.fetch("/api/content/v1/dataapps", {
    method: "POST",
    body: JSON.stringify({ title: opts.title, description: opts.description ?? "" }),
  });
  if (!res.ok) return fail(res);
  return ok(await res.json());
}

export async function getApp(auth: DomoAuth, dataAppId: string): Promise<DomoResult> {
  const res = await auth.fetch(`/api/content/v1/dataapps/${dataAppId}?includeHiddenViews=true`);
  if (!res.ok) return fail(res);
  return ok(await res.json());
}

export async function updateApp(auth: DomoAuth, dataAppId: string, body: unknown): Promise<DomoResult> {
  const res = await auth.fetch(`/api/content/v1/dataapps/${dataAppId}?includeHiddenViews=true`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
  if (!res.ok) return fail(res);
  return ok(await res.json());
}

export async function addAppView(
  auth: DomoAuth,
  dataAppId: string,
  title: string
): Promise<DomoResult> {
  // Fetch current user for ownership
  const meRes = await auth.fetch("/api/content/v2/users/me");
  const me = (await meRes.json()) as { id?: number; userId?: number };
  const userId = me.id ?? me.userId;

  const res = await auth.fetch(`/api/content/v1/dataapps/${dataAppId}/views`, {
    method: "POST",
    body: JSON.stringify({
      owners: [{ id: userId, type: "USER", displayName: null }],
      type: "dataappview",
      title,
      pageName: title,
      locked: false,
      mobileEnabled: true,
      sharedViewPage: true,
      virtualPage: false,
    }),
  });
  if (!res.ok) return fail(res);
  return ok(await res.json());
}

export async function updateAppNavigation(
  auth: DomoAuth,
  dataAppId: string,
  navigation: unknown
): Promise<DomoResult> {
  const res = await auth.fetch(`/api/content/v1/dataapps/${dataAppId}/navigation/reorder`, {
    method: "PUT",
    body: JSON.stringify(navigation),
  });
  if (!res.ok) return fail(res);
  return ok(await res.json());
}
