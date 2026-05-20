const colors = Object.freeze({
  reset: '\u001b[0m',
  cyan: '\u001b[36m',
  blue: '\u001b[34m',
  brightBlue: '\u001b[94m',
  orange: '\u001b[38;5;214m',
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
let bannerPrinted = false;

const stripAnsi = (value) => value.replace(/\u001b\[[0-9;]*m/g, '');

const padRight = (value, length) => {
  const cleaned = stripAnsi(value);
  const pad = Math.max(0, length - cleaned.length);
  return `${value}${' '.repeat(pad)}`;
};

const createBox = (title, lines, accentColor = 'brightBlue') => {
  const width = Math.max(
    stripAnsi(title).length + 4,
    ...lines.map((line) => stripAnsi(line).length + 2),
    36
  );

  const top = `┌${'─'.repeat(width)}┐`;
  const middle = lines.map((line) => `│ ${padRight(line, width - 1)}│`);
  const titleLine = `│ ${padRight(colorize('orange', title), width - 1)}│`;
  const divider = `├${'─'.repeat(width)}┤`;
  const bottom = `└${'─'.repeat(width)}┘`;
  return colorize(accentColor, [top, titleLine, divider, ...middle, bottom].join('\n'));
};

const getTerminalSize = () => ({
  width: process.stdout.columns || 120,
  height: process.stdout.rows || 40
});

const centerLines = (lines) => {
  const { width, height } = getTerminalSize();
  const topPadding = Math.max(0, Math.floor((height - lines.length) / 2));
  const paddedLines = lines.map((line) => {
    const lineLength = stripAnsi(line).length;
    const leftPadding = Math.max(0, Math.floor((width - lineLength) / 2));
    return `${' '.repeat(leftPadding)}${line}`;
  });
  return `${'\n'.repeat(topPadding)}${paddedLines.join('\n')}\n`;
};

const getBannerLines = () => {
  const pixelLogo = [
    '████████╗██████╗ ██████╗ ██╗  ██╗ █████╗ ████████╗',
    '╚══██╔══╝██╔══██╗██╔══██╗██║  ██║██╔══██╗╚══██╔══╝',
    '   ██║   ██║  ██║██████╔╝███████║███████║   ██║   ',
    '   ██║   ██║  ██║██╔═══╝ ██╔══██║██╔══██║   ██║   ',
    '   ██║   ██████╔╝██║     ██║  ██║██║  ██║   ██║   ',
    '   ╚═╝   ╚═════╝ ╚═╝     ╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝   ',
    '',
    '██╗   ██╗████████╗██╗██╗     ███████╗',
    '██║   ██║╚══██╔══╝██║██║     ██╔════╝',
    '██║   ██║   ██║   ██║██║     ███████╗',
    '██║   ██║   ██║   ██║██║     ╚════██║',
    '╚██████╔╝   ██║   ██║███████╗███████║',
    ' ╚═════╝    ╚═╝   ╚═╝╚══════╝╚══════╝'
  ];

  const logoLines = pixelLogo.map((line, index) => {
    if (index < 6) {
      return colorize('brightBlue', line);
    }
    if (index === 6) {
      return line;
    }
    return colorize('orange', line);
  });

  const shell = createBox('TDPhat Utils', [
    'AI Coordinator CLI',
    'Multi-Agent Skills Orchestration',
    'https://tdphat.io.vn/'
  ]);

  return [...logoLines, ...shell.split('\n')];
};

export const renderInteractiveScreen = (title, rows, footer) => {
  const lines = [
    ...getBannerLines(),
    '',
    colorize('cyan', title),
    ...rows,
    '',
    colorize('gray', footer)
  ];
  process.stdout.write(centerLines(lines));
};

export const printBanner = (force = false) => {
  if (bannerPrinted && !force) {
    return;
  }
  process.stdout.write(`${getBannerLines().join('\n')}\n\n`);
  bannerPrinted = true;
};

export const printMessage = (level, message) => {
  const icon = iconByLevel[level] || iconByLevel.info;
  const color = level === 'success' ? 'green' : level === 'warn' ? 'yellow' : level === 'error' ? 'red' : 'brightBlue';
  process.stdout.write(`${colorize(color, `${icon} ${message}`)}\n`);
};

export const printTable = (title, rows) => {
  const normalized = rows.map((row) => `• ${row}`);
  process.stdout.write(`\n${createBox(title, normalized)}\n`);
};

export const printCommandCard = (title, keyValues) => {
  const lines = Object.entries(keyValues).map(([key, value]) => {
    const normalized = Array.isArray(value) ? value.join(', ') : String(value);
    return `${colorize('cyan', key.padEnd(18, ' '))} ${normalized}`;
  });
  process.stdout.write(`${createBox(title, lines, 'blue')}\n`);
};

export const printJson = (value) => {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
};
