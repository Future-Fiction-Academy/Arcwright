import React, { useRef, useMemo, useCallback } from 'react';

/** Regex to detect code file extensions (used by MarkdownEditor to pick CodePane vs contentEditable). */
export const CODE_EXTS = /\.(json|js|jsx|py)$/i;

const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Simple lexer: walk through code, match rules in priority order, emit spans. */
function tokenize(code, rules) {
  let html = '';
  let pos = 0;
  const len = code.length;
  let plain = '';

  while (pos < len) {
    let matched = false;
    for (const rule of rules) {
      rule.regex.lastIndex = pos;
      const m = rule.regex.exec(code);
      if (m && m.index === pos && m[0].length > 0) {
        if (plain) { html += escapeHtml(plain); plain = ''; }
        // For strings that might be JSON keys: check if followed by ':'
        let cls = rule.cls;
        if (rule.maybeKey && /^\s*:/.test(code.substring(pos + m[0].length))) {
          cls = 'hl-key';
        }
        html += `<span class="${cls}">${escapeHtml(m[0])}</span>`;
        pos += m[0].length;
        matched = true;
        break;
      }
    }
    if (!matched) {
      plain += code[pos];
      pos++;
    }
  }
  if (plain) html += escapeHtml(plain);
  return html;
}

/** Language-specific tokenizer rules (ordered by priority — strings/comments first). */
function getRules(ext) {
  switch (ext) {
    case 'json':
      return [
        { regex: /"(?:\\.|[^"\\])*"/y, cls: 'hl-string', maybeKey: true },
        { regex: /\b(true|false|null)\b/y, cls: 'hl-literal' },
        { regex: /-?\b\d+\.?\d*([eE][+-]?\d+)?\b/y, cls: 'hl-number' },
      ];
    case 'js': case 'jsx':
      return [
        { regex: /\/\/[^\n]*/y, cls: 'hl-comment' },
        { regex: /\/\*[\s\S]*?\*\//y, cls: 'hl-comment' },
        { regex: /`(?:\\.|[^`\\])*`/y, cls: 'hl-string' },
        { regex: /"(?:\\.|[^"\\])*"/y, cls: 'hl-string' },
        { regex: /'(?:\\.|[^'\\])*'/y, cls: 'hl-string' },
        { regex: /\b(const|let|var|function|return|if|else|for|while|do|class|extends|import|export|from|new|this|async|await|try|catch|finally|throw|typeof|instanceof|default|switch|case|break|continue|of|in|yield|static|get|set|super|void|delete)\b/y, cls: 'hl-keyword' },
        { regex: /\b(true|false|null|undefined|NaN|Infinity)\b/y, cls: 'hl-literal' },
        { regex: /\b\d+\.?\d*([eE][+-]?\d+)?\b/y, cls: 'hl-number' },
      ];
    case 'py':
      return [
        { regex: /#[^\n]*/y, cls: 'hl-comment' },
        { regex: /"""[\s\S]*?"""/y, cls: 'hl-string' },
        { regex: /'''[\s\S]*?'''/y, cls: 'hl-string' },
        { regex: /"(?:\\.|[^"\\])*"/y, cls: 'hl-string' },
        { regex: /'(?:\\.|[^'\\])*'/y, cls: 'hl-string' },
        { regex: /\b(def|class|if|elif|else|for|while|return|import|from|as|try|except|finally|raise|with|lambda|yield|pass|break|continue|and|or|not|in|is|global|nonlocal|assert|del|async|await|print)\b/y, cls: 'hl-keyword' },
        { regex: /\b(True|False|None)\b/y, cls: 'hl-literal' },
        { regex: /@\w+/y, cls: 'hl-decorator' },
        { regex: /\b\d+\.?\d*([eE][+-]?\d+)?\b/y, cls: 'hl-number' },
      ];
    default:
      return [];
  }
}

function highlightCode(code, ext) {
  const rules = getRules(ext);
  if (rules.length === 0) return escapeHtml(code);
  return tokenize(code, rules);
}

const SHARED_FONT = 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace';

/**
 * Code editor pane with syntax highlighting.
 * Uses a transparent <textarea> over a highlighted <pre> — same text,
 * user types into the textarea while the pre shows colored tokens.
 */
export default function CodePane({ content, tabId, updateTabContent, colors, isDark, fileName, style, onFocus }) {
  const textareaRef = useRef(null);
  const preRef = useRef(null);

  const ext = (fileName?.match(/\.(\w+)$/)?.[1] || '').toLowerCase();
  const highlighted = useMemo(() => highlightCode(content || '', ext), [content, ext]);

  const handleChange = useCallback((e) => {
    updateTabContent(tabId, e.target.value);
  }, [tabId, updateTabContent]);

  const handleScroll = useCallback(() => {
    if (preRef.current && textareaRef.current) {
      preRef.current.scrollTop = textareaRef.current.scrollTop;
      preRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  }, []);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const ta = e.target;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const newVal = ta.value.substring(0, start) + '  ' + ta.value.substring(end);
      updateTabContent(tabId, newVal);
      requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = start + 2; });
    }
  }, [tabId, updateTabContent]);

  const hl = isDark
    ? { comment: '#9CA3AF', string: '#34D399', keyword: '#A78BFA', literal: '#FBBF24', number: '#22D3EE', key: '#F87171', decorator: '#F472B6' }
    : { comment: '#6B7280', string: '#059669', keyword: '#7C3AED', literal: '#D97706', number: '#0891B2', key: '#DC2626', decorator: '#DB2777' };

  const shared = {
    margin: 0, padding: 16,
    fontFamily: SHARED_FONT, fontSize: '13px', lineHeight: '1.6',
    whiteSpace: 'pre-wrap', wordWrap: 'break-word', tabSize: 2,
    border: 'none', outline: 'none',
  };

  return (
    <div style={{ position: 'relative', overflow: 'hidden', minHeight: 0, height: '100%', ...style }}>
      <style>{`
        .hl-comment { color: ${hl.comment}; font-style: italic; }
        .hl-string { color: ${hl.string}; }
        .hl-keyword { color: ${hl.keyword}; font-weight: 600; }
        .hl-literal { color: ${hl.literal}; }
        .hl-number { color: ${hl.number}; }
        .hl-key { color: ${hl.key}; }
        .hl-decorator { color: ${hl.decorator}; }
      `}</style>

      {/* Highlighted layer (visible, non-interactive) */}
      <pre
        ref={preRef}
        style={{
          ...shared,
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          overflow: 'hidden',
          color: colors.text, background: colors.bg,
          pointerEvents: 'none',
        }}
        dangerouslySetInnerHTML={{ __html: highlighted + '\n' }}
      />

      {/* Editable layer (transparent text, receives input + scroll) */}
      <textarea
        ref={textareaRef}
        value={content || ''}
        onChange={handleChange}
        onScroll={handleScroll}
        onKeyDown={handleKeyDown}
        onMouseDown={onFocus}
        onFocus={onFocus}
        spellCheck={false}
        style={{
          ...shared,
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          resize: 'none',
          color: 'transparent', caretColor: colors.caret,
          background: 'transparent',
          overflow: 'auto',
        }}
      />
    </div>
  );
}
