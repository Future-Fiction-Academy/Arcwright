import React from 'react';
import { Link } from 'react-router-dom';
import SetupBanner from '../projects/SetupBanner';

export default function WorkflowSelector() {
  return (
    <div>
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-3">Arcwrite</h1>
        <p className="text-purple-200 text-lg italic">
          Story analysis, scaffolding, and editorial tools
        </p>
      </div>

      <SetupBanner />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <Link
          to="/scaffold"
          className="group bg-white/10 backdrop-blur rounded-xl p-8 border border-purple-500/30 hover:border-purple-400 hover:bg-white/15 transition-all"
        >
          <div className="text-3xl mb-4">&#x1F3D7;&#xFE0F;</div>
          <h2 className="text-2xl font-bold mb-3 group-hover:text-purple-300 transition-colors">
            Story Scaffolding
          </h2>
          <p className="text-purple-200 text-sm leading-relaxed mb-4">
            Build a new story's dimensional arc from scratch or start from a genre template.
            Set dimension values at each story beat and watch your narrative take shape in real time.
          </p>
          <ul className="text-xs text-purple-300 space-y-1">
            <li>+ Genre-specific beat templates</li>
            <li>+ Interactive dimension sliders per beat</li>
            <li>+ Live chart visualization</li>
            <li>+ Genre requirement validation</li>
            <li>+ Export/import scaffolds</li>
          </ul>
        </Link>

        <Link
          to="/analyze"
          className="group bg-white/10 backdrop-blur rounded-xl p-8 border border-purple-500/30 hover:border-purple-400 hover:bg-white/15 transition-all"
        >
          <div className="text-3xl mb-4">&#x1F50D;</div>
          <h2 className="text-2xl font-bold mb-3 group-hover:text-purple-300 transition-colors">
            Reverse Engineer & Diagnose
          </h2>
          <p className="text-purple-200 text-sm leading-relaxed mb-4">
            Analyze an existing book chapter-by-chapter. AI scores the narrative dimensions,
            you refine, then compare against genre ideals with a full editorial get-well plan.
          </p>
          <ul className="text-xs text-purple-300 space-y-1">
            <li>+ AI-assisted dimension scoring (via OpenRouter)</li>
            <li>+ Manual score adjustment</li>
            <li>+ Actual vs ideal comparison overlay</li>
            <li>+ Beat-by-beat editorial recommendations</li>
            <li>+ Exportable get-well plan</li>
          </ul>
        </Link>

        <Link
          to="/edit"
          className="group bg-white/10 backdrop-blur rounded-xl p-8 border border-purple-500/30 hover:border-purple-400 hover:bg-white/15 transition-all"
        >
          <div className="text-3xl mb-4">&#x270F;&#xFE0F;</div>
          <h2 className="text-2xl font-bold mb-3 group-hover:text-purple-300 transition-colors">
            Edit
          </h2>
          <p className="text-purple-200 text-sm leading-relaxed mb-4">
            Write and edit your manuscript in markdown. Browse local files, use AI chat for
            writing assistance, and view chapter variables alongside your text.
          </p>
          <ul className="text-xs text-purple-300 space-y-1">
            <li>+ Markdown source editing with formatting bar</li>
            <li>+ Local file browser (open folders)</li>
            <li>+ AI chat panel for writing help</li>
            <li>+ Dual-pane mode for side-by-side editing</li>
            <li>+ Chapter variable reference panel</li>
          </ul>
        </Link>
      </div>
    </div>
  );
}
