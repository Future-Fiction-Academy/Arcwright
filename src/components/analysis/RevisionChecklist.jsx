import React, { useMemo } from 'react';
import useAppStore from '../../store/useAppStore';
import { dimensions } from '../../data/dimensions';
import { exportChecklistMarkdown } from '../../engine/revisionChecklist';
import { genreSystem } from '../../data/genreSystem';

function ChecklistItem({ item, onToggle }) {
  return (
    <div className={`rounded-lg border p-4 transition-colors ${
      item.checked
        ? 'bg-green-900/20 border-green-500/30'
        : 'bg-slate-800/50 border-purple-500/20'
    }`}>
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={item.checked}
          onChange={() => onToggle(item.id)}
          className="mt-1 accent-green-500"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-sm">{item.beat}</span>
            <span className="text-purple-400 font-mono text-xs">{item.time}%</span>
            <span className={`text-xs px-2 py-0.5 rounded font-semibold ${
              item.priority === 'HIGH' ? 'bg-red-600/60 text-red-200' :
              item.priority === 'MEDIUM' ? 'bg-yellow-600/60 text-yellow-200' :
              'bg-green-600/60 text-green-200'
            }`}>
              {item.priority}
            </span>
          </div>

          {item.aiDiagnosis && (
            <p className="text-xs text-purple-200 mb-1">
              <strong>Diagnosis:</strong> {item.aiDiagnosis}
            </p>
          )}
          {item.aiRecommendation && (
            <p className="text-xs text-white mb-2">{item.aiRecommendation}</p>
          )}

          <div className="flex flex-wrap gap-2">
            {item.adjustments.map((adj) => (
              <span
                key={adj.dimension}
                className="text-xs px-2 py-1 rounded bg-slate-700/50"
              >
                <span style={{ color: adj.color }} className="font-semibold">
                  {adj.direction === 'reduce' ? '\u2193' : '\u2191'} {adj.dimensionName}
                </span>
                <span className="text-purple-300 ml-1">
                  {adj.actual.toFixed(1)} → {adj.ideal.toFixed(1)}
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RevisionChecklist() {
  const {
    revisionItems, toggleRevisionItem,
    selectedGenre, selectedSubgenre,
  } = useAppStore();

  const completedCount = revisionItems.filter((i) => i.checked).length;
  const progress = revisionItems.length > 0
    ? Math.round((completedCount / revisionItems.length) * 100)
    : 0;

  const handleExport = () => {
    const genre = genreSystem[selectedGenre];
    const subgenre = genre.subgenres[selectedSubgenre];
    const md = exportChecklistMarkdown(revisionItems, genre.name, subgenre.name, 0);
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `revision-checklist-${selectedGenre}-${selectedSubgenre}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (revisionItems.length === 0) return null;

  return (
    <div className="bg-white/10 backdrop-blur rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold">Revision Checklist</h3>
        <button
          onClick={handleExport}
          className="text-sm bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded font-semibold"
        >
          Export Markdown
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-purple-300 mb-1">
          <span>{completedCount}/{revisionItems.length} items completed</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="space-y-2">
        {revisionItems.map((item) => (
          <ChecklistItem
            key={item.id}
            item={item}
            onToggle={toggleRevisionItem}
          />
        ))}
      </div>
    </div>
  );
}
