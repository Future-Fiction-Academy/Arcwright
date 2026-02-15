import React, { useState } from 'react';
import { dimensions, DIMENSION_KEYS } from '../../data/dimensions';
import { WEIGHT_KEYS } from '../../engine/weights';
import { plotStructures, referenceStructures } from '../../data/plotStructures';
import { genreSystem } from '../../data/genreSystem';
import ActStructuresTab from './ActStructuresTab';

const tabs = ['about', 'scaffolding', 'analysis', 'editing', 'structures', 'actStructures', 'dimensions', 'changelog'];

function Tab({ id, label, active, onClick }) {
  return (
    <button
      onClick={() => onClick(id)}
      className={`px-4 py-2 text-sm font-semibold rounded-t transition-colors ${
        active
          ? 'bg-purple-600 text-white'
          : 'bg-slate-800/50 text-purple-300 hover:bg-slate-700 hover:text-white'
      }`}
    >
      {label}
    </button>
  );
}

function Section({ title, children }) {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-bold text-purple-300 mb-3 border-b border-purple-500/30 pb-2">
        {title}
      </h3>
      {children}
    </div>
  );
}

function AboutTab() {
  return (
    <div className="space-y-4 text-sm text-purple-100 leading-relaxed">
      <Section title="What is Narrative Context Graph?">
        <p>
          Narrative Context Graph is a multi-dimensional story analysis tool that treats fiction
          as a system of interacting forces. Instead of thinking about plot as a single rising-and-falling
          line, it tracks <strong>11 narrative dimensions</strong> simultaneously &mdash; intimacy, power,
          information asymmetry, danger, trust, and more &mdash; to reveal the hidden physics of storytelling.
        </p>
        <p className="mt-2">
          The core insight is that <strong>tension emerges from mismatches</strong>: desire without intimacy,
          vulnerability without trust, proximity without safety. The tool calculates these gaps and weights
          them by genre to produce a tension curve that mirrors what a reader actually feels.
        </p>
      </Section>

      <Section title="Three Workflows">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-800/50 rounded p-4 border border-purple-500/20">
            <h4 className="font-bold text-white mb-2">Story Scaffolding</h4>
            <p>
              Build a new story's dimensional arc from scratch or start from a genre template.
              Set dimension values at each story beat and watch your narrative take shape in real time.
              Use this when you're <strong>planning a new story</strong> and want to ensure it hits
              the right emotional beats for your genre.
            </p>
          </div>
          <div className="bg-slate-800/50 rounded p-4 border border-purple-500/20">
            <h4 className="font-bold text-white mb-2">Reverse Engineer & Diagnose</h4>
            <p>
              Analyze an existing manuscript chapter-by-chapter. AI scores the narrative dimensions,
              you refine the scores, then compare against genre ideals. The tool generates a visual
              comparison overlay and a written <strong>get-well plan</strong> with specific editorial
              recommendations.
            </p>
          </div>
          <div className="bg-slate-800/50 rounded p-4 border border-purple-500/20">
            <h4 className="font-bold text-white mb-2">Edit</h4>
            <p>
              A full writing environment with file browser, markdown editor, and <strong>inline AI editing</strong>.
              Open a folder, edit files with formatting tools, and use AI-powered preset prompts to revise,
              continue, or transform your text. Run scripts to split chapters, clean up formatting, and more.
            </p>
          </div>
        </div>
      </Section>

      <Section title="AI Chat Assistant">
        <p>
          Click the toggle on the left edge of the screen to open the AI chat panel. The assistant
          is deeply integrated with the application &mdash; it knows which workflow you're on, can
          read all your current data (beats, scores, genre settings), and can <strong>modify fields
          directly</strong> via natural language commands like "set trust to 8 on the first beat"
          or "change genre to Science Fiction."
        </p>
        <p className="mt-2">
          Requires an <strong>OpenRouter API key</strong> (set it in the Analysis workflow).
          Click the <em>"Prompt"</em> button in the chat header to inspect exactly what context
          the assistant receives.
        </p>
      </Section>

      <Section title="Genre System">
        <p>
          Each genre has a default <strong>plot structure</strong> (Romancing the Beat, Hero's Journey,
          Three Act, Mystery/Suspense) and <strong>dimension weights</strong> that define what creates
          tension in that genre. A romance weights the desire-intimacy gap heavily; a thriller weights
          info asymmetry and danger.
        </p>
        <p className="mt-2">
          <strong>Subgenres</strong> refine these weights further (Dark Romance amplifies danger and power
          differential; Cozy Mystery amplifies mystery while reducing stakes). <strong>Modifiers</strong> add
          a final layer (a "Mafia" modifier pushes danger and power even higher).
        </p>
      </Section>

      <Section title="Credits">
        <p>
          The <strong>Narrative Physics Engine</strong> &mdash; the general concept of modeling stories as
          systems of interacting dimensional forces &mdash; was developed by{' '}
          <strong>Elizabeth Ann West</strong>, CEO of the{' '}
          <strong>Future Fiction Academy</strong>.
        </p>
        <p className="mt-2">
          <strong>Rachel Heller</strong> introduced the Future Fiction Academy to{' '}
          <strong>John Truby</strong> and his organic approach to story structure.
        </p>
      </Section>

      <Section title="How Tension Works">
        <p>The tension score is computed from 9 weighted channels:</p>
        <ul className="list-disc list-inside mt-2 space-y-1 text-xs text-purple-200">
          <li><strong>Info Asymmetry</strong> &mdash; direct from the dimension value</li>
          <li><strong>Stakes</strong> &mdash; direct from the dimension value</li>
          <li><strong>Misalignment</strong> &mdash; inverted goal alignment (10 - alignment)</li>
          <li><strong>Power Differential</strong> &mdash; absolute value of power difference</li>
          <li><strong>Vulnerability-Trust Gap</strong> &mdash; vulnerability * (10 - trust) / 10</li>
          <li><strong>Desire-Intimacy Gap</strong> &mdash; desire * (10 - intimacy) / 10</li>
          <li><strong>Proximity-Trust Gap</strong> &mdash; proximity * (10 - trust) / 10</li>
          <li><strong>Danger</strong> &mdash; direct from the dimension value</li>
          <li><strong>Mystery</strong> &mdash; direct from the dimension value</li>
        </ul>
        <p className="mt-2">
          Each channel is multiplied by its <strong>weight</strong> (0&ndash;3 scale), summed, and
          normalized to a 0&ndash;10 scale. Weights vary by genre/subgenre and can be adjusted manually.
        </p>
      </Section>
    </div>
  );
}

function ScaffoldingTab() {
  return (
    <div className="space-y-4 text-sm text-purple-100 leading-relaxed">
      <Section title="Getting Started">
        <ol className="list-decimal list-inside space-y-2">
          <li>
            <strong>Select your genre</strong> &mdash; Choose Genre, Subgenre, and optionally a Modifier
            from the dropdowns at the top. This sets the plot structure, default dimension weights,
            and genre requirements.
          </li>
          <li>
            <strong>Load a template or start fresh</strong> &mdash; Click <em>"Load Template"</em> to
            pick from the genre's canonical arc or any custom structures you've saved.
            Or click <em>"+ Add Beat"</em> to build from scratch.
          </li>
          <li>
            <strong>Edit beats</strong> &mdash; Click a beat's name to rename it inline, or click
            the row to expand it. Set time percentage (0&ndash;100%), beat type, and all 11
            dimension values using sliders. The <strong>Beat Suggestions</strong> panel shows
            where your values diverge from the genre ideal.
          </li>
          <li>
            <strong>Watch the chart</strong> &mdash; The chart on the right updates live as you edit.
            Toggle which dimensions are visible using the checkboxes below the chart.
          </li>
          <li>
            <strong>Check validation</strong> &mdash; The Genre Analysis panel at the bottom shows
            whether your final beat meets genre requirements for intimacy, trust, and tension.
          </li>
        </ol>
      </Section>

      <Section title="Beat Editor Features">
        <ul className="list-disc list-inside space-y-1 text-purple-200">
          <li><strong>Inline label editing:</strong> Click on any beat's name to rename it directly in the collapsed row &mdash; no need to expand first.</li>
          <li><strong>Drag to reorder:</strong> Grab the grip handle ({'\u2261'}) on any beat and drag it to a new position. Its time% adjusts automatically to fit between its new neighbors.</li>
          <li><strong>Insert between beats:</strong> Hover between any two beats to reveal a "+" insertion zone. Click to add a new beat at the midpoint time%, with dimension values averaged from its neighbors.</li>
          <li><strong>Smart Add Beat:</strong> The "+ Add Beat" button finds the largest gap in your timeline and inserts there, rather than appending at the end.</li>
          <li><strong>Custom structures:</strong> Click "Save as Structure" to save your current beats as a named, reusable template. Load them later from the "Load Template" dropdown.</li>
        </ul>
      </Section>

      <Section title="Tips">
        <ul className="list-disc list-inside space-y-1 text-purple-200">
          <li>Beats auto-sort by time percentage. Change a beat's time to reposition it in the arc.</li>
          <li>The mini color bars on collapsed beats give you a quick visual summary of that beat's dimensions.</li>
          <li>Use <em>Export Scaffold</em> to save your work as JSON, and <em>Import Scaffold</em> to restore it later.</li>
          <li>Adjusting weights in the Dimension Toggles section changes how tension is calculated but doesn't change the raw dimension values.</li>
          <li>Modifiers apply multipliers to weights &mdash; look for the yellow arrow showing the effective weight after modifier adjustment.</li>
          <li><strong>Genre blending:</strong> Enable "Blend Mode" to merge two genres. The blend ratio controls how much of each genre's weights, arcs, and requirements are used.</li>
        </ul>
      </Section>

      <Section title="Understanding the Chart">
        <ul className="list-disc list-inside space-y-1 text-purple-200">
          <li>X-axis: Story progress (0&ndash;100%)</li>
          <li>Y-axis: Intensity (0&ndash;10 for most dimensions, -5 to +5 for Power Differential)</li>
          <li>Each colored line represents one narrative dimension</li>
          <li>The red <strong>TENSION</strong> line is derived from all weighted dimensions &mdash; it's not editable directly</li>
          <li>The beat legend shows which structural beat corresponds to which percentage range</li>
        </ul>
      </Section>
    </div>
  );
}

function AnalysisTab() {
  return (
    <div className="space-y-4 text-sm text-purple-100 leading-relaxed">
      <Section title="Step 1: Set Up">
        <ol className="list-decimal list-inside space-y-2">
          <li>
            <strong>Select your genre</strong> &mdash; Same as scaffolding. This determines the ideal
            curve your book will be compared against.
          </li>
          <li>
            <strong>Enter your OpenRouter API key</strong> &mdash; Required for AI-assisted scoring. Your
            key stays in your browser's local storage and is only sent to the OpenRouter API.
            Get a key at <a href="https://openrouter.ai/keys" className="underline text-purple-200 hover:text-white" target="_blank" rel="noopener noreferrer">openrouter.ai/keys</a>.
          </li>
        </ol>
      </Section>

      <Section title="Step 2: Add Chapters">
        <ul className="list-disc list-inside space-y-1 text-purple-200">
          <li><strong>Single mode:</strong> Paste one chapter at a time with an optional title, click "Add Chapter".</li>
          <li><strong>Bulk Split mode:</strong> Paste an entire book. The tool splits on "Chapter X" markers, Markdown headings (<code className="text-purple-200 bg-slate-700/50 px-1 rounded">## Chapter X</code>), or triple-newlines.</li>
          <li>Each chapter appears in the list with word count and status (pending / analyzed / reviewed).</li>
        </ul>
      </Section>

      <Section title="Step 3: Analyze with AI">
        <p>
          Click the "Analyze" button to send pending chapters to your selected model. The AI reads each chapter and
          scores all 11 dimensions, assigns a time percentage and best-matching beat, and provides
          reasoning for its scores.
        </p>
        <p className="mt-2">
          Chapters are sent in batches of 5 to stay within context limits. Analysis may take
          30&ndash;60 seconds per batch.
        </p>
      </Section>

      <Section title="Step 4: Review & Adjust Scores">
        <p>
          The Score Review table shows AI-generated scores for each chapter. Click any row to expand
          and edit individual dimension values. <span className="text-blue-300">Blue values</span> are
          AI-generated; <span className="text-amber-300">amber values</span> have been manually adjusted.
        </p>
        <p className="mt-2">
          Click "Reset to AI Scores" on any chapter to undo your manual edits.
        </p>
      </Section>

      <Section title="Step 5: Compare Against Genre Ideal">
        <p>
          Once chapters are scored, the <strong>Comparison Overlay</strong> chart appears:
        </p>
        <ul className="list-disc list-inside space-y-1 text-purple-200 mt-2">
          <li><strong>Solid lines</strong> = your book's actual dimensional values</li>
          <li><strong>Dashed lines</strong> (40% opacity) = the genre's ideal template curve</li>
          <li>The <strong>Gap Heat Strip</strong> below the chart shows average gap per beat, color-coded green/yellow/orange/red</li>
        </ul>
      </Section>

      <Section title="Step 6: Get-Well Plan">
        <p>The Get-Well Plan provides:</p>
        <ul className="list-disc list-inside space-y-1 text-purple-200 mt-2">
          <li><strong>Overall Health Score</strong> (0&ndash;100) based on weighted gap analysis</li>
          <li><strong>Priority Actions</strong> &mdash; the most impactful changes ranked by severity</li>
          <li><strong>Beat-by-Beat Diagnosis</strong> &mdash; expand each beat to see specific dimensional gaps and suggestions</li>
          <li><strong>Dimension Summary</strong> &mdash; per-dimension trends across the whole book</li>
        </ul>
        <p className="mt-2">
          <strong>AI-Enhanced Plan:</strong> If you have an API key, click "Generate AI Plan" to get
          specific narrative recommendations from the AI (not just numerical gap data). It provides
          an executive summary, beat-specific editorial advice, and ranked priorities.
        </p>
        <p className="mt-2">
          Click <strong>Export Markdown</strong> to download the plan as a .md file you can share or
          reference while editing.
        </p>
      </Section>
    </div>
  );
}

function DimensionsTab() {
  return (
    <div className="space-y-4 text-sm text-purple-100 leading-relaxed">
      <Section title="The 11 Narrative Dimensions">
        <p className="mb-4">
          Each dimension captures a different axis of the reader's experience. Together they form a
          multi-dimensional "context field" that the tension engine reads from.
        </p>
        <div className="space-y-3">
          {DIMENSION_KEYS.map((key) => {
            const dim = dimensions[key];
            return (
              <div key={key} className="bg-slate-800/50 rounded p-3 border-l-4" style={{ borderLeftColor: dim.color }}>
                <div className="flex items-center gap-2 mb-1">
                  <span style={{ color: dim.color }} className="font-bold">{dim.name}</span>
                  <span className="text-xs text-purple-400">Range: {dim.range[0]} to {dim.range[1]}</span>
                </div>
                <p className="text-xs text-purple-200">
                  {dimensionDescriptions[key]}
                </p>
              </div>
            );
          })}
        </div>
      </Section>

      <Section title="Weight Channels">
        <p className="mb-3">
          The tension engine uses <strong>9 weight channels</strong>, not the 11 raw dimensions directly.
          Some channels compute derived "gap" values from pairs of dimensions:
        </p>
        <div className="bg-slate-800/50 rounded p-4 text-xs space-y-2">
          {weightChannelDescriptions.map(({ key, formula, explanation }) => (
            <div key={key} className="flex gap-3">
              <span className="text-purple-300 font-semibold w-36 flex-shrink-0">{key}</span>
              <span className="text-purple-400 font-mono w-48 flex-shrink-0">{formula}</span>
              <span className="text-purple-200">{explanation}</span>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

function EditGuideTab() {
  return (
    <div className="space-y-4 text-sm text-purple-100 leading-relaxed">
      <Section title="Getting Started">
        <ol className="list-decimal list-inside space-y-2">
          <li>
            <strong>Open a folder</strong> &mdash; Click <em>"Open Folder"</em> to grant the app access
            to a directory on your computer via the File System Access API. This loads your files
            into the file panel on the left.
          </li>
          <li>
            <strong>Click any .md or .txt file</strong> to open it in a tab. Multiple files can
            be open simultaneously &mdash; click tabs to switch between them.
          </li>
          <li>
            <strong>Start writing or editing</strong> using the rich-text toolbar, inline AI, or the
            chat panel for longer conversations about your work.
          </li>
        </ol>
      </Section>

      <Section title="File Panel">
        <ul className="list-disc list-inside space-y-1 text-purple-200">
          <li><strong>Tree view:</strong> Folders expand/collapse. Files are sorted alphabetically.</li>
          <li><strong>Open files:</strong> Click any text file (.md, .txt) to open it in a tab.</li>
          <li><strong>Rename:</strong> Double-click a file or folder name to rename it inline.</li>
          <li><strong>Create new:</strong> Hover over a folder to reveal <em>+f</em> (new file) and <em>+d</em> (new folder) buttons.</li>
          <li><strong>Right-click menu:</strong> Right-click any file or folder to access scripts (Split into Chapters, Combine Chapters, Em-dash Cleanup, Regex Search &amp; Replace).</li>
          <li><strong>Context dots:</strong> Each file has a green/gray circle on the right. Green means the file is included in AI context for inline editing prompts. Click to toggle. Clicking a folder's dot toggles all its children.</li>
        </ul>
      </Section>

      <Section title="Markdown Editor">
        <div className="space-y-3">
          <div>
            <h5 className="font-semibold text-purple-300 text-xs uppercase tracking-wider mb-1">Formatting Toolbar</h5>
            <ul className="list-disc list-inside text-xs text-purple-200 space-y-0.5">
              <li><strong>Text styles:</strong> Bold, Italic, Underline, Strikethrough</li>
              <li><strong>Headers:</strong> H1 through H4</li>
              <li><strong>Colors:</strong> Text color (A) and background highlight (A) with color picker grid and reset-to-default option</li>
              <li><strong>Lists:</strong> Ordered and unordered lists</li>
              <li><strong>Block elements:</strong> Blockquote, horizontal rule</li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold text-purple-300 text-xs uppercase tracking-wider mb-1">Editor Features</h5>
            <ul className="list-disc list-inside text-xs text-purple-200 space-y-0.5">
              <li><strong>Themes:</strong> Choose from multiple editor themes (adjusts background, text color, and toolbar styling)</li>
              <li><strong>Search &amp; Replace:</strong> Click the search icon or use Ctrl+H to open the search bar with regex support</li>
              <li><strong>Dual pane:</strong> Split the editor to view two files side-by-side</li>
              <li><strong>Word count:</strong> Live word count shown in the status bar</li>
              <li><strong>Auto-save:</strong> Changes are saved to the file system automatically</li>
              <li><strong>Export:</strong> Download the current file as Markdown (.md)</li>
            </ul>
          </div>
        </div>
      </Section>

      <Section title="Inline AI Editing">
        <p className="mb-2">
          Select text in the editor and an <strong>AI button</strong> appears near your selection.
          Click it to open the editing popup.
        </p>
        <ul className="list-disc list-inside space-y-1 text-purple-200">
          <li><strong>Free-form prompt:</strong> Type any instruction ("make this more vivid", "rewrite in first person", etc.)</li>
          <li><strong>Preset prompts:</strong> Start typing to see matching presets (Continue, Revise, Go, Chapter Revision, Line Edit, etc.). These are full prompt templates with context variables built in.</li>
          <li><strong>Response actions:</strong> After AI responds, you can <em>Accept</em> (replace selection), <em>Reject</em> (keep original), or <em>Retry</em> (try again with same or modified prompt).</li>
          <li><strong>Diff view:</strong> Toggle to see a side-by-side comparison of original vs. AI response with color-coded additions and removals.</li>
          <li><strong>Prompt history:</strong> Previous prompts appear in the dropdown for quick reuse.</li>
        </ul>
      </Section>

      <Section title="AI Context System">
        <p className="mb-2">
          The inline AI editor and the chat panel receive different context:
        </p>
        <div className="bg-slate-800/50 rounded p-4 text-xs space-y-3">
          <div>
            <h5 className="font-semibold text-purple-300 mb-1">Inline AI (preset prompts)</h5>
            <ul className="list-disc list-inside text-purple-200 space-y-0.5">
              <li><code className="text-purple-200 bg-slate-700/50 px-1 rounded">{'{{selected_text}}'}</code> &mdash; the highlighted text in the editor</li>
              <li><code className="text-purple-200 bg-slate-700/50 px-1 rounded">{'{{before}}'}</code> &mdash; text before the cursor/selection (up to ~8,000 chars)</li>
              <li><code className="text-purple-200 bg-slate-700/50 px-1 rounded">{'{{after}}'}</code> &mdash; text after the cursor/selection (up to ~8,000 chars)</li>
              <li><code className="text-purple-200 bg-slate-700/50 px-1 rounded">{'{{selected_documents}}'}</code> &mdash; full content of all green-dot files from the file panel</li>
              <li><code className="text-purple-200 bg-slate-700/50 px-1 rounded">{'{{user_input}}'}</code> &mdash; any text you type after a preset name</li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold text-purple-300 mb-1">Chat Panel</h5>
            <ul className="list-disc list-inside text-purple-200 space-y-0.5">
              <li>Full content of the active editor pane(s)</li>
              <li>Open tab names, directory name</li>
              <li>Story metadata (genre, structure, beats, chapters, scores)</li>
              <li>Native tools for modifying app state (when enabled)</li>
            </ul>
          </div>
        </div>
        <p className="mt-2 text-xs text-purple-300">
          <strong>Tip:</strong> Use green dots for inline presets that need multi-file context (e.g., a continuity check
          across chapters). Use the chat panel for conversational editing or when you need the AI to modify
          beats and genre settings.
        </p>
      </Section>

      <Section title="Tools & Scripts">
        <p className="mb-2">
          Click <strong>Tools</strong> in the toolbar to run built-in scripts, or right-click files/folders
          in the file panel for context-appropriate options.
        </p>
        <div className="space-y-3">
          <div>
            <h5 className="font-semibold text-purple-300 text-xs uppercase tracking-wider mb-1">Built-in Scripts</h5>
            <ul className="list-disc list-inside text-xs text-purple-200 space-y-0.5">
              <li><strong>Split into Chapters:</strong> Splits a file on chapter headings into numbered files in a new folder</li>
              <li><strong>Combine Chapters:</strong> Merges all .md/.txt files in a folder into a single file</li>
              <li><strong>Em-dash Cleanup:</strong> Replaces non-interruption em-dashes with commas (leaves dialogue interruptions intact)</li>
              <li><strong>Regex Search &amp; Replace:</strong> Three-step flow &mdash; describe what to find in plain English (AI suggests a regex), review/edit the pattern, then provide a replacement (or leave empty for find-only mode with match previews)</li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold text-purple-300 text-xs uppercase tracking-wider mb-1">Script Output Panel</h5>
            <p className="text-xs text-purple-200">
              When a script runs, a panel appears at the bottom of the editor showing progress and logs.
              Each log entry is timestamped and color-coded by level (info, warning, error).
            </p>
          </div>
        </div>
      </Section>

      <Section title="Chat Panel (Edit Mode)">
        <p className="mb-2">
          The AI chat panel works alongside the editor with several specialized modes:
        </p>
        <ul className="list-disc list-inside space-y-1 text-purple-200">
          <li><strong>Full Context:</strong> Default mode &mdash; the AI sees all story metadata, editor content, and has access to tools.</li>
          <li><strong>Prompt modes:</strong> Switch to Line Editor, Writing Partner, Critic, or Version Comparator modes via Chat Settings for focused editing assistance.</li>
          <li><strong>Stop generation:</strong> While the AI is responding, the send button becomes a red stop square. Click it to cancel the response mid-stream.</li>
          <li><strong>System prompt viewer:</strong> Click "Prompt" in the chat header to inspect exactly what context the AI receives in the current mode.</li>
          <li><strong>Model selector:</strong> Choose from available models in the dropdown. Pricing is shown as input/output cost per million tokens.</li>
        </ul>
      </Section>
    </div>
  );
}

function ChangelogTab() {
  return (
    <div className="space-y-4 text-sm text-purple-100 leading-relaxed">
      <Section title="Changelog">
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-purple-600 text-white text-xs px-2 py-0.5 rounded font-mono">v2.0.0</span>
              <span className="text-purple-300 text-xs">2026-02-13</span>
            </div>
            <h4 className="font-bold text-white mb-2">Edit Workflow, Inline AI &amp; Script Execution</h4>
            <div className="space-y-3">
              <div>
                <h5 className="font-semibold text-purple-300 text-xs uppercase tracking-wider mb-1">Edit Workflow</h5>
                <ul className="list-disc list-inside text-xs text-purple-200 space-y-0.5">
                  <li>New Edit workflow: full-featured writing environment with file browser and markdown editor</li>
                  <li>File System Access API integration &mdash; open, read, write, rename, and create files/folders directly from the browser</li>
                  <li>File panel with tree view, expand/collapse folders, and tabbed file editing</li>
                  <li>Rich-text toolbar: bold, italic, underline, strikethrough, headers (H1&ndash;H4), lists, blockquotes, text color, background highlight</li>
                  <li>Color picker with reset-to-default for both text color and highlight</li>
                  <li>Multiple editor themes with customizable colors</li>
                  <li>Search &amp; Replace with regex support (Ctrl+H)</li>
                  <li>Dual pane mode for side-by-side file editing</li>
                  <li>Live word count in status bar</li>
                  <li>Markdown export</li>
                </ul>
              </div>
              <div>
                <h5 className="font-semibold text-purple-300 text-xs uppercase tracking-wider mb-1">Inline AI Editing</h5>
                <ul className="list-disc list-inside text-xs text-purple-200 space-y-0.5">
                  <li>Select text to reveal a floating AI button; click to open the editing popup</li>
                  <li>18 preset prompts (Continue, Revise, Go, EPBM, Chapter Revision, Line Edit, Adverb Reduction, Dialogue Tag Refinement, and more)</li>
                  <li>Template variables: {'{{selected_text}}'}, {'{{before}}'}, {'{{after}}'}, {'{{selected_documents}}'}, {'{{user_input}}'}</li>
                  <li>Accept, reject, or retry AI responses with diff view showing additions/removals</li>
                  <li>Prompt history dropdown for quick reuse of previous instructions</li>
                </ul>
              </div>
              <div>
                <h5 className="font-semibold text-purple-300 text-xs uppercase tracking-wider mb-1">AI Context Selection</h5>
                <ul className="list-disc list-inside text-xs text-purple-200 space-y-0.5">
                  <li>Green/gray context dots on every file in the file panel</li>
                  <li>Green-dot files are included as context when using preset prompts with {'{{selected_documents}}'}</li>
                  <li>Folder dots toggle all children at once</li>
                  <li>Separate from the chat panel's context (chat sees editor panes; inline AI sees green-dot files)</li>
                </ul>
              </div>
              <div>
                <h5 className="font-semibold text-purple-300 text-xs uppercase tracking-wider mb-1">Script Execution System</h5>
                <ul className="list-disc list-inside text-xs text-purple-200 space-y-0.5">
                  <li>Tools dropdown in the editor toolbar with 4 built-in scripts</li>
                  <li>Split into Chapters: split a file on chapter headings into numbered .md files</li>
                  <li>Combine Chapters: merge all files in a folder into a single document</li>
                  <li>Em-dash Cleanup: smart em-dash replacement (preserves dialogue interruptions)</li>
                  <li>AI-assisted Regex Search &amp; Replace: describe what to find in plain English, AI suggests a regex pattern</li>
                  <li>Right-click context menu on files/folders for context-appropriate scripts</li>
                  <li>Script output panel with timestamped logs, progress bar, and color-coded messages</li>
                </ul>
              </div>
              <div>
                <h5 className="font-semibold text-purple-300 text-xs uppercase tracking-wider mb-1">Chat Panel Improvements</h5>
                <ul className="list-disc list-inside text-xs text-purple-200 space-y-0.5">
                  <li>Stop button: click the red square to cancel AI generation mid-stream</li>
                  <li>Prompt modes: Full Context, Line Editor, Writing Partner, Critic, Version Comparator</li>
                  <li>Chat settings panel for configuring prompt mode, tools, and temperature</li>
                  <li>AbortController integration for clean stream cancellation</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="border-t border-purple-500/20 pt-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-purple-600 text-white text-xs px-2 py-0.5 rounded font-mono">v1.4.0</span>
              <span className="text-purple-300 text-xs">2026-02-10</span>
            </div>
            <h4 className="font-bold text-white mb-2">Story Structure Reference &amp; Robust JSON Parsing</h4>
            <div className="space-y-3">
              <div>
                <h5 className="font-semibold text-purple-300 text-xs uppercase tracking-wider mb-1">Structure Reference</h5>
                <ul className="list-disc list-inside text-xs text-purple-200 space-y-0.5">
                  <li>Collapsible structure reference panel in Scaffolding workflow showing current structure's acts, beats, and related frameworks</li>
                  <li>New "Story Structures" tab in Help page with all 4 app structures displayed with act distribution bars and beat timelines</li>
                  <li>Reference library of 11 external story frameworks: Three-Act/Syd Field, Kishotenketsu, Freytag's Pyramid, Eight-Sequence, Michael Hauge, W-Plot, Fichtean Curve, Save the Cat, Truby 22 Steps, Story Circle, Seven-Point</li>
                  <li>Each reference framework shown as collapsible card with type badge, step positions, distribution, and summary</li>
                </ul>
              </div>
              <div>
                <h5 className="font-semibold text-purple-300 text-xs uppercase tracking-wider mb-1">Stability</h5>
                <ul className="list-disc list-inside text-xs text-purple-200 space-y-0.5">
                  <li>Robust JSON parser with 3 fallback strategies: direct parse, trailing comma/control char repair, truncated JSON recovery</li>
                  <li>Increased max tokens from 4096 to 8192 for chapter analysis to prevent truncation</li>
                  <li>Improved API error messages for authentication failures (Clerk/OpenRouter)</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="border-t border-purple-500/20 pt-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-purple-600 text-white text-xs px-2 py-0.5 rounded font-mono">v1.3.0</span>
              <span className="text-purple-300 text-xs">2026-02-10</span>
            </div>
            <h4 className="font-bold text-white mb-2">Beat Editor: Drag-and-Drop, Insertion &amp; Custom Structures</h4>
            <div className="space-y-3">
              <div>
                <h5 className="font-semibold text-purple-300 text-xs uppercase tracking-wider mb-1">Beat Editor Improvements</h5>
                <ul className="list-disc list-inside text-xs text-purple-200 space-y-0.5">
                  <li>Inline label editing &mdash; click a beat's name to rename it directly in the collapsed row</li>
                  <li>Drag-and-drop beat reordering with grip handle &mdash; time% recalculates to fit new position</li>
                  <li>"+" insertion zones between beats &mdash; hover to reveal, click to insert at midpoint time%</li>
                  <li>Inserted beats inherit averaged dimension values from their neighbors</li>
                  <li>Smarter "Add Beat" button finds the largest gap in the timeline instead of appending at end</li>
                  <li>Visual drag feedback: dragged row dims, drop target gets green border highlight</li>
                </ul>
              </div>
              <div>
                <h5 className="font-semibold text-purple-300 text-xs uppercase tracking-wider mb-1">Custom Story Structures</h5>
                <ul className="list-disc list-inside text-xs text-purple-200 space-y-0.5">
                  <li>"Save as Structure" button saves current beats as a named, reusable template</li>
                  <li>"Load Template" dropdown shows genre template + all saved custom structures</li>
                  <li>Custom structures persist across sessions in localStorage</li>
                  <li>Delete custom structures from the dropdown menu</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="border-t border-purple-500/20 pt-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-purple-600 text-white text-xs px-2 py-0.5 rounded font-mono">v1.2.0</span>
              <span className="text-purple-300 text-xs">2026-02-10</span>
            </div>
            <h4 className="font-bold text-white mb-2">AI Chat Panel, Genre Blending &amp; Beat Suggestions</h4>
            <div className="space-y-3">
              <div>
                <h5 className="font-semibold text-purple-300 text-xs uppercase tracking-wider mb-1">AI Chat Panel</h5>
                <ul className="list-disc list-inside text-xs text-purple-200 space-y-0.5">
                  <li>Sliding chat drawer on the left edge with toggle button</li>
                  <li>Context-aware: knows which workflow is open, reads all current state</li>
                  <li>Can modify beats, genre settings, weights, and chapter scores via natural language</li>
                  <li>Streaming responses with action badges showing what was changed</li>
                  <li>"Prompt" button to view the live system prompt sent to the LLM</li>
                  <li>Uses the same OpenRouter API key and model as the Analysis workflow</li>
                </ul>
              </div>
              <div>
                <h5 className="font-semibold text-purple-300 text-xs uppercase tracking-wider mb-1">Genre Blending</h5>
                <ul className="list-disc list-inside text-xs text-purple-200 space-y-0.5">
                  <li>Blend two genres with adjustable ratio (1&ndash;99%)</li>
                  <li>Blends dimension weights, preset arcs, and genre requirements</li>
                  <li>"Load Blended Template" creates a merged arc from both genres</li>
                  <li>Blend metadata shown in scaffold output and exports</li>
                </ul>
              </div>
              <div>
                <h5 className="font-semibold text-purple-300 text-xs uppercase tracking-wider mb-1">Beat Suggestions</h5>
                <ul className="list-disc list-inside text-xs text-purple-200 space-y-0.5">
                  <li>Each beat shows dimension suggestions comparing actual vs genre ideal values</li>
                  <li>Color-coded badges indicate which dimensions need adjustment</li>
                  <li>One-click "Apply Suggestions" to snap dimensions to ideal values</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="border-t border-purple-500/20 pt-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-purple-600 text-white text-xs px-2 py-0.5 rounded font-mono">v1.1.0</span>
              <span className="text-purple-300 text-xs">2026-02-09</span>
            </div>
            <h4 className="font-bold text-white mb-2">Pacing System, Scaffold Output &amp; Analysis Output</h4>
            <div className="space-y-3">
              <div>
                <h5 className="font-semibold text-purple-300 text-xs uppercase tracking-wider mb-1">Pacing Templates &amp; Classifier</h5>
                <ul className="list-disc list-inside text-xs text-purple-200 space-y-0.5">
                  <li>6 pacing patterns: Slow Burn, Instalove, One Night Stand, Second Chance, Enemies to Lovers, Friends to Lovers</li>
                  <li>Pacing templates overwrite intimacy curve when loading scaffold (romance genres)</li>
                  <li>Optional companion dimension adjustments (desire, vulnerability) per pacing pattern</li>
                  <li>Algorithmic pacing classifier: detects pattern + confidence from any intimacy curve</li>
                  <li>Pacing selector dropdown integrated into genre configuration (romance-only)</li>
                </ul>
              </div>

              <div>
                <h5 className="font-semibold text-purple-300 text-xs uppercase tracking-wider mb-1">Scaffold Output &amp; Writing Guide</h5>
                <ul className="list-disc list-inside text-xs text-purple-200 space-y-0.5">
                  <li>Summary card: genre configuration, turning points, arc shape, validation status</li>
                  <li>Beat sheet with tension drivers, emotional coordinates, and narrative writing guidance</li>
                  <li>Beat guidance for all 4 plot structures: purpose, emotional goal, establish/avoid lists</li>
                  <li>Export as Markdown (.md) or standalone HTML (printable to PDF)</li>
                </ul>
              </div>

              <div>
                <h5 className="font-semibold text-purple-300 text-xs uppercase tracking-wider mb-1">Revision Checklist &amp; Projection</h5>
                <ul className="list-disc list-inside text-xs text-purple-200 space-y-0.5">
                  <li>Auto-generated revision checklist from gap analysis with priority sorting</li>
                  <li>Interactive checkboxes with progress bar tracking</li>
                  <li>AI-enhanced checklist items when OpenRouter API key is available</li>
                  <li>Before/after projection slider (0&ndash;100%) blending actual toward ideal curves</li>
                  <li>Triple-layer comparison chart: actual (solid), ideal (dashed), projected (dotted)</li>
                  <li>Projected health score recalculated at each slider position</li>
                  <li>Markdown export for revision checklists</li>
                </ul>
              </div>

              <div>
                <h5 className="font-semibold text-purple-300 text-xs uppercase tracking-wider mb-1">Stability</h5>
                <ul className="list-disc list-inside text-xs text-purple-200 space-y-0.5">
                  <li>Error boundary added to prevent blank screens from runtime errors</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="border-t border-purple-500/20 pt-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-purple-600 text-white text-xs px-2 py-0.5 rounded font-mono">v1.0.0</span>
              <span className="text-purple-300 text-xs">2026-02-09</span>
            </div>
            <h4 className="font-bold text-white mb-2">Initial Release &mdash; Full Application</h4>
            <p className="text-purple-200 mb-2">
              Complete rebuild from the original single-file UniversalNarrativeAnalyzer into a
              full Vite + React application with two distinct workflows.
            </p>
            <div className="space-y-3">
              <div>
                <h5 className="font-semibold text-purple-300 text-xs uppercase tracking-wider mb-1">Architecture</h5>
                <ul className="list-disc list-inside text-xs text-purple-200 space-y-0.5">
                  <li>Vite + React 18 standalone application with Tailwind CSS</li>
                  <li>Zustand state management with localStorage persistence</li>
                  <li>React Router with lazy-loaded workflow pages</li>
                  <li>Extracted data modules: dimensions, plot structures, genre system, modifiers, preset arcs</li>
                  <li>Extracted engine modules: tension calculator, validation/gap analysis, weights, defaults</li>
                </ul>
              </div>

              <div>
                <h5 className="font-semibold text-purple-300 text-xs uppercase tracking-wider mb-1">Story Scaffolding Workflow</h5>
                <ul className="list-disc list-inside text-xs text-purple-200 space-y-0.5">
                  <li>Genre/subgenre/modifier selection with auto-configured weights</li>
                  <li>Load genre template arcs as starting points</li>
                  <li>Interactive beat editor with expandable rows and 11 dimension sliders per beat</li>
                  <li>Live Recharts visualization updating in real time</li>
                  <li>Genre requirement validation (intimacy, trust, tension targets)</li>
                  <li>JSON export/import for scaffolds</li>
                </ul>
              </div>

              <div>
                <h5 className="font-semibold text-purple-300 text-xs uppercase tracking-wider mb-1">Reverse Engineering & Diagnosis Workflow</h5>
                <ul className="list-disc list-inside text-xs text-purple-200 space-y-0.5">
                  <li>Chapter input: single-chapter paste or bulk split on "Chapter X" markers</li>
                  <li>OpenRouter API integration for AI-assisted dimension scoring (batched in groups of 5)</li>
                  <li>Score review table with per-chapter expandable editing</li>
                  <li>Comparison overlay chart: solid (actual) vs dashed (ideal) lines with gap heat strip</li>
                  <li>Get-Well Plan: health score, priority actions, beat-by-beat diagnosis</li>
                  <li>Algorithmic recommendations (always available) + AI-enhanced editorial advice (optional)</li>
                  <li>Markdown export for get-well plans</li>
                </ul>
              </div>

              <div>
                <h5 className="font-semibold text-purple-300 text-xs uppercase tracking-wider mb-1">Supported Genres</h5>
                <ul className="list-disc list-inside text-xs text-purple-200 space-y-0.5">
                  <li>Romance: Contemporary, Dark, Serial Killer, Paranormal, Romantic Suspense</li>
                  <li>Science Fiction: Space Opera, Cyberpunk, Hard SF</li>
                  <li>Fantasy: Epic, Urban, Dark</li>
                  <li>Mystery/Thriller/Suspense: Cozy Mystery, Psychological Thriller, Hardboiled Detective</li>
                </ul>
              </div>

              <div>
                <h5 className="font-semibold text-purple-300 text-xs uppercase tracking-wider mb-1">Plot Structures</h5>
                <ul className="list-disc list-inside text-xs text-purple-200 space-y-0.5">
                  <li>Romancing the Beat (Romance)</li>
                  <li>Hero's Journey (Science Fiction, Fantasy)</li>
                  <li>Three Act Structure (General)</li>
                  <li>Mystery/Suspense Structure (Mystery/Thriller)</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="border-t border-purple-500/20 pt-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-slate-600 text-white text-xs px-2 py-0.5 rounded font-mono">v0.1.0</span>
              <span className="text-purple-300 text-xs">Pre-release</span>
            </div>
            <h4 className="font-bold text-white mb-2">Original Prototype</h4>
            <p className="text-purple-200">
              Single-file React component (UniversalNarrativeAnalyzer) with embedded data,
              hardcoded sample arcs, and basic chart visualization. Served as proof-of-concept
              for the multi-dimensional narrative analysis approach.
            </p>
          </div>
        </div>
      </Section>
    </div>
  );
}

const ACT_COLORS = ['#60a5fa', '#4ade80', '#fb923c', '#c084fc', '#f87171', '#22d3ee'];

// Build a map of structureKey -> [genre names that use it]
const structureGenreMap = {};
Object.entries(genreSystem).forEach(([, genre]) => {
  const key = genre.structure;
  if (!structureGenreMap[key]) structureGenreMap[key] = [];
  structureGenreMap[key].push(genre.name);
});

function ActDistributionBar({ acts }) {
  if (!acts || acts.length === 0) return null;
  return (
    <div>
      <div className="flex rounded overflow-hidden h-6">
        {acts.map((act, i) => {
          const width = act.range[1] - act.range[0];
          return (
            <div
              key={i}
              className="flex items-center justify-center text-[10px] font-semibold text-white/90 overflow-hidden"
              style={{
                width: `${width}%`,
                backgroundColor: ACT_COLORS[i % ACT_COLORS.length],
                minWidth: 0,
              }}
              title={`${act.name}: ${act.range[0]}%-${act.range[1]}%`}
            >
              {width >= 12 ? act.name : ''}
            </div>
          );
        })}
      </div>
      <div className="flex mt-0.5">
        {acts.map((act, i) => {
          const width = act.range[1] - act.range[0];
          return (
            <div
              key={i}
              className="text-[9px] text-purple-400 text-center overflow-hidden"
              style={{ width: `${width}%`, minWidth: 0 }}
            >
              {width >= 10 ? `${act.range[0]}-${act.range[1]}%` : ''}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ReferenceCard({ item }) {
  const [open, setOpen] = useState(false);
  const typeBadge = {
    act: { label: 'Act', bg: 'bg-blue-600/60' },
    beat: { label: 'Beat', bg: 'bg-green-600/60' },
    hybrid: { label: 'Hybrid', bg: 'bg-amber-600/60' },
  }[item.type] || { label: item.type, bg: 'bg-slate-600/60' };

  return (
    <div className="bg-slate-800/50 rounded border border-purple-500/20">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-white/5 transition-colors"
      >
        <span className={`transition-transform inline-block text-xs text-purple-400 ${open ? 'rotate-90' : ''}`}>
          {'\u25B6'}
        </span>
        <span className="font-semibold text-white text-sm flex-1">{item.name}</span>
        <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${typeBadge.bg}`}>{typeBadge.label}</span>
        <span className="text-xs text-purple-400">{item.countLabel}</span>
      </button>
      {open && (
        <div className="px-4 pb-3 space-y-3 border-t border-purple-500/10">
          <p className="text-xs text-purple-200 leading-relaxed mt-2">{item.summary}</p>
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-[11px]">
            <span><span className="text-purple-400">Distribution:</span> <span className="text-purple-200">{item.distribution}</span></span>
            <span><span className="text-purple-400">Symmetric:</span> <span className="text-purple-200">{item.symmetric ? 'Yes' : 'No'}</span></span>
            <span><span className="text-purple-400">Genres:</span> <span className="text-purple-200">{item.genres}</span></span>
          </div>
          {item.steps && item.steps.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-0.5">
              {item.steps.map((step, i) => (
                <div key={i} className="flex items-center gap-2 text-[11px]">
                  <span className="text-purple-500 w-4 text-right flex-shrink-0">{i + 1}.</span>
                  <span className="text-purple-200 flex-1">{step.name}</span>
                  <span className="text-purple-500 flex-shrink-0">{step.position}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StructuresTab() {
  const actStructures = referenceStructures.filter((s) => s.type === 'act' || s.type === 'hybrid');
  const beatStructuresRef = referenceStructures.filter((s) => s.type === 'beat');

  return (
    <div className="space-y-4 text-sm text-purple-100 leading-relaxed">
      <Section title="App Structures">
        <p className="mb-4 text-xs text-purple-300">
          These are the 4 story structures used by the Narrative Context Graph for scaffolding and analysis.
          Each structure defines named beats at specific story percentages, grouped into acts.
        </p>
        <div className="space-y-6">
          {Object.entries(plotStructures).map(([key, struct]) => {
            const genres = structureGenreMap[key] || [];
            const beatEntries = Object.entries(struct.beats);
            return (
              <div key={key} className="bg-slate-800/50 rounded p-4 border border-purple-500/20">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="font-bold text-white">{struct.name}</h4>
                  {genres.length > 0 && (
                    <span className="text-[10px] text-purple-400 bg-purple-500/20 px-2 py-0.5 rounded">
                      {genres.join(', ')}
                    </span>
                  )}
                </div>
                {struct.description && (
                  <p className="text-xs text-purple-200 mb-3">{struct.description}</p>
                )}

                <ActDistributionBar acts={struct.acts} />

                <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1">
                  {beatEntries.map(([bKey, beat]) => (
                    <div key={bKey} className="flex items-center gap-2 text-[11px]">
                      <span
                        className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                        style={{ backgroundColor: beat.color }}
                      />
                      <span className="text-purple-200 truncate">{beat.name}</span>
                      <span className="text-purple-500 ml-auto flex-shrink-0">
                        {beat.range[0] === beat.range[1] ? `${beat.range[0]}%` : `${beat.range[0]}-${beat.range[1]}%`}
                      </span>
                    </div>
                  ))}
                </div>

                {struct.relatedFrameworks && (
                  <p className="text-[10px] text-purple-400 mt-2 italic">{struct.relatedFrameworks}</p>
                )}
              </div>
            );
          })}
        </div>
      </Section>

      <Section title="Reference: Act Structures">
        <p className="mb-3 text-xs text-purple-300">
          Act structures define the macro divisions of a story and what percentage each occupies.
          They answer: "How many major sections? How long is each?"
        </p>
        <div className="space-y-2">
          {actStructures.map((item, i) => (
            <ReferenceCard key={i} item={item} />
          ))}
        </div>
      </Section>

      <Section title="Reference: Beat Structures">
        <p className="mb-3 text-xs text-purple-300">
          Beat structures define specific story moments or turning points at prescribed positions.
          They answer: "What happens at this point in the story?"
        </p>
        <div className="space-y-2">
          {beatStructuresRef.map((item, i) => (
            <ReferenceCard key={i} item={item} />
          ))}
        </div>
      </Section>

      <Section title="Key Insights">
        <ul className="list-disc list-inside space-y-1 text-xs text-purple-200">
          <li><strong>Act structures are almost universally non-linear.</strong> The dominant pattern is 25/50/25 with the middle act consuming the bulk of the narrative.</li>
          <li><strong>Only Freytag's original Pyramid is truly symmetric</strong> at the act level (20/20/20/20/20).</li>
          <li><strong>Beat positions are percentage-based, not chapter-based.</strong> A 30-chapter three-act novel has ~8/~15/~7 chapters, not 10/10/10.</li>
          <li><strong>Truby's organic approach</strong> rejects imposed act divisions. Structure grows from character need and moral argument.</li>
          <li><strong>Act structures define the shape; beat structures fill in the moments.</strong> The app handles this separation: plotStructures = act/beat ranges; presetArcs = specific moments with dimension values.</li>
        </ul>
      </Section>
    </div>
  );
}

const dimensionDescriptions = {
  intimacy: 'Emotional entanglement between characters — how enmeshed, engaged, and emotionally invested they are in each other, regardless of whether that engagement is positive or negative. Anger, rivalry, forced proximity, and obsession all drive high intimacy because they create intense emotional engagement (supported by excitation transfer theory). Low intimacy = indifference; high intimacy = deep entanglement, whether as love, fury, or fixation. Vulnerability is tracked separately — high intimacy with low vulnerability means the connection is charged but guarded.',
  powerDiff: 'The power imbalance between key characters. Positive = Character A dominates; negative = Character B dominates; zero = equal footing. Power shifts drive conflict in nearly every genre, from corporate thrillers to fantasy courts.',
  infoAsym: 'How much one character (or the reader) knows vs. others. High info asymmetry creates dramatic irony, suspense, and the drive to reveal. Mysteries live and die on this dimension.',
  alignment: 'How closely characters\' goals align. High alignment = working together; low = actively opposing. Goal misalignment is one of the most fundamental sources of narrative tension.',
  proximity: 'How physically close the characters are forced to be. Forced proximity amplifies every other dimension -- tension rises when you can\'t escape someone you don\'t trust, or desire someone you\'re stuck with.',
  vulnerability: 'How emotionally or physically exposed a character is. Vulnerability without trust creates anxiety; vulnerability with trust creates catharsis. It\'s the dimension that makes readers hold their breath.',
  desire: 'Wanting -- whether romantic, professional, or existential. The gap between desire and fulfillment (intimacy, goal achievement, safety) drives characters forward. In romance, this is the ache; in thrillers, the obsession.',
  stakes: 'What\'s at risk if things go wrong. Low stakes = a mild inconvenience; high stakes = death, loss of love, end of the world. Stakes give weight to every other dimension.',
  trust: 'How much characters rely on each other. Trust is slow to build and fast to destroy. Its interaction with vulnerability and proximity creates some of fiction\'s most powerful moments.',
  danger: 'External threat level -- physical, psychological, or social. Danger raises stakes, reduces safety, and forces characters to reveal who they really are under pressure.',
  mystery: 'The unknown -- unanswered questions that pull readers forward. What\'s in the box? Who killed them? What does the prophecy mean? Mystery is the engine of page-turning.',
};

const weightChannelDescriptions = [
  { key: 'infoAsym', formula: 'point.infoAsym', explanation: 'Direct: information asymmetry value' },
  { key: 'stakes', formula: 'point.stakes', explanation: 'Direct: stakes value' },
  { key: 'misalignment', formula: '10 - point.alignment', explanation: 'Inverted: low alignment = high misalignment' },
  { key: 'powerDiff', formula: 'abs(point.powerDiff)', explanation: 'Absolute: any power imbalance creates tension' },
  { key: 'vulnerabilityTrust', formula: 'vuln * (10 - trust) / 10', explanation: 'Gap: being vulnerable without trust' },
  { key: 'desireIntimacy', formula: 'desire * (10 - intimacy) / 10', explanation: 'Gap: wanting without having' },
  { key: 'proximityTrust', formula: 'proximity * (10 - trust) / 10', explanation: 'Gap: closeness without safety' },
  { key: 'danger', formula: 'point.danger', explanation: 'Direct: danger/threat value' },
  { key: 'mystery', formula: 'point.mystery', explanation: 'Direct: mystery/unknown value' },
];

const tabLabels = {
  about: 'About',
  scaffolding: 'Scaffolding Guide',
  analysis: 'Analysis Guide',
  editing: 'Edit Workflow',
  structures: 'Story Structures',
  actStructures: 'Act Structures Survey',
  dimensions: 'Dimensions Reference',
  changelog: 'Changelog',
};

export default function HelpPage() {
  const [activeTab, setActiveTab] = useState('about');

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Help & Documentation</h1>

      {/* Tabs */}
      <div className="flex gap-1 mb-0 overflow-x-auto">
        {tabs.map((tab) => (
          <Tab
            key={tab}
            id={tab}
            label={tabLabels[tab]}
            active={activeTab === tab}
            onClick={setActiveTab}
          />
        ))}
      </div>

      {/* Content */}
      <div className="bg-white/10 backdrop-blur rounded-b-lg rounded-tr-lg p-6 border border-purple-500/20 border-t-0">
        {activeTab === 'about' && <AboutTab />}
        {activeTab === 'scaffolding' && <ScaffoldingTab />}
        {activeTab === 'analysis' && <AnalysisTab />}
        {activeTab === 'editing' && <EditGuideTab />}
        {activeTab === 'structures' && <StructuresTab />}
        {activeTab === 'actStructures' && <ActStructuresTab />}
        {activeTab === 'dimensions' && <DimensionsTab />}
        {activeTab === 'changelog' && <ChangelogTab />}
      </div>
    </div>
  );
}
