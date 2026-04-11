import type { Command } from "commander";
import type { DomoAuth } from "../../core/auth/index.js";
import { listDatasets, getDataset, getDatasetSchema, queryDataset, createDataset, uploadDataset, createDatasetWithData, search } from "../../core/api/index.js";
import { outputResult } from "../output.js";
import { resolveTextInput } from "../json-input.js";

export function registerDatasetCommands(program: Command, auth: DomoAuth): void {
  const dataset = program.command("dataset").description("Dataset operations");

  dataset.command("list")
    .description("List datasets in the Domo instance")
    .option("--limit <n>", "Max datasets to return (default 50, max 50)", "50")
    .option("--offset <n>", "Pagination offset", "0")
    .option("--name-contains <text>", "Filter by name substring")
    .action(async (opts) => {
      outputResult(await listDatasets(auth, { limit: Number(opts.limit), offset: Number(opts.offset), nameContains: opts.nameContains }));
    });

  dataset.command("get <datasetId>")
    .description("Get dataset metadata: schema, row count, owner, last updated")
    .action(async (datasetId: string) => { outputResult(await getDataset(auth, datasetId)); });

  dataset.command("schema <datasetId>")
    .description("Get the full column schema for a dataset")
    .action(async (datasetId: string) => { outputResult(await getDatasetSchema(auth, datasetId)); });

  dataset.command("query <datasetId> <sql>")
    .description("Run a SQL query against a dataset (use 'table' as the table name)")
    .action(async (datasetId: string, sql: string) => { outputResult(await queryDataset(auth, datasetId, sql)); });

  dataset.command("create")
    .description("Create a new empty dataset with a specified schema")
    .requiredOption("--name <name>", "Dataset name")
    .option("--description <text>", "Dataset description")
    .requiredOption("--columns <json>", "JSON array of column defs")
    .action(async (opts) => {
      outputResult(await createDataset(auth, { name: opts.name, columns: JSON.parse(opts.columns), description: opts.description }));
    });

  dataset.command("upload <datasetId>")
    .description("Upload CSV data into an existing dataset")
    .option("--csv-data <csv>", "CSV string with header row and data rows")
    .option("--csv-file <path>", "Path to a CSV file")
    .option("--update-method <method>", "REPLACE (default) or APPEND", "REPLACE")
    .action(async (datasetId: string, opts) => {
      const csvData = resolveTextInput(opts.csvData, opts.csvFile);
      outputResult(await uploadDataset(auth, datasetId, csvData, opts.updateMethod));
    });

  dataset.command("create-with-data")
    .description("Create a new dataset AND populate it with CSV data in one operation")
    .requiredOption("--name <name>", "Dataset name")
    .option("--description <text>", "Dataset description")
    .requiredOption("--columns <json>", "JSON array of column defs")
    .option("--csv-data <csv>", "CSV string with header row and data rows")
    .option("--csv-file <path>", "Path to a CSV file")
    .action(async (opts) => {
      const csvData = resolveTextInput(opts.csvData, opts.csvFile);
      outputResult(await createDatasetWithData(auth, { name: opts.name, columns: JSON.parse(opts.columns), csvData, description: opts.description }));
    });

  // Search is top-level but grouped here with data
  program.command("search <query>")
    .description("Search across Domo for datasets, cards, pages, and other entities")
    .option("--entities <types>", "Comma-separated entity types: CARD, PAGE, DATASET", "CARD,PAGE,DATASET")
    .option("--limit <n>", "Max results (default 20)", "20")
    .action(async (query: string, opts) => {
      const entities = opts.entities.split(",").map((e: string) => e.trim());
      outputResult(await search(auth, query, { entities, limit: Number(opts.limit) }));
    });
}
