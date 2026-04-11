import type { Command } from "commander";
import type { DomoAuth } from "../../core/auth/index.js";
import { listEtls, getEtl, createEtl, updateEtl, runEtl, getEtlExecutionStatus } from "../../core/api/index.js";
import { outputResult } from "../output.js";
import { resolveJsonInput } from "../json-input.js";

export function registerEtlCommands(program: Command, auth: DomoAuth): void {
  const etl = program.command("etl").description("Magic ETL dataflow operations");

  etl.command("list")
    .description("List Magic ETL dataflows")
    .option("--limit <n>", "Max results (default 50)", "50")
    .option("--offset <n>", "Pagination offset", "0")
    .action(async (opts) => { outputResult(await listEtls(auth, { limit: Number(opts.limit), offset: Number(opts.offset) })); });

  etl.command("get <dataflowId>")
    .description("Get the full definition of a Magic ETL dataflow")
    .action(async (dataflowId: string) => { outputResult(await getEtl(auth, dataflowId)); });

  etl.command("create")
    .description("Create a Magic ETL dataflow (databaseType forced to MAGIC)")
    .option("--definition <json>", "Full dataflow JSON definition")
    .option("--definition-file <path>", "Path to dataflow JSON file")
    .action(async (opts) => {
      const body = resolveJsonInput(opts.definition, opts.definitionFile) as Record<string, unknown>;
      outputResult(await createEtl(auth, body));
    });

  etl.command("update <dataflowId>")
    .description("Update an existing Magic ETL dataflow (PUT replaces entire definition)")
    .option("--definition <json>", "Full updated dataflow JSON definition")
    .option("--definition-file <path>", "Path to dataflow JSON file")
    .action(async (dataflowId: string, opts) => {
      outputResult(await updateEtl(auth, dataflowId, resolveJsonInput(opts.definition, opts.definitionFile)));
    });

  etl.command("run <dataflowId>")
    .description("Trigger a Magic ETL dataflow execution")
    .action(async (dataflowId: string) => { outputResult(await runEtl(auth, dataflowId)); });

  etl.command("execution-status <dataflowId> <executionId>")
    .description("Check the status of a Magic ETL execution")
    .action(async (dataflowId: string, executionId: string) => { outputResult(await getEtlExecutionStatus(auth, dataflowId, executionId)); });
}
