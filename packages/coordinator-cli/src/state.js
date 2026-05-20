import { readJsonFile, writeJsonFile } from './io.js';
import { PriorityDefaultOrder, SupportedAgents } from './enums.js';
import { resolveConfigFile, resolveStateFile } from './paths.js';

const now = () => new Date().toISOString();

export const createDefaultConfig = () => ({
  version: 1,
  applyMode: 'auto',
  enabledAgents: [...SupportedAgents],
  priority: {
    defaultOrder: [...PriorityDefaultOrder],
    byAgent: {}
  }
});

export const createDefaultState = () => ({
  version: 1,
  initializedAt: now(),
  updatedAt: now(),
  lastSyncVersion: null,
  installRecords: [],
  backups: []
});

export const loadConfig = async () => readJsonFile(resolveConfigFile(), createDefaultConfig());

export const saveConfig = async (config) => writeJsonFile(resolveConfigFile(), config);

export const loadState = async () => readJsonFile(resolveStateFile(), createDefaultState());

export const saveState = async (state) => {
  const nextState = {
    ...state,
    updatedAt: now()
  };
  await writeJsonFile(resolveStateFile(), nextState);
  return nextState;
};
