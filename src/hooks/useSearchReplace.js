import { useState, useRef, useCallback, useEffect } from 'react';
import useEditorStore from '../store/useEditorStore';

/**
 * Strip HTML to plain text using a temporary DOM element.
 * Used for tabs that aren't currently visible in a pane.
 */
function stripHtml(html) {
  if (!html) return '';
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || '';
}

/**
 * Find all match positions in a plain-text string.
 * Returns array of { index, length }.
 */
function findMatches(query, text, caseSensitive, useRegex) {
  if (!query || !text) return [];
  const results = [];
  try {
    if (useRegex) {
      const flags = caseSensitive ? 'g' : 'gi';
      const re = new RegExp(query, flags);
      let m;
      while ((m = re.exec(text)) !== null) {
        results.push({ index: m.index, length: m[0].length });
        if (m[0].length === 0) re.lastIndex++;
      }
    } else {
      const haystack = caseSensitive ? text : text.toLowerCase();
      const needle = caseSensitive ? query : query.toLowerCase();
      let pos = 0;
      while ((pos = haystack.indexOf(needle, pos)) !== -1) {
        results.push({ index: pos, length: needle.length });
        pos += needle.length;
      }
    }
  } catch {
    // invalid regex
  }
  return results;
}

/**
 * Build a DOM Range from text-content offsets using TreeWalker.
 * Maps flat textContent offsets → actual DOM text node positions.
 */
function buildRange(element, startOffset, endOffset) {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  let pos = 0;
  let startNode = null, startOff = 0;
  let endNode = null, endOff = 0;

  while (walker.nextNode()) {
    const node = walker.currentNode;
    const len = node.textContent.length;

    if (!startNode && pos + len > startOffset) {
      startNode = node;
      startOff = startOffset - pos;
    }
    if (pos + len >= endOffset) {
      endNode = node;
      endOff = endOffset - pos;
      break;
    }
    pos += len;
  }

  if (!startNode || !endNode) return null;
  try {
    const range = document.createRange();
    range.setStart(startNode, startOff);
    range.setEnd(endNode, endOff);
    return range;
  } catch {
    return null;
  }
}

/**
 * Replace text in HTML string while preserving tags.
 * Splits by HTML tags and only performs replacement in text segments.
 */
function replaceInHtml(html, query, replacement, caseSensitive, useRegex) {
  const parts = html.split(/(<[^>]*>)/);
  if (useRegex) {
    try {
      const flags = caseSensitive ? 'g' : 'gi';
      const re = new RegExp(query, flags);
      return parts.map((part, i) => (i % 2 === 0 ? part.replace(re, replacement) : part)).join('');
    } catch { return html; }
  }
  const needle = caseSensitive ? query : query.toLowerCase();
  return parts.map((part, i) => {
    if (i % 2 !== 0) return part; // HTML tag — skip
    const hay = caseSensitive ? part : part.toLowerCase();
    let result = '';
    let pos = 0;
    let idx;
    while ((idx = hay.indexOf(needle, pos)) !== -1) {
      result += part.substring(pos, idx) + replacement;
      pos = idx + needle.length;
    }
    result += part.substring(pos);
    return result;
  }).join('');
}

/**
 * Replace all matches in a plain-text string (back-to-front).
 * Used for disk files which are raw text, not HTML.
 */
function replaceAllInString(content, matches, replacement, useRegex, query, caseSensitive) {
  if (useRegex) {
    try {
      const flags = caseSensitive ? 'g' : 'gi';
      return content.replace(new RegExp(query, flags), replacement);
    } catch { return content; }
  }
  let result = content;
  for (let i = matches.length - 1; i >= 0; i--) {
    const { index, length } = matches[i];
    result = result.substring(0, index) + replacement + result.substring(index + length);
  }
  return result;
}

/** Recursively collect all text files from a directory handle. */
async function collectFiles(dirHandle, basePath = '') {
  const files = [];
  try {
    for await (const [name, handle] of dirHandle.entries()) {
      const path = basePath ? `${basePath}/${name}` : name;
      if (handle.kind === 'directory') {
        files.push(...await collectFiles(handle, path));
      } else if (/\.(md|txt|markdown|text)$/i.test(name)) {
        files.push({ name, path, handle });
      }
    }
  } catch { /* permission or read error */ }
  return files;
}

const hasHighlightAPI = typeof window !== 'undefined' && 'Highlight' in window && CSS.highlights;

export default function useSearchReplace(primaryRef, secondaryRef) {
  const [query, setQuery] = useState('');
  const [replacement, setReplacement] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [useRegex, setUseRegex] = useState(false);
  const [scope, setScope] = useState('file');
  const [matches, setMatches] = useState([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(-1);
  const [fileCounts, setFileCounts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);

  const debounceRef = useRef(null);

  // Resolve which DOM element corresponds to a tabId
  const getElementForTab = useCallback((tabId) => {
    const editor = useEditorStore.getState();
    if (editor.activeTabId === tabId && primaryRef?.current) return primaryRef.current;
    if (editor.dualPane && editor.secondaryTabId === tabId && secondaryRef?.current) return secondaryRef.current;
    return null;
  }, [primaryRef, secondaryRef]);

  // Apply CSS Custom Highlight API highlights to visible panes
  const applyHighlights = useCallback((matchList, currentIdx) => {
    if (!hasHighlightAPI) return;
    CSS.highlights.delete('search-results');
    CSS.highlights.delete('current-match');

    if (!matchList || matchList.length === 0) return;

    const allRanges = [];
    let currentRange = null;

    for (let i = 0; i < matchList.length; i++) {
      const match = matchList[i];
      if (!match.tabId) continue;

      const element = getElementForTab(match.tabId);
      if (!element) continue;

      const range = buildRange(element, match.index, match.index + match.length);
      if (!range) continue;

      if (i === currentIdx) {
        currentRange = range;
      } else {
        allRanges.push(range);
      }
    }

    if (allRanges.length > 0) {
      CSS.highlights.set('search-results', new Highlight(...allRanges));
    }
    if (currentRange) {
      CSS.highlights.set('current-match', new Highlight(currentRange));
    }
  }, [getElementForTab]);

  // Run search on query/option changes
  const runSearch = useCallback(async () => {
    if (!query) {
      setMatches([]);
      setCurrentMatchIndex(-1);
      setFileCounts([]);
      setTotalCount(0);
      if (hasHighlightAPI) {
        CSS.highlights.delete('search-results');
        CSS.highlights.delete('current-match');
      }
      return;
    }

    const editor = useEditorStore.getState();

    if (scope === 'file') {
      const tabId = editor.focusedPane === 'secondary' && editor.dualPane
        ? editor.secondaryTabId
        : editor.activeTabId;
      const tab = editor.tabs.find((t) => t.id === tabId);
      if (!tab) {
        setMatches([]);
        setCurrentMatchIndex(-1);
        setTotalCount(0);
        return;
      }

      // Use DOM textContent for visible tabs, stripHtml for others
      const element = getElementForTab(tabId);
      const text = element ? element.textContent : stripHtml(tab.content);

      const found = findMatches(query, text, caseSensitive, useRegex);
      const withTab = found.map((m) => ({ ...m, tabId }));
      const idx = found.length > 0 ? 0 : -1;
      setMatches(withTab);
      setCurrentMatchIndex(idx);
      setFileCounts([{ name: tab.title, path: tab.id, tabId, count: found.length }]);
      setTotalCount(found.length);
      applyHighlights(withTab, idx);

    } else {
      // Search all open tabs + disk files
      const allMatches = [];
      const counts = [];
      const tabIds = new Set();

      for (const tab of editor.tabs) {
        tabIds.add(tab.id);
        const element = getElementForTab(tab.id);
        const text = element ? element.textContent : stripHtml(tab.content);
        const found = findMatches(query, text, caseSensitive, useRegex);
        if (found.length > 0) {
          counts.push({ name: tab.title, path: tab.id, tabId: tab.id, count: found.length });
          allMatches.push(...found.map((m) => ({ ...m, tabId: tab.id })));
        }
      }

      if (editor.directoryHandle) {
        const diskFiles = await collectFiles(editor.directoryHandle);
        for (const df of diskFiles) {
          if (tabIds.has(df.path)) continue;
          try {
            const file = await df.handle.getFile();
            const content = await file.text();
            const found = findMatches(query, content, caseSensitive, useRegex);
            if (found.length > 0) {
              counts.push({ name: df.name, path: df.path, handle: df.handle, count: found.length });
              allMatches.push(...found.map((m) => ({ ...m, filePath: df.path, fileHandle: df.handle, fileName: df.name })));
            }
          } catch { /* skip unreadable */ }
        }
      }

      const idx = allMatches.length > 0 ? 0 : -1;
      setMatches(allMatches);
      setCurrentMatchIndex(idx);
      setFileCounts(counts);
      setTotalCount(allMatches.length);
      applyHighlights(allMatches, idx);
    }
  }, [query, caseSensitive, useRegex, scope, getElementForTab, applyHighlights]);

  // Debounced search trigger
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(runSearch, 150);
    return () => clearTimeout(debounceRef.current);
  }, [runSearch]);

  // Navigate to a specific match
  const goToMatch = useCallback((idx) => {
    if (idx < 0 || idx >= matches.length) return;
    setCurrentMatchIndex(idx);
    const match = matches[idx];

    // Update highlights
    applyHighlights(matches, idx);

    if (match.tabId) {
      const editor = useEditorStore.getState();
      // Switch tab if needed
      if (editor.activeTabId !== match.tabId && editor.secondaryTabId !== match.tabId) {
        editor.setActiveTab(match.tabId);
        // DOM won't be ready yet — re-highlight after mount
        setTimeout(() => applyHighlights(matches, idx), 100);
      }

      const isSecondary = editor.secondaryTabId === match.tabId && editor.dualPane;
      const ref = isSecondary ? secondaryRef : primaryRef;

      if (ref?.current) {
        const range = buildRange(ref.current, match.index, match.index + match.length);
        if (range) {
          // Select the match
          const sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);

          // Scroll into view
          const rect = range.getBoundingClientRect();
          const containerRect = ref.current.getBoundingClientRect();
          if (rect.top < containerRect.top || rect.bottom > containerRect.bottom) {
            const scrollTarget = ref.current.scrollTop + (rect.top - containerRect.top) - containerRect.height / 3;
            ref.current.scrollTop = Math.max(0, scrollTarget);
          }
        }
      }
    }
  }, [matches, primaryRef, secondaryRef, applyHighlights]);

  const nextMatch = useCallback(() => {
    if (matches.length === 0) return;
    goToMatch((currentMatchIndex + 1) % matches.length);
  }, [currentMatchIndex, matches.length, goToMatch]);

  const prevMatch = useCallback(() => {
    if (matches.length === 0) return;
    goToMatch((currentMatchIndex - 1 + matches.length) % matches.length);
  }, [currentMatchIndex, matches.length, goToMatch]);

  // Replace the current match using DOM selection + execCommand
  const replaceCurrent = useCallback(() => {
    if (currentMatchIndex < 0 || currentMatchIndex >= matches.length) return;
    const match = matches[currentMatchIndex];
    if (!match.tabId) return;

    const editor = useEditorStore.getState();
    const isSecondary = editor.secondaryTabId === match.tabId && editor.dualPane;
    const ref = isSecondary ? secondaryRef : primaryRef;
    if (!ref?.current) return;

    const range = buildRange(ref.current, match.index, match.index + match.length);
    if (!range) return;

    ref.current.focus();
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    document.execCommand('insertText', false, replacement);

    // Sync back to store
    editor.updateTabContent(match.tabId, ref.current.innerHTML);

    // Re-run search after DOM settles
    setTimeout(runSearch, 50);
  }, [currentMatchIndex, matches, replacement, primaryRef, secondaryRef, runSearch]);

  // Replace all matches
  const replaceAll = useCallback(async () => {
    if (matches.length === 0) return;
    const editor = useEditorStore.getState();

    // Group matches by source
    const byTab = {};
    const byDisk = {};
    for (const m of matches) {
      if (m.tabId) {
        if (!byTab[m.tabId]) byTab[m.tabId] = [];
        byTab[m.tabId].push(m);
      } else if (m.filePath) {
        if (!byDisk[m.filePath]) byDisk[m.filePath] = { handle: m.fileHandle, matches: [] };
        byDisk[m.filePath].matches.push(m);
      }
    }

    // Replace in open tabs (HTML-aware replacement)
    for (const [tabId, tabMatches] of Object.entries(byTab)) {
      const element = getElementForTab(tabId);
      if (element) {
        // Visible tab: replace in innerHTML preserving tags
        const newHtml = replaceInHtml(element.innerHTML, query, replacement, caseSensitive, useRegex);
        element.innerHTML = newHtml;
        editor.updateTabContent(tabId, newHtml);
      } else {
        // Non-visible tab: replace in store HTML
        const tab = editor.tabs.find((t) => t.id === tabId);
        if (!tab) continue;
        const newContent = replaceInHtml(tab.content, query, replacement, caseSensitive, useRegex);
        editor.updateTabContent(tabId, newContent);
      }
    }

    // Replace in disk-only files (plain text)
    for (const [, entry] of Object.entries(byDisk)) {
      try {
        const file = await entry.handle.getFile();
        const content = await file.text();
        const newContent = replaceAllInString(content, entry.matches, replacement, useRegex, query, caseSensitive);
        const writable = await entry.handle.createWritable();
        await writable.write(newContent);
        await writable.close();
      } catch { /* skip files we can't write */ }
    }

    setTimeout(runSearch, 50);
  }, [matches, replacement, useRegex, query, caseSensitive, getElementForTab, runSearch]);

  const reset = useCallback(() => {
    setQuery('');
    setReplacement('');
    setMatches([]);
    setCurrentMatchIndex(-1);
    setFileCounts([]);
    setTotalCount(0);
    if (hasHighlightAPI) {
      CSS.highlights.delete('search-results');
      CSS.highlights.delete('current-match');
    }
  }, []);

  return {
    query, setQuery,
    replacement, setReplacement,
    caseSensitive, setCaseSensitive,
    useRegex, setUseRegex,
    scope, setScope,
    matches, currentMatchIndex, totalCount, fileCounts,
    nextMatch, prevMatch, goToMatch,
    replaceCurrent, replaceAll,
    reset,
  };
}
