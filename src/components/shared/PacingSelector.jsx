import React from 'react';
import useAppStore from '../../store/useAppStore';
import { pacingPatterns, PACING_KEYS } from '../../data/pacingPatterns';

export default function PacingSelector() {
  const {
    selectedGenre, selectedPacing, applyCompanions,
    setPacing, setApplyCompanions,
  } = useAppStore();

  // Currently pacing is romance-focused
  const isRomance = selectedGenre === 'romance';
  if (!isRomance) return null;

  return (
    <div>
      <h3 className="text-sm font-bold mb-2 text-purple-300">Pacing Pattern</h3>
      <select
        value={selectedPacing}
        onChange={(e) => setPacing(e.target.value)}
        className="w-full bg-slate-800 border border-purple-500 rounded px-3 py-2 text-white"
      >
        <option value="">None (custom)</option>
        {PACING_KEYS.map((key) => (
          <option key={key} value={key}>{pacingPatterns[key].name}</option>
        ))}
      </select>
      {selectedPacing && (
        <>
          <p className="mt-2 text-xs text-purple-200">
            {pacingPatterns[selectedPacing].description}
          </p>
          <label className="flex items-center gap-2 mt-2 text-xs text-purple-300 cursor-pointer">
            <input
              type="checkbox"
              checked={applyCompanions}
              onChange={(e) => setApplyCompanions(e.target.checked)}
              className="rounded"
            />
            Also adjust desire & vulnerability curves
          </label>
        </>
      )}
    </div>
  );
}
