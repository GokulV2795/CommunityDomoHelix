import type { Command } from "commander";
import type { DomoAuth } from "../../core/auth/index.js";
import { listCards, getCardDetails, getCardData, createCard, updateCard } from "../../core/api/index.js";
import { outputResult } from "../output.js";
import { resolveJsonInput } from "../json-input.js";

export function registerCardCommands(program: Command, auth: DomoAuth): void {
  const card = program.command("card").description("Native card operations");

  card.command("list <pageId>")
    .description("List all cards on a page (works for App Studio views and classic pages)")
    .action(async (pageId: string) => { outputResult(await listCards(auth, pageId)); });

  card.command("get-details <cardId>")
    .description("Get a card's column definitions, dataset binding, and BeastMode references")
    .action(async (cardId: string) => { outputResult(await getCardDetails(auth, cardId)); });

  card.command("get-data <cardId>")
    .description("Get a card's rendered data with chart role mappings and row data")
    .action(async (cardId: string) => { outputResult(await getCardData(auth, cardId)); });

  card.command("create <pageId>")
    .description("Create a native Domo card on a page. Use viewId as pageId for App Studio.")
    .option("--body <json>", "Full card body JSON")
    .option("--body-file <path>", "Path to card body JSON file")
    .action(async (pageId: string, opts) => {
      outputResult(await createCard(auth, pageId, resolveJsonInput(opts.body, opts.bodyFile)));
    });

  card.command("update <cardId>")
    .description("Update an existing card's definition (full replacement — GET first)")
    .option("--body <json>", "Full updated card body JSON")
    .option("--body-file <path>", "Path to card body JSON file")
    .action(async (cardId: string, opts) => {
      outputResult(await updateCard(auth, cardId, resolveJsonInput(opts.body, opts.bodyFile)));
    });
}
