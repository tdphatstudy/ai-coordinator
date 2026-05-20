# ai-coordinator

Single standard for `skills`, `workflows`, and `mcp` assets across multiple coding CLI agents.

## V1 Goals
- Clone once, run one setup flow, and start with curated defaults.
- Support `claude`, `codex`, `qwen`, and `antigravity` adapters.
- Prefer symlink/junction, then fallback to safe sync-copy automatically.
- Provide explicit priority layers and per-agent override controls.

## Repo Layout
- `packages/coordinator-cli` - Node.js CLI (`agent-coordinator`)
- `standards` - canonical shared assets (`skills`, `workflows`, `mcp`)
- `adapters` - agent mapping metadata
- `compatibility` - support matrix and limitations
- `scripts` - setup helpers for PowerShell and shell

## Quickstart

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

## Commands
- `init` - initialize config/state and apply assets to selected agents
- `link` - force link/junction mode
- `sync` - force copy/sync mode
- `doctor` - show health, discoverability, and priority layer per agent
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

## Discoverability
After successful `init`, each adapter target receives `skills/workflows/mcp` assets under agent-specific directories:
- `~/.claude/*`
- `~/.codex/*`
- `~/.qwen/*`
- `~/.antigravity/*`

Then run the agent command (for example `/skills`) to verify visibility in the target CLI.

## Cross-Platform Behavior
- `--mode auto`: try link first, fallback to sync if link fails.
- `--mode link`: require links/junctions; errors if unsupported.
- `--mode sync`: use managed copy only.

## Compatibility
See `compatibility/matrix.json` for current support and feature coverage.

## Notes
- This project never stores credentials in repo files.
- MCP presets use placeholders only (for example env var names).
