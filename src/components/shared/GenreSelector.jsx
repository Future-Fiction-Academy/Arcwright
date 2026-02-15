import React from 'react';
import useAppStore from '../../store/useAppStore';
import { genreSystem } from '../../data/genreSystem';
import { plotStructures } from '../../data/plotStructures';
import { modifierEffects } from '../../data/modifierEffects';
import PacingSelector from './PacingSelector';

export default function GenreSelector() {
  const {
    selectedGenre, selectedSubgenre, selectedModifier,
    setGenre, setSubgenre, setModifier,
  } = useAppStore();

  const currentGenre = genreSystem[selectedGenre];
  const currentSubgenre = currentGenre.subgenres[selectedSubgenre];
  const currentStructure = plotStructures[currentGenre.structure];
  const isRomance = selectedGenre === 'romance';

  return (
    <div className="bg-white/10 backdrop-blur rounded-lg p-4 mb-6">
      <div className={`grid ${isRomance ? 'grid-cols-4' : 'grid-cols-3'} gap-4 mb-4`}>
        <div>
          <h3 className="text-sm font-bold mb-2 text-purple-300">Genre</h3>
          <select
            value={selectedGenre}
            onChange={(e) => setGenre(e.target.value)}
            className="w-full bg-slate-800 border border-purple-500 rounded px-3 py-2 text-white"
          >
            {Object.entries(genreSystem).map(([key, genre]) => (
              <option key={key} value={key}>{genre.name}</option>
            ))}
          </select>
        </div>

        <div>
          <h3 className="text-sm font-bold mb-2 text-purple-300">Subgenre</h3>
          <select
            value={selectedSubgenre}
            onChange={(e) => setSubgenre(e.target.value)}
            className="w-full bg-slate-800 border border-purple-500 rounded px-3 py-2 text-white"
          >
            {Object.entries(currentGenre.subgenres).map(([key, sub]) => (
              <option key={key} value={key}>{sub.name}</option>
            ))}
          </select>
        </div>

        <div>
          <h3 className="text-sm font-bold mb-2 text-purple-300">Focus/Modifier</h3>
          <select
            value={selectedModifier}
            onChange={(e) => setModifier(e.target.value)}
            className="w-full bg-slate-800 border border-purple-500 rounded px-3 py-2 text-white"
          >
            <option value="">None</option>
            {currentSubgenre.modifiers.map((mod, idx) => (
              <option key={idx} value={mod}>{mod}</option>
            ))}
          </select>
          {selectedModifier && modifierEffects[selectedModifier] && (
            <div className="mt-2 p-2 bg-purple-900/50 rounded border border-purple-500/50 text-xs text-purple-200">
              {modifierEffects[selectedModifier].description}
            </div>
          )}
        </div>

        {isRomance && (
          <PacingSelector />
        )}
      </div>

      <div className="p-3 bg-purple-900/30 rounded">
        <div className="text-sm font-bold text-purple-300">
          Plot Structure: {currentStructure.name}
        </div>
        <div className="text-xs text-purple-200 mt-1">
          {currentGenre.name} stories follow the <strong>{currentStructure.name}</strong> narrative framework
        </div>
      </div>
    </div>
  );
}
