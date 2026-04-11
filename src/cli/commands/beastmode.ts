import type { Command } from "commander";
import type { DomoAuth } from "../../core/auth/index.js";
import { validateBeastmode, createBeastmode } from "../../core/api/index.js";
import { outputResult } from "../output.js";

export function registerBeastmodeCommands(program: Command, auth: DomoAuth): void {
  const beastmode = program.command("beastmode").description("BeastMode calculated field operations");

  beastmode.command("validate")
    .description("Validate a BeastMode formula before creating it")
    .requiredOption("--expression <expr>", "The BeastMode expression")
    .requiredOption("--name <name>", "Display name for the calculated field")
    .requiredOption("--datasource-id <id>", "The dataset UUID to validate against")
    .action(async (opts) => {
      outputResult(await validateBeastmode(auth, { expression: opts.expression, name: opts.name, datasourceId: opts.datasourceId }));
    });

  beastmode.command("create")
    .description("Create a BeastMode calculated field on a dataset")
    .requiredOption("--expression <expr>", "The BeastMode expression")
    .requiredOption("--name <name>", "Display name for the calculated field")
    .requiredOption("--datasource-id <id>", "The dataset UUID")
    .option("--data-type <type>", "Result data type: LONG, DOUBLE, DECIMAL, STRING, DATE, DATETIME", "DOUBLE")
    .action(async (opts) => {
      outputResult(await createBeastmode(auth, { expression: opts.expression, name: opts.name, datasourceId: opts.datasourceId, dataType: opts.dataType }));
    });
}
