import fs from 'node:fs/promises';
import path from 'node:path';
import { createBackup } from './backup.js';
import { ApplyMode } from './enums.js';
import { copyPath, ensureDir, fileExists, removePath } from './io.js';

const linkDirectory = async (sourcePath, targetPath) => {
  const linkType = process.platform === 'win32' ? 'junction' : 'dir';
  await fs.symlink(sourcePath, targetPath, linkType);
};

const applyLink = async (record) => {
  await ensureDir(path.dirname(record.targetPath));
  await removePath(record.targetPath);
  await linkDirectory(record.sourcePath, record.targetPath);
  return 'linked';
};

const applySync = async (record) => {
  await ensureDir(path.dirname(record.targetPath));
  await removePath(record.targetPath);
  await copyPath(record.sourcePath, record.targetPath);
  return 'synced';
};

export const decideMode = (preferredMode) => {
  if (preferredMode === ApplyMode.LINK) {
    return ApplyMode.LINK;
  }
  if (preferredMode === ApplyMode.SYNC) {
    return ApplyMode.SYNC;
  }
  return ApplyMode.AUTO;
};

export const applyRecords = async (records, preferredMode) => {
  const mode = decideMode(preferredMode);
  const backup = await createBackup(records);
  const results = [];

  try {
    for (const record of records) {
      const sourceExists = await fileExists(record.sourcePath);
      if (!sourceExists) {
        throw new Error(`Missing source path: ${record.sourcePath}`);
      }
      let appliedAs = 'synced';
      if (mode === ApplyMode.LINK) {
        appliedAs = await applyLink(record);
      } else if (mode === ApplyMode.SYNC) {
        appliedAs = await applySync(record);
      } else {
        try {
          appliedAs = await applyLink(record);
        } catch {
          appliedAs = await applySync(record);
        }
      }
      results.push({
        ...record,
        mode: appliedAs,
        appliedAt: new Date().toISOString()
      });
    }
  } catch (error) {
    for (const snapshot of backup.records) {
      const exists = await fileExists(snapshot.backupPath);
      if (!exists) {
        continue;
      }
      await removePath(snapshot.targetPath);
      await copyPath(snapshot.backupPath, snapshot.targetPath);
    }
    throw error;
  }

  return {
    mode,
    backup,
    results
  };
};
