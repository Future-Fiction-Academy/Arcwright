import React, { useState, useRef, useEffect } from 'react';
import { allStructures, structureGroups } from '../../data/plotStructures';

const GROUP_LABELS = {
  act: 'Act Structures',
  beat: 'Beat Structures',
};

const COLOR_CLASSES = {
  teal: {
    button: 'bg-teal-600 hover:bg-teal-700',
    active: 'bg-teal-600/30',
    check: 'text-teal-400',
  },
  indigo: {
    button: 'bg-indigo-600 hover:bg-indigo-700',
    active: 'bg-indigo-600/30',
    check: 'text-indigo-400',
  },
};

export default function StructureSelector({
  label = 'Beats',
  selectedKey,
  onSelect,
  groups = structureGroups,
  color = 'teal',
  countField = 'beats',
  showNone = false,
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  const current = selectedKey ? allStructures[selectedKey] : null;
  const colors = COLOR_CLASSES[color] || COLOR_CLASSES.teal;

  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const displayName = current?.name || 'None';

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className={`text-sm ${colors.button} px-4 py-2 rounded font-semibold flex items-center gap-1`}
      >
        <span className="text-xs opacity-70">{label}:</span>
        <span className="truncate max-w-[140px]">{displayName}</span>
        <span className="text-xs">{open ? '\u25B2' : '\u25BC'}</span>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-72 bg-slate-800 border border-purple-500/30 rounded-lg shadow-xl z-30 overflow-hidden max-h-[70vh] overflow-y-auto">
          {showNone && (
            <>
              <button
                onClick={() => { onSelect(''); setOpen(false); }}
                className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center gap-2 ${
                  !selectedKey ? `${colors.active} text-white` : 'hover:bg-slate-700 text-purple-100'
                }`}
              >
                {!selectedKey && <span className={`${colors.check} text-xs`}>&#10003;</span>}
                <span className={`flex-1 ${!selectedKey ? 'font-semibold' : ''}`}>None</span>
              </button>
              <div className="border-t border-purple-500/20" />
            </>
          )}
          {Object.entries(groups).map(([groupKey, keys]) => (
            <div key={groupKey}>
              <div className="px-4 py-1.5 text-[10px] font-bold text-purple-400 uppercase tracking-wider bg-slate-800/80 sticky top-0">
                {GROUP_LABELS[groupKey]}
              </div>
              {keys.map((key) => {
                const struct = allStructures[key];
                if (!struct) return null;
                const isActive = key === selectedKey;
                const count = countField === 'acts'
                  ? struct.acts?.length || 0
                  : Object.keys(struct.beats).length;
                const countLabel = countField === 'acts' ? 'acts' : 'beats';
                return (
                  <button
                    key={key}
                    onClick={() => { onSelect(key); setOpen(false); }}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center gap-2 ${
                      isActive ? `${colors.active} text-white` : 'hover:bg-slate-700 text-purple-100'
                    }`}
                  >
                    {isActive && <span className={`${colors.check} text-xs`}>&#10003;</span>}
                    <span className={`flex-1 ${isActive ? 'font-semibold' : ''}`}>{struct.name}</span>
                    <span className="text-[10px] text-purple-400">{count} {countLabel}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
