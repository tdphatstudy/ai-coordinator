import { buildApplyRecords } from './records.js';
import { fileExists, readDirNames, safeStat } from './io.js';

export const runDoctor = async (config, state) => {
  const records = buildApplyRecords(config.enabledAgents);
  const grouped = {};

  for (const record of records) {
    if (!grouped[record.agent]) {
      grouped[record.agent] = {
        installed: true,
        linked_or_synced: false,
        discoverable: false,
        priority_layer: config.priority.byAgent[record.agent] || config.priority.defaultOrder,
        last_sync_version: state.lastSyncVersion,
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
    }
    if (names.length > 0) {
      grouped[record.agent].discoverable = true;
    }
  }

  return grouped;
};
