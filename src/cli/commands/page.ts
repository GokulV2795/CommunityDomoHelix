import type { Command } from "commander";
import type { DomoAuth } from "../../core/auth/index.js";
import { listPages } from "../../core/api/index.js";
import { outputResult } from "../output.js";

export function registerPageCommands(program: Command, auth: DomoAuth): void {
  const page = program.command("page").description("Classic Domo page operations (legacy)");

  page.command("list")
    .description("List classic Domo pages (for App Studio apps, use 'app list' instead)")
    .option("--limit <n>", "Max results (default 50)", "50")
    .option("--offset <n>", "Pagination offset", "0")
    .action(async (opts) => { outputResult(await listPages(auth, { limit: Number(opts.limit), offset: Number(opts.offset) })); });
}
