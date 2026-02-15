/**
 * Filesystem abstraction for the .arcwrite/ system folder.
 * All disk I/O for settings and project definitions goes through here.
 */

const DEFAULT_SETTINGS = {
  version: 1,
  apiKey: '',
  selectedModel: 'anthropic/claude-sonnet-4-5-20250929',
  chatSettings: {
    temperature: 1,
    maxTokens: 4096,
    toolsEnabled: true,
    reasoningEnabled: false,
    promptMode: 'full',
  },
  editorTheme: 'light',
};

/**
 * Walk/create nested directories from a parent handle.
 * Returns the final directory handle.
 */
export async function ensureDir(parentHandle, ...pathParts) {
  let current = parentHandle;
  for (const part of pathParts) {
    current = await current.getDirectoryHandle(part, { create: true });
  }
  return current;
}

/**
 * Read and parse a JSON file from a directory handle.
 * Returns null if the file doesn't exist.
 */
export async function readJsonFile(dirHandle, filename) {
  try {
    const fileHandle = await dirHandle.getFileHandle(filename);
    const file = await fileHandle.getFile();
    const text = await file.text();
    return JSON.parse(text);
  } catch (e) {
    if (e.name === 'NotFoundError') return null;
    throw e;
  }
}

/**
 * Write a JSON file to a directory handle.
 */
export async function writeJsonFile(dirHandle, filename, data) {
  const fileHandle = await dirHandle.getFileHandle(filename, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(JSON.stringify(data, null, 2));
  await writable.close();
}

/**
 * Initialize an Arcwrite storage folder inside a parent directory.
 * Creates "Arcwrite/" subfolder (visible, no dot prefix), sets up internal
 * structure, and returns the subfolder handle + settings.
 * Only the returned arcwriteHandle is persisted to IndexedDB — the parent
 * handle is discarded after this call, so future permission prompts scope
 * to "Arcwrite/" only.
 */
export async function initArcwrite(parentHandle) {
  const arcwriteHandle = await parentHandle.getDirectoryHandle('Arcwrite', { create: true });

  await ensureDir(arcwriteHandle, 'projects', 'books');
  await ensureDir(arcwriteHandle, 'projects', 'ai');

  let settings = await readJsonFile(arcwriteHandle, 'settings.json');
  if (!settings) {
    settings = { ...DEFAULT_SETTINGS };
    await writeJsonFile(arcwriteHandle, 'settings.json', settings);
  }

  return { arcwriteHandle, settings };
}

/**
 * Read settings from .arcwrite/settings.json.
 */
export async function readSettings(arcwriteHandle) {
  const settings = await readJsonFile(arcwriteHandle, 'settings.json');
  return settings || { ...DEFAULT_SETTINGS };
}

/**
 * Write settings to .arcwrite/settings.json.
 */
export async function writeSettings(arcwriteHandle, settings) {
  await writeJsonFile(arcwriteHandle, 'settings.json', settings);
}
