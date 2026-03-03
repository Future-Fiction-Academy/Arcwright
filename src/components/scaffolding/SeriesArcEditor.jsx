import React, { useMemo } from 'react';
import useSeriesStore from '../../store/useSeriesStore';
import useBookStore from '../../store/useBookStore';
import { seriesStructures, seriesStructureGroups } from '../../data/plotStructures';
import { ACT_COLORS } from '../../data/plotStructures';

/**
 * SeriesArcEditor — displays the series-level arc with book positions.
 *
 * Shows:
 * - Series structure selector (Trilogy, Saga, Continuing, Common World)
 * - Visual arc with books positioned on it
 * - Current book highlighted
 * - Series beat descriptions
 */
export default function SeriesArcEditor({ seriesId, bookPosition, onSelectStructure }) {
    const activeSeries = useSeriesStore((s) => s.activeSeries);
    const seriesBooks = useSeriesStore((s) => s.books);
    const activeBookId = useBookStore((s) => s.activeBookId);

    const selectedStructureKey = useSeriesStore((s) => s.selectedSeriesStructure);
    const setSelectedStructure = useSeriesStore((s) => s.setSelectedSeriesStructure);

    const structure = seriesStructures[selectedStructureKey] || null;

    // Determine which series beat the current book falls in
    const currentBookBeat = useMemo(() => {
        if (!structure || bookPosition == null) return null;
        const pct = seriesBooks.length > 0
            ? ((bookPosition - 1) / seriesBooks.length) * 100
            : 0;
        const beatEntries = Object.entries(structure.beats);
        return beatEntries.find(([, b]) => pct >= b.range[0] && pct <= b.range[1]);
    }, [structure, bookPosition, seriesBooks]);

    return (
        <div className="bg-white/5 backdrop-blur rounded-lg border border-purple-500/20 p-4 mb-6">
            <h3 className="text-lg font-bold text-purple-300 mb-3">Series Arc</h3>

            {/* Structure selector */}
            <div className="flex flex-wrap gap-2 mb-4">
                {Object.entries(seriesStructureGroups).map(([group, keys]) => (
                    <div key={group} className="flex gap-1">
                        {keys.map((key) => {
                            const s = seriesStructures[key];
                            return (
                                <button
                                    key={key}
                                    onClick={() => setSelectedStructure(key)}
                                    className={`text-xs px-3 py-1.5 rounded font-semibold transition-colors ${selectedStructureKey === key
                                            ? 'bg-purple-600 text-white'
                                            : 'bg-white/10 text-purple-300 hover:bg-white/20'
                                        }`}
                                >
                                    {s.name}
                                </button>
                            );
                        })}
                    </div>
                ))}
            </div>

            {structure && (
                <>
                    {/* Description */}
                    <p className="text-xs text-gray-400 mb-4">{structure.description}</p>

                    {/* Visual arc bar */}
                    <div className="relative h-10 rounded-lg overflow-hidden mb-3 bg-gray-800">
                        {structure.acts.map((act, i) => {
                            const width = act.range[1] - act.range[0];
                            return (
                                <div
                                    key={act.name}
                                    className="absolute top-0 h-full flex items-center justify-center text-[10px] font-semibold text-white/80 border-r border-gray-700 last:border-r-0"
                                    style={{
                                        left: `${act.range[0]}%`,
                                        width: `${width}%`,
                                        backgroundColor: `${ACT_COLORS[i % ACT_COLORS.length]}33`,
                                    }}
                                    title={act.name}
                                >
                                    <span className="truncate px-1">{act.name}</span>
                                </div>
                            );
                        })}

                        {/* Book position markers */}
                        {seriesBooks.map((book, i) => {
                            const pct = seriesBooks.length > 1
                                ? (i / (seriesBooks.length - 1)) * 95 + 2.5
                                : 50;
                            const isActive = book.id === activeBookId;
                            return (
                                <div
                                    key={book.id}
                                    className={`absolute top-1 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold border-2 transition-all ${isActive
                                            ? 'bg-purple-500 border-white text-white scale-125 z-10'
                                            : 'bg-gray-600 border-gray-400 text-gray-300'
                                        }`}
                                    style={{ left: `${pct}%`, transform: `translateX(-50%)${isActive ? ' scale(1.25)' : ''}` }}
                                    title={`Book ${i + 1}: ${book.title}`}
                                >
                                    {i + 1}
                                </div>
                            );
                        })}
                    </div>

                    {/* Beat list */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {Object.entries(structure.beats).map(([key, beat]) => {
                            const isCurrent = currentBookBeat && currentBookBeat[0] === key;
                            return (
                                <div
                                    key={key}
                                    className={`rounded px-2 py-1.5 text-xs border ${isCurrent
                                            ? 'border-purple-400 bg-purple-500/20 text-purple-200'
                                            : 'border-gray-700 bg-gray-800/50 text-gray-400'
                                        }`}
                                >
                                    <div className="flex items-center gap-1.5">
                                        <span
                                            className="w-2 h-2 rounded-full shrink-0"
                                            style={{ backgroundColor: beat.color }}
                                        />
                                        <span className="font-semibold truncate">{beat.name}</span>
                                        <span className="ml-auto text-[10px] text-gray-500">
                                            {beat.range[0]}–{beat.range[1]}%
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Current book context */}
                    {currentBookBeat && (
                        <div className="mt-3 p-2 rounded bg-purple-500/10 border border-purple-500/30 text-xs text-purple-300">
                            <strong>Current book</strong> (position {bookPosition}/{seriesBooks.length}) aligns with:{' '}
                            <strong>{currentBookBeat[1].name}</strong> ({currentBookBeat[1].range[0]}–{currentBookBeat[1].range[1]}%)
                        </div>
                    )}
                </>
            )}

            {!structure && (
                <p className="text-xs text-gray-500">Select a series arc structure above to see the macro arc.</p>
            )}
        </div>
    );
}
