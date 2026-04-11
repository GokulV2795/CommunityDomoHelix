import type { Command } from "commander";
import type { DomoAuth } from "../../core/auth/index.js";
import { getLayoutStack, lockLayout, updateLayout, unlockLayout } from "../../core/api/index.js";
import { outputResult } from "../output.js";
import { resolveJsonInput } from "../json-input.js";

export function registerLayoutCommands(program: Command, auth: DomoAuth): void {
  const layout = program.command("layout").description("Page layout operations");

  layout.command("stack <viewId>")
    .description("Get full page structure: layout grid, card placements, display settings")
    .action(async (viewId: string) => { outputResult(await getLayoutStack(auth, viewId)); });

  layout.command("lock <layoutId>")
    .description("Acquire write lock on a page layout (required before any layout update)")
    .action(async (layoutId: string) => { outputResult(await lockLayout(auth, layoutId)); });

  layout.command("update <layoutId>")
    .description("Update a page layout (must lock first, unlock after)")
    .option("--body <json>", "Full layout object JSON")
    .option("--body-file <path>", "Path to layout JSON file")
    .action(async (layoutId: string, opts) => {
      outputResult(await updateLayout(auth, layoutId, resolveJsonInput(opts.body, opts.bodyFile)));
    });

  layout.command("unlock <layoutId>")
    .description("Release write lock on a page layout")
    .action(async (layoutId: string) => { outputResult(await unlockLayout(auth, layoutId)); });
}
