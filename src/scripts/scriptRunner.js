import { createScriptContext } from './scriptApi';
import useScriptStore from '../store/useScriptStore';

const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;

/**
 * Run a script definition. Shows the output panel and streams logs.
 * @param {object} scriptDef - Script definition with { id, name, language, code, ... }
 * @param {object} options - { selectedNode } for context menu invocations
 */
export async function runScript(scriptDef, options = {}) {
  const store = useScriptStore.getState();

  if (store.scriptOutput.isRunning) {
    window.alert('A script is already running. Please wait for it to finish.');
    return;
  }

  store.resetOutput();
  store.setScriptOutput({ isRunning: true, scriptName: scriptDef.name });
  store.setShowOutputPanel(true);

  const ctx = createScriptContext({
    onLog: (msg, level) => useScriptStore.getState().appendLog(msg, level),
    onProgress: (current, total) =>
      useScriptStore.getState().setScriptOutput({ progress: { current, total } }),
    selectedNode: options.selectedNode || null,
  });

  try {
    ctx.log(`Running "${scriptDef.name}"...`);

    const fn = new AsyncFunction('ctx', scriptDef.code);
    await fn(ctx);

    ctx.log('Script completed successfully.');

    // Refresh file tree in case scripts created/modified files
    await ctx.refreshFileTree();
  } catch (err) {
    useScriptStore.getState().appendLog(`Error: ${err.message}`, 'error');
    useScriptStore.getState().setScriptOutput({ error: err.message });
  } finally {
    useScriptStore.getState().setScriptOutput({ isRunning: false });
  }
}
