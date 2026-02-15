import React, { useState } from 'react';
import { dimensions } from '../../data/dimensions';

function BeatSheetEntry({ entry }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-slate-800/50 rounded-lg border border-purple-500/20 p-4">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <span className="text-purple-400 font-mono text-sm">{entry.time}%</span>
          <span className="font-semibold text-sm">{entry.label}</span>
          {entry.beat && (
            <span className="text-xs text-purple-300 bg-purple-900/30 px-2 py-0.5 rounded">
              {entry.beat}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div
            className={`text-xs px-2 py-0.5 rounded font-bold ${
              entry.tension >= 7 ? 'bg-red-600/60 text-red-200' :
              entry.tension >= 4 ? 'bg-yellow-600/60 text-yellow-200' :
              'bg-green-600/60 text-green-200'
            }`}
          >
            Tension: {entry.tension.toFixed(1)}
          </div>
          <span className="text-purple-400 text-xs">{expanded ? '\u25B2' : '\u25BC'}</span>
        </div>
      </div>

      {expanded && (
        <div className="mt-3 space-y-3">
          {/* Tension Drivers */}
          <div>
            <h5 className="text-xs font-bold text-purple-300 mb-1">Top Tension Drivers</h5>
            <div className="flex gap-2">
              {entry.tensionDrivers.map((d) => (
                <span
                  key={d.key}
                  className="text-xs px-2 py-1 rounded bg-slate-700/50"
                  style={{ color: d.color }}
                >
                  {d.name}: {d.value.toFixed(1)}
                </span>
              ))}
            </div>
          </div>

          {/* Dimensional Coordinates */}
          <div>
            <h5 className="text-xs font-bold text-purple-300 mb-1">Emotional Coordinates</h5>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-1">
              {Object.entries(entry.dimensions).map(([key, value]) => (
                <div key={key} className="flex items-center gap-1 text-xs">
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: dimensions[key]?.color }}
                  />
                  <span className="text-purple-300 truncate">{dimensions[key]?.name}:</span>
                  <span className="font-mono text-white">{value.toFixed(1)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Writing Guidance */}
          {entry.guidance && (
            <div className="bg-purple-900/30 rounded p-3 border border-purple-500/30">
              <h5 className="text-xs font-bold text-purple-300 mb-2">Writing Guidance</h5>
              <p className="text-xs text-white mb-2">
                <strong>Purpose:</strong> {entry.guidance.purpose}
              </p>
              <p className="text-xs text-purple-200 mb-2">
                <strong>Emotional Goal:</strong> {entry.guidance.emotionalGoal}
              </p>

              {entry.guidance.establish?.length > 0 && (
                <div className="mb-2">
                  <p className="text-xs font-semibold text-green-400">Establish:</p>
                  <ul className="text-xs text-purple-200 list-disc list-inside">
                    {entry.guidance.establish.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {entry.guidance.avoid?.length > 0 && (
                <div className="mb-2">
                  <p className="text-xs font-semibold text-red-400">Avoid:</p>
                  <ul className="text-xs text-red-200/70 list-disc list-inside">
                    {entry.guidance.avoid.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {entry.guidance.connectionToNext && (
                <p className="text-xs text-blue-300 italic">
                  <strong>Connection to Next:</strong> {entry.guidance.connectionToNext}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function BeatSheetView({ beatSheet }) {
  const [expandAll, setExpandAll] = useState(false);

  if (!beatSheet || beatSheet.length === 0) return null;

  return (
    <div className="bg-white/10 backdrop-blur rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold">Beat Sheet & Writing Guide</h3>
        <button
          onClick={() => setExpandAll(!expandAll)}
          className="text-xs text-purple-300 hover:text-white"
        >
          {expandAll ? 'Collapse All' : 'Expand All'}
        </button>
      </div>

      <div className="space-y-2">
        {beatSheet.map((entry, i) => (
          <BeatSheetEntry key={i} entry={entry} />
        ))}
      </div>
    </div>
  );
}
