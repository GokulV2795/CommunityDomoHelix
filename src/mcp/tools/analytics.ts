import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { DomoAuth } from "../../core/auth/index.js";
import { listCards, getCardDetails, getCardData, createCard, updateCard, validateBeastmode, createBeastmode, listApps, listAppSummaries, createApp, getApp, updateApp, addAppView, updateAppNavigation, getLayoutStack, lockLayout, updateLayout, unlockLayout, listPages } from "../../core/api/index.js";
import { toMcpResponse } from "../output.js";

export function registerAnalyticsTools(server: McpServer, auth: DomoAuth): void {
  // â”€â”€ Cards â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  server.tool(
    "domo_page_cards",
    "List all cards on a page (works for App Studio views and classic pages). For App Studio apps, the viewId doubles as a pageId.",
    { pageId: z.string().describe("The page/view ID") },
    async ({ pageId }) => toMcpResponse(await listCards(auth, pageId))
  );

  server.tool(
    "domo_card_get_details",
    "Get a card's column definitions, dataset binding, and BeastMode references.",
    { cardId: z.string().describe("The card ID") },
    async ({ cardId }) => toMcpResponse(await getCardDetails(auth, cardId))
  );

  server.tool(
    "domo_card_get_data",
    "Get a card's rendered data including chart role mappings and actual row data.",
    { cardId: z.string().describe("The card ID") },
    async ({ cardId }) => toMcpResponse(await getCardData(auth, cardId))
  );

  server.tool(
    "domo_card_create",
    "Create a native Domo card on a page. ALWAYS prefer native cards before custom apps. For App Studio use viewId as pageId.",
    { pageId: z.string().describe("The page/view ID"), body: z.string().describe("Full card body JSON") },
    async ({ pageId, body }) => toMcpResponse(await createCard(auth, pageId, JSON.parse(body)))
  );

  server.tool(
    "domo_card_update",
    "Update an existing card's definition (full replacement â€” GET first).",
    { cardId: z.string().describe("The card ID"), body: z.string().describe("Full updated card body JSON") },
    async ({ cardId, body }) => toMcpResponse(await updateCard(auth, cardId, JSON.parse(body)))
  );

  // â”€â”€ BeastMode â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  server.tool(
    "domo_beastmode_validate",
    "Validate a BeastMode formula before creating it. Fetches schema and user context automatically.",
    { expression: z.string().describe("The BeastMode expression"), name: z.string().describe("Display name"), datasourceId: z.string().describe("The dataset UUID") },
    async (args) => toMcpResponse(await validateBeastmode(auth, args))
  );

  server.tool(
    "domo_beastmode_create",
    "Create a BeastMode calculated field on a dataset. Persists on the dataset for reuse across cards.",
    { expression: z.string().describe("The BeastMode expression"), name: z.string().describe("Display name"), datasourceId: z.string().describe("The dataset UUID"), dataType: z.string().optional().describe("Result data type: LONG, DOUBLE, DECIMAL, STRING, DATE, DATETIME") },
    async (args) => toMcpResponse(await createBeastmode(auth, args))
  );

  // â”€â”€ App Studio â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  server.tool(
    "domo_app_list",
    "List App Studio apps with concise metadata. Use domo_app_get for full details.",
    { limit: z.number().int().min(0).max(200).optional().describe("Maximum results (default 50)") },
    async ({ limit }) => toMcpResponse(await listAppSummaries(auth, { limit }))
  );

  server.tool(
    "domo_app_create",
    "Create a new App Studio app (returns dataAppId and landingViewId).",
    { title: z.string().describe("App title"), description: z.string().optional().describe("App description") },
    async (args) => toMcpResponse(await createApp(auth, args))
  );

  server.tool(
    "domo_app_get",
    "Get the full structure of an App Studio app including views, navigation, and theme.",
    { dataAppId: z.string().describe("The app ID") },
    async ({ dataAppId }) => toMcpResponse(await getApp(auth, dataAppId))
  );

  server.tool(
    "domo_app_update",
    "Update an App Studio app (full replacement â€” GET first, partial updates cause 400).",
    { dataAppId: z.string().describe("The app ID"), body: z.string().describe("Full app object JSON") },
    async ({ dataAppId, body }) => toMcpResponse(await updateApp(auth, dataAppId, JSON.parse(body)))
  );

  server.tool(
    "domo_app_add_view",
    "Add a new view (page) to an App Studio app. Auto-fetches current user for ownership.",
    { dataAppId: z.string().describe("The app ID"), title: z.string().describe("View/page title") },
    async ({ dataAppId, title }) => toMcpResponse(await addAppView(auth, dataAppId, title))
  );

  server.tool(
    "domo_app_navigation_update",
    "Update App Studio app navigation (must send FULL array â€” GET first).",
    { dataAppId: z.string().describe("The app ID"), navigation: z.string().describe("Full navigation array JSON") },
    async ({ dataAppId, navigation }) => toMcpResponse(await updateAppNavigation(auth, dataAppId, JSON.parse(navigation)))
  );

  // â”€â”€ Layout â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  server.tool(
    "domo_stack_get",
    "Get full page structure: layout grid, card placements, display settings.",
    { viewId: z.string().describe("The view/page ID") },
    async ({ viewId }) => toMcpResponse(await getLayoutStack(auth, viewId))
  );

  server.tool(
    "domo_layout_lock",
    "Acquire write lock on a page layout (required before any layout update).",
    { layoutId: z.string().describe("The layout ID") },
    async ({ layoutId }) => toMcpResponse(await lockLayout(auth, layoutId))
  );

  server.tool(
    "domo_layout_update",
    "Update a page layout (must lock first, unlock after). Every contentKey must appear in both templates.",
    { layoutId: z.string().describe("The layout ID"), body: z.string().describe("Full layout object JSON") },
    async ({ layoutId, body }) => toMcpResponse(await updateLayout(auth, layoutId, JSON.parse(body)))
  );

  server.tool(
    "domo_layout_unlock",
    "Release write lock on a page layout.",
    { layoutId: z.string().describe("The layout ID") },
    async ({ layoutId }) => toMcpResponse(await unlockLayout(auth, layoutId))
  );

  // â”€â”€ Pages (legacy) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  server.tool(
    "domo_page_list",
    "List classic Domo pages (for App Studio apps, use domo_app_list instead).",
    { limit: z.number().optional().describe("Max results (default 50)"), offset: z.number().optional().describe("Pagination offset") },
    async (args) => toMcpResponse(await listPages(auth, args))
  );
}
