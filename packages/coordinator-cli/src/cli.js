import { CommandId } from './enums.js';
import { runCommand } from './commands.js';
import { printBanner, printMessage } from './ui.js';

const helpText = `agent-coordinator commands:
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

export const runCli = async (argv) => {
  const command = argv[0] || CommandId.LIST;
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
