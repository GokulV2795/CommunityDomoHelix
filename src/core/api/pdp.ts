import type { DomoAuth } from "../auth/index.js";
import type { DomoResult } from "./types.js";
import { ok, fail } from "./types.js";

export async function listPdpPolicies(auth: DomoAuth, datasetId: string): Promise<DomoResult> {
  const res = await auth.fetch(`/api/data/v1/datasources/${datasetId}/pdp/policies`);
  if (!res.ok) return fail(res);
  return ok(await res.json());
}
