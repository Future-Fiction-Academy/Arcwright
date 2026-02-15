import { DIMENSION_KEYS } from '../data/dimensions';

export function validateAgainstGenre(enrichedData, subgenreRequirements) {
  const finalPoint = enrichedData[enrichedData.length - 1];
  if (!finalPoint || !subgenreRequirements) return { intimacy: false, trust: false, tension: false };

  const reqs = subgenreRequirements;
  return {
    intimacy: finalPoint.intimacy >= reqs.finalIntimacy[0] && finalPoint.intimacy <= reqs.finalIntimacy[1],
    trust: finalPoint.trust >= reqs.finalTrust[0] && finalPoint.trust <= reqs.finalTrust[1],
    tension: finalPoint.tension >= reqs.finalTension[0] && finalPoint.tension <= reqs.finalTension[1],
  };
}

// Interpolate a value at a given time from a dataset
export function interpolateAtTime(data, time) {
  if (!data || data.length === 0) return null;

  // Exact match
  const exact = data.find((d) => d.time === time);
  if (exact) return exact;

  // Find surrounding points
  let before = null;
  let after = null;
  for (const point of data) {
    if (point.time <= time) before = point;
    if (point.time >= time && !after) after = point;
  }

  if (!before && after) return after;
  if (before && !after) return before;
  if (!before && !after) return null;
  if (before.time === after.time) return before;

  // Linear interpolation
  const ratio = (time - before.time) / (after.time - before.time);
  const interpolated = { time };
  DIMENSION_KEYS.forEach((key) => {
    interpolated[key] = before[key] + (after[key] - before[key]) * ratio;
  });
  if (before.tension !== undefined && after.tension !== undefined) {
    interpolated.tension = before.tension + (after.tension - before.tension) * ratio;
  }
  return interpolated;
}

// Compute gap analysis between actual book data and ideal genre template
export function computeGapAnalysis(actualBeats, idealBeats, weights, plotStructure) {
  if (!actualBeats.length || !idealBeats.length) {
    return { overallScore: 0, perBeatGaps: [], perDimensionSummary: {}, priorityActions: [] };
  }

  const perBeatGaps = actualBeats.map((actual) => {
    const ideal = interpolateAtTime(idealBeats, actual.time);
    if (!ideal) return null;

    const gaps = {};
    let totalWeightedGap = 0;

    DIMENSION_KEYS.forEach((key) => {
      const gap = actual[key] - ideal[key];
      const absGap = Math.abs(gap);
      // Use a simple weight lookup; composite weights map to their primary dimension
      const weightKey = key === 'alignment' ? 'misalignment' : key;
      const weight = weights[weightKey] || weights[key] || 0.5;
      const weightedImpact = absGap * weight;
      totalWeightedGap += weightedImpact;

      gaps[key] = {
        actual: actual[key],
        ideal: ideal[key],
        gap,
        absGap,
        weightedImpact,
      };
    });

    // Also compare tension
    if (actual.tension !== undefined && ideal.tension !== undefined) {
      const tensionGap = actual.tension - ideal.tension;
      gaps.tension = {
        actual: actual.tension,
        ideal: ideal.tension,
        gap: tensionGap,
        absGap: Math.abs(tensionGap),
        weightedImpact: Math.abs(tensionGap) * 2, // Tension gets double weight
      };
      totalWeightedGap += gaps.tension.weightedImpact;
    }

    const priority = totalWeightedGap > 15 ? 'HIGH' : totalWeightedGap > 8 ? 'MEDIUM' : 'LOW';

    return {
      time: actual.time,
      beat: actual.beat,
      label: actual.label,
      gaps,
      totalWeightedGap,
      priority,
    };
  }).filter(Boolean);

  // Per-dimension summary
  const perDimensionSummary = {};
  DIMENSION_KEYS.forEach((key) => {
    const dimGaps = perBeatGaps.map((b) => b.gaps[key]).filter(Boolean);
    if (dimGaps.length === 0) return;

    const avgGap = dimGaps.reduce((sum, g) => sum + g.gap, 0) / dimGaps.length;
    const maxGapEntry = dimGaps.reduce((max, g) => (g.absGap > max.absGap ? g : max), dimGaps[0]);
    const worstBeat = perBeatGaps.find((b) => b.gaps[key]?.absGap === maxGapEntry.absGap);

    perDimensionSummary[key] = {
      averageGap: avgGap,
      maxGap: maxGapEntry.absGap,
      trend: avgGap > 0.5 ? 'above' : avgGap < -0.5 ? 'below' : 'mixed',
      worstBeat: worstBeat?.label || '',
    };
  });

  // Overall score: 100 minus penalties from gaps
  const maxPossibleGap = perBeatGaps.length * DIMENSION_KEYS.length * 10;
  const totalGap = perBeatGaps.reduce((sum, b) => sum + b.totalWeightedGap, 0);
  const overallScore = Math.max(0, Math.round(100 - (totalGap / Math.max(maxPossibleGap, 1)) * 200));

  // Priority actions: top dimensions needing attention
  const priorityActions = Object.entries(perDimensionSummary)
    .filter(([, summary]) => summary.maxGap >= 2)
    .sort((a, b) => b[1].maxGap - a[1].maxGap)
    .slice(0, 5)
    .map(([dimension, summary]) => ({
      dimension,
      description: `${dimension}: ${summary.trend === 'above' ? 'consistently above' : summary.trend === 'below' ? 'consistently below' : 'inconsistent with'} genre expectations (worst at "${summary.worstBeat}", gap of ${summary.maxGap.toFixed(1)})`,
      priority: summary.maxGap >= 4 ? 'HIGH' : summary.maxGap >= 2.5 ? 'MEDIUM' : 'LOW',
      beats: perBeatGaps
        .filter((b) => b.gaps[dimension]?.absGap >= 2)
        .map((b) => b.label),
    }));

  return { overallScore, perBeatGaps, perDimensionSummary, priorityActions };
}

// Merge actual and ideal datasets for comparison chart overlay
export function mergeForComparison(actualData, idealData) {
  const allTimes = new Set([
    ...actualData.map((d) => d.time),
    ...idealData.map((d) => d.time),
  ]);

  const sorted = [...allTimes].sort((a, b) => a - b);

  return sorted.map((time) => {
    const actual = interpolateAtTime(actualData, time);
    const ideal = interpolateAtTime(idealData, time);

    const merged = { time };
    DIMENSION_KEYS.forEach((key) => {
      merged[`actual_${key}`] = actual?.[key] ?? null;
      merged[`ideal_${key}`] = ideal?.[key] ?? null;
      merged[`gap_${key}`] = actual && ideal ? Math.abs(actual[key] - ideal[key]) : null;
    });
    merged.actual_tension = actual?.tension ?? null;
    merged.ideal_tension = ideal?.tension ?? null;
    merged.actual_label = actual?.label ?? null;
    merged.ideal_label = ideal?.label ?? null;
    return merged;
  });
}
