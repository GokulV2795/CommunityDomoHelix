import type { DomoAuth } from "../auth/index.js";
import type { DomoResult } from "./types.js";
import { ok, fail } from "./types.js";

export async function queryAppdb(
  auth: DomoAuth,
  collectionName: string,
  query: unknown = {}
): Promise<DomoResult> {
  const res = await auth.fetch(
    `/api/datastores/v1/collections/${collectionName}/documents/query`,
    { method: "POST", body: JSON.stringify(query) }
  );
  if (!res.ok) return fail(res);
  return ok(await res.json());
}
