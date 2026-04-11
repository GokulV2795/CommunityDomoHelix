import type { DomoResult } from "../core/api/types.js";

/**
 * Convert a DomoResult to MCP tool response format.
 */
export function toMcpResponse(result: DomoResult): { content: Array<{ type: "text"; text: string }> } {
  if (!result.ok) {
    return { content: [{ type: "text", text: `Error ${result.status}: ${result.message}` }] };
  }
  return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }] };
}
