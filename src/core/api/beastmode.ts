import type { DomoAuth } from "../auth/index.js";
import type { DomoResult } from "./types.js";
import { ok, fail } from "./types.js";

const TYPE_MAP: Record<string, string> = {
  STRING: "string", LONG: "numeric", DOUBLE: "numeric", DECIMAL: "numeric",
  DATE: "date", DATETIME: "datetime",
};

export async function validateBeastmode(
  auth: DomoAuth,
  opts: { expression: string; name: string; datasourceId: string }
): Promise<DomoResult> {
  // Step 1: Fetch dataset schema
  const schemaRes = await auth.fetch(`/api/data/v3/datasources/${opts.datasourceId}/schema`);
  if (!schemaRes.ok) return fail(schemaRes);
  const schemaData = (await schemaRes.json()) as { schemaContract?: { schema?: { columns?: Array<{ name: string; type: string }> } } };
  const rawColumns = schemaData.schemaContract?.schema?.columns ?? [];

  const columns = rawColumns.map((col) => ({
    id: col.name, name: col.name,
    type: TYPE_MAP[col.type] ?? col.type?.toLowerCase() ?? "string",
    isCalculation: false, isAggregatable: true, isEncrypted: false,
    hidden: false, order: 0, sourceId: opts.datasourceId, isControlled: false, label: col.name,
  }));

  // Step 2: Fetch current user
  const meRes = await auth.fetch("/api/content/v2/users/me");
  const me = (await meRes.json()) as { id?: number; userId?: number; displayName?: string };

  // Step 3: Validate
  const res = await auth.fetch("/api/query/v1/functions/validateFormulas", {
    method: "POST",
    body: JSON.stringify({
      dataSourceId: opts.datasourceId,
      columns,
      formulas: {
        validate_target: {
          id: "validate_target", name: opts.name, formula: opts.expression,
          status: "valid", dataType: "STRING", persistedOnDataSource: false,
          isAggregatable: true, bignumber: false,
          owner: { id: String(me.id ?? me.userId), name: me.displayName ?? "", type: "USER", group: false },
          nonAggregatedColumns: [], legacyId: 0, variable: false,
          referenceCount: 0, usedByOtherCards: false, formulaDependencies: [],
        },
      },
    }),
  });
  if (!res.ok) return fail(res);
  return ok(await res.json());
}

export async function createBeastmode(
  auth: DomoAuth,
  opts: { expression: string; name: string; datasourceId: string; dataType?: string }
): Promise<DomoResult> {
  // Step 1: Fetch current user for owner field
  const meRes = await auth.fetch("/api/content/v2/users/me");
  const me = (await meRes.json()) as { id?: number; userId?: number };

  // Step 2: Create
  const res = await auth.fetch("/api/query/v1/functions/template?strict=false", {
    method: "POST",
    body: JSON.stringify({
      expression: opts.expression,
      id: 0,
      name: opts.name,
      owner: Number(me.id ?? me.userId),
      status: "VALID",
      persistedOnDataSource: true,
      locked: false,
      dataType: opts.dataType ?? "DOUBLE",
      containsAggregation: opts.expression.match(/SUM|AVG|COUNT|MIN|MAX|MEDIAN/i) !== null,
      links: [{ resource: { id: opts.datasourceId, type: "DATA_SOURCE" }, visible: true }],
    }),
  });
  if (!res.ok) return fail(res);
  return ok(await res.json());
}
