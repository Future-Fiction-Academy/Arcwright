import React from 'react';

export default function SummaryCard({ summary }) {
  if (!summary) return null;

  return (
    <div className="bg-white/10 backdrop-blur rounded-lg p-6 mb-6">
      <h3 className="text-xl font-bold mb-4">Arc Summary</h3>

      {/* Config */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {[
          ['Genre', summary.genre],
          ['Subgenre', summary.subgenre],
          ['Modifier', summary.modifier],
          ['Pacing', summary.pacing],
        ].map(([label, value]) => (
          <div key={label} className="bg-slate-800/50 rounded p-2 text-center">
            <div className="text-[10px] text-purple-400 uppercase font-bold">{label}</div>
            <div className="text-sm font-semibold">{value}</div>
          </div>
        ))}
      </div>

      {/* Blend Info */}
      {summary.blendMeta && (
        <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-3 mb-4 flex items-center gap-3">
          <span className="text-xs font-bold text-purple-300 uppercase">Blended</span>
          <span className="text-sm">
            {summary.blendMeta.blendRatio}% {summary.genre} / {100 - summary.blendMeta.blendRatio}% {summary.blendMeta.secondaryGenre} ({summary.blendMeta.secondarySubgenre})
          </span>
        </div>
      )}

      {/* Arc Shape */}
      <div className="bg-slate-800/50 rounded-lg p-4 mb-4">
        <p className="text-sm text-white mb-2">{summary.arcDescription}</p>
        <div className="flex gap-4 text-xs text-purple-300">
          {['Beginning', 'Middle', 'End'].map((label, i) => (
            <div key={label} className="flex items-center gap-1">
              <span>{label}:</span>
              <span className="font-mono font-bold text-white">
                {summary.avgTensionPerThird[i].toFixed(1)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Turning Points */}
      {summary.turningPoints.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-bold text-purple-300 mb-2">Key Turning Points</h4>
          <div className="flex flex-wrap gap-2">
            {summary.turningPoints.map((tp, i) => (
              <div
                key={i}
                className={`text-xs px-3 py-1.5 rounded-full font-semibold ${
                  tp.direction === 'rise'
                    ? 'bg-orange-900/40 text-orange-300 border border-orange-500/30'
                    : 'bg-blue-900/40 text-blue-300 border border-blue-500/30'
                }`}
              >
                {tp.label} ({tp.time}%) — {tp.direction === 'rise' ? '\u2191' : '\u2193'}{tp.shift.toFixed(1)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Critical Moments */}
      {summary.criticalMoments.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-bold text-purple-300 mb-2">Critical High-Tension Moments</h4>
          <div className="flex flex-wrap gap-2">
            {summary.criticalMoments.map((cm, i) => (
              <div
                key={i}
                className="text-xs px-3 py-1.5 rounded-full bg-red-900/40 text-red-300 border border-red-500/30 font-semibold"
              >
                {cm.label} ({cm.time}%) — tension {cm.tension.toFixed(1)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Validation */}
      <div className="flex gap-3">
        {[
          ['Intimacy', summary.validation.intimacy],
          ['Trust', summary.validation.trust],
          ['Tension', summary.validation.tension],
        ].map(([label, pass]) => (
          <span
            key={label}
            className={`text-xs px-3 py-1 rounded font-semibold ${
              pass
                ? 'bg-green-900/40 text-green-300 border border-green-500/30'
                : 'bg-red-900/40 text-red-300 border border-red-500/30'
            }`}
          >
            {label}: {pass ? 'PASS' : 'FAIL'}
          </span>
        ))}
      </div>
    </div>
  );
}
