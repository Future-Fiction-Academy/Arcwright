import React from 'react';

export default function ChatActionBadge({ action }) {
  if (!action.success) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-red-50 text-red-700 border border-red-300">
        <span>{'\u2717'}</span>
        <span>{action.error || 'Failed'}</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-white text-black border border-black/30">
      <span>{'\u2713'}</span>
      <span>{action.description}</span>
    </span>
  );
}
