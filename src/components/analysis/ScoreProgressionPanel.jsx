import React, { useMemo, useState } from 'react';
import useBookStore from '../../store/useBookStore';
import useAppStore from '../../store/useAppStore';
import { dimensions, DIMENSION_KEYS } from '../../data/dimensions';

/**
 * ScoreProgressionPanel — shows score history for scenes over revisions.
 *
 * Displays:
 * - Scenes with snapshots (revision history)
 * - Before/after comparison per dimension
 * - Trend indicators (improving / declining / stable)
 * - Re-analyze action to trigger fresh analysis
 */
export default function ScoreProgressionPanel({ onReanalyze }) {
    const activeBookId = useBookStore((s) => s.activeBookId);
    const scenes = useBookStore((s) => s.scenes);
    const getSceneSnapshots = useBookStore((s) => s.getSceneSnapshots);
    const chapters = useAppStore((s) => s.chapters);

    const [expandedScene, setExpandedScene] = useState(null);

    // Scenes with snapshot histories
    const scenesWithHistory = useMemo(() => {
        if (!activeBookId) return [];
        return scenes
            .map((scene) => {
                const snapshots = getSceneSnapshots(scene.id);
                return { ...scene, snapshots };
            })
            .filter((s) => s.snapshots.length > 0)
            .sort((a, b) => (a.time_position || 0) - (b.time_position || 0));
    }, [activeBookId, scenes, getSceneSnapshots]);

    if (!activeBookId || scenesWithHistory.length === 0) {
        return null; // Don't render if no history
    }

    return (
        <div className="bg-white/5 backdrop-blur rounded-lg border border-purple-500/20 p-4 mb-6 mt-8">
            <h3 className="text-lg font-bold text-purple-300 mb-3">Score Progression</h3>
            <p className="text-xs text-gray-400 mb-4">
                Showing dimension scores across analysis and revision runs.
            </p>

            <div className="space-y-2">
                {scenesWithHistory.map((scene) => {
                    const isExpanded = expandedScene === scene.id;
                    const latest = scene.snapshots[scene.snapshots.length - 1];
                    const first = scene.snapshots[0];
                    const latestScores = parseScores(latest?.scores);
                    const firstScores = parseScores(first?.scores);

                    return (
                        <div key={scene.id} className="border border-gray-700 rounded bg-gray-800/50">
                            {/* Scene header row */}
                            <button
                                onClick={() => setExpandedScene(isExpanded ? null : scene.id)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-700/50 rounded-t"
                            >
                                <span className="text-[10px] text-gray-500">{isExpanded ? '▼' : '▶'}</span>
                                <span className="font-medium text-gray-200 truncate">{scene.title}</span>
                                {scene.beat_id && (
                                    <span className="text-[10px] text-purple-400">♫ {scene.beat_id}</span>
                                )}
                                <span className="ml-auto text-[10px] text-gray-500">
                                    {scene.snapshots.length} run{scene.snapshots.length !== 1 ? 's' : ''}
                                </span>
                                {/* Quick trend icons */}
                                {scene.snapshots.length >= 2 && latestScores && firstScores && (
                                    <div className="flex gap-0.5 ml-1">
                                        {computeOverallTrend(firstScores, latestScores) === 'up' && (
                                            <span className="text-emerald-400 text-[10px]">↑</span>
                                        )}
                                        {computeOverallTrend(firstScores, latestScores) === 'down' && (
                                            <span className="text-red-400 text-[10px]">↓</span>
                                        )}
                                        {computeOverallTrend(firstScores, latestScores) === 'stable' && (
                                            <span className="text-gray-500 text-[10px]">→</span>
                                        )}
                                    </div>
                                )}
                            </button>

                            {/* Expanded detail */}
                            {isExpanded && (
                                <div className="px-3 pb-3 border-t border-gray-700">
                                    {/* Dimension comparison table */}
                                    <table className="w-full text-[10px] mt-2">
                                        <thead>
                                            <tr className="text-gray-500 border-b border-gray-700">
                                                <th className="text-left py-1 font-normal">Dimension</th>
                                                <th className="text-right py-1 font-normal">First</th>
                                                <th className="text-right py-1 font-normal">Latest</th>
                                                <th className="text-right py-1 font-normal">Δ</th>
                                                <th className="text-center py-1 font-normal">Trend</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {DIMENSION_KEYS.map((k) => {
                                                const dim = dimensions[k];
                                                const firstVal = firstScores?.[k];
                                                const latestVal = latestScores?.[k];
                                                const delta = firstVal != null && latestVal != null
                                                    ? (latestVal - firstVal)
                                                    : null;

                                                return (
                                                    <tr key={k} className="border-b border-gray-800">
                                                        <td className="py-1">
                                                            <span className="flex items-center gap-1">
                                                                <span
                                                                    className="w-1.5 h-1.5 rounded-full inline-block"
                                                                    style={{ backgroundColor: dim.color }}
                                                                />
                                                                {dim.name}
                                                            </span>
                                                        </td>
                                                        <td className="text-right font-mono text-gray-400">
                                                            {firstVal != null ? Number(firstVal).toFixed(1) : '—'}
                                                        </td>
                                                        <td className="text-right font-mono text-gray-300">
                                                            {latestVal != null ? Number(latestVal).toFixed(1) : '—'}
                                                        </td>
                                                        <td className={`text-right font-mono ${delta > 0 ? 'text-emerald-400' : delta < 0 ? 'text-red-400' : 'text-gray-500'
                                                            }`}>
                                                            {delta != null ? (delta > 0 ? '+' : '') + delta.toFixed(1) : '—'}
                                                        </td>
                                                        <td className="text-center">
                                                            {delta != null && (
                                                                delta > 0.5 ? '📈' : delta < -0.5 ? '📉' : '➡️'
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>

                                    {/* Snapshot timeline */}
                                    <div className="mt-3">
                                        <div className="text-[10px] text-gray-500 font-semibold mb-1">History</div>
                                        <div className="flex gap-1 flex-wrap">
                                            {scene.snapshots.map((snap, i) => (
                                                <span
                                                    key={snap.id}
                                                    className={`text-[9px] px-1.5 py-0.5 rounded ${snap.source === 'revision'
                                                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                                            : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                                        }`}
                                                    title={`${snap.source} — ${snap.created_at}`}
                                                >
                                                    #{i + 1} {snap.source}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Re-analyze action */}
                                    {onReanalyze && (
                                        <button
                                            onClick={() => onReanalyze(scene)}
                                            className="mt-2 text-xs bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded font-semibold"
                                        >
                                            Re-analyze This Scene
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function parseScores(scoresStr) {
    if (!scoresStr) return null;
    try {
        return typeof scoresStr === 'string' ? JSON.parse(scoresStr) : scoresStr;
    } catch {
        return null;
    }
}

function computeOverallTrend(firstScores, latestScores) {
    let totalDelta = 0;
    let count = 0;
    DIMENSION_KEYS.forEach((k) => {
        const f = firstScores?.[k];
        const l = latestScores?.[k];
        if (f != null && l != null) {
            totalDelta += (l - f);
            count++;
        }
    });
    if (count === 0) return 'stable';
    const avg = totalDelta / count;
    if (avg > 0.3) return 'up';
    if (avg < -0.3) return 'down';
    return 'stable';
}
