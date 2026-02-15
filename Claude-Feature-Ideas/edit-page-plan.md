Plan: Edit Page — Markdown Editor with Switchable Left Panel & Dual Pane
Context
The app currently has Scaffold and Analyze workflows. The user wants a new Edit page for writing manuscript text directly. Key requirements: markdown source editing (not WYSIWYG), a formatting bar, a switchable left panel (Chat / Files / Chapter Variables), the ability to split into two parallel editor panes (optionally synced like a diff), and the chat panel remaining expandable.

Architecture Decision: Chat Panel on Edit Route
The global ChatPanel lives in AppShell's sidebar. On the /edit route, the chat needs to appear inside the left panel instead. Approach:

AppShell conditionally hides its chat sidebar when on /edit (checks location.pathname)
EditWorkflow manages its own left panel with tabs, one of which renders <ChatPanel />
Same ChatPanel component, same stores — just mounted in a different location
Files to Modify (3) + New Files (4)
Modified:
src/App.jsx — add /edit route with lazy import
src/components/layout/AppShell.jsx — hide global chat sidebar on /edit route; add Edit nav link
src/chat/contextBuilder.js — add Edit workflow context to system prompt
New:
src/store/useEditorStore.js — editor state (open tabs, content, file handles, dual-pane mode)
src/components/edit/EditWorkflow.jsx — main page component with left panel + editor area
src/components/edit/MarkdownEditor.jsx — textarea + formatting bar + dual-pane support
src/components/edit/FilePanel.jsx — File System Access API browser
Step 1: Editor Store
New file: src/store/useEditorStore.js

Separate Zustand store (not persisted initially — file handles can't be serialized):


{
  // Tab management
  tabs: [],           // [{ id, title, content, dirty, fileHandle? }]
  activeTabId: null,
  secondaryTabId: null,  // for dual-pane mode

  // Dual-pane
  dualPane: false,       // toggle
  syncScroll: false,     // synced scrolling between panes

  // File system
  directoryHandle: null, // FileSystemDirectoryHandle
  fileTree: [],          // [{ name, handle, type: 'file'|'dir', children? }]

  // Left panel
  leftPanelTab: 'chat',  // 'chat' | 'files' | 'variables'

  // Actions
  openTab(id, title, content, fileHandle?),
  closeTab(id),
  setActiveTab(id),
  setSecondaryTab(id),
  updateTabContent(id, content),
  toggleDualPane(),
  toggleSyncScroll(),
  setLeftPanelTab(tab),
  setDirectoryHandle(handle),
  setFileTree(tree),
  saveTab(id),  // writes back to fileHandle
}
Step 2: EditWorkflow Component
New file: src/components/edit/EditWorkflow.jsx

Layout: resizable left panel | divider | main editor area (same drag pattern as ScaffoldingWorkflow)


┌─────────────────────────────────────────────┐
│ [Chat] [Files] [Variables]  ← tab bar       │
├──────────────┬──────────────────────────────┤
│              │  tab bar: [Ch1.md] [Ch2.md]  │
│  left panel  │  ┌─────────┬────────────┐    │
│  (chat or    │  │ format bar            │    │
│   files or   │  ├─────────┼────────────┤    │
│   variables) │  │ editor  │ editor 2   │    │
│              │  │ pane 1  │ (dual mode)│    │
│              │  │         │            │    │
│              │  └─────────┴────────────┘    │
└──────────────┴──────────────────────────────┘
Left panel defaults to ~300px, resizable via drag divider (reuses AppShell's drag pattern)
Tab bar at top switches between Chat, Files, Variables
When leftPanelTab === 'chat': renders <ChatPanel />
When leftPanelTab === 'files': renders <FilePanel />
When leftPanelTab === 'variables': renders chapter dimension expectations (v1: simple list from store chapters/scaffold data)
Step 3: MarkdownEditor Component
New file: src/components/edit/MarkdownEditor.jsx

Formatting Bar
Row of buttons above the textarea that insert markdown at cursor:

B (bold) → wraps selection in **...**
I (italic) → wraps in *...*
H1/H2/H3 → inserts # / ## / ### at line start
List → inserts - at line start
Ordered list → inserts 1. at line start
Blockquote → inserts > at line start
Link → inserts [text](url)
Code → wraps in backticks
Horizontal rule → inserts ---
Dual-pane toggle button (right side of bar)
Sync scroll toggle (visible in dual-pane mode)
Editor Area
Single textarea per pane (plain <textarea> with monospace font, full height)
Tab bar above formatting bar for open files
Word count + character count in status bar at bottom
Dirty indicator (dot) on tab when content is modified
Dual-Pane Mode
Activated by toolbar toggle button
Splits editor area into two side-by-side textareas with a drag divider between them
Left pane = active tab, right pane = secondary tab (user picks from tab bar or a selector)
Sync scroll: when enabled, scrolling one pane scrolls the other proportionally
Simple diff highlighting (future enhancement, not v1 — flag in feature ideas)
Cursor-aware formatting
Helper function insertMarkdown(textarea, prefix, suffix):


function insertMarkdown(textareaRef, prefix, suffix = '') {
  const el = textareaRef.current;
  const start = el.selectionStart;
  const end = el.selectionEnd;
  const selected = el.value.substring(start, end);
  const replacement = prefix + selected + suffix;
  // Update content via store, then restore cursor position
}
Step 4: FilePanel Component
New file: src/components/edit/FilePanel.jsx

Uses the File System Access API:

"Open Folder" button → calls window.showDirectoryPicker() → stores the handle in editor store
Recursive directory listing → builds file tree from handle, filters to .md/.txt files
Click file → reads content via fileHandle.getFile() → opens as a new tab in the editor
Save → writes back via fileHandle.createWritable() → clears dirty flag
Tree display: simple indented list with folder/file icons, collapsible directories.

Graceful fallback: if File System Access API is unavailable (Firefox, etc.), show a message suggesting Chrome/Edge and offer a textarea-only mode with copy/paste.

Step 5: Route + AppShell Changes
File: src/App.jsx

Add lazy import: const EditWorkflow = lazy(() => import('./components/edit/EditWorkflow'));
Add route: <Route path="edit" element={<EditWorkflow />} />
File: src/components/layout/AppShell.jsx

Import useLocation from react-router-dom
When location.pathname starts with /edit: hide the global chat sidebar (toggle button, ChatPanel, divider)
Add "Edit" nav link between "Scaffold" and "Analyze"
The EditWorkflow manages its own chat embedding
File: src/components/layout/WorkflowSelector.jsx

Add an Edit workflow card to the home page grid
Step 6: Context Builder — Edit Route Awareness
File: src/chat/contextBuilder.js

Add Edit workflow detection:


function routeToWorkflow(route) {
  if (route?.includes('edit')) return 'Edit';
  // ... existing routes
}
When workflow === 'Edit':

Include current editor tab content (or summary if long) in the system prompt
Include the file name being edited
Provide edit-specific actions (future: the chat could suggest text changes)
Step 7: Add Edit Link to Home Page
File: src/components/layout/WorkflowSelector.jsx

Add a third card to the grid with an Edit workflow description — text editing, markdown source mode, file browser, AI assistance.

Verification
npx vite build — no errors
Navigate to /edit — page loads with left panel (Chat tab active) + empty editor
Click "Files" tab → "Open Folder" → select a directory → see file tree
Click a .md file → opens in editor tab with content
Use formatting bar (bold, heading, etc.) → markdown syntax inserted at cursor
Toggle dual-pane → two side-by-side editors appear
Toggle sync scroll → scrolling one pane scrolls the other
Open chat in left panel → send a message → works normally
Global chat sidebar is hidden on /edit route, visible on other routes
cp -R dist/* context-graph/