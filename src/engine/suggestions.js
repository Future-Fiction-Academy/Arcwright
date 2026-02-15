import { dimensions, DIMENSION_KEYS } from '../data/dimensions';
import { WEIGHT_KEYS } from './weights';
import { interpolateAtTime } from './validation';
import { beatGuidance } from '../data/beatGuidance';

// Dimension-specific suggestion text templates
const suggestionTemplates = {
  intimacy: {
    increase: 'Deepen the emotional connection — shared confession, physical closeness, or a moment of understanding.',
    decrease: 'Pull characters apart emotionally — misunderstanding, emotional walls, or withdrawal.',
  },
  powerDiff: {
    increase: 'Widen the power gap — one character gains leverage, authority, or resources over the other.',
    decrease: 'Equalize power — the disadvantaged character gains agency, knowledge, or allies.',
  },
  infoAsym: {
    increase: 'Add secrets or hidden knowledge — one character learns something the other doesn\'t know.',
    decrease: 'Reveal information — a confession, discovery, or forced exposure of the truth.',
  },
  alignment: {
    increase: 'Bring goals into alignment — shared purpose, common enemy, or mutual need.',
    decrease: 'Create goal conflict — competing priorities, betrayal of interests, or forced choices.',
  },
  proximity: {
    increase: 'Force characters together — shared space, joint mission, or physical closeness.',
    decrease: 'Separate characters — distance, barriers, or forced isolation.',
  },
  vulnerability: {
    increase: 'Expose emotional or physical weakness — a confession, injury, or moment of helplessness.',
    decrease: 'Armor up — characters build defenses, hide weakness, or project strength.',
  },
  desire: {
    increase: 'Intensify wanting — forbidden attraction, teasing proximity, or an almost-moment.',
    decrease: 'Dampen desire — satisfaction, disillusionment, or redirection of focus.',
  },
  stakes: {
    increase: 'Raise what can be lost — threaten relationships, lives, careers, or identity.',
    decrease: 'Lower the pressure — resolve a threat, provide safety, or reduce consequences.',
  },
  trust: {
    increase: 'Build trust — kept promises, shared vulnerability, or demonstrated loyalty.',
    decrease: 'Erode trust — broken promises, revealed secrets, or betrayal.',
  },
  danger: {
    increase: 'Introduce threat — physical risk, a ticking clock, or an antagonist closing in.',
    decrease: 'Remove immediate danger — safe harbor, defeated threat, or temporary peace.',
  },
  mystery: {
    increase: 'Deepen the unknown — new questions, strange clues, or unexplained events.',
    decrease: 'Reveal answers — solve a puzzle, explain the strange, or confirm a theory.',
  },
};

/**
 * Generate beat-level suggestions by comparing actual values to the ideal curve.
 *
 * Returns { positionSummary, suggestions[], guidance }
 */
export function generateBeatSuggestions(beat, idealCurve, activeWeights, structureKey) {
  if (!idealCurve || idealCurve.length === 0) {
    return { positionSummary: '', suggestions: [], guidance: null };
  }

  const expected = interpolateAtTime(idealCurve, beat.time);
  if (!expected) {
    return { positionSummary: '', suggestions: [], guidance: null };
  }

  // Map dimension keys to their most relevant weight key for importance ranking
  const dimToWeight = {
    intimacy: 'desireIntimacy',
    powerDiff: 'powerDiff',
    infoAsym: 'infoAsym',
    alignment: 'misalignment',
    proximity: 'proximityTrust',
    vulnerability: 'vulnerabilityTrust',
    desire: 'desireIntimacy',
    stakes: 'stakes',
    trust: 'vulnerabilityTrust',
    danger: 'danger',
    mystery: 'mystery',
  };

  const suggestions = DIMENSION_KEYS
    .map((key) => {
      const actual = beat[key] ?? 0;
      const ideal = expected[key] ?? 0;
      const gap = actual - ideal;
      const absGap = Math.abs(gap);

      if (absGap < 1.0) return null; // Close enough — no suggestion

      const weightKey = dimToWeight[key] || key;
      const weight = activeWeights[weightKey] || 0.5;
      const weightedImpact = absGap * weight;

      const direction = gap < 0 ? 'increase' : 'decrease';
      const severity = absGap > 3 ? 'high' : absGap > 1.5 ? 'medium' : 'low';
      const template = suggestionTemplates[key]?.[direction] || '';

      return {
        dimension: key,
        dimensionName: dimensions[key].name,
        color: dimensions[key].color,
        actual: Math.round(actual * 10) / 10,
        expected: Math.round(ideal * 10) / 10,
        gap: Math.round(gap * 10) / 10,
        direction,
        severity,
        weightedImpact,
        suggestion: template,
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.weightedImpact - a.weightedImpact)
    .slice(0, 5);

  // Position summary
  const beatName = beat.beat
    ? (structureKey ? `${beat.beat}` : beat.beat)
    : '';
  const positionSummary = `At ${beat.time}%${beatName ? ` — ${beat.label || beatName}` : ''}`;

  // Beat guidance from the data file
  const guidance = beatGuidance[structureKey]?.[beat.beat] || null;

  return { positionSummary, suggestions, guidance };
}
