import React, { useState } from 'react';
import useAppStore from '../../store/useAppStore';
import { allStructures, ACT_COLORS } from '../../data/plotStructures';

export default function StructureReference() {
  const { selectedStructure, selectedActStructure } = useAppStore();
  const beatStructure = allStructures[selectedStructure];
  const actStructure = selectedActStructure ? allStructures[selectedActStructure] : null;
  const [isOpen, setIsOpen] = useState(false);

  if (!beatStructure && !actStructure) return null;

  const beatEntries = beatStructure ? Object.entries(beatStructure.beats) : [];
  const showBoth = actStructure && actStructure !== beatStructure;

  const headerName = showBoth
    ? `${beatStructure?.name || 'Beats'} + ${actStructure.name}`
    : (beatStructure?.name || actStructure?.name || 'Structure');

  return (
    <div className="mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-sm text-purple-300 hover:text-white transition-colors py-1"
      >
        <span className={`transition-transform inline-block ${isOpen ? 'rotate-90' : ''}`}>
          {'\u25B6'}
        </span>
        <span className="font-semibold">{headerName} Reference</span>
      </button>

      {isOpen && (
        <div className="mt-2 bg-white/5 backdrop-blur rounded-lg p-4 border border-purple-500/20 text-sm space-y-4">
          {/* Beat structure description */}
          {beatStructure?.description && (
            <p className="text-purple-200 leading-relaxed">{beatStructure.description}</p>
          )}

          {/* Act Distribution Bar (from act structure) */}
          {actStructure?.acts?.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-2">
                Act Distribution{showBoth ? ` (${actStructure.name})` : ''}
              </h4>
              <div className="flex rounded overflow-hidden h-7">
                {actStructure.acts.map((act, i) => {
                  const width = act.range[1] - act.range[0];
                  return (
                    <div
                      key={i}
                      className="flex items-center justify-center text-xs font-semibold text-white/90 overflow-hidden"
                      style={{
                        width: `${width}%`,
                        backgroundColor: ACT_COLORS[i % ACT_COLORS.length],
                        minWidth: 0,
                      }}
                      title={`${act.name}: ${act.range[0]}%-${act.range[1]}%`}
                    >
                      {width >= 15 ? act.name : ''}
                    </div>
                  );
                })}
              </div>
              <div className="flex mt-1">
                {actStructure.acts.map((act, i) => {
                  const width = act.range[1] - act.range[0];
                  return (
                    <div
                      key={i}
                      className="text-[10px] text-purple-400 text-center overflow-hidden"
                      style={{ width: `${width}%`, minWidth: 0 }}
                    >
                      {width >= 10 ? `${act.range[0]}-${act.range[1]}%` : ''}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Beat Timeline (from beat structure) */}
          {beatEntries.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-2">
                Beat Timeline{showBoth ? ` (${beatStructure.name})` : ''}
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1">
                {beatEntries.map(([key, beat]) => (
                  <div key={key} className="flex items-center gap-2 text-xs">
                    <span
                      className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                      style={{ backgroundColor: beat.color }}
                    />
                    <span className="text-purple-200 truncate">{beat.name}</span>
                    <span className="text-purple-500 ml-auto flex-shrink-0">
                      {beat.range[0] === beat.range[1] ? `${beat.range[0]}%` : `${beat.range[0]}-${beat.range[1]}%`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Related Frameworks */}
          {beatStructure?.relatedFrameworks && (
            <div>
              <h4 className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-1">Related Frameworks</h4>
              <p className="text-xs text-purple-300 leading-relaxed">{beatStructure.relatedFrameworks}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
