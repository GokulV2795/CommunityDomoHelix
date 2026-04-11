import type { Command } from "commander";
import type { DomoAuth } from "../../core/auth/index.js";
import { runCodeEngine } from "../../core/api/index.js";
import { outputResult } from "../output.js";

export function registerCodeEngineCommands(program: Command, auth: DomoAuth): void {
  const codeEngine = program.command("code-engine").description("Code Engine operations");

  codeEngine.command("run <packageAlias> <functionName>")
    .description("Invoke a Code Engine function")
    .option("--params <json>", "JSON parameters to pass to the function", "{}")
    .action(async (packageAlias: string, functionName: string, opts) => {
      outputResult(await runCodeEngine(auth, packageAlias, functionName, JSON.parse(opts.params)));
    });
}
