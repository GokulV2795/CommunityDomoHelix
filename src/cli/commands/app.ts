import type { Command } from "commander";
import type { DomoAuth } from "../../core/auth/index.js";
import { listApps, createApp, getApp, updateApp, addAppView, updateAppNavigation } from "../../core/api/index.js";
import { outputResult } from "../output.js";
import { resolveJsonInput } from "../json-input.js";

export function registerAppCommands(program: Command, auth: DomoAuth): void {
  const app = program.command("app").description("App Studio operations");

  app.command("list")
    .description("List App Studio apps in the Domo instance")
    .option("--limit <n>", "Max results (default 50)", "50")
    .action(async (opts) => { outputResult(await listApps(auth, { limit: Number(opts.limit) })); });

  app.command("create")
    .description("Create a new App Studio app")
    .requiredOption("--title <title>", "App title")
    .option("--description <text>", "App description", "")
    .action(async (opts) => { outputResult(await createApp(auth, { title: opts.title, description: opts.description })); });

  app.command("get <dataAppId>")
    .description("Get the full structure of an App Studio app")
    .action(async (dataAppId: string) => { outputResult(await getApp(auth, dataAppId)); });

  app.command("update <dataAppId>")
    .description("Update an App Studio app (full replacement — GET first)")
    .option("--body <json>", "Full app object JSON")
    .option("--body-file <path>", "Path to app JSON file")
    .action(async (dataAppId: string, opts) => {
      outputResult(await updateApp(auth, dataAppId, resolveJsonInput(opts.body, opts.bodyFile)));
    });

  app.command("add-view <dataAppId>")
    .description("Add a new view (page) to an App Studio app")
    .requiredOption("--title <title>", "View/page title")
    .action(async (dataAppId: string, opts) => { outputResult(await addAppView(auth, dataAppId, opts.title)); });

  app.command("navigation-update <dataAppId>")
    .description("Update App Studio app navigation (must send FULL array — GET first)")
    .option("--navigation <json>", "Full navigation array JSON")
    .option("--navigation-file <path>", "Path to navigation JSON file")
    .action(async (dataAppId: string, opts) => {
      outputResult(await updateAppNavigation(auth, dataAppId, resolveJsonInput(opts.navigation, opts.navigationFile)));
    });
}
