import React, { useState } from 'react';
import useAppStore from '../../store/useAppStore';
import { dimensions, DIMENSION_KEYS } from '../../data/dimensions';

export default function ScoringReviewPanel() {
  const { chapters, updateChapterScores } = useAppStore();
  const [expandedChapter, setExpandedChapter] = useState(null);

  const analyzedChapters = chapters.filter((ch) => ch.aiScores || ch.userScores);

  if (analyzedChapters.length === 0) {
    return null;
  }

  const handleScoreChange = (chapterId, dimKey, value) => {
    const chapter = chapters.find((ch) => ch.id === chapterId);
    if (!chapter) return;
    const currentScores = chapter.userScores || chapter.aiScores || {};
    updateChapterScores(chapterId, { ...currentScores, [dimKey]: parseFloat(value) || 0 }, 'user');
  };

  const handleResetToAI = (chapterId) => {
    const chapter = chapters.find((ch) => ch.id === chapterId);
    if (!chapter?.aiScores) return;
    updateChapterScores(chapterId, { ...chapter.aiScores }, 'ai');
  };

  return (
    <div className="bg-white/10 backdrop-blur rounded-lg p-4 mb-6">
      <h3 className="text-lg font-bold mb-3">Score Review & Adjustment</h3>
      <p className="text-xs text-purple-300 mb-4">
        Review AI-generated scores and adjust as needed. Click a chapter to expand and edit dimensions.
        <span className="text-blue-300"> Blue values</span> are AI-generated,
        <span className="text-amber-300"> amber values</span> have been manually adjusted.
      </p>

      {/* Compact table header */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-purple-500/30">
              <th className="text-left p-2 text-purple-300">#</th>
              <th className="text-left p-2 text-purple-300">Chapter</th>
              <th className="text-center p-2 text-purple-300">%</th>
              {DIMENSION_KEYS.map((key) => (
                <th
                  key={key}
                  className="text-center p-1 text-purple-300"
                  style={{ color: dimensions[key].color }}
                  title={dimensions[key].name}
                >
                  {key.slice(0, 4)}
                </th>
              ))}
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody>
            {analyzedChapters.map((ch, i) => {
              const scores = ch.userScores || ch.aiScores || {};
              const isExpanded = expandedChapter === ch.id;
              const isModified = ch.status === 'reviewed';

              return (
                <React.Fragment key={ch.id}>
                  <tr
                    className={`border-b border-purple-500/10 cursor-pointer hover:bg-slate-700/30 ${
                      isExpanded ? 'bg-slate-700/30' : ''
                    }`}
                    onClick={() => setExpandedChapter(isExpanded ? null : ch.id)}
                  >
                    <td className="p-2 text-purple-400">{i + 1}</td>
                    <td className="p-2 truncate max-w-[150px]">{ch.title}</td>
                    <td className="p-2 text-center text-purple-300">
                      {scores.timePercent ?? Math.round(((i + 1) / chapters.length) * 100)}%
                    </td>
                    {DIMENSION_KEYS.map((key) => {
                      const aiVal = ch.aiScores?.[key];
                      const userVal = scores[key];
                      const wasEdited = aiVal !== undefined && userVal !== aiVal;
                      return (
                        <td
                          key={key}
                          className={`p-1 text-center font-mono ${
                            wasEdited ? 'text-amber-300' : 'text-blue-300'
                          }`}
                        >
                          {userVal !== undefined ? userVal.toFixed?.(1) ?? userVal : '-'}
                        </td>
                      );
                    })}
                    <td className="p-2">
                      <span className="text-purple-400 text-xs">
                        {isExpanded ? '\u25B2' : '\u25BC'}
                      </span>
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr>
                      <td colSpan={DIMENSION_KEYS.length + 4} className="p-4 bg-slate-800/50">
                        <div className="space-y-3">
                          {scores.reasoning && (
                            <div className="text-xs text-purple-200 bg-purple-900/30 p-2 rounded">
                              <strong>AI Reasoning:</strong> {scores.reasoning}
                            </div>
                          )}
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {DIMENSION_KEYS.map((key) => (
                              <div key={key} className="flex items-center gap-2">
                                <span
                                  style={{ color: dimensions[key].color }}
                                  className="text-xs font-semibold w-20 truncate"
                                >
                                  {dimensions[key].name}
                                </span>
                                <input
                                  type="number"
                                  min={dimensions[key].range[0]}
                                  max={dimensions[key].range[1]}
                                  step={0.5}
                                  value={scores[key] ?? 0}
                                  onChange={(e) => handleScoreChange(ch.id, key, e.target.value)}
                                  className="w-16 bg-slate-700 border border-purple-500/50 rounded px-2 py-1 text-xs text-center text-white"
                                />
                              </div>
                            ))}
                          </div>
                          <div className="flex gap-2 mt-2">
                            {ch.aiScores && (
                              <button
                                onClick={(e) => { e.stopPropagation(); handleResetToAI(ch.id); }}
                                className="text-xs bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded"
                              >
                                Reset to AI Scores
                              </button>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
