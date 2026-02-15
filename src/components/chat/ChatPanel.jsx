import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import useChatStore from '../../store/useChatStore';
import useAppStore from '../../store/useAppStore';
import useChatSend from '../../hooks/useChatSend';
import ChatMessage from './ChatMessage';
import ChatSettings from './ChatSettings';
import { stripActionBlocks } from '../../api/chatStreaming';
import { buildChatSystemPrompt } from '../../chat/contextBuilder';
import { buildEditModePrompt, PROMPT_MODES } from '../../chat/editPrompts';
import { modelSupportsTools } from '../../api/claude';
import useEditorStore from '../../store/useEditorStore';

export default function ChatPanel() {
  const isOpen = useChatStore((s) => s.isOpen);
  const messages = useChatStore((s) => s.messages);
  const isStreaming = useChatStore((s) => s.isStreaming);
  const streamBuffer = useChatStore((s) => s.streamBuffer);
  const error = useChatStore((s) => s.error);
  const clearMessages = useChatStore((s) => s.clearMessages);

  const [input, setInput] = useState('');
  const [showSystemPrompt, setShowSystemPrompt] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [systemPromptText, setSystemPromptText] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const selectedModel = useAppStore((s) => s.selectedModel);
  const setSelectedModel = useAppStore((s) => s.setSelectedModel);
  const availableModels = useAppStore((s) => s.availableModels);
  const chatSettings = useAppStore((s) => s.chatSettings);
  const sendMessage = useChatSend();
  const location = useLocation();

  const model = availableModels.find((m) => m.id === selectedModel);
  const toolsActive = chatSettings.toolsEnabled && modelSupportsTools(model);

  /** Shorten a model ID for display: strip date suffix, keep provider. */
  const shortName = (id) => id.replace(/-\d{8}$/, '');

  /** Format per-M price compactly: 0.40 → ".40", 5.00 → "5", 15.00 → "15" */
  const compactPrice = (priceStr) => {
    const p = parseFloat(priceStr) * 1e6;
    if (!p || isNaN(p)) return '?';
    if (p < 1) return p.toFixed(2).replace(/^0/, '');
    if (p % 1 === 0) return p.toFixed(0);
    return p.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
  };

  // Pad model names so prices align at right edge (monospace)
  const maxNameLen = availableModels.reduce((max, m) => Math.max(max, shortName(m.id).length), 0);

  /** Build option label: "provider/model      in/out" with padding */
  const optionLabel = (m) => {
    const name = shortName(m.id);
    if (!m.pricing) return name;
    const price = `${compactPrice(m.pricing.prompt)}/${compactPrice(m.pricing.completion)}`;
    const pad = '\u2002'.repeat(Math.max(1, maxNameLen - name.length + 2));
    return `${name}${pad}${price}`;
  };

  // Rebuild the system prompt each time the user opens the viewer
  const handleToggleSystemPrompt = () => {
    if (!showSystemPrompt) {
      const promptMode = chatSettings.promptMode || 'full';
      if (promptMode === 'off') {
        setSystemPromptText('(No system prompt — plain conversation mode)');
      } else if (promptMode === 'full') {
        setSystemPromptText(buildChatSystemPrompt(location.pathname));
      } else {
        const editPrompt = buildEditModePrompt(promptMode, useEditorStore.getState());
        setSystemPromptText(editPrompt || '(No prompt for this mode)');
      }
    }
    setShowSystemPrompt(!showSystemPrompt);
  };

  const activeModeName = PROMPT_MODES.find((m) => m.key === (chatSettings.promptMode || 'full'))?.name || 'Full Context';

  // Auto-scroll to bottom on new messages or stream updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamBuffer]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const abortStream = useChatStore((s) => s.abortStream);

  const handleSend = () => {
    const text = input.trim();
    if (!text || isStreaming) return;
    setInput('');
    sendMessage(text);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
      <div className="flex flex-col h-full bg-white text-black">
        {/* Header */}
        <div className="p-3 border-b border-black/15 shrink-0 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <h2 className="text-sm font-bold text-black shrink-0">AI</h2>
              {availableModels.length > 0 ? (
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="text-[10px] font-mono bg-gray-100 text-gray-600 rounded px-1 py-0.5 border-none outline-none cursor-pointer hover:bg-gray-200 transition-colors min-w-0 truncate"
                  title={selectedModel}
                >
                  {availableModels.map((m) => (
                    <option key={m.id} value={m.id}>{optionLabel(m)}</option>
                  ))}
                </select>
              ) : (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 font-mono truncate max-w-[180px]" title={selectedModel}>
                  {shortName(selectedModel)}
                </span>
              )}
              {toolsActive && (chatSettings.promptMode || 'full') === 'full' && (
                <span className="text-[9px] px-1 py-0.5 rounded bg-green-100 text-green-700 font-medium shrink-0">
                  tools
                </span>
              )}
              {(chatSettings.promptMode || 'full') !== 'full' && (
                <span className="text-[9px] px-1 py-0.5 rounded bg-purple-100 text-purple-700 font-medium shrink-0">
                  {activeModeName}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => { setShowSettings(!showSettings); if (!showSettings) setShowSystemPrompt(false); }}
                className={`px-1.5 py-1 rounded transition-colors ${
                  showSettings
                    ? 'bg-black text-white'
                    : 'text-gray-500 hover:text-black hover:bg-gray-100'
                }`}
                title="Chat settings"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"/>
                  <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.421 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.421-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"/>
                </svg>
              </button>
              <button
                onClick={handleToggleSystemPrompt}
                className={`text-xs px-2 py-1 rounded transition-colors ${
                  showSystemPrompt
                    ? 'bg-black text-white'
                    : 'text-gray-500 hover:text-black hover:bg-gray-100'
                }`}
                title="View system prompt"
              >
                Prompt
              </button>
              <button
                onClick={() => {
                  if (messages.length === 0 || window.confirm('Start a new chat? Current messages will be cleared.')) {
                    clearMessages();
                  }
                }}
                className="text-gray-500 hover:text-black px-1.5 py-1 rounded hover:bg-gray-100 transition-colors"
                title="New chat"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="12" height="10" rx="1.5" />
                  <line x1="5" y1="6.5" x2="11" y2="6.5" />
                  <line x1="5" y1="9.5" x2="9" y2="9.5" />
                  <path d="M12 1v3M14 2h-4" strokeWidth="1.5" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Chat settings panel */}
        {showSettings && (
          <ChatSettings onClose={() => setShowSettings(false)} />
        )}

        {/* System prompt viewer */}
        {showSystemPrompt && (
          <div className="border-b border-black/15 bg-gray-50 shrink-0 max-h-[60%] overflow-y-auto">
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-500 uppercase">System Prompt — {activeModeName}</span>
                <button
                  onClick={() => setShowSystemPrompt(false)}
                  className="text-xs text-gray-400 hover:text-black"
                >
                  {'\u2715'}
                </button>
              </div>
              <pre className="text-[11px] text-black whitespace-pre-wrap break-words font-mono leading-relaxed">
                {systemPromptText}
              </pre>
            </div>
          </div>
        )}

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white">
          {messages.length === 0 && !isStreaming && (
            <div className="text-center text-gray-400 text-sm mt-8">
              <p className="mb-2">Ask me about your story.</p>
              <p className="text-xs text-gray-400">
                I can read and modify your scaffold beats, genre settings, chapter scores, and more.
              </p>
            </div>
          )}

          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}

          {/* Streaming: show partial response */}
          {isStreaming && streamBuffer && (
            <div className="bg-white rounded-lg border border-black/15 p-3 text-sm text-black">
              <div className="whitespace-pre-wrap break-words leading-relaxed">
                {stripActionBlocks(streamBuffer)}
              </div>
              <span className="inline-block w-1.5 h-4 bg-black ml-0.5 animate-pulse" />
            </div>
          )}

          {/* Streaming: waiting for first chunk */}
          {isStreaming && !streamBuffer && (
            <div className="flex gap-1.5 p-3">
              <span className="w-2 h-2 bg-black/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-black/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-black/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          )}

          {/* Error display */}
          {error && (
            <div className="bg-red-50 border border-red-300 rounded p-3 text-xs text-red-700">
              {error}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="p-3 border-t border-black/15 shrink-0 bg-white">
          <div className="relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your story..."
              rows={2}
              className="w-full bg-white border border-black/20 rounded-lg pl-3 pr-10 py-2 text-sm text-black resize-none focus:outline-none focus:border-black/50 placeholder:text-gray-400"
            />
            {isStreaming ? (
              <button
                onClick={abortStream}
                className="absolute right-2 bottom-2 w-7 h-7 flex items-center justify-center bg-black hover:bg-gray-800 rounded-md transition-colors"
                title="Stop generating"
              >
                <span style={{ width: 10, height: 10, background: '#DC2626', borderRadius: 2, display: 'block' }} />
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="absolute right-2 bottom-2 w-7 h-7 flex items-center justify-center bg-black hover:bg-gray-800 disabled:bg-gray-300 disabled:text-gray-500 text-white rounded-md text-sm font-semibold transition-colors"
              >
                {'\u2191'}
              </button>
            )}
          </div>
        </div>
      </div>
  );
}
