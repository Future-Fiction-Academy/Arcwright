import useAppStore from '../store/useAppStore';
import useEditorStore from '../store/useEditorStore';
import { buildFileTree } from '../components/edit/FilePanel';

export const ACTION_HANDLERS = {
  // --- Scaffold ---
  updateBeat: ({ id, updates }) => {
    useAppStore.getState().updateBeat(id, updates);
    const fields = Object.entries(updates).map(([k, v]) => `${k}=${v}`).join(', ');
    return `Updated beat ${id}: ${fields}`;
  },
  addBeat: ({ beat }) => {
    useAppStore.getState().addBeat(beat);
    return `Added beat "${beat.label || 'untitled'}" at ${beat.time}%`;
  },
  removeBeat: ({ id }) => {
    useAppStore.getState().removeBeat(id);
    return `Removed beat ${id}`;
  },
  clearScaffold: () => {
    useAppStore.getState().clearScaffold();
    return 'Cleared all scaffold beats';
  },

  // --- Genre config ---
  setGenre: ({ genre }) => {
    useAppStore.getState().setGenre(genre);
    return `Changed genre to ${genre}`;
  },
  setSubgenre: ({ subgenre }) => {
    useAppStore.getState().setSubgenre(subgenre);
    return `Changed subgenre to ${subgenre}`;
  },
  setModifier: ({ modifier }) => {
    useAppStore.getState().setModifier(modifier);
    return modifier ? `Set modifier to ${modifier}` : 'Cleared modifier';
  },
  setPacing: ({ pacing }) => {
    useAppStore.getState().setPacing(pacing);
    return pacing ? `Set pacing to ${pacing}` : 'Cleared pacing';
  },
  updateWeight: ({ key, value }) => {
    useAppStore.getState().updateWeight(key, value);
    return `Updated weight ${key} to ${value}`;
  },
  resetWeights: () => {
    useAppStore.getState().resetWeights();
    return 'Reset weights to genre defaults';
  },

  // --- Blending ---
  setBlendEnabled: ({ enabled }) => {
    useAppStore.getState().setBlendEnabled(enabled);
    return enabled ? 'Enabled genre blending' : 'Disabled genre blending';
  },
  setSecondaryGenre: ({ genre }) => {
    useAppStore.getState().setSecondaryGenre(genre);
    return `Set secondary genre to ${genre}`;
  },
  setSecondarySubgenre: ({ subgenre }) => {
    useAppStore.getState().setSecondarySubgenre(subgenre);
    return `Set secondary subgenre to ${subgenre}`;
  },
  setBlendRatio: ({ ratio }) => {
    useAppStore.getState().setBlendRatio(ratio);
    return `Set blend ratio to ${ratio}%`;
  },

  // --- Analysis ---
  updateChapterScores: ({ chapterId, scores }) => {
    useAppStore.getState().updateChapterScores(chapterId, scores, 'user');
    return `Updated scores for chapter ${chapterId}`;
  },
  removeChapter: ({ id }) => {
    useAppStore.getState().removeChapter(id);
    return `Removed chapter ${id}`;
  },
  setProjectionPercent: ({ percent }) => {
    useAppStore.getState().setProjectionPercent(percent);
    return `Set projection to ${percent}%`;
  },

  // --- Visibility ---
  toggleDimension: ({ dim }) => {
    useAppStore.getState().toggleDimension(dim);
    return `Toggled ${dim} visibility`;
  },

  // --- Edit workflow ---
  writeFile: async ({ path, content }) => {
    const editorState = useEditorStore.getState();
    const rootHandle = editorState.directoryHandle;
    if (!rootHandle) throw new Error('No directory open in the editor');
    if (!path || !content) throw new Error('path and content are required');

    // Walk subdirectories to get parent, creating as needed
    const parts = path.split('/').filter(Boolean);
    const filename = parts.pop();
    if (!filename) throw new Error('Invalid file path');
    let dirHandle = rootHandle;
    for (const part of parts) {
      dirHandle = await dirHandle.getDirectoryHandle(part, { create: true });
    }

    // Create and write the file
    const fileHandle = await dirHandle.getFileHandle(filename, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(content);
    await writable.close();

    // Refresh file tree
    const tree = await buildFileTree(rootHandle);
    useEditorStore.getState().setFileTree(tree);

    // Open in secondary pane if dual-pane is on, otherwise primary
    const tabId = path;
    const { dualPane } = useEditorStore.getState();
    if (dualPane) {
      const tabs = useEditorStore.getState().tabs;
      const existing = tabs.find((t) => t.id === tabId);
      if (existing) {
        useEditorStore.getState().setSecondaryTab(tabId);
      } else {
        useEditorStore.setState((s) => ({
          tabs: [...s.tabs, { id: tabId, title: filename, content, dirty: false, fileHandle }],
          secondaryTabId: tabId,
        }));
      }
    } else {
      editorState.openTab(tabId, filename, content, fileHandle);
    }

    const words = content.trim().split(/\s+/).filter(Boolean).length;
    return `Created "${path}" (${words} words) and opened in editor`;
  },
};

/**
 * Execute an array of parsed action groups against the Zustand store.
 * Returns array of { success, description, type } or { success: false, error, type }.
 */
export async function executeActions(actions) {
  const results = [];
  for (const group of actions) {
    if (group.error) {
      results.push({ success: false, error: `Parse error: ${group.error}` });
      continue;
    }
    for (const action of group.data) {
      const handler = ACTION_HANDLERS[action.type];
      if (!handler) {
        results.push({ success: false, error: `Unknown action: ${action.type}`, type: action.type });
        continue;
      }
      try {
        const description = await handler(action);
        results.push({ success: true, description, type: action.type });
      } catch (e) {
        results.push({ success: false, error: e.message, type: action.type });
      }
    }
  }
  return results;
}
