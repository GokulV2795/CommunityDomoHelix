import type { Command } from "commander";
import type { DomoAuth } from "../../core/auth/index.js";
import { queryAppdb } from "../../core/api/index.js";
import { outputResult } from "../output.js";

export function registerAppdbCommands(program: Command, auth: DomoAuth): void {
  const appdb = program.command("appdb").description("AppDB document database operations");

  appdb.command("query <collectionName>")
    .description("Query an AppDB collection")
    .option("--query <json>", "JSON query filter", "{}")
    .action(async (collectionName: string, opts) => {
      outputResult(await queryAppdb(auth, collectionName, JSON.parse(opts.query)));
    });
}
