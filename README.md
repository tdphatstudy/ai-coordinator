# ai-coordinator

Production-focused coordinator for `skills`, `workflows`, `mcp`, and `agent profiles` across multiple coding CLI agents.

## Strategy
- **Official baseline**: Adapter mappings and capability assumptions are anchored to official docs.
- **Curated extension**: Marketplace/community packs are included only after schema and quality checks.
- **Cross-platform reliability**: Link-first (`symlink`/`junction`) with automatic sync fallback.

## Repo Layout
- `packages/coordinator-cli` - Node.js CLI (`agent-coordinator`)
- `standards` - canonical shared assets (`skills`, `workflows`, `mcp`, `agents`)
- `adapters` - agent mapping metadata
- `compatibility` - support matrix and limitations
- `scripts` - setup helpers for PowerShell and shell

## Supported Agents
- Claude Code
- OpenAI Codex CLI
- Qwen Code
- Antigravity CLI 2.0

See `compatibility/matrix.json` for source references and verification status.

## Quick Start

### Prerequisite
- Node.js `>=18`

### Setup (PowerShell)
```powershell
./scripts/setup.ps1
```

### Setup (Linux/macOS)
```bash
sh ./scripts/setup.sh
```

### Setup (direct command)
```bash
node packages/coordinator-cli/bin/ai-coordinator.js init --mode auto --agents all
node packages/coordinator-cli/bin/ai-coordinator.js doctor
```

## CLI Branding
The CLI includes a startup banner and status icons, and includes project branding with:
- `https://tdphat.io.vn/`

## Commands
- `init` - initialize config/state and apply assets to selected agents
- `link` - force link/junction mode
- `sync` - force copy/sync mode
- `doctor [--json] [--verbose]` - show health, discoverability, docs sources, capabilities
- `list` - list installed assets and backup ids
- `update` - re-apply current standards to enabled agents
- `priority` - inspect or set per-agent priority order
- `backup` - snapshot managed targets
- `restore` - restore from latest or specific backup
- `remove` - uninstall managed assets

## Priority Model
Default layer order:

`agent_global < coordinator_shared < project_local < user_override`

Set per-agent priority example:
```bash
node packages/coordinator-cli/bin/ai-coordinator.js priority --agent claude --order agent_global,coordinator_shared,project_local,user_override
```

## Asset Catalogs
The repository ships detailed prompts and workflows covering software delivery from idea to production:
- Skills: backend, frontend, testing, review, devops, security, data, incident response
- Workflows: feature delivery, bugfix, architecture decision, release hardening, migration, postmortem
- MCP presets: local-safe baseline, provider placeholders, team collaboration
- Agent profiles: backend architect, QA guardian, incident commander

Prompts are written in English and include metadata fields (`id`, `title`, `description`, `scope`, `inputs`, `outputs`, `constraints`, `supported_agents`, `degradation_mode`, `source`).

## Validation and Safety
- Standards are validated before apply (`init`, `link`, `sync`, `update`).
- Backup snapshots are created before changes.
- Failed apply attempts auto-restore from backup.

## Cross-Platform Behavior
- `--mode auto`: try link first, fallback to sync if link fails.
- `--mode link`: require links/junctions; errors if unsupported.
- `--mode sync`: use managed copy only.

## Official Documentation Sources
- Claude: `https://code.claude.com/docs/en/claude-directory`
- Codex: `https://developers.openai.com/codex/config-basic`
- Qwen: `https://qwenlm.github.io/qwen-code-docs/en/users/configuration/settings/`
- Antigravity: `https://antigravity.google/docs/cli-overview`

## Security Notes
- Never store credentials in repository files.
- MCP provider presets only contain env var placeholders.

## Vietnamese Documentation
- See `README.vi.md` for a full Vietnamese guide.
