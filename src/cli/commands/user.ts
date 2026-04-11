import type { Command } from "commander";
import type { DomoAuth } from "../../core/auth/index.js";
import { listUsers, getUser } from "../../core/api/index.js";
import { outputResult } from "../output.js";

export function registerUserCommands(program: Command, auth: DomoAuth): void {
  const user = program.command("user").description("User operations");

  user.command("list")
    .description("List users in the Domo instance")
    .option("--limit <n>", "Max results (default 50)", "50")
    .option("--offset <n>", "Pagination offset", "0")
    .action(async (opts) => { outputResult(await listUsers(auth, { limit: Number(opts.limit), offset: Number(opts.offset) })); });

  user.command("get <userId>")
    .description("Get details for a specific user")
    .action(async (userId: string) => { outputResult(await getUser(auth, userId)); });
}
