import { useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import useAppStore from '../store/useAppStore';
import useChatStore from '../store/useChatStore';
import { callClaudeStreaming, parseActions, stripActionBlocks } from '../api/chatStreaming';
import { executeActions, ACTION_HANDLERS } from '../chat/actionExecutor';
import { buildChatSystemPrompt } from '../chat/contextBuilder';
import { buildEditModePrompt } from '../chat/editPrompts';
import { modelSupportsTools } from '../api/claude';
import { toolDefinitions } from '../chat/toolDefinitions';
import useEditorStore from '../store/useEditorStore';

const MAX_TOOL_ITERATIONS = 5;

export default function useChatSend() {
  const location = useLocation();

  return useCallback(async (userText) => {
    const chat = useChatStore.getState();
    const app = useAppStore.getState();

    if (!app.apiKey) {
      chat.setError('Set your OpenRouter API key in the Analyze workflow first.');
      return;
    }
    if (chat.isStreaming) return;

    // Add user message
    const userMsg = {
      id: `msg_${Date.now()}_u`,
      role: 'user',
      content: userText,
      timestamp: Date.now(),
    };
    chat.addMessage(userMsg);
    chat.setStreaming(true);
    chat.setError(null);
    chat.updateStreamBuffer('');

    const abortController = new AbortController();
    chat.setAbortController(abortController);

    // Determine if native tools are available (only in full context mode)
    const model = app.availableModels.find((m) => m.id === app.selectedModel);
    const promptMode = app.chatSettings.promptMode || 'full';
    const useNativeTools = promptMode === 'full' && app.chatSettings.toolsEnabled && modelSupportsTools(model);

    // Build system prompt based on prompt mode
    let systemPrompt = null;
    if (promptMode === 'full') {
      systemPrompt = buildChatSystemPrompt(location.pathname, { nativeToolsActive: useNativeTools });
    } else if (promptMode !== 'off') {
      systemPrompt = buildEditModePrompt(promptMode, useEditorStore.getState());
    }

    // Debug: log prompt mode and system prompt info
    console.log('[ChatSend] promptMode:', promptMode, '| systemPrompt:', systemPrompt ? `${systemPrompt.substring(0, 80)}... (${systemPrompt.length} chars)` : 'NONE');

    // Get recent conversation history within token budget
    const recentMessages = chat.getRecentMessages(32000);

    const apiMessages = [
      ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
      ...recentMessages.map((m) => ({
        role: m.role === 'action' ? 'assistant' : m.role,
        content: m.content,
      })),
      { role: 'user', content: userText },
    ];

    const settings = {
      model: app.selectedModel,
      maxTokens: app.chatSettings.maxTokens,
      temperature: app.chatSettings.temperature,
    };

    if (useNativeTools) {
      // --- Native tool calling path (agentic loop) ---
      let allActionResults = [];
      let fullResponse = '';
      let iterations = 0;

      while (iterations < MAX_TOOL_ITERATIONS) {
        iterations++;
        fullResponse = '';

        const toolCallsResult = await new Promise((resolve) => {
          callClaudeStreaming(
            app.apiKey,
            apiMessages,
            { ...settings, tools: toolDefinitions, signal: abortController.signal },
            (chunk) => {
              fullResponse += chunk;
              useChatStore.getState().updateStreamBuffer(fullResponse);
            },
            (toolCalls) => resolve(toolCalls),
            (err) => {
              useChatStore.getState().setError(err.message);
              resolve(null);
            }
          );
        });

        // Error or no tool calls → done
        if (!toolCallsResult || Object.keys(toolCallsResult).length === 0) break;

        // Execute tool calls
        const toolCallsArr = Object.values(toolCallsResult);
        const assistantMsg = {
          role: 'assistant',
          content: fullResponse || null,
          tool_calls: toolCallsArr,
        };
        apiMessages.push(assistantMsg);

        for (const tc of toolCallsArr) {
          let result;
          try {
            const args = JSON.parse(tc.function.arguments);
            const handler = ACTION_HANDLERS[tc.function.name];
            if (!handler) throw new Error(`Unknown action: ${tc.function.name}`);
            const desc = await handler({ ...args, type: tc.function.name });
            result = JSON.stringify({ success: true, description: desc });
            allActionResults.push({ success: true, description: desc, type: tc.function.name });
          } catch (e) {
            result = JSON.stringify({ success: false, error: e.message });
            allActionResults.push({ success: false, error: e.message, type: tc.function.name });
          }
          apiMessages.push({ role: 'tool', tool_call_id: tc.id, content: result });
        }
        // Loop back — model sees tool results and may respond or call more tools
      }

      useChatStore.getState().finalizeStream(fullResponse, allActionResults);
    } else {
      // --- Fenced-block fallback (existing path) ---
      let fullResponse = '';

      await callClaudeStreaming(
        app.apiKey,
        apiMessages,
        { ...settings, signal: abortController.signal },
        (chunk) => {
          fullResponse += chunk;
          useChatStore.getState().updateStreamBuffer(fullResponse);
        },
        async () => {
          const actions = parseActions(fullResponse);
          const displayText = stripActionBlocks(fullResponse);
          let actionResults = [];
          if (actions.length > 0) {
            actionResults = await executeActions(actions);
          }
          useChatStore.getState().finalizeStream(displayText, actionResults);
        },
        (err) => {
          useChatStore.getState().setError(err.message);
          useChatStore.getState().setStreaming(false);
          useChatStore.getState().updateStreamBuffer('');
        }
      );
    }
  }, [location.pathname]);
}
