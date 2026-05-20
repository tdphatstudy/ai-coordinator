import path from 'node:path';
import { resolveAgentTargets } from './adapters.js';
import { prepareAssetSources } from './asset-packager.js';
import { SupportedAgents, SupportedAssetKinds } from './enums.js';
import { resolveStandardsRoot } from './paths.js';

export const buildApplyRecords = async (enabledAgents) => {
  const standardsRoot = resolveStandardsRoot();
  const { targets, adapters } = await resolveAgentTargets();
  const selected = enabledAgents?.length ? enabledAgents : SupportedAgents;
  const sourcesByAgent = await prepareAssetSources(selected, adapters, standardsRoot);
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
        adapter: adapters[agent],
        sourcePath: sourcesByAgent[agent]?.[kind] || path.join(standardsRoot, kind),
        targetPath: agentTargets[kind]
      });
    }
  }

  return { records, adapters };
};
