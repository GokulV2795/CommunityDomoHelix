# Helix — Domo Platform Tools for AI Coding Agents

A native-first toolkit that gives AI coding agents full control of the [Domo](https://www.domo.com) BI platform. Build analytics experiences end-to-end — from raw data to polished App Studio dashboards — via **CLI commands** or **MCP tools**.

**Compatible with:** [Claude Code](https://docs.anthropic.com/en/docs/claude-code), [Snowflake Cortex Code CLI](https://docs.snowflake.com/en/user-guide/cortex-code/cortex-code-cli), and any AI agent with Bash or MCP support.

---

## Two Modes, One Codebase

| | CLI (`domo-helix`) | MCP (`domo-helix-mcp`) |
|---|---|---|
| **Context cost** | ~2K tokens once (AGENTS.md cached) | ~6-12K tokens/message (tool schemas) |
| **Invocation** | Bash command | MCP tool call (JSON-RPC) |
| **Process model** | One process per command | Long-running server (stdio) |
| **Session caching** | File-based (~/.cache/domo-cli/) | In-memory (process lifetime) |
| **Discovery** | AGENTS.md + `--help` | Auto (tool schemas in context) |
| **Best for** | Lower context cost, any agent | Richer tool schemas, structured I/O |

**Use one, not both.** Enabling both simultaneously doubles context cost with no benefit.

---

## Agent Compatibility

| Agent | CLI Mode | MCP Mode |
|-------|----------|----------|
| Claude Code | AGENTS.md + Bash tool | MCP config in claude_desktop_config.json |
| Cortex Code CLI | AGENTS.md + Bash tool | MCP config in ~/.snowflake/cortex/mcp.json |
| Other agents | AGENTS.md + Bash | MCP stdio transport |

---

## Quick Start

```bash
git clone https://github.com/BFullenkampDomo/CommunityDomoHelix.git
cd CommunityDomoHelix
npm install && npm run build
npm link   # makes 'domo-helix' and 'domo-helix-mcp' available globally
```

**Prerequisites:**
- Node.js 18+
- An active `domo login` session (via [Ryuu CLI](https://www.npmjs.com/package/ryuu)) **or** `DOMO_INSTANCE` + `DOMO_TOKEN` environment variables

**Verify (CLI mode):**

```bash
domo-helix whoami
```

**Verify (MCP mode):** Add to your MCP config:

```json
{ "mcpServers": { "domo": { "command": "domo-helix-mcp" } } }
```

---

## Authentication

Helix resolves credentials automatically in this order:

| Priority | Source | How |
|----------|--------|-----|
| 1 | CLI flags | `--instance` + `--token` on any command |
| 2 | Environment | `DOMO_INSTANCE` + `DOMO_TOKEN` env vars |
| 3 | Ryuu CLI | Reads `~/.config/configstore/ryuu/{instance}.json` from your last `domo login` |
| 4 | Auto-detect | Picks the most recently used instance if multiple logins exist |

**Session caching:** SIDs are cached to `~/.cache/domo-cli/session.json` with a 55-minute TTL.

---

## Architecture

```
AI Coding Agent (Claude Code, Cortex Code, etc.)
     |
     +-- CLI mode: Bash tool → domo-helix commands
     |
     +-- MCP mode: MCP protocol → domo-helix-mcp tools
     |
  Shared Core (src/core/)
     |
  +--+----+
  |       |
Auth    API (consolidation point)
  |       |
  |  +----+--------+-----------+-----------+
  |  | Data        | Analytics |  Admin    | Custom App
  |  | datasets    | cards     | users     | appdb
  |  | etl         | beastmode | groups    | code engine
  |  | search      | app studio| pdp       |
  |  |             | layout    |           |
  |  +----+--------+-----------+-----------+
  |       |
  +--+----+
     |
  Domo REST APIs
```

All business logic lives in `src/core/api/`. CLI and MCP are thin wrappers.

---

## Commands (CLI) / Tools (MCP)

### Data Layer

| CLI Command | MCP Tool | Description |
|-------------|----------|-------------|
| `domo-helix dataset list` | `domo_dataset_list` | Search datasets by name |
| `domo-helix dataset get <id>` | `domo_dataset_get` | Full metadata |
| `domo-helix dataset schema <id>` | `domo_dataset_schema` | Column names and types |
| `domo-helix dataset query <id> <sql>` | `domo_dataset_query` | Run SQL (`FROM table`) |
| `domo-helix dataset create` | `domo_dataset_create` | Create empty dataset |
| `domo-helix dataset upload <id>` | `domo_dataset_upload` | Upload CSV data |
| `domo-helix dataset create-with-data` | `domo_dataset_create_with_data` | Create + populate |
| `domo-helix search <query>` | `domo_search` | Cross-entity search |

### Magic ETL

| CLI Command | MCP Tool | Description |
|-------------|----------|-------------|
| `domo-helix etl list` | `domo_etl_list` | List dataflows |
| `domo-helix etl get <id>` | `domo_etl_get` | Full definition |
| `domo-helix etl create` | `domo_etl_create` | Create dataflow |
| `domo-helix etl update <id>` | `domo_etl_update` | Update (full replacement) |
| `domo-helix etl run <id>` | `domo_etl_run` | Trigger execution |
| `domo-helix etl execution-status` | `domo_etl_execution_status` | Poll status |

### Analytics

| CLI Command | MCP Tool | Description |
|-------------|----------|-------------|
| `domo-helix card list <pageId>` | `domo_page_cards` | Cards on a page |
| `domo-helix card get-details <id>` | `domo_card_get_details` | Card schema |
| `domo-helix card get-data <id>` | `domo_card_get_data` | Rendered data |
| `domo-helix card create <pageId>` | `domo_card_create` | Create card |
| `domo-helix card update <id>` | `domo_card_update` | Update card |
| `domo-helix beastmode validate` | `domo_beastmode_validate` | Validate formula |
| `domo-helix beastmode create` | `domo_beastmode_create` | Create BeastMode |
| `domo-helix app list` | `domo_app_list` | List apps |
| `domo-helix app create` | `domo_app_create` | Create app |
| `domo-helix app get <id>` | `domo_app_get` | App structure |
| `domo-helix app update <id>` | `domo_app_update` | Update app |
| `domo-helix app add-view <id>` | `domo_app_add_view` | Add view |
| `domo-helix app navigation-update` | `domo_app_navigation_update` | Update nav |
| `domo-helix layout stack <id>` | `domo_stack_get` | Layout grid |
| `domo-helix layout lock <id>` | `domo_layout_lock` | Acquire lock |
| `domo-helix layout update <id>` | `domo_layout_update` | Update layout |
| `domo-helix layout unlock <id>` | `domo_layout_unlock` | Release lock |
| `domo-helix page list` | `domo_page_list` | Classic pages |

### Administration

| CLI Command | MCP Tool | Description |
|-------------|----------|-------------|
| `domo-helix user list` | `domo_user_list` | List users |
| `domo-helix user get <id>` | `domo_user_get` | User details |
| `domo-helix group list` | `domo_group_list` | List groups |
| `domo-helix pdp list <id>` | `domo_pdp_list` | PDP policies |
| `domo-helix whoami` | `domo_whoami` | Current user |
| `domo-helix custom-app list` | `domo_custom_app_list` | Custom apps |
| `domo-helix appdb query <col>` | `domo_appdb_query` | AppDB query |
| `domo-helix code-engine run` | `domo_code_engine_run` | Run function |

---

## Project Structure

```
src/
  core/                    Shared logic (zero duplication)
    auth/                  DomoAuth, ryuu store, token exchange, SID cache
    api/                   ALL business logic — the consolidation point
      index.ts             Re-exports every operation
      datasets.ts          Dataset CRUD, upload, search
      etl.ts               Magic ETL dataflows
      cards.ts             Native card operations
      beastmode.ts         Calculated fields (multi-step)
      apps.ts              App Studio apps
      layout.ts            Page layout grid
      pages.ts             Classic pages
      users.ts             User management
      groups.ts            Groups
      pdp.ts               Data permissions
      custom-apps.ts       Custom apps
      appdb.ts             AppDB queries
      code-engine.ts       Code Engine functions
      search.ts            Cross-entity search
  cli/                     CLI interface (thin wrappers)
    index.ts               Commander.js entry point → domo-helix
    output.ts              DomoResult → stdout/stderr
    json-input.ts          --body/--body-file resolver
    commands/              One file per domain
  mcp/                     MCP interface (thin wrappers)
    index.ts               McpServer entry point → domo-helix-mcp
    output.ts              DomoResult → MCP content blocks
    tools/                 One file per domain group
```

---

## Related Projects

- [CommunityDomoCLIHelix](https://github.com/BFullenkampDomo/CommunityDomoCLIHelix) — Previous CLI-only version (archived)
- [CommunityDomoMCPHelix](https://github.com/BFullenkampDomo/CommunityDomoMCPHelix) — Previous MCP-only version (archived)
- [Ryuu CLI](https://www.npmjs.com/package/ryuu) — Official Domo developer CLI (`domo login`, `domo publish`)

---

## License

MIT
