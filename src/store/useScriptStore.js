import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useScriptStore = create(
  persist(
    (set) => ({
      userScripts: [],

      // --- Execution state (not persisted) ---
      scriptOutput: {
        isRunning: false,
        scriptName: '',
        logs: [],
        progress: null,
        error: null,
      },
      showOutputPanel: false,

      // --- Script CRUD ---
      addScript: (script) => set((s) => ({
        userScripts: [...s.userScripts, { ...script, id: `script_${Date.now()}` }],
      })),
      updateScript: (id, updates) => set((s) => ({
        userScripts: s.userScripts.map((sc) => (sc.id === id ? { ...sc, ...updates } : sc)),
      })),
      removeScript: (id) => set((s) => ({
        userScripts: s.userScripts.filter((sc) => sc.id !== id),
      })),

      // --- Output management ---
      setScriptOutput: (updates) => set((s) => ({
        scriptOutput: { ...s.scriptOutput, ...updates },
      })),
      appendLog: (message, level = 'info') => set((s) => ({
        scriptOutput: {
          ...s.scriptOutput,
          logs: [...s.scriptOutput.logs, { timestamp: Date.now(), message, level }],
        },
      })),
      resetOutput: () => set({
        scriptOutput: { isRunning: false, scriptName: '', logs: [], progress: null, error: null },
      }),
      setShowOutputPanel: (v) => set({ showOutputPanel: v }),
    }),
    {
      name: 'script-store',
      partialize: (state) => ({
        userScripts: state.userScripts,
      }),
    }
  )
);

export default useScriptStore;
