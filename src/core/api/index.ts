/**
 * Domo API — consolidation point.
 *
 * Every Domo platform operation is exported from this module.
 * Both CLI commands and MCP tools are thin wrappers around these functions.
 *
 * To add a new operation:
 *   1. Add the function to the appropriate domain file (e.g., datasets.ts)
 *   2. Re-export it here
 *   3. Add a CLI wrapper in cli/commands/
 *   4. Add an MCP wrapper in mcp/tools/
 */

// Result type
export { type DomoResult, ok, fail } from "./types.js";

// Data
export { listDatasets, getDataset, getDatasetSchema, queryDataset, createDataset, uploadDataset, createDatasetWithData } from "./datasets.js";
export { search } from "./search.js";

// Magic ETL
export { listEtls, getEtl, createEtl, updateEtl, runEtl, getEtlExecutionStatus } from "./etl.js";

// Cards & BeastModes
export { listCards, getCardDetails, getCardData, createCard, updateCard } from "./cards.js";
export { validateBeastmode, createBeastmode } from "./beastmode.js";

// App Studio
export { listApps, listAppSummaries, createApp, getApp, updateApp, addAppView, updateAppNavigation } from "./apps.js";
export { getLayoutStack, lockLayout, updateLayout, unlockLayout } from "./layout.js";
export { listPages } from "./pages.js";

// Admin
export { listUsers, getUser, whoami } from "./users.js";
export { listGroups } from "./groups.js";
export { listPdpPolicies } from "./pdp.js";

// Custom App Platform
export { listCustomApps } from "./custom-apps.js";
export { queryAppdb } from "./appdb.js";
export { runCodeEngine } from "./code-engine.js";
