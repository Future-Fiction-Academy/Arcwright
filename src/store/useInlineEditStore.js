import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const MAX_HISTORY = 30;

const useInlineEditStore = create(
  persist(
    (set) => ({
      promptHistory: [],
      lastPrompt: '',

      addPrompt: (text) => {
        const trimmed = text.trim();
        if (!trimmed) return;
        set((s) => {
          const filtered = s.promptHistory.filter((p) => p !== trimmed);
          const updated = [trimmed, ...filtered].slice(0, MAX_HISTORY);
          return { promptHistory: updated, lastPrompt: trimmed };
        });
      },

      removePrompt: (text) => {
        set((s) => ({
          promptHistory: s.promptHistory.filter((p) => p !== text),
        }));
      },

      clearHistory: () => set({ promptHistory: [], lastPrompt: '' }),
    }),
    { name: 'inline-edit-store' }
  )
);

export default useInlineEditStore;
