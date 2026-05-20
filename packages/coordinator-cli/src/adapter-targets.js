import path from 'node:path';
import { AgentId, AssetKind } from './enums.js';
import { resolveHomeDir, resolveProjectRoot } from './paths.js';

const home = resolveHomeDir();
const project = resolveProjectRoot();

export const resolveAgentTargets = () => ({
  [AgentId.CLAUDE]: {
    [AssetKind.SKILLS]: path.join(home, '.claude', 'skills'),
    [AssetKind.WORKFLOWS]: path.join(home, '.claude', 'workflows'),
    [AssetKind.MCP]: path.join(home, '.claude', 'mcp')
  },
  [AgentId.CODEX]: {
    [AssetKind.SKILLS]: path.join(home, '.codex', 'skills'),
    [AssetKind.WORKFLOWS]: path.join(home, '.codex', 'workflows'),
    [AssetKind.MCP]: path.join(home, '.codex', 'mcp')
  },
  [AgentId.QWEN]: {
    [AssetKind.SKILLS]: path.join(home, '.qwen', 'skills'),
    [AssetKind.WORKFLOWS]: path.join(home, '.qwen', 'workflows'),
    [AssetKind.MCP]: path.join(home, '.qwen', 'mcp')
  },
  [AgentId.ANTIGRAVITY]: {
    [AssetKind.SKILLS]: path.join(home, '.antigravity', 'skills'),
    [AssetKind.WORKFLOWS]: path.join(home, '.antigravity', 'workflows'),
    [AssetKind.MCP]: path.join(home, '.antigravity', 'mcp')
  }
});

export const resolveProjectUserOverrideTargets = () => ({
  [AssetKind.SKILLS]: path.join(project, '.ai-coordinator', 'overrides', 'skills'),
  [AssetKind.WORKFLOWS]: path.join(project, '.ai-coordinator', 'overrides', 'workflows'),
  [AssetKind.MCP]: path.join(project, '.ai-coordinator', 'overrides', 'mcp')
});
