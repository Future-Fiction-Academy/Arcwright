import React from 'react';
import useAppStore from '../../store/useAppStore';
import { genreSystem, genreDimensionRanges } from '../../data/genreSystem';
import { allStructures } from '../../data/plotStructures';
import { modifierEffects } from '../../data/modifierEffects';
import { dimensions } from '../../data/dimensions';

export default function ValidationPanel({ validation, enrichedData }) {
  const { selectedGenre, selectedSubgenre, selectedModifier, selectedStructure } = useAppStore();

  const currentGenre = genreSystem[selectedGenre];
  const currentSubgenre = currentGenre.subgenres[selectedSubgenre];
  const currentStructure = allStructures[selectedStructure] || allStructures[currentGenre.structure];
  const allPass = validation.intimacy && validation.trust && validation.tension;
  const ranges = genreDimensionRanges[selectedGenre] || {};

  // Final beat values
  const finalPoint = enrichedData?.[enrichedData.length - 1];
  const firstPoint = enrichedData?.[0];
  const beatCount = enrichedData?.length || 0;

  // Requirement check with actual values
  const reqs = currentSubgenre.requirements;
  const reqChecks = [
    { key: 'intimacy', label: 'Intimacy', range: reqs.finalIntimacy, pass: validation.intimacy },
    { key: 'trust', label: 'Trust', range: reqs.finalTrust, pass: validation.trust },
    { key: 'tension', label: 'Tension', range: reqs.finalTension, pass: validation.tension },
  ];

  // Compute per-dimension arc deltas (first → last)
  const dimEntries = Object.entries(dimensions);

  return (
    <div className="bg-white/10 backdrop-blur rounded-lg p-6">
      <h3 className="text-xl font-bold mb-4">Genre Analysis</h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left column: configuration + requirements */}
        <div className="p-4 bg-purple-900/30 rounded border border-purple-500">
          <p className="text-sm mb-2">
            <strong className="text-purple-300">Configuration:</strong>{' '}
            <strong>{currentGenre.name}</strong> &rarr; <strong>{currentSubgenre.name}</strong>
            {selectedModifier && (
              <span> &rarr; <strong className="text-yellow-300">{selectedModifier}</strong></span>
            )}
          </p>
          <p className="text-sm mb-2">
            <strong className="text-purple-300">Plot Structure:</strong> {currentStructure.name}
            <span className="text-purple-400 ml-2 text-xs">({beatCount} beats)</span>
          </p>
          {selectedModifier && modifierEffects[selectedModifier] && (
            <p className="text-sm mb-2">
              <strong className="text-purple-300">Modifier:</strong>{' '}
              <span className="text-yellow-200">{modifierEffects[selectedModifier].description}</span>
            </p>
          )}

          <div className="border-t border-purple-500/50 pt-3 mt-3">
            <h4 className="text-sm font-semibold mb-2 text-purple-300">Genre Requirements (Final Beat):</h4>
            <div className="space-y-2">
              {reqChecks.map(({ key, label, range, pass }) => {
                const actual = finalPoint?.[key];
                const dim = dimensions[key];
                const dimRange = dim?.range || [0, 10];
                const scale = dimRange[1] - dimRange[0];
                // Bar positions as percentages
                const reqLeftPct = ((range[0] - dimRange[0]) / scale) * 100;
                const reqWidthPct = ((range[1] - range[0]) / scale) * 100;
                const actualPct = actual != null ? ((actual - dimRange[0]) / scale) * 100 : null;

                return (
                  <div key={key}>
                    <div className="flex items-center justify-between text-xs mb-0.5">
                      <span className="flex items-center gap-1.5">
                        <span className={pass ? 'text-green-400' : 'text-red-400'}>
                          {pass ? '\u2713' : '\u2717'}
                        </span>
                        <span style={{ color: dim?.color }}>{label}</span>
                      </span>
                      <span className="text-purple-300 font-mono">
                        {actual != null ? actual.toFixed(1) : '?'}{' '}
                        <span className="text-purple-500">({range[0]}-{range[1]})</span>
                      </span>
                    </div>
                    <div className="relative h-2 bg-slate-700 rounded-full overflow-hidden">
                      {/* Required range band */}
                      <div
                        className="absolute top-0 h-full bg-purple-500/40 rounded-full"
                        style={{ left: `${reqLeftPct}%`, width: `${reqWidthPct}%` }}
                      />
                      {/* Actual value marker */}
                      {actualPct != null && (
                        <div
                          className={`absolute top-0 h-full w-1.5 rounded-full ${pass ? 'bg-green-400' : 'bg-red-400'}`}
                          style={{ left: `${Math.min(100, Math.max(0, actualPct))}%` }}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="text-sm mt-3">
              <strong className="text-purple-300">Status:</strong>{' '}
              {allPass ? (
                <span className="text-green-400 font-bold">{'\u2713'} Valid trajectory for genre</span>
              ) : (
                <span className="text-yellow-400 font-bold">Check genre requirements</span>
              )}
            </p>
          </div>
        </div>

        {/* Right column: all dimension final values with arc direction */}
        <div className="p-4 bg-purple-900/30 rounded border border-purple-500">
          <h4 className="text-sm font-semibold mb-3 text-purple-300">Dimension Summary (Final Values)</h4>
          <div className="space-y-1.5">
            {dimEntries.map(([key, dim]) => {
              const finalVal = finalPoint?.[key];
              const firstVal = firstPoint?.[key];
              const range = ranges[key];
              const dimRange = dim.range || [0, 10];
              const scale = dimRange[1] - dimRange[0];
              const valPct = finalVal != null ? ((finalVal - dimRange[0]) / scale) * 100 : 0;
              const delta = finalVal != null && firstVal != null ? finalVal - firstVal : null;

              // Is the final value in the genre's typical range?
              const inRange = range && finalVal != null
                ? finalVal >= range[0] && finalVal <= range[1]
                : null;

              // Genre range band
              const rangeLeftPct = range ? ((range[0] - dimRange[0]) / scale) * 100 : 0;
              const rangeWidthPct = range ? ((range[1] - range[0]) / scale) * 100 : 0;

              return (
                <div key={key}>
                  <div className="flex items-center justify-between text-xs mb-0.5">
                    <span style={{ color: dim.color }} className="font-semibold truncate">{dim.name}</span>
                    <span className="flex items-center gap-1.5 font-mono text-purple-200 shrink-0">
                      {finalVal != null ? finalVal.toFixed(1) : '-'}
                      {delta != null && (
                        <span className={`text-[10px] ${delta > 0 ? 'text-green-400' : delta < 0 ? 'text-red-400' : 'text-purple-500'}`}>
                          {delta > 0 ? '\u25B2' : delta < 0 ? '\u25BC' : '\u25C6'}{Math.abs(delta).toFixed(1)}
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="relative h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    {/* Genre typical range band */}
                    {range && (
                      <div
                        className="absolute top-0 h-full bg-purple-500/30 rounded-full"
                        style={{ left: `${rangeLeftPct}%`, width: `${rangeWidthPct}%` }}
                      />
                    )}
                    {/* Value bar */}
                    <div
                      className="absolute top-0 h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, Math.max(0, valPct))}%`,
                        backgroundColor: dim.color,
                        opacity: 0.7,
                      }}
                    />
                  </div>
                </div>
              );
            })}
            {/* Tension (derived) */}
            {finalPoint?.tension != null && (
              <div>
                <div className="flex items-center justify-between text-xs mb-0.5">
                  <span className="text-red-400 font-semibold">TENSION (derived)</span>
                  <span className="font-mono text-purple-200">
                    {finalPoint.tension.toFixed(1)}
                    {firstPoint?.tension != null && (
                      <span className={`text-[10px] ml-1.5 ${finalPoint.tension - firstPoint.tension > 0 ? 'text-red-400' : 'text-green-400'}`}>
                        {finalPoint.tension > firstPoint.tension ? '\u25B2' : '\u25BC'}{Math.abs(finalPoint.tension - firstPoint.tension).toFixed(1)}
                      </span>
                    )}
                  </span>
                </div>
                <div className="relative h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="absolute top-0 h-full rounded-full bg-red-500/70"
                    style={{ width: `${Math.min(100, (finalPoint.tension / 10) * 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
