import React, { useState } from 'react';
import useAppStore from '../../store/useAppStore';
import { dimensions } from '../../data/dimensions';
import { modifierEffects } from '../../data/modifierEffects';
import { genreSystem, genreDimensionRanges } from '../../data/genreSystem';
import { getModifierAdjustedWeights } from '../../engine/weights';
import { getGenreDescription } from '../../engine/defaults';

export default function DimensionToggles() {
  const {
    selectedGenre, selectedModifier, weights, baseWeights, visibleDims,
    updateWeight, validateAndClampWeight, toggleDimension,
    resetWeights, resetVisibility,
  } = useAppStore();

  const [showWeights, setShowWeights] = useState(false);
  const activeWeights = getModifierAdjustedWeights(weights, selectedModifier);
  const dimEntries = Object.entries(dimensions);
  const ranges = genreDimensionRanges[selectedGenre] || {};

  const renderDimensionRow = ([key, dim]) => {
    const range = ranges[key];
    const effectiveWeight = activeWeights[key] ? activeWeights[key].toFixed(2) : '0.00';
    const isModified = selectedModifier && modifierEffects[selectedModifier]?.adjustments[key];
    const isManuallyChanged = weights[key] !== baseWeights[key];

    return (
      <div key={key} className="flex items-center gap-1.5 p-1.5 bg-slate-800/50 rounded">
        <label className="flex items-center gap-1.5 flex-1 min-w-0">
          <input
            type="checkbox"
            checked={visibleDims[key] || false}
            onChange={() => toggleDimension(key)}
            className="w-3.5 h-3.5 flex-shrink-0"
          />
          <span style={{ color: dim.color }} className="font-semibold text-xs truncate">
            {dim.name}
          </span>
        </label>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {range && (
            <span className="text-xs text-purple-300 font-mono">
              {range[0]}&ndash;{range[1]}
            </span>
          )}
          {showWeights && (
            <>
              <input
                type="number"
                value={weights[key] || 0}
                onChange={(e) => updateWeight(key, e.target.value)}
                onBlur={() => validateAndClampWeight(key)}
                step="0.1"
                min="0"
                max="3"
                className={`w-14 border border-purple-500 rounded px-1.5 py-1 text-xs text-center text-white ${
                  isManuallyChanged ? 'bg-amber-700' : 'bg-slate-700'
                }`}
              />
              {isModified && effectiveWeight !== (weights[key] || 0).toFixed(2) && (
                <span className="text-xs text-yellow-400 w-12 text-right" title={`Modified by ${selectedModifier}`}>
                  &rarr;{effectiveWeight}
                </span>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white/10 backdrop-blur rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold">Dimensions & Ranges</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setShowWeights(!showWeights)}
            className={`text-sm px-4 py-2 rounded font-semibold ${
              showWeights ? 'bg-amber-600 hover:bg-amber-700' : 'bg-slate-600 hover:bg-slate-700'
            }`}
          >
            {showWeights ? 'Hide Weights' : 'Show Weights'}
          </button>
          {showWeights && (
            <button
              onClick={resetWeights}
              className="text-sm bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded font-semibold"
            >
              Reset Weights
            </button>
          )}
          <button
            onClick={resetVisibility}
            className="text-sm bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded font-semibold"
          >
            Reset Visibility
          </button>
        </div>
      </div>

      <div className="mb-3 p-3 bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded border border-purple-500/50">
        <p className="text-sm font-semibold text-purple-200">
          <strong className="text-purple-300">Typical ranges for {genreSystem[selectedGenre]?.name}:</strong>{' '}
          {getGenreDescription(selectedGenre)}
        </p>
        <p className="text-xs text-purple-300 mt-1">
          Ranges show the typical operating band for each dimension in this genre. Values outside the range aren't wrong — they're unusual.
          {showWeights && <> <strong>Weight values (0-3)</strong> are multipliers controlling how much each dimension contributes to tension.</>}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1.5">{dimEntries.slice(0, 4).map(renderDimensionRow)}</div>
        <div className="space-y-1.5">{dimEntries.slice(4, 8).map(renderDimensionRow)}</div>
        <div className="space-y-1.5">{dimEntries.slice(8).map(renderDimensionRow)}</div>
      </div>

      {/* Tension toggle */}
      <div className="flex items-center gap-3 p-2 bg-slate-900/70 rounded border border-red-500/50 mt-3">
        <label className="flex items-center gap-2 flex-1">
          <input
            type="checkbox"
            checked={visibleDims.tension || false}
            onChange={() => toggleDimension('tension')}
            className="w-4 h-4"
          />
          <span className="text-red-400 font-bold text-sm">
            TENSION (derived from weighted dimensions)
          </span>
        </label>
        <div className="text-xs text-red-300">Calculated automatically</div>
      </div>
    </div>
  );
}
