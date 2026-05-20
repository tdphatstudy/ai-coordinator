import readline from 'node:readline';
import { CommandId } from './enums.js';
import { runCommand } from './commands.js';
import { printBanner, printMessage } from './ui.js';

const MenuAction = Object.freeze({
  QUICK_SETUP: 'quick_setup',
  DOCTOR: 'doctor',
  LIST: 'list',
  UPDATE: 'update',
  BACKUP: 'backup',
  RESTORE: 'restore',
  REMOVE: 'remove',
  PRIORITY: 'priority',
  EXIT: 'exit'
});

const menuActions = Object.freeze([
  { action: MenuAction.QUICK_SETUP, label: 'Quick setup (init)' },
  { action: MenuAction.DOCTOR, label: 'Health check (doctor)' },
  { action: MenuAction.LIST, label: 'List installed assets' },
  { action: MenuAction.UPDATE, label: 'Update current setup' },
  { action: MenuAction.BACKUP, label: 'Create backup snapshot' },
  { action: MenuAction.RESTORE, label: 'Restore from backup' },
  { action: MenuAction.REMOVE, label: 'Remove managed assets' },
  { action: MenuAction.PRIORITY, label: 'Show priority status' },
  { action: MenuAction.EXIT, label: 'Exit' }
]);

const setupModes = Object.freeze([
  { mode: 'auto', label: 'auto  (link first, fallback sync)' },
  { mode: 'link', label: 'link  (force symlink/junction)' },
  { mode: 'sync', label: 'sync  (force copy/sync)' }
]);

const selectableAgents = Object.freeze([
  { id: 'claude', label: 'claude' },
  { id: 'codex', label: 'codex' },
  { id: 'qwen', label: 'qwen' },
  { id: 'antigravity', label: 'antigravity' }
]);

const helpText = `agent-coordinator commands:
  [no args] interactive menu
  init [--agents all|claude,codex,qwen,antigravity] [--mode auto|link|sync]
  link [--agents ...]
  sync [--agents ...]
  doctor [--json] [--verbose]
  list
  update
  priority [--agent name --order agent_global,coordinator_shared,project_local,user_override]
  backup
  restore [--name backup-id]
  remove
\nWebsite: https://tdphat.io.vn/
`;

const clearScreen = () => {
  process.stdout.write('\u001bc');
};

const renderSingleSelect = (title, options, cursor, footer) => {
  clearScreen();
  printBanner(true);
  process.stdout.write(`\u001b[96m${title}\u001b[0m\n`);
  for (let index = 0; index < options.length; index += 1) {
    const isFocused = index === cursor;
    const pointer = isFocused ? '❯' : ' ';
    process.stdout.write(`${pointer} ${options[index].label}\n`);
  }
  process.stdout.write(`\n\u001b[90m${footer}\u001b[0m\n`);
};

const renderMultiSelectAgents = (cursor, selectedSet) => {
  clearScreen();
  printBanner(true);
  process.stdout.write('\u001b[96mSelect agents\u001b[0m\n');
  process.stdout.write('❯ all\n');
  for (let index = 0; index < selectableAgents.length; index += 1) {
    const option = selectableAgents[index];
    const isFocused = index === cursor;
    const isSelected = selectedSet.has(option.id);
    const pointer = isFocused ? '❯' : ' ';
    const marker = isSelected ? '[x]' : '[ ]';
    process.stdout.write(`${pointer} ${marker} ${option.label}\n`);
  }
  process.stdout.write('\n\u001b[90mUse Up/Down to move, Space to toggle, Enter to confirm\u001b[0m\n');
};

const readKeySelection = (renderer, maxIndex, onEnter, onSpace) => {
  return new Promise((resolve) => {
    let cursor = 0;

    const cleanup = () => {
      process.stdin.removeListener('keypress', handleKeypress);
      if (process.stdin.isTTY) {
        process.stdin.setRawMode(false);
      }
      process.stdin.pause();
    };

    const handleKeypress = (_str, key) => {
      if (key.name === 'up') {
        cursor = (cursor - 1 + maxIndex + 1) % (maxIndex + 1);
        renderer(cursor);
        return;
      }
      if (key.name === 'down') {
        cursor = (cursor + 1) % (maxIndex + 1);
        renderer(cursor);
        return;
      }
      if (key.name === 'space' && onSpace) {
        onSpace(cursor);
        renderer(cursor);
        return;
      }
      if (key.name === 'return') {
        const value = onEnter(cursor);
        cleanup();
        resolve(value);
        return;
      }
      if (key.ctrl && key.name === 'c') {
        cleanup();
        process.exit(0);
      }
    };

    readline.emitKeypressEvents(process.stdin);
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
    }
    process.stdin.resume();
    process.stdin.on('keypress', handleKeypress);
    renderer(cursor);
  });
};

const selectMenuAction = async () => {
  return readKeySelection(
    (cursor) => renderSingleSelect('Main Menu', menuActions, cursor, 'Use Up/Down and Enter'),
    menuActions.length - 1,
    (cursor) => menuActions[cursor].action
  );
};

const selectSetupMode = async () => {
  const selected = await readKeySelection(
    (cursor) => renderSingleSelect('Setup Mode', setupModes, cursor, 'Use Up/Down and Enter'),
    setupModes.length - 1,
    (cursor) => setupModes[cursor].mode
  );
  return selected;
};

const selectAgents = async () => {
  const selectedSet = new Set(selectableAgents.map((item) => item.id));
  const value = await readKeySelection(
    (cursor) => renderMultiSelectAgents(cursor, selectedSet),
    selectableAgents.length - 1,
    () => {
      if (selectedSet.size === 0 || selectedSet.size === selectableAgents.length) {
        return 'all';
      }
      return selectableAgents
        .filter((item) => selectedSet.has(item.id))
        .map((item) => item.id)
        .join(',');
    },
    (cursor) => {
      const option = selectableAgents[cursor];
      if (!option) {
        return;
      }
      if (selectedSet.has(option.id)) {
        selectedSet.delete(option.id);
        return;
      }
      selectedSet.add(option.id);
    }
  );
  return value;
};

const runInteractiveMenu = async () => {
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    printBanner();
    printMessage('warn', 'Interactive mode requires a TTY terminal');
    printMessage('info', 'Use direct commands like: agents-coordinator init --mode auto --agents all');
    return;
  }

  const action = await selectMenuAction();
  if (!action || action === MenuAction.EXIT) {
    clearScreen();
    printBanner();
    printMessage('warn', 'Exit without changes');
    return;
  }

  let command = CommandId.LIST;
  let args = [];

  if (action === MenuAction.QUICK_SETUP) {
    const mode = await selectSetupMode();
    const agents = await selectAgents();
    command = CommandId.INIT;
    args = ['--mode', mode, '--agents', agents];
  }
  if (action === MenuAction.DOCTOR) {
    command = CommandId.DOCTOR;
  }
  if (action === MenuAction.LIST) {
    command = CommandId.LIST;
  }
  if (action === MenuAction.UPDATE) {
    command = CommandId.UPDATE;
  }
  if (action === MenuAction.BACKUP) {
    command = CommandId.BACKUP;
  }
  if (action === MenuAction.RESTORE) {
    command = CommandId.RESTORE;
  }
  if (action === MenuAction.REMOVE) {
    command = CommandId.REMOVE;
  }
  if (action === MenuAction.PRIORITY) {
    command = CommandId.PRIORITY;
  }

  clearScreen();
  printBanner();
  printMessage('info', `Executing command: ${command}`);
  await runCommand(command, args);
  printMessage('success', `Done: ${command}`);
};

export const runCli = async (argv) => {
  const command = argv[0] || null;
  if (!command) {
    await runInteractiveMenu();
    return;
  }
  if (command === '--help' || command === '-h' || command === 'help') {
    printBanner();
    process.stdout.write(helpText);
    return;
  }

  printBanner();
  printMessage('info', `Executing command: ${command}`);
  await runCommand(command, argv.slice(1));
  printMessage('success', `Done: ${command}`);
};
