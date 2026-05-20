import fs from 'node:fs/promises';
import path from 'node:path';
import { AgentId, AssetKind, SupportedAgents } from './enums.js';
import { resolveHomeDir, resolveProjectRoot } from './paths.js';

const home = resolveHomeDir();
const projectRoot = resolveProjectRoot();

const adapterFileByAgent = Object.freeze({
  [AgentId.CLAUDE]: 'claude.json',
  [AgentId.CODEX]: 'codex.json',
  [AgentId.QWEN]: 'qwen.json',
  [AgentId.ANTIGRAVITY]: 'antigravity.json'
});

const expandTemplate = (value) => value
  .replace(/^~(?=\\|\/|$)/, home)
  .replaceAll('${HOME}', home)
  .replaceAll('${PROJECT_ROOT}', projectRoot);

const pickCandidate = async (candidates) => {
  for (const candidate of candidates) {
    const expanded = path.resolve(expandTemplate(candidate));
    try {
      await fs.access(path.dirname(expanded));
      return expanded;
    } catch {
      continue;
    }
  }
  return path.resolve(expandTemplate(candidates[0]));
};

const readAdapterByAgent = async (agentId) => {
  const fileName = adapterFileByAgent[agentId];
  const filePath = path.join(projectRoot, 'adapters', fileName);
  const content = await fs.readFile(filePath, 'utf8');
  return JSON.parse(content);
};

export const loadAdapters = async () => {
  const adapters = {};
  for (const agentId of SupportedAgents) {
    adapters[agentId] = await readAdapterByAgent(agentId);
  }
  return adapters;
};

export const resolveAgentTargets = async () => {
  const adapters = await loadAdapters();
  const targets = {};

  for (const agentId of SupportedAgents) {
    const adapter = adapters[agentId];
    targets[agentId] = {
      [AssetKind.SKILLS]: await pickCandidate(adapter.targetCandidates.skills),
      [AssetKind.WORKFLOWS]: await pickCandidate(adapter.targetCandidates.workflows),
      [AssetKind.MCP]: await pickCandidate(adapter.targetCandidates.mcp),
      [AssetKind.AGENTS]: await pickCandidate(adapter.targetCandidates.agents)
    };
  }

  return { adapters, targets };
};
