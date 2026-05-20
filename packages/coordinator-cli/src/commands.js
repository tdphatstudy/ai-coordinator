import path from 'node:path';
import { applyRecords } from './apply-engine.js';
import { createBackup } from './backup.js';
import { runDoctor } from './doctor.js';
import { ApplyMode, PriorityDefaultOrder, SupportedAgents } from './enums.js';
import { copyPath, ensureDir, fileExists, readDirNames, removePath } from './io.js';
import { resolveBackupDir, resolveCoordinatorRoot, resolveStandardsRoot } from './paths.js';
import { buildApplyRecords } from './records.js';
import { loadConfig, loadState, saveConfig, saveState } from './state.js';

const pickArgValue = (args, name, fallback) => {
  const index = args.indexOf(name);
  if (index === -1) {
    return fallback;
  }
  return args[index + 1] ?? fallback;
};

const parseAgentsArg = (args) => {
  const value = pickArgValue(args, '--agents', 'all');
  if (value === 'all') {
    return [...SupportedAgents];
  }
  return value
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter((item) => SupportedAgents.includes(item));
};

const parseMode = (args) => {
  const raw = pickArgValue(args, '--mode', ApplyMode.AUTO);
  if (raw === ApplyMode.LINK || raw === ApplyMode.SYNC || raw === ApplyMode.AUTO) {
    return raw;
  }
  return ApplyMode.AUTO;
};

const printJson = (value) => {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
};

export const runInit = async (args) => {
  const config = await loadConfig();
  const state = await loadState();
  const selectedAgents = parseAgentsArg(args);
  const mode = parseMode(args);
  config.enabledAgents = selectedAgents;
  config.applyMode = mode;

  await ensureDir(resolveCoordinatorRoot());
  const records = buildApplyRecords(config.enabledAgents);
  const applied = await applyRecords(records, config.applyMode);

  state.installRecords = applied.results;
  state.lastSyncVersion = 'v1';
  state.backups = [applied.backup, ...state.backups].slice(0, 20);

  await saveConfig(config);
  await saveState(state);

  printJson({
    command: 'init',
    mode: applied.mode,
    agents: config.enabledAgents,
    installedRecords: applied.results.length,
    backup: applied.backup.name
  });
};

export const runLink = async (args) => {
  const config = await loadConfig();
  const state = await loadState();
  const selectedAgents = parseAgentsArg(args);
  config.enabledAgents = selectedAgents;
  config.applyMode = ApplyMode.LINK;

  const records = buildApplyRecords(config.enabledAgents);
  const applied = await applyRecords(records, ApplyMode.LINK);
  state.installRecords = applied.results;
  state.backups = [applied.backup, ...state.backups].slice(0, 20);

  await saveConfig(config);
  await saveState(state);

  printJson({ command: 'link', mode: applied.mode, records: applied.results.length });
};

export const runSync = async (args) => {
  const config = await loadConfig();
  const state = await loadState();
  const selectedAgents = parseAgentsArg(args);
  config.enabledAgents = selectedAgents;
  config.applyMode = ApplyMode.SYNC;

  const records = buildApplyRecords(config.enabledAgents);
  const applied = await applyRecords(records, ApplyMode.SYNC);
  state.installRecords = applied.results;
  state.lastSyncVersion = 'v1';
  state.backups = [applied.backup, ...state.backups].slice(0, 20);

  await saveConfig(config);
  await saveState(state);

  printJson({ command: 'sync', mode: applied.mode, records: applied.results.length });
};

export const runDoctorCommand = async () => {
  const config = await loadConfig();
  const state = await loadState();
  const report = await runDoctor(config, state);
  printJson({ command: 'doctor', report });
};

export const runList = async () => {
  const standardsRoot = resolveStandardsRoot();
  const config = await loadConfig();
  const state = await loadState();

  const skills = await readDirNames(path.join(standardsRoot, 'skills'));
  const workflows = await readDirNames(path.join(standardsRoot, 'workflows'));
  const mcp = await readDirNames(path.join(standardsRoot, 'mcp'));

  printJson({
    command: 'list',
    agents: config.enabledAgents,
    applyMode: config.applyMode,
    assets: {
      skills,
      workflows,
      mcp
    },
    backups: state.backups.map((item) => item.name)
  });
};

export const runPriority = async (args) => {
  const config = await loadConfig();
  const agent = pickArgValue(args, '--agent', null);
  const orderRaw = pickArgValue(args, '--order', null);

  if (!agent || !orderRaw) {
    printJson({ command: 'priority', priority: config.priority });
    return;
  }

  const parsedOrder = orderRaw.split(',').map((item) => item.trim());
  const hasSameLength = parsedOrder.length === PriorityDefaultOrder.length;
  const hasAllLayers = PriorityDefaultOrder.every((layer) => parsedOrder.includes(layer));

  if (!SupportedAgents.includes(agent)) {
    throw new Error(`Unsupported agent: ${agent}`);
  }
  if (!hasSameLength || !hasAllLayers) {
    throw new Error('Invalid priority order');
  }

  config.priority.byAgent[agent] = parsedOrder;
  await saveConfig(config);

  printJson({ command: 'priority', agent, order: parsedOrder });
};

export const runBackup = async () => {
  const state = await loadState();
  const backup = await createBackup(state.installRecords || []);
  state.backups = [backup, ...state.backups].slice(0, 20);
  await saveState(state);
  printJson({ command: 'backup', backup: backup.name, records: backup.records.length });
};

export const runRestore = async (args) => {
  const state = await loadState();
  const backupName = pickArgValue(args, '--name', state.backups?.[0]?.name);
  if (!backupName) {
    throw new Error('No backup available');
  }

  const backup = state.backups.find((item) => item.name === backupName);
  if (!backup) {
    throw new Error(`Backup not found: ${backupName}`);
  }

  for (const record of backup.records) {
    await ensureDir(path.dirname(record.targetPath));
    await removePath(record.targetPath);
    await copyPath(record.backupPath, record.targetPath);
  }

  printJson({ command: 'restore', backup: backupName, restored: backup.records.length });
};

export const runRemove = async () => {
  const state = await loadState();
  for (const record of state.installRecords || []) {
    await removePath(record.targetPath);
  }
  state.installRecords = [];
  await saveState(state);
  printJson({ command: 'remove', removed: true });
};

export const runUpdate = async () => {
  const config = await loadConfig();
  const state = await loadState();
  const records = buildApplyRecords(config.enabledAgents);
  const applied = await applyRecords(records, config.applyMode);
  state.installRecords = applied.results;
  state.lastSyncVersion = 'v1';
  state.backups = [applied.backup, ...state.backups].slice(0, 20);
  await saveState(state);
  printJson({ command: 'update', records: applied.results.length, backup: applied.backup.name });
};

export const runCommand = async (command, args) => {
  switch (command) {
    case 'init':
      return runInit(args);
    case 'link':
      return runLink(args);
    case 'sync':
      return runSync(args);
    case 'doctor':
      return runDoctorCommand();
    case 'list':
      return runList();
    case 'update':
      return runUpdate();
    case 'priority':
      return runPriority(args);
    case 'backup':
      return runBackup();
    case 'restore':
      return runRestore(args);
    case 'remove':
      return runRemove();
    default:
      throw new Error(`Unsupported command: ${command}`);
  }
};
