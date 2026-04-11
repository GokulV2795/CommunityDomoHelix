import type { Command } from "commander";
import type { DomoAuth } from "../../core/auth/index.js";
import { listPdpPolicies } from "../../core/api/index.js";
import { outputResult } from "../output.js";

export function registerPdpCommands(program: Command, auth: DomoAuth): void {
  const pdp = program.command("pdp").description("Personalized Data Permissions operations");

  pdp.command("list <datasetId>")
    .description("List PDP policies for a dataset")
    .action(async (datasetId: string) => { outputResult(await listPdpPolicies(auth, datasetId)); });
}
