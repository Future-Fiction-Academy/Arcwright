import React, { useState } from 'react';
import { dimensions, DIMENSION_KEYS } from '../../data/dimensions';
import DimensionSlider from './DimensionSlider';
import BeatSuggestions from './BeatSuggestions';

export default function BeatEditorRow({ beat, structureBeats, idealCurve, activeWeights, structureKey, onUpdate, onRemove, index, isDragging, isDropTarget, onDragStart, onDragOver, onDragEnd, onDrop }) {
  const [expanded, setExpanded] = useState(false);

  const handleDimChange = (key, value) => {
    onUpdate(beat.id, { [key]: value });
  };

  const beatOptions = Object.entries(structureBeats);

  return (
    <div
      className={`bg-slate-800/60 rounded-lg border overflow-hidden transition-all ${
        isDropTarget ? 'border-green-400 border-t-2' : 'border-purple-500/30'
      } ${isDragging ? 'opacity-50' : ''}`}
      onDragOver={(e) => { e.preventDefault(); onDragOver?.(index); }}
      onDrop={(e) => { e.preventDefault(); onDrop?.(index); }}
    >
      {/* Collapsed header */}
      <div
        className="flex items-center gap-3 p-3 cursor-pointer hover:bg-slate-700/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Drag handle */}
        <span
          draggable
          onDragStart={(e) => { e.stopPropagation(); onDragStart?.(index); }}
          onDragEnd={onDragEnd}
          className="text-purple-400/60 hover:text-purple-300 cursor-grab active:cursor-grabbing text-sm select-none"
          title="Drag to reorder"
          onClick={(e) => e.stopPropagation()}
        >
          {'\u2261'}
        </span>
        <span className="text-purple-400 text-xs font-mono w-10 text-right">
          {beat.time}%
        </span>
        <div className="flex-1 min-w-0" onClick={(e) => e.stopPropagation()}>
          <input
            type="text"
            value={beat.label || ''}
            onChange={(e) => onUpdate(beat.id, { label: e.target.value })}
            placeholder="Untitled Beat"
            className="font-semibold text-sm bg-transparent border-none outline-none w-full text-white placeholder:text-white/60 cursor-text focus:bg-slate-700/50 focus:px-1 rounded transition-all"
          />
          <span className="text-xs text-purple-300">
            {structureBeats[beat.beat]?.name || beat.beat}
          </span>
        </div>
        {/* Mini dimension summary */}
        <div className="flex gap-1">
          {DIMENSION_KEYS.slice(0, 5).map((key) => (
            <div
              key={key}
              className="w-2 h-4 rounded-sm"
              style={{
                backgroundColor: dimensions[key].color,
                opacity: (beat[key] || 0) / 10,
              }}
              title={`${dimensions[key].name}: ${beat[key]}`}
            />
          ))}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(beat.id); }}
          className="text-red-400 hover:text-red-300 text-sm px-2"
          title="Remove beat"
        >
          &times;
        </button>
        <span className="text-purple-400 text-xs">{expanded ? '\u25B2' : '\u25BC'}</span>
      </div>

      {/* Expanded editor */}
      {expanded && (
        <div className="p-4 border-t border-purple-500/20 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-purple-300 block mb-1">Label</label>
              <input
                type="text"
                value={beat.label || ''}
                onChange={(e) => onUpdate(beat.id, { label: e.target.value })}
                className="w-full bg-slate-700 border border-purple-500/50 rounded px-2 py-1 text-sm text-white"
                placeholder="Beat label..."
              />
            </div>
            <div>
              <label className="text-xs text-purple-300 block mb-1">Time %</label>
              <input
                type="number"
                min={0}
                max={100}
                value={beat.time}
                onChange={(e) => onUpdate(beat.id, { time: Math.max(0, Math.min(100, parseInt(e.target.value) || 0)) })}
                className="w-full bg-slate-700 border border-purple-500/50 rounded px-2 py-1 text-sm text-white"
              />
            </div>
            <div>
              <label className="text-xs text-purple-300 block mb-1">Beat Type</label>
              <select
                value={beat.beat || ''}
                onChange={(e) => onUpdate(beat.id, { beat: e.target.value })}
                className="w-full bg-slate-700 border border-purple-500/50 rounded px-2 py-1 text-sm text-white"
              >
                {beatOptions.map(([key, b]) => (
                  <option key={key} value={key}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <h4 className="text-xs font-bold text-purple-300 mt-2">Dimensions</h4>
            {DIMENSION_KEYS.map((key) => (
              <DimensionSlider
                key={key}
                dimKey={key}
                dim={dimensions[key]}
                value={beat[key] ?? 0}
                onChange={handleDimChange}
              />
            ))}
          </div>

          <BeatSuggestions
            beat={beat}
            idealCurve={idealCurve}
            activeWeights={activeWeights}
            structureKey={structureKey}
            onUpdate={onUpdate}
          />
        </div>
      )}
    </div>
  );
}
