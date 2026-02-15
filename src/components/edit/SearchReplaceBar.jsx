import React, { useRef, useEffect } from 'react';

export default function SearchReplaceBar({ isOpen, onClose, search, colors: c }) {
  const searchRef = useRef(null);

  // Auto-focus search input on open
  useEffect(() => {
    if (isOpen && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Keyboard handler: Escape to close, Enter to navigate
  const handleSearchKey = (e) => {
    if (e.key === 'Escape') { onClose(); return; }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (e.shiftKey) search.prevMatch();
      else search.nextMatch();
    }
  };

  const handleReplaceKey = (e) => {
    if (e.key === 'Escape') { onClose(); return; }
    if (e.key === 'Enter') {
      e.preventDefault();
      search.replaceCurrent();
    }
  };

  if (!isOpen) return null;

  const btnStyle = {
    color: c.toolbarBtn,
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '2px 6px',
    borderRadius: '3px',
    fontSize: '11px',
    transition: 'all 0.15s',
  };

  const activeBtnStyle = {
    ...btnStyle,
    background: c.toolbarBtnHoverBg,
    color: c.toolbarBtnHover,
  };

  const inputStyle = {
    background: c.bg,
    color: c.text,
    border: `1px solid ${c.chromeBorder}`,
    borderRadius: '3px',
    padding: '3px 8px',
    fontSize: '12px',
    outline: 'none',
    flex: 1,
    minWidth: 0,
  };

  return (
    <div
      className="shrink-0"
      style={{ background: c.chrome, borderBottom: `1px solid ${c.chromeBorder}` }}
    >
      {/* Row 1: Search */}
      <div className="flex items-center gap-1.5 px-2 py-1.5">
        <input
          ref={searchRef}
          type="text"
          value={search.query}
          onChange={(e) => search.setQuery(e.target.value)}
          onKeyDown={handleSearchKey}
          placeholder="Search..."
          style={inputStyle}
        />

        {/* Match count */}
        <span
          className="text-[10px] shrink-0 min-w-[48px] text-center"
          style={{ color: c.statusText }}
        >
          {search.query
            ? search.totalCount === 0
              ? 'No results'
              : `${search.currentMatchIndex + 1} of ${search.totalCount}`
            : ''}
        </span>

        {/* Prev / Next */}
        <button
          onClick={search.prevMatch}
          style={btnStyle}
          title="Previous match (Shift+Enter)"
          onMouseEnter={(e) => { e.currentTarget.style.background = c.toolbarBtnHoverBg; e.currentTarget.style.color = c.toolbarBtnHover; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = c.toolbarBtn; }}
        >
          {'\u2191'}
        </button>
        <button
          onClick={search.nextMatch}
          style={btnStyle}
          title="Next match (Enter)"
          onMouseEnter={(e) => { e.currentTarget.style.background = c.toolbarBtnHoverBg; e.currentTarget.style.color = c.toolbarBtnHover; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = c.toolbarBtn; }}
        >
          {'\u2193'}
        </button>

        {/* Separator */}
        <div className="w-px h-4" style={{ background: c.chromeBorder }} />

        {/* Case sensitive */}
        <button
          onClick={() => search.setCaseSensitive(!search.caseSensitive)}
          style={search.caseSensitive ? activeBtnStyle : btnStyle}
          title="Case sensitive"
          onMouseEnter={(e) => { if (!search.caseSensitive) { e.currentTarget.style.background = c.toolbarBtnHoverBg; e.currentTarget.style.color = c.toolbarBtnHover; } }}
          onMouseLeave={(e) => { if (!search.caseSensitive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = c.toolbarBtn; } }}
        >
          Aa
        </button>

        {/* Regex */}
        <button
          onClick={() => search.setUseRegex(!search.useRegex)}
          style={search.useRegex ? activeBtnStyle : btnStyle}
          title="Regular expression"
          onMouseEnter={(e) => { if (!search.useRegex) { e.currentTarget.style.background = c.toolbarBtnHoverBg; e.currentTarget.style.color = c.toolbarBtnHover; } }}
          onMouseLeave={(e) => { if (!search.useRegex) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = c.toolbarBtn; } }}
        >
          .*
        </button>

        {/* Separator */}
        <div className="w-px h-4" style={{ background: c.chromeBorder }} />

        {/* Scope toggle */}
        <div
          className="flex rounded overflow-hidden text-[10px] font-medium shrink-0"
          style={{ border: `1px solid ${c.chromeBorder}` }}
        >
          <button
            onClick={() => search.setScope('file')}
            style={{
              padding: '2px 8px',
              background: search.scope === 'file' ? c.toolbarBtnHoverBg : 'transparent',
              color: search.scope === 'file' ? c.toolbarBtnHover : c.toolbarBtn,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            File
          </button>
          <button
            onClick={() => search.setScope('all')}
            style={{
              padding: '2px 8px',
              background: search.scope === 'all' ? c.toolbarBtnHoverBg : 'transparent',
              color: search.scope === 'all' ? c.toolbarBtnHover : c.toolbarBtn,
              border: 'none',
              borderLeft: `1px solid ${c.chromeBorder}`,
              cursor: 'pointer',
            }}
          >
            All
          </button>
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          style={btnStyle}
          title="Close (Escape)"
          onMouseEnter={(e) => { e.currentTarget.style.background = c.toolbarBtnHoverBg; e.currentTarget.style.color = c.toolbarBtnHover; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = c.toolbarBtn; }}
        >
          {'\u2715'}
        </button>
      </div>

      {/* Row 2: Replace */}
      <div className="flex items-center gap-1.5 px-2 pb-1.5">
        <input
          type="text"
          value={search.replacement}
          onChange={(e) => search.setReplacement(e.target.value)}
          onKeyDown={handleReplaceKey}
          placeholder="Replace..."
          style={inputStyle}
        />

        <button
          onClick={search.replaceCurrent}
          style={btnStyle}
          title="Replace current match (Enter in replace field)"
          onMouseEnter={(e) => { e.currentTarget.style.background = c.toolbarBtnHoverBg; e.currentTarget.style.color = c.toolbarBtnHover; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = c.toolbarBtn; }}
        >
          Replace
        </button>
        <button
          onClick={search.replaceAll}
          style={btnStyle}
          title="Replace all matches"
          onMouseEnter={(e) => { e.currentTarget.style.background = c.toolbarBtnHoverBg; e.currentTarget.style.color = c.toolbarBtnHover; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = c.toolbarBtn; }}
        >
          Replace All
        </button>
      </div>

      {/* All-files summary (only shown in "all" scope with matches) */}
      {search.scope === 'all' && search.fileCounts.length > 0 && (
        <div
          className="flex flex-wrap gap-x-3 gap-y-0.5 px-3 pb-1.5 text-[10px]"
          style={{ color: c.statusText }}
        >
          {search.fileCounts.map((f) => (
            <span
              key={f.path}
              className="cursor-pointer hover:underline"
              style={{ color: c.chromeText }}
              onClick={() => {
                // Navigate to first match in this file
                const idx = search.matches.findIndex(
                  (m) => m.tabId === f.tabId || m.filePath === f.path
                );
                if (idx >= 0) search.goToMatch(idx);
              }}
            >
              {f.name} ({f.count})
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
