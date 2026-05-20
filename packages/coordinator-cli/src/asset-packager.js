import fs from 'node:fs/promises';
import path from 'node:path';
import { AssetKind, AssetLayout, SupportedAssetKinds } from './enums.js';
import { ensureDir, readDirNames, removePath } from './io.js';
import { resolveCoordinatorRoot } from './paths.js';

const parseFrontmatter = (content) => {
  const matched = content.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!matched) {
    return { metadata: {}, body: content.trim() };
  }

  const metadata = {};
  for (const line of matched[1].split('\n')) {
    const index = line.indexOf(':');
    if (index <= 0) {
      continue;
    }
    const key = line.slice(0, index).trim();
    const value = line.slice(index + 1).trim();
    metadata[key] = value;
  }

  const body = content.slice(matched[0].length).trim();
  return { metadata, body };
};

const normalizeSlug = (value) => String(value || '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

const createSkillMarkdown = (title, description, body) => {
  const lines = [];
  lines.push(`# ${title}`);
  if (description) {
    lines.push('');
    lines.push(description);
  }
  if (body) {
    lines.push('');
    lines.push('## Instructions');
    lines.push('');
    lines.push(body);
  }
  return `${lines.join('\n').trim()}\n`;
};

const createOpenAiYaml = (name, description) => {
  const safeName = String(name || 'skill').replace(/"/g, '\\"');
  const safeDescription = String(description || '').replace(/"/g, '\\"');
  return `name: "${safeName}"\ndescription: "${safeDescription}"\n`;
};

const packageCodexSkills = async (sourcePath, targetPath) => {
  await removePath(targetPath);
  await ensureDir(targetPath);

  const entries = await readDirNames(sourcePath);
  for (const entry of entries) {
    if (!entry.toLowerCase().endsWith('.md')) {
      continue;
    }
    const filePath = path.join(sourcePath, entry);
    const content = await fs.readFile(filePath, 'utf8');
    const { metadata, body } = parseFrontmatter(content);
    const fallbackName = entry.replace(/\.md$/i, '');
    const slug = normalizeSlug(metadata.id || metadata.title || fallbackName) || normalizeSlug(fallbackName) || 'skill';
    const displayTitle = metadata.title || metadata.id || fallbackName;
    const description = metadata.description || '';

    const skillRoot = path.join(targetPath, slug);
    const agentsDir = path.join(skillRoot, 'agents');

    await ensureDir(agentsDir);
    await fs.writeFile(path.join(skillRoot, 'SKILL.md'), createSkillMarkdown(displayTitle, description, body), 'utf8');
    await fs.writeFile(path.join(agentsDir, 'openai.yaml'), createOpenAiYaml(slug, description), 'utf8');
  }
};

const resolveLayout = (adapter, kind) => {
  const configured = adapter?.assetLayouts?.[kind];
  if (configured) {
    return configured;
  }
  return AssetLayout.STANDARD_TREE;
};

const buildGeneratedRoot = () => path.join(resolveCoordinatorRoot(), 'generated-assets');

export const prepareAssetSources = async (selectedAgents, adapters, standardsRoot) => {
  const generatedRoot = buildGeneratedRoot();
  await ensureDir(generatedRoot);

  const sources = {};

  for (const agent of selectedAgents) {
    const adapter = adapters[agent] || {};
    const perAgent = {};

    for (const kind of SupportedAssetKinds) {
      const canonicalSource = path.join(standardsRoot, kind);
      const layout = resolveLayout(adapter, kind);

      if (layout === AssetLayout.CODEX_SKILL_PACKAGE && kind === AssetKind.SKILLS) {
        const generatedPath = path.join(generatedRoot, agent, kind);
        await packageCodexSkills(canonicalSource, generatedPath);
        perAgent[kind] = generatedPath;
        continue;
      }

      perAgent[kind] = canonicalSource;
    }

    sources[agent] = perAgent;
  }

  return sources;
};
