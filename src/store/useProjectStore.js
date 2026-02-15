import { create } from 'zustand';
import { saveHandle, loadHandle } from '../services/idbHandleStore';
import { initArcwrite, readSettings, writeSettings, ensureDir } from '../services/arcwriteFS';
import useAppStore from './useAppStore';
import useEditorStore from './useEditorStore';

/**
 * Central project system store.
 * Persistence target is the Arcwrite/ folder on disk (via File System Access API).
 * The Arcwrite/ directory handle is persisted in IndexedDB.
 *
 * Permission model (Chrome 122+):
 * - On first setup, user picks a parent folder → Arcwrite/ is created inside it
 * - Only the Arcwrite/ handle is stored in IDB (scoped permissions)
 * - On startup, queryPermission() is called silently (no UI)
 * - If the user chose "Allow on every visit", it returns 'granted' → zero prompts
 * - If not, needsReconnect is set and a button is shown (user gesture required)
 */
const useProjectStore = create((set, get) => ({
  // Arcwrite storage folder handle
  arcwriteHandle: null,
  isInitialized: false,
  needsReconnect: false,

  // Settings loaded from disk
  settings: null,

  // Project listings (Phase 2 skeleton)
  bookProjects: [],
  aiProjects: [],
  activeBookProject: null,
  activeAiProject: null,
  activeMode: null,

  /**
   * Set up Arcwrite storage. Called when user picks a parent folder.
   * Creates "Arcwrite/" inside it, persists only that subfolder handle
   * to IndexedDB. The parent handle is not stored anywhere.
   */
  setRootDirectory: async (handle) => {
    const { arcwriteHandle, settings } = await initArcwrite(handle);
    await saveHandle('rootDir', arcwriteHandle);
    set({ arcwriteHandle, isInitialized: true, needsReconnect: false, settings });

    // Migrate settings from localStorage if this is first setup
    await get().migrateFromLocalStorage();

    // Sync loaded settings to useAppStore
    const current = get().settings;
    if (current) {
      useAppStore.getState().syncFromProjectSettings(current);
    }
  },

  /**
   * Try to restore the Arcwrite/ handle from IndexedDB on startup.
   * Uses queryPermission() only — NEVER calls requestPermission() here
   * (no user gesture available in useEffect).
   *
   * If permission was persisted ("Allow on every visit"), returns true silently.
   * If not, sets needsReconnect so the UI can show a reconnect button.
   */
  restoreFromIDB: async () => {
    try {
      const arcwriteHandle = await loadHandle('rootDir');
      if (!arcwriteHandle) return false;

      // Silent check — queryPermission() never shows UI
      const perm = await arcwriteHandle.queryPermission({ mode: 'readwrite' });

      if (perm === 'granted') {
        // Permission persisted (user chose "Allow on every visit")
        await ensureDir(arcwriteHandle, 'projects', 'books');
        await ensureDir(arcwriteHandle, 'projects', 'ai');
        const settings = await readSettings(arcwriteHandle);
        set({ arcwriteHandle, isInitialized: true, needsReconnect: false, settings });

        if (settings) {
          useAppStore.getState().syncFromProjectSettings(settings);
        }
        return true;
      }

      // Permission not persisted — store handle for reconnect button
      set({ arcwriteHandle, needsReconnect: true });
      return false;
    } catch (e) {
      console.warn('[ProjectStore] Failed to restore from IDB:', e.message);
      return false;
    }
  },

  /**
   * Re-grant permission to the Arcwrite/ folder.
   * MUST be called from a user gesture (button click) so that
   * requestPermission() can show Chrome's three-way prompt.
   */
  reconnect: async () => {
    const { arcwriteHandle } = get();
    if (!arcwriteHandle) return false;

    try {
      const perm = await arcwriteHandle.requestPermission({ mode: 'readwrite' });
      if (perm !== 'granted') return false;

      await ensureDir(arcwriteHandle, 'projects', 'books');
      await ensureDir(arcwriteHandle, 'projects', 'ai');
      const settings = await readSettings(arcwriteHandle);
      set({ isInitialized: true, needsReconnect: false, settings });

      if (settings) {
        useAppStore.getState().syncFromProjectSettings(settings);
      }
      return true;
    } catch (e) {
      console.error('[ProjectStore] Reconnect failed:', e.message);
      return false;
    }
  },

  /**
   * Reload settings from disk.
   */
  loadSettings: async () => {
    const { arcwriteHandle } = get();
    if (!arcwriteHandle) return;
    const settings = await readSettings(arcwriteHandle);
    set({ settings });
    useAppStore.getState().syncFromProjectSettings(settings);
  },

  /**
   * Update settings: merge patch, write to disk, sync to useAppStore.
   */
  updateSettings: async (patch) => {
    const { arcwriteHandle, settings } = get();
    if (!arcwriteHandle || !settings) return;
    const updated = { ...settings, ...patch };
    if (patch.chatSettings) {
      updated.chatSettings = { ...settings.chatSettings, ...patch.chatSettings };
    }
    await writeSettings(arcwriteHandle, updated);
    set({ settings: updated });
    useAppStore.getState().syncFromProjectSettings(updated);
  },

  /**
   * One-time migration of settings from localStorage to Arcwrite/.
   */
  migrateFromLocalStorage: async () => {
    const { arcwriteHandle, settings } = get();
    if (!arcwriteHandle || !settings) return;

    const appState = useAppStore.getState();
    let needsWrite = false;
    const updated = { ...settings };

    if (!settings.apiKey && appState.apiKey) {
      updated.apiKey = appState.apiKey;
      needsWrite = true;
    }

    if (settings.selectedModel === 'anthropic/claude-sonnet-4-5-20250929' && appState.selectedModel &&
        appState.selectedModel !== 'anthropic/claude-sonnet-4-5-20250929') {
      updated.selectedModel = appState.selectedModel;
      needsWrite = true;
    }

    if (appState.chatSettings) {
      const defaults = { temperature: 1, maxTokens: 4096, toolsEnabled: true, reasoningEnabled: false, promptMode: 'full' };
      const appChat = appState.chatSettings;
      const hasCustom = Object.keys(defaults).some((k) => appChat[k] !== undefined && appChat[k] !== defaults[k]);
      if (hasCustom) {
        updated.chatSettings = { ...settings.chatSettings, ...appChat };
        needsWrite = true;
      }
    }

    const editorTheme = useEditorStore.getState().editorTheme;
    if (editorTheme && editorTheme !== 'light') {
      updated.editorTheme = editorTheme;
      needsWrite = true;
    }

    if (needsWrite) {
      await writeSettings(arcwriteHandle, updated);
      set({ settings: updated });
      console.log('[ProjectStore] Migrated settings from localStorage to Arcwrite/');
    }
  },
}));

export default useProjectStore;
