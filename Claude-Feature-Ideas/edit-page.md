# Edit Page — Markdown Text Editor

## Status: DESIGN PHASE

## Core Concept
A new `/edit` route for writing and editing manuscript text in markdown source mode. Switchable left panel provides contextual tools alongside the editor.

## Layout
- **Left panel** (switchable, resizable): Chat | Files | Chapter Variables
- **Main area**: Markdown editor with formatting bar
- **Optional**: Dual-pane mode for parallel editing or diff view

## Features

### Editor
- Markdown source editing (textarea, no WYSIWYG)
- Formatting bar: bold, italic, heading, list, blockquote, link, etc. (inserts markdown syntax)
- Tab-based multi-file editing
- Word/character count

### Left Panel Tabs
1. **Chat** — Reuses existing ChatPanel component (suppresses global sidebar on /edit route)
2. **Files** — File System Access API (`showDirectoryPicker()`) for local folder browsing
3. **Chapter Variables** — Dimension expectations for current chapter position; pulls from analysis data or interpolates from genre arc

### Dual-Pane / Diff Mode
- Split the editor area into two parallel panes
- Modes:
  - **Side-by-side editing**: Two independent documents open
  - **Synced scroll**: Both panes scroll together (for comparing versions)
  - **Diff view**: Highlight insertions/deletions between two versions
- Toggle between single-pane and dual-pane via toolbar button
- Could use a simple line-by-line diff algorithm or leverage a library

## Design Decisions
- No editor library for v1 — plain textarea with markdown formatting buttons
- Could upgrade to CodeMirror 6 later for syntax highlighting, line numbers
- File System Access API is Chromium-only (acceptable for this project)
- Explicit save (no auto-save to filesystem)
- Chat context builder gains Edit-route awareness

## Not in v1
- Live markdown preview rendering
- Spell check / grammar
- Auto-save
- Git integration
