import type { Command } from "commander";
import type { DomoAuth } from "../../core/auth/index.js";
import { whoami } from "../../core/api/index.js";
import { outputResult } from "../output.js";

export function registerWhoamiCommand(program: Command, auth: DomoAuth): void {
  program.command("whoami")
    .description("Get the currently authenticated user's information")
    .action(async () => { outputResult(await whoami(auth)); });
}
