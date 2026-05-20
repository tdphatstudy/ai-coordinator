#!/usr/bin/env sh
set -eu

MODE="${1:-auto}"
AGENTS="${2:-all}"

echo "Running agent-coordinator init..."
node packages/coordinator-cli/bin/ai-coordinator.js init --mode "$MODE" --agents "$AGENTS"
node packages/coordinator-cli/bin/ai-coordinator.js doctor
