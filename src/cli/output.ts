import type { DomoResult } from "../core/api/types.js";

/**
 * Output a DomoResult to stdout/stderr.
 * Success → JSON to stdout. Failure → error JSON to stderr + exit(1).
 */
export function outputResult(result: DomoResult): void {
  if (!result.ok) {
    console.error(JSON.stringify({ error: true, status: result.status, message: result.message }, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify(result.data, null, 2));
}
