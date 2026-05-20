import fs from 'node:fs/promises';
import path from 'node:path';
import { SupportedAssetKinds } from './enums.js';
import { resolveStandardsRoot } from './paths.js';

const requiredMetaKeys = Object.freeze([
  'id',
  'title',
  'description',
  'scope',
  'inputs',
  'outputs',
  'constraints',
  'supported_agents',
  'degradation_mode',
  'source'
]);

const parseFrontmatter = (content) => {
  const match = content.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) {
    return { meta: null, body: content };
  }

  const lines = match[1].split('\n').map((line) => line.trim()).filter(Boolean);
  const meta = {};
  for (const line of lines) {
    const separatorIndex = line.indexOf(':');
    if (separatorIndex === -1) {
      continue;
    }
    const key = line.slice(0, separatorIndex).trim();
    const rawValue = line.slice(separatorIndex + 1).trim();
    if (rawValue.startsWith('[') && rawValue.endsWith(']')) {
      const parsedArray = rawValue
        .slice(1, -1)
        .split(',')
        .map((item) => item.trim().replace(/^"|"$/g, ''))
        .filter(Boolean);
      meta[key] = parsedArray;
    } else {
      meta[key] = rawValue.replace(/^"|"$/g, '');
    }
  }

  return { meta, body: content.slice(match[0].length) };
};

const readFilesByExtension = async (folderPath, extension) => {
  try {
    const entries = await fs.readdir(folderPath, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(extension))
      .map((entry) => path.join(folderPath, entry.name));
  } catch {
    return [];
  }
};

const validateMarkdownAsset = async (filePath) => {
  const content = await fs.readFile(filePath, 'utf8');
  const { meta, body } = parseFrontmatter(content);
  const errors = [];

  if (!meta) {
    errors.push('Missing frontmatter block');
    return errors;
  }

  for (const key of requiredMetaKeys) {
    if (!(key in meta) || meta[key] === '') {
      errors.push(`Missing metadata key: ${key}`);
    }
  }

  if (!body.trim()) {
    errors.push('Missing prompt body content');
  }

  return errors;
};

const validateJsonAsset = async (filePath) => {
  const content = await fs.readFile(filePath, 'utf8');
  const errors = [];
  let parsed;

  try {
    parsed = JSON.parse(content);
  } catch {
    return ['Invalid JSON format'];
  }

  if (!parsed.presetId && !parsed.id) {
    errors.push('Missing id or presetId');
  }
  if (!parsed.description) {
    errors.push('Missing description');
  }
  return errors;
};

export const validateStandards = async () => {
  const standardsRoot = resolveStandardsRoot();
  const report = {
    valid: true,
    checked: 0,
    errors: []
  };

  for (const kind of SupportedAssetKinds) {
    const folder = path.join(standardsRoot, kind);
    if (kind === 'mcp') {
      const files = await readFilesByExtension(folder, '.json');
      for (const filePath of files) {
        const errors = await validateJsonAsset(filePath);
        report.checked += 1;
        if (errors.length > 0) {
          report.valid = false;
          report.errors.push({ filePath, errors });
        }
      }
      continue;
    }

    const files = await readFilesByExtension(folder, '.md');
    for (const filePath of files) {
      const errors = await validateMarkdownAsset(filePath);
      report.checked += 1;
      if (errors.length > 0) {
        report.valid = false;
        report.errors.push({ filePath, errors });
      }
    }
  }

  return report;
};
