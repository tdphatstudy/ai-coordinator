export const AgentId = Object.freeze({
  CLAUDE: 'claude',
  CODEX: 'codex',
  QWEN: 'qwen',
  ANTIGRAVITY: 'antigravity'
});

export const ApplyMode = Object.freeze({
  AUTO: 'auto',
  LINK: 'link',
  SYNC: 'sync'
});

export const AssetKind = Object.freeze({
  SKILLS: 'skills',
  WORKFLOWS: 'workflows',
  MCP: 'mcp'
});

export const PriorityLayer = Object.freeze({
  AGENT_GLOBAL: 'agent_global',
  COORDINATOR_SHARED: 'coordinator_shared',
  PROJECT_LOCAL: 'project_local',
  USER_OVERRIDE: 'user_override'
});

export const CommandId = Object.freeze({
  INIT: 'init',
  LINK: 'link',
  SYNC: 'sync',
  DOCTOR: 'doctor',
  LIST: 'list',
  UPDATE: 'update',
  PRIORITY: 'priority',
  BACKUP: 'backup',
  RESTORE: 'restore',
  REMOVE: 'remove'
});

export const SupportedAgents = Object.freeze([
  AgentId.CLAUDE,
  AgentId.CODEX,
  AgentId.QWEN,
  AgentId.ANTIGRAVITY
]);

export const SupportedAssetKinds = Object.freeze([
  AssetKind.SKILLS,
  AssetKind.WORKFLOWS,
  AssetKind.MCP
]);

export const PriorityDefaultOrder = Object.freeze([
  PriorityLayer.AGENT_GLOBAL,
  PriorityLayer.COORDINATOR_SHARED,
  PriorityLayer.PROJECT_LOCAL,
  PriorityLayer.USER_OVERRIDE
]);
