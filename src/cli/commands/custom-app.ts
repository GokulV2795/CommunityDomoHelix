import type { Command } from "commander";
import type { DomoAuth } from "../../core/auth/index.js";
import { listCustomApps } from "../../core/api/index.js";
import { outputResult } from "../output.js";

export function registerCustomAppCommands(program: Command, auth: DomoAuth): void {
  const customApp = program.command("custom-app").description("Custom app platform operations");

  customApp.command("list")
    .description("List published custom apps")
    .option("--limit <n>", "Max results (default 50)", "50")
    .option("--offset <n>", "Pagination offset", "0")
    .action(async (opts) => { outputResult(await listCustomApps(auth, { limit: Number(opts.limit), offset: Number(opts.offset) })); });
}
