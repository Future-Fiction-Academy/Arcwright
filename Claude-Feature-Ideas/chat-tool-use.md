# Chat Panel: Native Tool Use & Model-Aware Settings

## Status: COMPLETE (Feb 2025)

All 8 implementation steps done:
1. Full model metadata stored from OpenRouter (`supported_parameters`, `context_length`, `pricing`, etc.)
2. `chatSettings` state in store (temperature, maxTokens, toolsEnabled, reasoningEnabled) — persisted
3. `ChatSettings` component with model-aware enable/disable per parameter
4. Streaming API handles `tools`, `tool_choice`, `temperature` in request body
5. 18 tool schemas defined in `src/chat/toolDefinitions.js` matching all ACTION_HANDLERS
6. Tool call accumulation from streaming SSE deltas (keyed by `tc.index`)
7. Agentic tool loop in `useChatSend.js` — up to 5 iterations with tool result feedback
8. Conditional system prompt — skips fenced-block instructions when native tools active

### Files Modified
- `src/api/claude.js` — model metadata + `modelSupportsTools()`
- `src/api/chatStreaming.js` — tool call streaming
- `src/hooks/useChatSend.js` — agentic loop (native) + fenced-block fallback
- `src/chat/contextBuilder.js` — conditional action instructions
- `src/store/useAppStore.js` — chatSettings state
- `src/components/chat/ChatPanel.jsx` — gear icon, tools badge, pricing in dropdown

### Files Created
- `src/chat/toolDefinitions.js` — 18 OpenAI-format tool schemas
- `src/components/chat/ChatSettings.jsx` — settings panel with model info
