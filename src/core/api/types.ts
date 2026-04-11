/**
 * Unified result type for all Domo API operations.
 * Both CLI and MCP interfaces consume this uniformly.
 */
export type DomoResult<T = unknown> =
  | { ok: true; data: T }
  | { ok: false; status: number; message: string };

/**
 * Helper to create a success result.
 */
export function ok<T>(data: T): DomoResult<T> {
  return { ok: true, data };
}

/**
 * Helper to create an error result from a fetch Response.
 */
export async function fail(res: Response): Promise<DomoResult<never>> {
  return { ok: false, status: res.status, message: await res.text().catch(() => "") };
}
