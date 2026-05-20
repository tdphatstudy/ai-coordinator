import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const sourceFilePath = fileURLToPath(import.meta.url);
const sourceDirPath = path.dirname(sourceFilePath);
const bundledRepoRoot = path.resolve(sourceDirPath, '../../..');

export const resolveProjectRoot = () => process.cwd();

export const resolveCoordinatorRepoRoot = () => {
  const explicitRoot = process.env.AI_COORDINATOR_ROOT;
  if (explicitRoot) {
    return path.resolve(explicitRoot);
  }
  return bundledRepoRoot;
};

export const resolveCoordinatorRoot = () => path.join(resolveProjectRoot(), '.ai-coordinator');

export const resolveStateFile = () => path.join(resolveCoordinatorRoot(), 'state.json');

export const resolveConfigFile = () => path.join(resolveCoordinatorRoot(), 'config.json');

export const resolveBackupDir = () => path.join(resolveCoordinatorRoot(), 'backups');

export const resolveStandardsRoot = () => path.join(resolveCoordinatorRepoRoot(), 'standards');

export const resolveHomeDir = () => os.homedir();

export const normalizePath = (value) => path.resolve(value);
