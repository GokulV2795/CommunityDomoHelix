import type { DomoAuth } from "../auth/index.js";
import type { DomoResult } from "./types.js";
import { ok, fail } from "./types.js";

export async function runCodeEngine(
  auth: DomoAuth,
  packageAlias: string,
  functionName: string,
  params: unknown = {}
): Promise<DomoResult> {
  const res = await auth.fetch(
    `/api/codeengine/v2/packages/${packageAlias}/functions/${functionName}`,
    { method: "POST", body: JSON.stringify(params) }
  );
  if (!res.ok) return fail(res);
  return ok(await res.json());
}
