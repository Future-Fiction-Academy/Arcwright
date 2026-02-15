import React from 'react';
import { classifyPacingPattern } from '../../engine/pacing';

export default function PacingClassifierBadge({ beats }) {
  if (!beats || beats.length < 3) return null;

  // Only classify if there's meaningful intimacy data
  const hasIntimacy = beats.some((b) => (b.intimacy ?? 0) > 0);
  if (!hasIntimacy) return null;

  const result = classifyPacingPattern(beats);

  const confidenceColor =
    result.confidence >= 70 ? 'text-green-400' :
    result.confidence >= 50 ? 'text-yellow-400' :
    'text-red-400';

  const bgColor =
    result.confidence >= 70 ? 'bg-green-900/30 border-green-500/30' :
    result.confidence >= 50 ? 'bg-yellow-900/30 border-yellow-500/30' :
    'bg-red-900/30 border-red-500/30';

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm ${bgColor}`}>
      <span className="text-purple-300 text-xs">Detected pacing:</span>
      <span className="font-semibold text-white">{result.name}</span>
      <span className={`text-xs font-mono ${confidenceColor}`}>
        {result.confidence}%
      </span>
    </div>
  );
}
