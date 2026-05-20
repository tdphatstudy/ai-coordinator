import path from 'node:path';
import { AssetKind } from './enums.js';
import { resolveProjectRoot } from './paths.js';
import { resolveAgentTargets as resolveAgentTargetsFromAdapters } from './adapters.js';

const project = resolveProjectRoot();

export const resolveAgentTargets = async () => {
  const { targets } = await resolveAgentTargetsFromAdapters();
  return targets;
};

export const resolveProjectUserOverrideTargets = () => ({
  [AssetKind.SKILLS]: path.join(project, '.ai-coordinator', 'overrides', 'skills'),
  [AssetKind.WORKFLOWS]: path.join(project, '.ai-coordinator', 'overrides', 'workflows'),
  [AssetKind.MCP]: path.join(project, '.ai-coordinator', 'overrides', 'mcp')
});
