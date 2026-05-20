import fs from 'node:fs/promises';
import path from 'node:path';

export const readJsonFile = async (filePath, fallbackValue) => {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      return fallbackValue;
    }
    throw error;
  }
};

export const writeJsonFile = async (filePath, value) => {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
};

export const fileExists = async (filePath) => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

export const safeStat = async (filePath) => {
  try {
    return await fs.lstat(filePath);
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      return null;
    }
    throw error;
  }
};

export const removePath = async (targetPath) => {
  await fs.rm(targetPath, { recursive: true, force: true });
};

export const copyPath = async (sourcePath, targetPath) => {
  await fs.cp(sourcePath, targetPath, { recursive: true, force: true });
};

export const ensureDir = async (targetPath) => {
  await fs.mkdir(targetPath, { recursive: true });
};

export const readDirNames = async (targetPath) => {
  try {
    const entries = await fs.readdir(targetPath, { withFileTypes: true });
    return entries.map((entry) => entry.name);
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
};
