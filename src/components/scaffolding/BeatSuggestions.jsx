import React, { useMemo, useState } from 'react';
import { generateBeatSuggestions } from '../../engine/suggestions';

function SeverityBadge({ severity }) {
  const colors = {
    high: 'bg-red-600/60 text-red-200',
    medium: 'bg-yellow-600/60 text-yellow-200',
    low: 'bg-green-600/60 text-green-200',
  };
  return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase ${colors[severity] || colors.low}`}>
      {severity}
    </span>
  );
}

export default function BeatSuggestions({ beat, idealCurve, activeWeights, structureKey, onUpdate }) {
  const [guidanceExpanded, setGuidanceExpanded] = useState(false);

  const { positionSummary, suggestions, guidance } = useMemo(
    () => generateBeatSuggestions(beat, idealCurve, activeWeights, structureKey),
    [beat, idealCurve, activeWeights, structureKey]
  );

  if (!idealCurve || idealCurve.length === 0) return null;

  const hasSuggestions = suggestions.length > 0;
  const hasGuidance = guidance !== null;

  if (!hasSuggestions && !hasGuidance) return null;

  return (
    <div className="mt-3 border-t border-purple-500/20 pt-3 space-y-2">
      <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
        <span>&#x1f4a1;</span> Suggestions
        <span className="text-purple-300 font-normal">{positionSummary}</span>
      </h4>

      {hasSuggestions && (
        <div className="space-y-1.5">
          {suggestions.map((s) => (
            <div
              key={s.dimension}
              className="flex items-start gap-2 bg-slate-900/50 rounded p-2"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-semibold" style={{ color: s.color }}>
                    {s.dimensionName}
                  </span>
                  <SeverityBadge severity={s.severity} />
                  <span className="text-[10px] text-purple-300">
                    {s.actual} &rarr; {s.expected}
                  </span>
                </div>
                <p className="text-[11px] text-purple-200">{s.suggestion}</p>
              </div>
              <button
                onClick={() => onUpdate(beat.id, { [s.dimension]: Math.round(s.expected * 2) / 2 })}
                className="text-[10px] bg-purple-600/50 hover:bg-purple-600 px-2 py-1 rounded whitespace-nowrap flex-shrink-0"
                title={`Set ${s.dimensionName} to ${s.expected}`}
              >
                Snap
              </button>
            </div>
          ))}
        </div>
      )}

      {hasGuidance && (
        <div>
          <button
            className="text-[11px] text-purple-300 hover:text-purple-200 underline"
            onClick={() => setGuidanceExpanded(!guidanceExpanded)}
          >
            {guidanceExpanded ? 'Hide' : 'Show'} Beat Guidance
          </button>

          {guidanceExpanded && (
            <div className="mt-2 bg-purple-900/30 rounded p-3 border border-purple-500/30 space-y-2 text-[11px]">
              {guidance.purpose && (
                <div>
                  <span className="font-bold text-purple-300">Purpose: </span>
                  <span className="text-purple-200">{guidance.purpose}</span>
                </div>
              )}
              {guidance.emotionalGoal && (
                <div>
                  <span className="font-bold text-purple-300">Emotional Goal: </span>
                  <span className="text-purple-200">{guidance.emotionalGoal}</span>
                </div>
              )}
              {guidance.establish?.length > 0 && (
                <div>
                  <span className="font-bold text-green-300">Establish:</span>
                  <ul className="list-disc list-inside text-purple-200 ml-2">
                    {guidance.establish.map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                </div>
              )}
              {guidance.avoid?.length > 0 && (
                <div>
                  <span className="font-bold text-red-300">Avoid:</span>
                  <ul className="list-disc list-inside text-purple-200 ml-2">
                    {guidance.avoid.map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                </div>
              )}
              {guidance.connectionToNext && (
                <div className="italic text-blue-300">
                  {guidance.connectionToNext}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
