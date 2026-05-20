import fs from 'node:fs/promises';
import { buildApplyRecords } from './records.js';
import { VerificationLevel } from './enums.js';
import { fileExists, readDirNames, safeStat } from './io.js';
import { resolveCoordinatorRepoRoot } from './paths.js';

const resolveVerificationLevel = (verification) => {
  const normalized = String(verification || '').toLowerCase();
  if (normalized.includes('partially_verified')) {
    return VerificationLevel.PARTIAL;
  }
  if (normalized.includes('verified')) {
    return VerificationLevel.VERIFIED;
  }
  return VerificationLevel.ASSUMED;
};

const loadCompatibilityVerification = async () => {
  const matrixPath = `${resolveCoordinatorRepoRoot()}/compatibility/matrix.json`;
  const exists = await fileExists(matrixPath);
  if (!exists) {
    return {};
  }
  const matrix = await fs.readFile(matrixPath, 'utf8').then((value) => JSON.parse(value)).catch(() => null);
  if (!matrix || !Array.isArray(matrix.agents)) {
    return {};
  }
  const byAgent = {};
  for (const item of matrix.agents) {
    if (!item?.id) {
      continue;
    }
    byAgent[item.id] = {
      verification_source: item.verification || 'not_specified',
      verification_level: resolveVerificationLevel(item.verification)
    };
  }
  return byAgent;
};

export const runDoctor = async (config, state) => {
  const { records, adapters } = await buildApplyRecords(config.enabledAgents);
  const compatibilityByAgent = await loadCompatibilityVerification();
  const grouped = {};

  for (const record of records) {
    if (!grouped[record.agent]) {
      grouped[record.agent] = {
        installed: false,
        linked_or_synced: false,
        discoverable: false,
        priority_layer: config.priority.byAgent[record.agent] || config.priority.defaultOrder,
        last_sync_version: state.lastSyncVersion,
        verification_level: compatibilityByAgent[record.agent]?.verification_level || VerificationLevel.ASSUMED,
        verification_source: compatibilityByAgent[record.agent]?.verification_source || 'adapter_assumed_only',
        capabilities: adapters[record.agent]?.capabilities || null,
        docs: adapters[record.agent]?.officialDocs || {},
        assets: []
      };
    }

    const exists = await fileExists(record.targetPath);
    const stat = exists ? await safeStat(record.targetPath) : null;
    const names = exists ? await readDirNames(record.targetPath) : [];

    const assetStatus = {
      kind: record.kind,
      targetPath: record.targetPath,
      exists,
      itemCount: names.length,
      linkType: stat?.isSymbolicLink() ? 'symlink' : exists ? 'directory' : 'missing'
    };

    grouped[record.agent].assets.push(assetStatus);
    if (exists) {
      grouped[record.agent].linked_or_synced = true;
      grouped[record.agent].installed = true;
    }
    if (names.length > 0) {
      grouped[record.agent].discoverable = true;
    }
  }

  return grouped;
};
