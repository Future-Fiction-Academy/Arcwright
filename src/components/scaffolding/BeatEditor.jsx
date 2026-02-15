import React, { useState } from 'react';
import useAppStore from '../../store/useAppStore';
import { DIMENSION_KEYS } from '../../data/dimensions';
import BeatEditorRow from './BeatEditorRow';

let nextId = 1;
function generateId() {
  return `beat_${Date.now()}_${nextId++}`;
}

function createEmptyBeat(time = 50, beat = '') {
  const b = { id: generateId(), time, beat, label: '' };
  DIMENSION_KEYS.forEach((key) => { b[key] = 0; });
  return b;
}

/** Create a beat whose time% and dimension values are averaged from its neighbors. */
function createAveragedBeat(time, beatKey, above, below) {
  const b = { id: generateId(), time, beat: beatKey, label: '' };
  if (above && below) {
    DIMENSION_KEYS.forEach((key) => {
      b[key] = Math.round(((above[key] || 0) + (below[key] || 0)) / 2);
    });
  } else if (above) {
    DIMENSION_KEYS.forEach((key) => { b[key] = above[key] || 0; });
  } else if (below) {
    DIMENSION_KEYS.forEach((key) => { b[key] = below[key] || 0; });
  } else {
    DIMENSION_KEYS.forEach((key) => { b[key] = 0; });
  }
  return b;
}

/** Find the midpoint time between two boundary values, clamped to integers. */
function midpointTime(low, high) {
  const mid = Math.round((low + high) / 2);
  // Ensure at least 1% apart from neighbors
  return Math.max(low + 1, Math.min(high - 1, mid));
}

/** Find the largest gap in the beat timeline and return its midpoint. */
function smartInsertTime(beats) {
  if (beats.length === 0) return 50;

  let bestGap = beats[0].time - 0;
  let bestMid = Math.round(beats[0].time / 2);

  for (let i = 1; i < beats.length; i++) {
    const gap = beats[i].time - beats[i - 1].time;
    if (gap > bestGap) {
      bestGap = gap;
      bestMid = Math.round((beats[i - 1].time + beats[i].time) / 2);
    }
  }

  const tailGap = 100 - beats[beats.length - 1].time;
  if (tailGap > bestGap) {
    bestMid = Math.round((beats[beats.length - 1].time + 100) / 2);
  }

  return Math.max(0, Math.min(100, bestMid));
}

function InsertionZone({ onClick }) {
  return (
    <div
      className="group h-2 hover:h-6 flex items-center justify-center cursor-pointer transition-all duration-150"
      onClick={onClick}
    >
      <div className="hidden group-hover:flex items-center gap-1 text-green-400 text-xs font-bold">
        <span className="w-4 h-4 rounded-full border border-green-400 flex items-center justify-center text-[10px]">+</span>
        <span>Insert beat</span>
      </div>
    </div>
  );
}

export default function BeatEditor({ structureBeats, idealCurve, activeWeights, structureKey }) {
  const { scaffoldBeats, addBeat, updateBeat, removeBeat } = useAppStore();

  const [dragIndex, setDragIndex] = useState(null);
  const [dropIndex, setDropIndex] = useState(null);

  // --- Drag-and-drop handlers ---
  const handleDragStart = (index) => {
    setDragIndex(index);
  };

  const handleDragOver = (index) => {
    if (dragIndex !== null && index !== dragIndex) {
      setDropIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDropIndex(null);
  };

  const handleDrop = (targetIdx) => {
    if (dragIndex === null || targetIdx === dragIndex) {
      handleDragEnd();
      return;
    }

    const draggedBeat = scaffoldBeats[dragIndex];
    // Compute new time for the dragged beat at the target position
    // We need to figure out what neighbors it would have after removal
    const remaining = scaffoldBeats.filter((_, i) => i !== dragIndex);
    let newTime;
    if (remaining.length === 0) {
      newTime = 50;
    } else if (targetIdx <= 0) {
      newTime = Math.round(remaining[0].time / 2);
    } else if (targetIdx >= remaining.length) {
      newTime = Math.round((remaining[remaining.length - 1].time + 100) / 2);
    } else {
      // Adjust target index since we removed the dragged item
      const adjIdx = targetIdx > dragIndex ? targetIdx - 1 : targetIdx;
      const low = remaining[Math.max(0, adjIdx - 1)]?.time ?? 0;
      const high = remaining[adjIdx]?.time ?? 100;
      newTime = midpointTime(low, high);
    }

    newTime = Math.max(0, Math.min(100, newTime));
    updateBeat(draggedBeat.id, { time: newTime });
    handleDragEnd();
  };

  // --- Insertion handlers ---
  const handleInsertAt = (index) => {
    const firstBeatKey = Object.keys(structureBeats)[0] || '';
    const above = scaffoldBeats[index - 1] || null;
    const below = scaffoldBeats[index] || null;
    let time;
    if (!above && !below) {
      time = 50;
    } else if (!above) {
      time = Math.round(below.time / 2);
    } else if (!below) {
      time = Math.round((above.time + 100) / 2);
    } else {
      time = midpointTime(above.time, below.time);
    }
    const beatKey = above?.beat || below?.beat || firstBeatKey;
    addBeat(createAveragedBeat(Math.max(0, Math.min(100, time)), beatKey, above, below));
  };

  // --- Smart Add Beat (finds largest gap, averages neighbors) ---
  const handleAdd = () => {
    const firstBeatKey = Object.keys(structureBeats)[0] || '';
    if (scaffoldBeats.length === 0) {
      addBeat(createEmptyBeat(50, firstBeatKey));
      return;
    }
    // Find largest gap and its neighbor indices
    let bestGap = scaffoldBeats[0].time;
    let bestAboveIdx = -1;
    let bestBelowIdx = 0;
    for (let i = 1; i < scaffoldBeats.length; i++) {
      const gap = scaffoldBeats[i].time - scaffoldBeats[i - 1].time;
      if (gap > bestGap) {
        bestGap = gap;
        bestAboveIdx = i - 1;
        bestBelowIdx = i;
      }
    }
    const tailGap = 100 - scaffoldBeats[scaffoldBeats.length - 1].time;
    if (tailGap > bestGap) {
      bestAboveIdx = scaffoldBeats.length - 1;
      bestBelowIdx = -1;
    }
    const above = bestAboveIdx >= 0 ? scaffoldBeats[bestAboveIdx] : null;
    const below = bestBelowIdx >= 0 ? scaffoldBeats[bestBelowIdx] : null;
    const time = smartInsertTime(scaffoldBeats);
    const beatKey = above?.beat || below?.beat || firstBeatKey;
    addBeat(createAveragedBeat(time, beatKey, above, below));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">
          Story Beats ({scaffoldBeats.length})
        </h3>
        <button
          onClick={handleAdd}
          className="text-sm bg-green-600 hover:bg-green-700 px-4 py-2 rounded font-semibold"
        >
          + Add Beat
        </button>
      </div>

      {scaffoldBeats.length === 0 ? (
        <div className="text-center py-8 text-purple-300 bg-slate-800/30 rounded-lg border border-dashed border-purple-500/30">
          <p className="mb-2">No beats yet.</p>
          <p className="text-xs text-purple-400">
            Add beats manually or load a genre template to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-0 max-h-[600px] overflow-y-auto pr-1">
          {/* Insertion zone before first beat */}
          <InsertionZone onClick={() => handleInsertAt(0)} />

          {scaffoldBeats.map((beat, idx) => (
            <React.Fragment key={beat.id}>
              <BeatEditorRow
                beat={beat}
                structureBeats={structureBeats}
                idealCurve={idealCurve}
                activeWeights={activeWeights}
                structureKey={structureKey}
                onUpdate={updateBeat}
                onRemove={removeBeat}
                index={idx}
                isDragging={dragIndex === idx}
                isDropTarget={dropIndex === idx}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
                onDrop={handleDrop}
              />
              {/* Insertion zone after each beat */}
              <InsertionZone onClick={() => handleInsertAt(idx + 1)} />
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
}
