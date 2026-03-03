import React, { useState, useMemo } from 'react';
import useBookStore from '../../store/useBookStore';
import useAppStore from '../../store/useAppStore';
import useEditorStore from '../../store/useEditorStore';

/**
 * SceneMappingPanel — Left panel tab in the editor.
 *
 * Shows all scenes in the active book, grouped by chapter.
 * Provides:
 * - Scene list with beat assignment indicators
 * - Quick-add scene
 * - Click to open scene file in editor
 * - Beat assignment dropdown
 */
export default function SceneMappingPanel() {
    const activeBookId = useBookStore((s) => s.activeBookId);
    const scenes = useBookStore((s) => s.scenes);
    const chapters = useBookStore((s) => s.chapters);
    const characters = useBookStore((s) => s.characters);
    const scaffoldBeats = useAppStore((s) => s.scaffoldBeats);
    const addScene = useBookStore((s) => s.addScene);
    const updateSceneById = useBookStore((s) => s.updateSceneById);
    const removeScene = useBookStore((s) => s.removeScene);
    const linkSceneToBeatAction = useBookStore((s) => s.linkSceneToBeatAction);
    const unlinkSceneAction = useBookStore((s) => s.unlinkSceneAction);

    const [showAddForm, setShowAddForm] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [expandedChapters, setExpandedChapters] = useState({});

    // Group scenes by chapter
    const { grouped, unmapped } = useMemo(() => {
        const mapped = {};
        const noChapter = [];

        scenes.forEach((scene) => {
            if (scene.chapter_id) {
                if (!mapped[scene.chapter_id]) mapped[scene.chapter_id] = [];
                mapped[scene.chapter_id].push(scene);
            } else {
                noChapter.push(scene);
            }
        });

        return { grouped: mapped, unmapped: noChapter };
    }, [scenes]);

    const toggleChapter = (chId) => {
        setExpandedChapters((prev) => ({ ...prev, [chId]: !prev[chId] }));
    };

    const handleAddScene = () => {
        if (!newTitle.trim()) return;
        addScene({ title: newTitle.trim() });
        setNewTitle('');
        setShowAddForm(false);
    };

    const handleOpenScene = (scene) => {
        if (!scene.file_path) return;
        // Try to open the scene file in the editor
        const tabId = `scene-${scene.id}`;
        const tabs = useEditorStore.getState().tabs;
        const existing = tabs.find((t) => t.id === tabId);
        if (existing) {
            useEditorStore.getState().setActiveTab(tabId);
        }
        // Note: Full file loading from book project dir would be wired in Phase 3+
    };

    const handleAssignBeat = (sceneId, beatValue) => {
        if (beatValue === '__none__') {
            unlinkSceneAction(sceneId);
        } else {
            const beat = scaffoldBeats.find((b) => b.beat === beatValue || b.label === beatValue);
            if (beat) {
                linkSceneToBeatAction(sceneId, beat.beat || beat.label, beat.time);
            }
        }
    };

    if (!activeBookId) {
        return (
            <div className="p-3 text-sm text-g-muted">
                <p>No book project active.</p>
                <p className="text-xs mt-1 text-g-status">
                    Activate a book project from the Project menu to see scenes.
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full text-sm">
            {/* Header */}
            <div className="flex items-center justify-between p-2 border-b border-g-border shrink-0">
                <span className="text-xs font-bold text-g-muted uppercase">
                    Scenes ({scenes.length})
                </span>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="text-xs bg-purple-600 hover:bg-purple-700 px-2 py-1 rounded font-semibold"
                >
                    + Add
                </button>
            </div>

            {/* Quick-add form */}
            {showAddForm && (
                <div className="p-2 border-b border-g-border bg-g-chrome shrink-0">
                    <input
                        type="text"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddScene()}
                        placeholder="Scene title…"
                        className="w-full text-xs bg-g-bg border border-g-border rounded px-2 py-1 text-g-text"
                        autoFocus
                    />
                    <div className="flex gap-1 mt-1">
                        <button
                            onClick={handleAddScene}
                            className="text-xs bg-emerald-600 hover:bg-emerald-700 px-2 py-0.5 rounded"
                        >
                            Create
                        </button>
                        <button
                            onClick={() => setShowAddForm(false)}
                            className="text-xs bg-g-chrome hover:bg-g-bg px-2 py-0.5 rounded text-g-muted"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Scene list */}
            <div className="flex-1 overflow-y-auto p-1">
                {scenes.length === 0 ? (
                    <div className="p-2 text-xs text-g-status">
                        No scenes yet. Use <strong>Create Scene Stubs</strong> in the Scaffold output, or add scenes manually.
                    </div>
                ) : (
                    <>
                        {/* Scenes in chapters */}
                        {chapters.map((ch) => {
                            const chScenes = grouped[ch.id] || [];
                            if (chScenes.length === 0) return null;
                            const isExpanded = expandedChapters[ch.id] !== false; // default open

                            return (
                                <div key={ch.id} className="mb-1">
                                    <button
                                        onClick={() => toggleChapter(ch.id)}
                                        className="w-full flex items-center gap-1 px-2 py-1 text-xs font-semibold text-g-muted hover:text-g-text rounded hover:bg-g-chrome"
                                    >
                                        <span className="text-[10px]">{isExpanded ? '▼' : '▶'}</span>
                                        Ch {ch.number}: {ch.title}
                                        <span className="ml-auto text-g-status text-[10px]">
                                            {chScenes.length}
                                        </span>
                                    </button>
                                    {isExpanded && (
                                        <div className="ml-3">
                                            {chScenes.map((scene) => (
                                                <SceneItem
                                                    key={scene.id}
                                                    scene={scene}
                                                    beats={scaffoldBeats}
                                                    onOpen={handleOpenScene}
                                                    onAssignBeat={handleAssignBeat}
                                                    onRemove={removeScene}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {/* Unmapped scenes (no chapter) */}
                        {unmapped.length > 0 && (
                            <div className="mb-1">
                                <div className="px-2 py-1 text-xs font-semibold text-g-muted">
                                    Unassigned ({unmapped.length})
                                </div>
                                <div className="ml-3">
                                    {unmapped.map((scene) => (
                                        <SceneItem
                                            key={scene.id}
                                            scene={scene}
                                            beats={scaffoldBeats}
                                            onOpen={handleOpenScene}
                                            onAssignBeat={handleAssignBeat}
                                            onRemove={removeScene}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Beat coverage summary */}
            {scaffoldBeats.length > 0 && scenes.length > 0 && (
                <BeatCoverageSummary scenes={scenes} beats={scaffoldBeats} />
            )}
        </div>
    );
}

/** Individual scene row. */
function SceneItem({ scene, beats, onOpen, onAssignBeat, onRemove }) {
    const [showBeatSelect, setShowBeatSelect] = useState(false);

    const beatLabel = scene.beat_id
        ? beats.find((b) => b.beat === scene.beat_id || b.label === scene.beat_id)?.label || scene.beat_id
        : null;

    return (
        <div className="group flex items-start gap-1 px-1.5 py-1 rounded hover:bg-g-chrome text-xs">
            {/* Beat indicator dot */}
            <span
                className={`mt-1 w-2 h-2 rounded-full shrink-0 ${scene.beat_id ? 'bg-purple-500' : 'bg-gray-500/40'
                    }`}
                title={beatLabel ? `Beat: ${beatLabel}` : 'No beat assigned'}
            />

            {/* Scene info */}
            <div className="flex-1 min-w-0">
                <button
                    onClick={() => onOpen(scene)}
                    className="text-left w-full font-medium text-g-text truncate hover:underline"
                    title={scene.title}
                >
                    {scene.title}
                </button>

                {beatLabel && (
                    <div className="text-[10px] text-purple-400 truncate">
                        ♫ {beatLabel} ({scene.time_position}%)
                    </div>
                )}

                {/* Beat assignment dropdown */}
                {showBeatSelect && beats.length > 0 && (
                    <select
                        className="mt-0.5 w-full text-[10px] bg-g-bg border border-g-border rounded px-1 py-0.5 text-g-text"
                        value={scene.beat_id || '__none__'}
                        onChange={(e) => {
                            onAssignBeat(scene.id, e.target.value);
                            setShowBeatSelect(false);
                        }}
                    >
                        <option value="__none__">— No beat —</option>
                        {beats.map((b) => (
                            <option key={b.beat || b.label} value={b.beat || b.label}>
                                {b.label} ({b.time}%)
                            </option>
                        ))}
                    </select>
                )}
            </div>

            {/* Actions */}
            <div className="shrink-0 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                {beats.length > 0 && (
                    <button
                        onClick={() => setShowBeatSelect(!showBeatSelect)}
                        className="text-[10px] text-purple-400 hover:text-purple-300 px-1"
                        title="Assign beat"
                    >
                        ♫
                    </button>
                )}
                <button
                    onClick={() => onRemove(scene.id)}
                    className="text-[10px] text-red-400 hover:text-red-300 px-1"
                    title="Remove scene"
                >
                    ✕
                </button>
            </div>
        </div>
    );
}

/** Summary bar showing beat coverage. */
function BeatCoverageSummary({ scenes, beats }) {
    const mappedBeats = new Set(scenes.filter((s) => s.beat_id).map((s) => s.beat_id));
    const covered = beats.filter((b) => mappedBeats.has(b.beat) || mappedBeats.has(b.label)).length;
    const pct = beats.length > 0 ? Math.round((covered / beats.length) * 100) : 0;

    return (
        <div className="shrink-0 border-t border-g-border px-2 py-1.5 text-[10px] text-g-muted">
            <div className="flex items-center gap-2 mb-0.5">
                <span>Beat Coverage: {covered}/{beats.length} ({pct}%)</span>
            </div>
            <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden">
                <div
                    className="h-full bg-purple-500 rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    );
}
