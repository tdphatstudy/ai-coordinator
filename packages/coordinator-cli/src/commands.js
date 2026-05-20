import path from 'node:path';
import { applyRecords } from './apply-engine.js';
import { createBackup } from './backup.js';
import { runDoctor } from './doctor.js';
import { ApplyMode, PriorityDefaultOrder, SupportedAgents } from './enums.js';
import { copyPath, ensureDir, fileExists, readDirNames, removePath } from './io.js';
import { resolveCoordinatorRoot, resolveStandardsRoot } from './paths.js';
import { buildApplyRecords } from './records.js';
import { loadConfig, loadState, saveConfig, saveState } from './state.js';
import { printCommandCard, printJson, printMessage, printTable } from './ui.js';
import { validateStandards } from './validator.js';

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

const hasFlag = (args, flag) => args.includes(flag);

const summarizeDoctorRows = (report) => Object.entries(report).map(([agent, details]) => {
  const assetsState = details.assets
    .map((asset) => `${asset.kind}:${asset.exists ? asset.linkType : 'missing'}/${asset.itemCount}`)
    .join(' | ');
  return `${agent} | discoverable=${details.discoverable} | linked_or_synced=${details.linked_or_synced} | assets=${assetsState}`;
});

const validateBeforeApply = async () => {
  const validation = await validateStandards();
  if (!validation.valid) {
    printJson({ command: 'validate', valid: false, errors: validation.errors });
    throw new Error('Standards validation failed');
  }
};

export const runInit = async (args) => {
  const config = await loadConfig();
  const state = await loadState();
  const selectedAgents = parseAgentsArg(args);
  const mode = parseMode(args);
  config.enabledAgents = selectedAgents;
  config.applyMode = mode;

  await ensureDir(resolveCoordinatorRoot());
  await validateBeforeApply();
  const { records } = await buildApplyRecords(config.enabledAgents);
  const applied = await applyRecords(records, config.applyMode);

  state.installRecords = applied.results;
  state.lastSyncVersion = 'v1';
  state.backups = [applied.backup, ...state.backups].slice(0, 20);

  await saveConfig(config);
  await saveState(state);

  printCommandCard('Init Result', {
    command: 'init',
    mode: applied.mode,
    agents: config.enabledAgents,
    installed_records: applied.results.length,
    backup_id: applied.backup.name
  });
};

export const runLink = async (args) => {
  const config = await loadConfig();
  const state = await loadState();
  const selectedAgents = parseAgentsArg(args);
  config.enabledAgents = selectedAgents;
  config.applyMode = ApplyMode.LINK;

  await validateBeforeApply();
  const { records } = await buildApplyRecords(config.enabledAgents);
  const applied = await applyRecords(records, ApplyMode.LINK);
  state.installRecords = applied.results;
  state.backups = [applied.backup, ...state.backups].slice(0, 20);

  await saveConfig(config);
  await saveState(state);

  printCommandCard('Link Result', {
    command: 'link',
    mode: applied.mode,
    records: applied.results.length,
    backup_id: applied.backup.name
  });
};

export const runSync = async (args) => {
  const config = await loadConfig();
  const state = await loadState();
  const selectedAgents = parseAgentsArg(args);
  config.enabledAgents = selectedAgents;
  config.applyMode = ApplyMode.SYNC;

  await validateBeforeApply();
  const { records } = await buildApplyRecords(config.enabledAgents);
  const applied = await applyRecords(records, ApplyMode.SYNC);
  state.installRecords = applied.results;
  state.lastSyncVersion = 'v1';
  state.backups = [applied.backup, ...state.backups].slice(0, 20);

  await saveConfig(config);
  await saveState(state);

  printCommandCard('Sync Result', {
    command: 'sync',
    mode: applied.mode,
    records: applied.results.length,
    backup_id: applied.backup.name
  });
};

export const runDoctorCommand = async (args) => {
  const config = await loadConfig();
  const state = await loadState();
  const report = await runDoctor(config, state);
  if (hasFlag(args, '--json')) {
    printJson({ command: 'doctor', report });
    return;
  }

  printTable('Doctor Summary', summarizeDoctorRows(report));
  if (hasFlag(args, '--verbose')) {
    printJson({ command: 'doctor', report });
  }
};

export const runList = async () => {
  const standardsRoot = resolveStandardsRoot();
  const config = await loadConfig();
  const state = await loadState();

  const skills = await readDirNames(path.join(standardsRoot, 'skills'));
  const workflows = await readDirNames(path.join(standardsRoot, 'workflows'));
  const mcp = await readDirNames(path.join(standardsRoot, 'mcp'));
  const agents = await readDirNames(path.join(standardsRoot, 'agents'));

  printCommandCard('List Result', {
    command: 'list',
    agents: config.enabledAgents,
    apply_mode: config.applyMode,
    skills_count: skills.length,
    workflows_count: workflows.length,
    mcp_count: mcp.length,
    agents_count: agents.length,
    backups: state.backups.map((item) => item.name)
  });
};

export const runPriority = async (args) => {
  const config = await loadConfig();
  const agent = pickArgValue(args, '--agent', null);
  const orderRaw = pickArgValue(args, '--order', null);

  if (!agent || !orderRaw) {
    printCommandCard('Priority Status', {
      command: 'priority',
      default_order: config.priority.defaultOrder,
      configured_agents: Object.keys(config.priority.byAgent)
    });
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

  printCommandCard('Priority Updated', {
    command: 'priority',
    agent,
    order: parsedOrder
  });
};

export const runBackup = async () => {
  const state = await loadState();
  const backup = await createBackup(state.installRecords || []);
  state.backups = [backup, ...state.backups].slice(0, 20);
  await saveState(state);
  printCommandCard('Backup Result', {
    command: 'backup',
    backup_id: backup.name,
    records: backup.records.length
  });
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

  printCommandCard('Restore Result', {
    command: 'restore',
    backup_id: backupName,
    restored_records: backup.records.length
  });
};

export const runRemove = async () => {
  const state = await loadState();
  for (const record of state.installRecords || []) {
    await removePath(record.targetPath);
  }
  state.installRecords = [];
  await saveState(state);
  printCommandCard('Remove Result', {
    command: 'remove',
    removed: true
  });
};

export const runUpdate = async () => {
  const config = await loadConfig();
  const state = await loadState();
  await validateBeforeApply();
  const { records } = await buildApplyRecords(config.enabledAgents);
  const applied = await applyRecords(records, config.applyMode);
  state.installRecords = applied.results;
  state.lastSyncVersion = 'v1';
  state.backups = [applied.backup, ...state.backups].slice(0, 20);
  await saveState(state);
  printCommandCard('Update Result', {
    command: 'update',
    records: applied.results.length,
    backup_id: applied.backup.name
  });
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
      return runDoctorCommand(args);
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
      printMessage('error', `Unsupported command: ${command}`);
      throw new Error(`Unsupported command: ${command}`);
  }
};
