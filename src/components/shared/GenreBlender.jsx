import React from 'react';
import useAppStore from '../../store/useAppStore';
import { genreSystem } from '../../data/genreSystem';

export default function GenreBlender() {
  const {
    selectedGenre, blendEnabled, secondaryGenre, secondarySubgenre, blendRatio,
    setBlendEnabled, setSecondaryGenre, setSecondarySubgenre, setBlendRatio,
  } = useAppStore();

  const secondaryGenreObj = secondaryGenre ? genreSystem[secondaryGenre] : null;
  const primaryName = genreSystem[selectedGenre]?.name || selectedGenre;
  const secondaryName = secondaryGenreObj?.name || '';

  return (
    <div className="bg-white/10 backdrop-blur rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-purple-300">Genre Blending</h3>
        <label className="flex items-center gap-2 cursor-pointer">
          <span className="text-xs text-purple-300">
            {blendEnabled ? 'On' : 'Off'}
          </span>
          <div
            className={`w-10 h-5 rounded-full relative transition-colors cursor-pointer ${
              blendEnabled ? 'bg-purple-600' : 'bg-slate-600'
            }`}
            onClick={() => setBlendEnabled(!blendEnabled)}
          >
            <div
              className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform ${
                blendEnabled ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </div>
        </label>
      </div>

      {blendEnabled && secondaryGenreObj && (
        <div className="mt-3 space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-purple-300 block mb-1">Secondary Genre</label>
              <select
                value={secondaryGenre}
                onChange={(e) => setSecondaryGenre(e.target.value)}
                className="w-full bg-slate-800 border border-purple-500/50 rounded px-3 py-2 text-sm text-white"
              >
                {Object.entries(genreSystem)
                  .filter(([key]) => key !== selectedGenre)
                  .map(([key, genre]) => (
                    <option key={key} value={key}>{genre.name}</option>
                  ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-purple-300 block mb-1">Secondary Subgenre</label>
              <select
                value={secondarySubgenre}
                onChange={(e) => setSecondarySubgenre(e.target.value)}
                className="w-full bg-slate-800 border border-purple-500/50 rounded px-3 py-2 text-sm text-white"
              >
                {Object.entries(secondaryGenreObj.subgenres).map(([key, sub]) => (
                  <option key={key} value={key}>{sub.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-purple-300 block mb-1">
              Blend Ratio: {blendRatio}% {primaryName} / {100 - blendRatio}% {secondaryName}
            </label>
            <input
              type="range"
              min={1}
              max={99}
              value={blendRatio}
              onChange={(e) => setBlendRatio(parseInt(e.target.value))}
              className="w-full accent-purple-500"
            />
            <div className="flex justify-between text-[10px] text-purple-400 mt-0.5">
              <span>{secondaryName}</span>
              <span>{primaryName}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
