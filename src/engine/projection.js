import { DIMENSION_KEYS } from '../data/dimensions';
import { enrichDataWithTension } from './tension';

/**
 * Generate projected data by blending actual toward ideal.
 * projected[dim] = actual[dim] + (ideal[dim] - actual[dim]) * (percent / 100)
 * At 0% = actual, at 100% = ideal.
 */
export function generateProjection(actualBeats, idealBeats, percent, activeWeights) {
  if (!actualBeats.length || !idealBeats.length) return [];

  // Interpolate ideal at each actual beat's time
  const projected = actualBeats.map((actual) => {
    const ideal = interpolateAtTime(idealBeats, actual.time);
    if (!ideal) return { ...actual };

    const point = { time: actual.time, label: actual.label, beat: actual.beat };
    DIMENSION_KEYS.forEach((key) => {
      const a = actual[key] ?? 0;
      const i = ideal[key] ?? 0;
      point[key] = a + (i - a) * (percent / 100);
    });

    return point;
  });

  return enrichDataWithTension(projected, activeWeights);
}

// Interpolate a value at a given time from a dataset
function interpolateAtTime(data, time) {
  if (!data || data.length === 0) return null;

  const exact = data.find((d) => d.time === time);
  if (exact) return exact;

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

/**
 * Merge actual, ideal, and projected datasets for triple-layer comparison chart.
 * Returns data with actual_*, ideal_*, projected_*, and gap_* prefixed keys.
 */
export function mergeForTripleComparison(actualData, idealData, projectedData) {
  const allTimes = new Set([
    ...actualData.map((d) => d.time),
    ...idealData.map((d) => d.time),
    ...projectedData.map((d) => d.time),
  ]);

  const sorted = [...allTimes].sort((a, b) => a - b);

  return sorted.map((time) => {
    const actual = interpolateAtTime(actualData, time);
    const ideal = interpolateAtTime(idealData, time);
    const projected = interpolateAtTime(projectedData, time);

    const merged = { time };
    DIMENSION_KEYS.forEach((key) => {
      merged[`actual_${key}`] = actual?.[key] ?? null;
      merged[`ideal_${key}`] = ideal?.[key] ?? null;
      merged[`projected_${key}`] = projected?.[key] ?? null;
      merged[`gap_${key}`] = actual && ideal ? Math.abs(actual[key] - ideal[key]) : null;
    });
    merged.actual_tension = actual?.tension ?? null;
    merged.ideal_tension = ideal?.tension ?? null;
    merged.projected_tension = projected?.tension ?? null;
    merged.actual_label = actual?.label ?? null;
    merged.ideal_label = ideal?.label ?? null;
    return merged;
  });
}
