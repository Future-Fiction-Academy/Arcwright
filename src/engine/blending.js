import { DIMENSION_KEYS } from '../data/dimensions';
import { WEIGHT_KEYS } from './weights';
import { interpolateAtTime } from './validation';

/**
 * Blend two preset arcs into a hybrid ideal curve.
 * ratio is 0-1 where 1 = 100% primary, 0 = 100% secondary.
 */
export function blendArcs(primaryArc, secondaryArc, ratio) {
  const r = ratio / 100;

  // Collect union of all time points
  const timeSet = new Set([
    ...primaryArc.map((p) => p.time),
    ...secondaryArc.map((p) => p.time),
  ]);
  const times = [...timeSet].sort((a, b) => a - b);

  return times.map((time) => {
    const p = interpolateAtTime(primaryArc, time);
    const s = interpolateAtTime(secondaryArc, time);
    if (!p || !s) return p || s;

    const blended = { time };
    DIMENSION_KEYS.forEach((key) => {
      blended[key] = r * (p[key] ?? 0) + (1 - r) * (s[key] ?? 0);
    });

    // Use primary beat metadata
    const nearest = primaryArc.reduce((best, pt) =>
      Math.abs(pt.time - time) < Math.abs(best.time - time) ? pt : best
    );
    blended.beat = nearest.beat || '';
    blended.label = nearest.label || '';

    return blended;
  });
}

/**
 * Blend two subgenre weight objects.
 * ratio is 0-100 where 100 = 100% primary.
 */
export function blendWeights(primaryWeights, secondaryWeights, ratio) {
  const r = ratio / 100;
  const blended = {};
  WEIGHT_KEYS.forEach((key) => {
    blended[key] = r * (primaryWeights[key] || 0) + (1 - r) * (secondaryWeights[key] || 0);
  });
  return blended;
}

/**
 * Blend two requirement objects.
 * Each has finalIntimacy: [min, max], finalTrust: [min, max], finalTension: [min, max].
 */
export function blendRequirements(primaryReqs, secondaryReqs, ratio) {
  const r = ratio / 100;
  const blend = (a, b) => [
    Math.round((r * a[0] + (1 - r) * b[0]) * 10) / 10,
    Math.round((r * a[1] + (1 - r) * b[1]) * 10) / 10,
  ];
  return {
    finalIntimacy: blend(primaryReqs.finalIntimacy, secondaryReqs.finalIntimacy),
    finalTrust: blend(primaryReqs.finalTrust, secondaryReqs.finalTrust),
    finalTension: blend(primaryReqs.finalTension, secondaryReqs.finalTension),
  };
}
