import path from 'node:path';
import { resolveAgentTargets } from './adapter-targets.js';
import { SupportedAgents, SupportedAssetKinds } from './enums.js';
import { resolveStandardsRoot } from './paths.js';

export const buildApplyRecords = (enabledAgents) => {
  const standardsRoot = resolveStandardsRoot();
  const targets = resolveAgentTargets();
  const selected = enabledAgents?.length ? enabledAgents : SupportedAgents;
  const records = [];

  for (const agent of selected) {
    const agentTargets = targets[agent];
    if (!agentTargets) {
      continue;
    }
    for (const kind of SupportedAssetKinds) {
      records.push({
        agent,
        kind,
        sourcePath: path.join(standardsRoot, kind),
        targetPath: agentTargets[kind]
      });
    }
  }

  return records;
};
