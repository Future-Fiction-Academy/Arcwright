import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import useChatStore from '../../store/useChatStore';
import useAppStore from '../../store/useAppStore';
import useProjectStore from '../../store/useProjectStore';
import useChatSend from '../../hooks/useChatSend';
import ChatMessage from './ChatMessage';
import { stripActionBlocks } from '../../api/chatStreaming';
import { buildChatSystemPrompt, buildAiProjectSystemPrompt } from '../../chat/contextBuilder';
import { buildEditModePrompt } from '../../chat/editPrompts';
import { modelSupportsTools } from '../../api/claude';
import { PROVIDERS } from '../../api/providers';
import { useOpenSettings } from '../layout/AppShell';
import useEditorStore from '../../store/useEditorStore';

export default function ChatPanel() {
  const isOpen = useChatStore((s) => s.isOpen);
  const messages = useChatStore((s) => s.messages);
  const isStreaming = useChatStore((s) => s.isStreaming);
  const streamBuffer = useChatStore((s) => s.streamBuffer);
  const error = useChatStore((s) => s.error);
  const clearMessages = useChatStore((s) => s.clearMessages);
  const truncateAfter = useChatStore((s) => s.truncateAfter);
  const truncateFrom = useChatStore((s) => s.truncateFrom);

  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [showSystemPrompt, setShowSystemPrompt] = useState(false);
  const [showFiles, setShowFiles] = useState(false);
  const [systemPromptText, setSystemPromptText] = useState('');
  const [editingMessageId, setEditingMessageId] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const activeProvider = useAppStore((s) => s.activeProvider);
  const providers = useAppStore((s) => s.providers);
  const chatSettings = useAppStore((s) => s.chatSettings);
  const sendMessage = useChatSend();
  const location = useLocation();
  const openSettings = useOpenSettings();

  const activeAiProject = useProjectStore((s) => s.activeAiProject);
  const activeBookProject = useProjectStore((s) => s.activeBookProject);
  const activeMode = useProjectStore((s) => s.activeMode);

  const fileTree = useEditorStore((s) => s.fileTree);
  const directoryHandle = useEditorStore((s) => s.directoryHandle);

  const providerState = providers[activeProvider] || {};
  const providerConfig = PROVIDERS[activeProvider];
  const allModels = providerState.availableModels?.length > 0
    ? providerState.availableModels
    : (providerConfig?.hardcodedModels || []);
  const model = allModels.find((m) => m.id === providerState.selectedModel);
  const toolsActive = chatSettings.toolsEnabled && modelSupportsTools(model);
  const hasFiles = fileTree && fileTree.length > 0;

  /** Shorten a model ID for display: strip date suffix. */
  const shortName = (id) => id.replace(/-\d{8}$/, '');

  // Rebuild the system prompt each time the user opens the viewer
  const handleToggleSystemPrompt = () => {
    if (!showSystemPrompt) {
      if (activeAiProject && activeMode === 'ai') {
        setSystemPromptText(buildAiProjectSystemPrompt(activeAiProject, useEditorStore.getState(), location.pathname));
      } else {
        const promptMode = chatSettings.promptMode || 'full';
        if (promptMode === 'off') {
          setSystemPromptText('(No system prompt \u2014 plain conversation mode)');
        } else if (promptMode === 'full') {
          setSystemPromptText(buildChatSystemPrompt(location.pathname));
        } else {
          const editPrompt = buildEditModePrompt(promptMode, useEditorStore.getState());
          setSystemPromptText(editPrompt || '(No prompt for this mode)');
        }
      }
    }
    setShowSystemPrompt(!showSystemPrompt);
  };

  // Display name for the current mode/project
  const promptLabel = activeMode === 'ai' && activeAiProject
    ? activeAiProject.name
    : activeMode === 'book' && activeBookProject
      ? activeBookProject
      : 'Full Context';

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

  // Handle file attachment
  const handleAttachFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newAttachments = [];
    for (const file of files) {
      try {
        const content = await file.text();
        newAttachments.push({
          name: file.name,
          content,
          size: file.size,
        });
      } catch (err) {
        console.warn('[ChatPanel] Failed to read file:', file.name, err.message);
      }
    }

    setAttachments((prev) => [...prev, ...newAttachments]);
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSend = () => {
    const text = input.trim();
    if ((!text && attachments.length === 0) || isStreaming) return;

    // Build message content with attachments
    let messageContent = text;
    if (attachments.length > 0) {
      const attachmentText = attachments.map((att) =>
        `\n\n---\n**Attached file: ${att.name}**\n\`\`\`\n${att.content}\n\`\`\``
      ).join('');
      messageContent = text + attachmentText;
    }

    setInput('');
    setAttachments([]);
    setEditingMessageId(null);
    sendMessage(messageContent);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Handle copy action
  const handleCopy = () => {
    // Could show a toast notification here
  };

  // Handle regenerate - find the last user message and regenerate from there
  const handleRegenerate = (assistantMessage) => {
    // Find the user message that preceded this assistant message
    const msgIndex = messages.findIndex((m) => m.id === assistantMessage.id);
    if (msgIndex <= 0) return;

    // Find the last user message before this assistant message
    let userMsgIndex = -1;
    for (let i = msgIndex - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        userMsgIndex = i;
        break;
      }
    }
    if (userMsgIndex === -1) return;

    const userMessage = messages[userMsgIndex];
    // Truncate to just before the user message, then resend
    truncateFrom(userMessage.id);
    setTimeout(() => sendMessage(userMessage.content), 100);
  };

  // Handle edit - populate input with message content and remove it + subsequent messages
  const handleEdit = (message) => {
    setInput(message.content);
    setEditingMessageId(message.id);
    truncateFrom(message.id);
    inputRef.current?.focus();
  };

  return (
      <div className="flex flex-col h-full bg-white text-black">
        {/* Header */}
        <div className="p-3 border-b border-black/15 shrink-0 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <h2 className="text-sm font-bold text-black shrink-0">AI</h2>
              <span
                className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 font-mono truncate max-w-[200px] cursor-pointer hover:bg-gray-200 transition-colors"
                title={`${providerConfig?.name || activeProvider} / ${providerState.selectedModel || 'none'}\nClick to open Settings`}
                onClick={openSettings}
              >
                {providerConfig?.name ? `${providerConfig.name} / ` : ''}{shortName(providerState.selectedModel || '')}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 font-medium shrink-0 max-w-[120px] truncate" title={promptLabel}>
                {promptLabel}
              </span>
              {toolsActive && !activeMode && (
                <span className="text-[9px] px-1 py-0.5 rounded bg-green-100 text-green-700 font-medium shrink-0">
                  tools
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 shrink-0">
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
              {hasFiles && (
                <button
                  onClick={() => { setShowFiles(!showFiles); if (!showFiles) { setShowSystemPrompt(false); } }}
                  className={`text-xs px-2 py-1 rounded transition-colors ${
                    showFiles
                      ? 'bg-black text-white'
                      : 'text-gray-500 hover:text-black hover:bg-gray-100'
                  }`}
                  title="View file tree"
                >
                  Files
                </button>
              )}
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

        {/* System prompt viewer */}
        {showSystemPrompt && (
          <div className="border-b border-black/15 bg-gray-50 shrink-0 max-h-[60%] overflow-y-auto">
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-500 uppercase">System Prompt — {promptLabel}</span>
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

        {/* File tree panel */}
        {showFiles && hasFiles && (
          <div className="border-b border-black/15 bg-gray-50 shrink-0 max-h-[40%] overflow-y-auto">
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-500 uppercase">
                  Files — {directoryHandle?.name || 'Editor'}
                </span>
                <button
                  onClick={() => setShowFiles(false)}
                  className="text-xs text-gray-400 hover:text-black"
                >
                  {'\u2715'}
                </button>
              </div>
              <FileTreeView entries={fileTree} />
            </div>
          </div>
        )}

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white">
          {messages.length === 0 && !isStreaming && (
            <div className="text-center text-gray-400 text-sm mt-8">
              {activeMode === 'ai' && activeAiProject ? (
                <>
                  <p className="mb-2">AI Project: {activeAiProject.name}</p>
                  <p className="text-xs text-gray-400">
                    {activeAiProject.files?.length > 0
                      ? `${activeAiProject.files.length} file(s) in catalog. Ask me anything.`
                      : 'Custom system prompt active. Ask me anything.'}
                  </p>
                </>
              ) : activeMode === 'book' && activeBookProject ? (
                <>
                  <p className="mb-2">Book Project: {activeBookProject}</p>
                  <p className="text-xs text-gray-400">
                    Ask me about your story.
                  </p>
                </>
              ) : (
                <>
                  <p className="mb-2">Ask me about your story.</p>
                  <p className="text-xs text-gray-400">
                    I can read and modify your scaffold beats, genre settings, chapter scores, and more.
                  </p>
                </>
              )}
            </div>
          )}

          {messages.map((msg, idx) => (
            <ChatMessage
              key={msg.id}
              message={msg}
              onCopy={handleCopy}
              onRegenerate={msg.role === 'assistant' ? () => handleRegenerate(msg) : undefined}
              onEdit={msg.role === 'user' ? handleEdit : undefined}
            />
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

        {/* Attachments preview */}
        {attachments.length > 0 && (
          <div className="px-3 pt-2 border-t border-black/10 bg-gray-50">
            <div className="flex flex-wrap gap-2">
              {attachments.map((att, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1 px-2 py-1 bg-white border border-black/15 rounded text-xs"
                >
                  <span className="text-gray-500">📎</span>
                  <span className="truncate max-w-[120px]" title={att.name}>{att.name}</span>
                  <button
                    onClick={() => removeAttachment(i)}
                    className="text-gray-400 hover:text-red-500 ml-1"
                    title="Remove"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Input area */}
        <div className="p-3 border-t border-black/15 shrink-0 bg-white">
          <div className="relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={editingMessageId ? 'Edit your message...' : 'Ask about your story...'}
              rows={2}
              className="w-full bg-white border border-black/20 rounded-lg pl-10 pr-10 py-2 text-sm text-black resize-none focus:outline-none focus:border-black/50 placeholder:text-gray-400"
            />
            {/* File attachment button */}
            <button
              onClick={handleAttachFile}
              disabled={isStreaming}
              className="absolute left-2 bottom-2 w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50"
              title="Attach files"
            >
              📎
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelected}
              className="hidden"
              accept=".txt,.md,.json,.js,.jsx,.ts,.tsx,.css,.html,.py,.xml,.yaml,.yml,.csv"
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
                disabled={!input.trim() && attachments.length === 0}
                className="absolute right-2 bottom-2 w-7 h-7 flex items-center justify-center bg-black hover:bg-gray-800 disabled:bg-gray-300 disabled:text-gray-500 text-white rounded-md text-sm font-semibold transition-colors"
              >
                {'\u2191'}
              </button>
            )}
          </div>
          {editingMessageId && (
            <div className="mt-1 text-[10px] text-purple-600 font-medium">
              Editing message • <button onClick={() => { setEditingMessageId(null); setInput(''); }} className="underline hover:text-purple-800">Cancel</button>
            </div>
          )}
        </div>
      </div>
  );
}

/** Compact file tree for the chat panel's Files drawer. */
function FileTreeView({ entries, depth = 0 }) {
  if (!entries || entries.length === 0) return null;
  return (
    <div style={{ paddingLeft: depth > 0 ? 12 : 0 }}>
      {entries.map((entry) => (
        <div key={entry.path}>
          {entry.type === 'dir' ? (
            <>
              <div className="text-[11px] text-gray-500 font-medium py-0.5">
                {'\uD83D\uDCC1'} {entry.name}/
              </div>
              <FileTreeView entries={entry.children} depth={depth + 1} />
            </>
          ) : entry.type === 'file' ? (
            <div className="text-[11px] text-gray-700 py-0.5 truncate" title={entry.path}>
              {entry.name}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
