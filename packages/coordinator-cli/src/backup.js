import path from 'node:path';
import fs from 'node:fs/promises';
import { copyPath, ensureDir, fileExists } from './io.js';
import { resolveBackupDir } from './paths.js';

const timestamp = () => new Date().toISOString().replace(/[:.]/g, '-');

export const createBackup = async (records) => {
  const root = resolveBackupDir();
  const name = `backup-${timestamp()}`;
  const targetRoot = path.join(root, name);
  await ensureDir(targetRoot);

  const stored = [];
  for (const record of records) {
    if (!record.targetPath) {
      continue;
    }
    const exists = await fileExists(record.targetPath);
    if (!exists) {
      continue;
    }
    const safeName = `${record.agent}-${record.kind}`;
    const backupPath = path.join(targetRoot, safeName);
    let sourcePath = record.targetPath;
    try {
      const stat = await fs.lstat(record.targetPath);
      if (stat.isSymbolicLink()) {
        sourcePath = await fs.realpath(record.targetPath);
      }
      await copyPath(sourcePath, backupPath);
    } catch {
      continue;
    }
    stored.push({ ...record, backupPath });
  }

  return {
    name,
    createdAt: new Date().toISOString(),
    records: stored
  };
};
