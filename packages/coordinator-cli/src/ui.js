const colors = Object.freeze({
  reset: '\u001b[0m',
  cyan: '\u001b[36m',
  green: '\u001b[32m',
  yellow: '\u001b[33m',
  red: '\u001b[31m',
  gray: '\u001b[90m'
});

const iconByLevel = Object.freeze({
  info: 'ℹ',
  success: '✔',
  warn: '⚠',
  error: '✖'
});

const colorize = (color, value) => `${colors[color]}${value}${colors.reset}`;

export const printBanner = () => {
  const lines = [
    '╔════════════════════════════════════════════════════════╗',
    '║                 AI COORDINATOR CLI                    ║',
    '║           Multi-Agent Skills Orchestration            ║',
    '╚════════════════════════════════════════════════════════╝'
  ];

  process.stdout.write(`${colorize('cyan', lines.join('\n'))}\n`);
  process.stdout.write(`${colorize('gray', 'by tdphat.io.vn')}\n\n`);
};

export const printMessage = (level, message) => {
  const icon = iconByLevel[level] || iconByLevel.info;
  const color = level === 'success' ? 'green' : level === 'warn' ? 'yellow' : level === 'error' ? 'red' : 'cyan';
  process.stdout.write(`${colorize(color, `${icon} ${message}`)}\n`);
};

export const printTable = (title, rows) => {
  process.stdout.write(`${colorize('cyan', `\n${title}`)}\n`);
  for (const row of rows) {
    process.stdout.write(`- ${row}\n`);
  }
};

export const printJson = (value) => {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
};
