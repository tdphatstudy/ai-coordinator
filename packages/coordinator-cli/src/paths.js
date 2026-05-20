import os from 'node:os';
import path from 'node:path';

export const resolveProjectRoot = () => process.cwd();

export const resolveCoordinatorRoot = () => path.join(resolveProjectRoot(), '.ai-coordinator');

export const resolveStateFile = () => path.join(resolveCoordinatorRoot(), 'state.json');

export const resolveConfigFile = () => path.join(resolveCoordinatorRoot(), 'config.json');

export const resolveBackupDir = () => path.join(resolveCoordinatorRoot(), 'backups');

export const resolveStandardsRoot = () => path.join(resolveProjectRoot(), 'standards');

export const resolveHomeDir = () => os.homedir();

export const normalizePath = (value) => path.resolve(value);
