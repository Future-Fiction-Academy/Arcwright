import React from 'react';
import ChatActionBadge from './ChatActionBadge';

export default function ChatMessage({ message }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
      <div
        className={`rounded-lg px-3 py-2 text-sm ${
          isUser
            ? 'max-w-[95%] bg-gray-100 text-black border border-black/20'
            : 'w-full text-black'
        }`}
      >
        <div className="whitespace-pre-wrap break-words leading-relaxed">
          {formatText(message.content)}
        </div>
      </div>

      {message.actions && message.actions.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1 max-w-[95%]">
          {message.actions.map((action, i) => (
            <ChatActionBadge key={i} action={action} />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Minimal text formatting: bold (**text**) and inline code (`text`).
 * No markdown library needed — covers the most common LLM output patterns.
 */
function formatText(text) {
  if (!text) return null;

  // Split by lines, then process each line for bold and code spans
  return text.split('\n').map((line, i) => {
    const parts = [];
    let remaining = line;
    let key = 0;

    // Process bold and code patterns
    const pattern = /(\*\*(.+?)\*\*|`([^`]+)`)/g;
    let lastIndex = 0;
    let match;

    while ((match = pattern.exec(remaining)) !== null) {
      // Text before the match
      if (match.index > lastIndex) {
        parts.push(remaining.slice(lastIndex, match.index));
      }

      if (match[2]) {
        // Bold: **text**
        parts.push(<strong key={key++} className="font-semibold">{match[2]}</strong>);
      } else if (match[3]) {
        // Code: `text`
        parts.push(
          <code key={key++} className="bg-gray-100 border border-black/10 px-1 rounded text-xs">
            {match[3]}
          </code>
        );
      }

      lastIndex = match.index + match[0].length;
    }

    // Remaining text after last match
    if (lastIndex < remaining.length) {
      parts.push(remaining.slice(lastIndex));
    }

    // If no patterns found, just use the plain line
    if (parts.length === 0) {
      parts.push(line);
    }

    return (
      <React.Fragment key={i}>
        {i > 0 && <br />}
        {parts}
      </React.Fragment>
    );
  });
}
