# Arcwright Development Activity Log

Tracks significant changes, architectural decisions, and bug fixes. Most recent first.

---

## 2026-02-25

### Storage Architecture Reorganization

**Problem:** AI project JSON files in `projects/ai/` contained bloated `chatHistory` arrays and `cachedContent` for reference-mode files. Chat history had no versioning. Structure was confusing — config and history mixed in one file.

**Changes:**
- AI project configs moved: `projects/ai/{Name}.json` → `chat-history/{Name}/project.json`
- Chat history moved: embedded in project JSON → `chat-history/{Name}/active.json`
- "New Chat" now archives `active.json` → `{timestamp}.json` before clearing — nothing is ever destroyed
- `cachedContent` stripped from reference-mode files on project load; `AiProjectEditor` clears it when mode switches to reference
- `initArcwrite` now creates `chat-history/` instead of `projects/ai/` on init
- `projects/ai/` is now unused; legacy `.chats/` fallback retained in `readAiChatHistory` for migration

**Files:** `src/services/arcwriteFS.js`, `src/store/useProjectStore.js`, `src/components/projects/AiProjectEditor.jsx`

---

### Storage Folder Detection

**Problem:** If the user picked their existing `Arcwrite/` folder as the storage location, `initArcwrite` would create a nested `Arcwrite/Arcwrite/` inside it.

**Changes:**
- `SetupBanner.handleSetup`: detects folder names matching `/^arcwri(te|ght)$/i` and shows a `window.confirm` — OK uses the folder directly, Cancel creates a subfolder inside it
- `initArcwrite` accepts `{ direct: boolean }` option
- `setRootDirectory` accepts and passes through `{ direct }`

**Files:** `src/components/projects/SetupBanner.jsx`, `src/services/arcwriteFS.js`, `src/store/useProjectStore.js`

---

### Image Generation Fixes

**Problem:** Multiple issues — OpenRouter model routing wrong, regenerate button sent image to chat LLM instead of regenerating, images saved to wrong location, file tree overwritten with Arcwrite root.

**Changes:**
- OpenRouter routing: dual-output models (Gemini Image, GPT-5-image) use `modalities: ["image","text"]`; image-only models (Flux, Seedream, Sourceful) use `modalities: ["image"]`
- Regenerate button: detects `imageArtifact` on the message and calls `ACTION_HANDLERS.generateImage` directly instead of routing to the chat LLM
- Image save location: book project `images/` when active; `arcwriteHandle/images/` otherwise
- File tree refresh: only called when saving inside a book project — prevents Arcwrite root appearing as the project file tree
- `resolveBookProjectHandle` fallback removed from `generateImage`; pre-flight checks give clear error messages
- OpenRouter model discovery: reverted to frontend proxy (`/or-image-models`) — `/api/v1/models` only returns 4 image models vs 15+ from the frontend API

**Files:** `src/api/imageGeneration.js`, `src/chat/actionExecutor.js`, `src/components/chat/ChatPanel.jsx`, `src/api/providerAdapter.js`

---

### Arcwrite Folder Migration (manual)

**Problem:** App had been connected to the Arcwright source directory (`/Volumes/home/ai-tools/.../Arcwright`) instead of the data folder (`/Volumes/home/Arcwrite`). The real working data was in `/Volumes/home/Arcwrite/Arcwrite/` (nested, because the user had originally pointed at `/Volumes/home/Arcwrite/` as the parent).

**Changes (filesystem, not code):**
- Merged `/Volumes/home/Arcwrite/Arcwrite/` into `/Volumes/home/Arcwrite/`:
  - `_Artifacts/semantic_physics_engine/` → `Arcwrite/_Artifacts/semantic_physics_engine/`
  - Settings merged: image config (Seedream 4.5) and Perplexity API key pulled from nested into root
  - Test images moved to `Arcwrite/projects/images/`
- `settings.json.bak` created as backup before merge
- Chat history extracted from project JSONs and placed in `chat-history/` (see above)

---

## 2026-02-26

### Prompts Management

**Changes:**
- Chat `/` slash menu extended to include user prompts alongside sequences. Selecting a prompt inserts its template text into the input box without auto-sending; sequences still execute immediately. Results grouped under "Sequences" / "Prompts" section headers.
- "Prompts" button added to chat panel header — opens `PromptEditorDialog` for create/edit/delete without needing to be inside a document editor.
- `InlineEditPopup` (editor): selecting a preset or custom prompt now shows an editable preview step — template variables resolved against current selection context, presented in a textarea with Run / Cancel before submission.

**Files:** `src/components/chat/ChatPanel.jsx`, `src/components/edit/InlineEditPopup.jsx`

---

### Mermaid Diagrams in Help

**Changes:**
- Sequences tab in Help page: replaced ASCII `DiagramBox` placeholders with live `MermaidDiagram` flowcharts — seq-flow (4-step sequence), seq-exit-loop (exit-condition loop), seq-condition (branching condition with retry).

**Files:** `src/components/layout/HelpPage.jsx`

---

### Scaffold: Live Tension Readout

**Problem:** Changing a dimension slider in the scaffold beat editor caused no visible change to the TENSION (derived) line. The formula is correct — the normalization against all-channels-at-maximum means a full-range stakes change moves tension by ~1 unit on a 0-10 scale, which is visually subtle.

**Changes:**
- `BeatEditorRow` collapsed header: shows `T:x.x` badge (green-tinted red) next to the dimension swatches.
- `BeatEditorRow` expanded view: "Tension:" label with a live mini progress bar and numeric score above the dimension sliders — updates instantly as sliders move.

**Files:** `src/components/scaffolding/BeatEditorRow.jsx`

---

### Bug Fixes

**AI project support files not loading (Nova):**
- Stored paths in `project.json` include a leading `Arcwrite/` prefix (e.g. `Arcwrite/projects/ai/...`). `readFileByPath` is called with `arcwriteHandle` already at the Arcwrite root, so the traversal was failing on the `Arcwrite/` segment. The incoming `path` arg was already stripped but the matched file's stored path was passed raw.
- Fix: strip `Arcwrite/` prefix from `match.path` before calling `readFileByPath`.
- **File:** `src/chat/actionExecutor.js`

**Book file path resolution (✗ → retry pattern):**
- Book files are stored at `projects/books/{Name}/{Name}.md` but the AI was requesting `projects/books/{Name}.md`. Try 1 always failed (that path resolves to a directory), forcing an AI retry with the bare filename.
- Fix: added Try 1.5 — detects `projects/books/*.md` pattern and rewrites to the nested form before falling through.
- **File:** `src/chat/actionExecutor.js`

**Chat draft input lost on pane switch:**
- `ChatPanel` unmounts completely when toggled closed. Input was local `useState`, so any draft was lost when switching to Files and back.
- Fix: moved `input` to `useChatStore` as `draftInput` / `setDraftInput`.
- **Files:** `src/store/useChatStore.js`, `src/components/chat/ChatPanel.jsx`

---

### UI Tweaks

- **Tool-capable model indicator:** Model names in the provider model list render in green when `supportedParameters` includes `'tools'`.
- **AI label:** Chat panel header "AI" label gets a green background when the active model supports tools and tools are enabled.
- **"Prompt" → "Mode":** The system prompt / agent switcher button in the chat header renamed from "Prompt" to "Mode".
- **GitHub Action:** `.github/workflows/sync-ffa.yml` — syncs `main` to `Future-Fiction-Academy/Arcwright` daily at 3 am MT; both repos also configured as push targets on `origin`.

**Files:** `src/components/settings/ProviderCard.jsx`, `src/components/chat/ChatPanel.jsx`, `.github/workflows/sync-ffa.yml`

---

## Known Issues / Watch List

- `projects/ai/` directory still exists on disk (now empty). Safe to delete manually.
- `settings.json.bak` in Arcwrite root — can be deleted once settings confirmed correct.
- App must be reconnected via "Change" button → pick `/Volumes/home/Arcwrite/` → click OK when asked if it's the home folder.
