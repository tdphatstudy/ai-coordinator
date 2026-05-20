import { CommandId } from './enums.js';
import { runCommand } from './commands.js';

const helpText = `agent-coordinator commands:
  init [--agents all|claude,codex,qwen,antigravity] [--mode auto|link|sync]
  link [--agents ...]
  sync [--agents ...]
  doctor
  list
  update
  priority [--agent name --order agent_global,coordinator_shared,project_local,user_override]
  backup
  restore [--name backup-id]
  remove
`;

export const runCli = async (argv) => {
  const command = argv[0] || CommandId.LIST;
  if (command === '--help' || command === '-h' || command === 'help') {
    process.stdout.write(helpText);
    return;
  }

  await runCommand(command, argv.slice(1));
};
