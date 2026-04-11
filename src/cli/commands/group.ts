import type { Command } from "commander";
import type { DomoAuth } from "../../core/auth/index.js";
import { listGroups } from "../../core/api/index.js";
import { outputResult } from "../output.js";

export function registerGroupCommands(program: Command, auth: DomoAuth): void {
  const group = program.command("group").description("Group operations");

  group.command("list")
    .description("List groups in the Domo instance")
    .option("--limit <n>", "Max results (default 50)", "50")
    .option("--offset <n>", "Pagination offset", "0")
    .action(async (opts) => { outputResult(await listGroups(auth, { limit: Number(opts.limit), offset: Number(opts.offset) })); });
}
