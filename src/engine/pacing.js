import { pacingPatterns } from '../data/pacingPatterns';

// Linearly interpolate a value at a given time from control points
function interpolate(curve, time) {
  if (!curve || curve.length === 0) return 0;
  if (time <= curve[0].time) return curve[0].intimacy ?? curve[0].value ?? 0;
  if (time >= curve[curve.length - 1].time) return curve[curve.length - 1].intimacy ?? curve[curve.length - 1].value ?? 0;

  let before = curve[0];
  let after = curve[curve.length - 1];
  for (let i = 0; i < curve.length - 1; i++) {
    if (curve[i].time <= time && curve[i + 1].time >= time) {
      before = curve[i];
      after = curve[i + 1];
      break;
    }
  }

  if (before.time === after.time) return before.intimacy ?? before.value ?? 0;
  const ratio = (time - before.time) / (after.time - before.time);
  const bVal = before.intimacy ?? before.value ?? 0;
  const aVal = after.intimacy ?? after.value ?? 0;
  return bVal + (aVal - bVal) * ratio;
}

/**
 * Apply a pacing pattern to a set of beats.
 * Overwrites intimacy values by interpolating the pacing curve to each beat's time%.
 * Optionally applies companion dimension suggestions (desire, vulnerability).
 */
export function applyPacingToBeats(beats, pacingKey, applyCompanions = false) {
  const pattern = pacingPatterns[pacingKey];
  if (!pattern) return beats;

  return beats.map((beat) => {
    const updated = { ...beat };
    updated.intimacy = Math.round(interpolate(pattern.intimacyCurve, beat.time) * 10) / 10;

    if (applyCompanions && pattern.companionSuggestions) {
      if (pattern.companionSuggestions.desire) {
        updated.desire = Math.round(interpolate(pattern.companionSuggestions.desire, beat.time) * 10) / 10;
      }
      if (pattern.companionSuggestions.vulnerability) {
        updated.vulnerability = Math.round(interpolate(pattern.companionSuggestions.vulnerability, beat.time) * 10) / 10;
      }
    }

    return updated;
  });
}

/**
 * Extract classifier features from an intimacy curve (array of {time, intimacy} or beat objects).
 */
export function extractPacingFeatures(data) {
  if (!data || data.length === 0) {
    return { startLevel: 0, earlyRiseRate: 0, timeToFive: 100, midpointLevel: 0, hasEarlySpike: false, hasMidDrop: false };
  }

  const sorted = [...data].sort((a, b) => a.time - b.time);

  // startLevel: avg intimacy at time <= 10%
  const earlyPoints = sorted.filter((p) => p.time <= 10);
  const startLevel = earlyPoints.length > 0
    ? earlyPoints.reduce((s, p) => s + (p.intimacy ?? 0), 0) / earlyPoints.length
    : sorted[0].intimacy ?? 0;

  // earlyRiseRate: slope from 0-30%
  const at0 = interpolate(sorted.map((p) => ({ time: p.time, intimacy: p.intimacy ?? 0 })), 0);
  const at30 = interpolate(sorted.map((p) => ({ time: p.time, intimacy: p.intimacy ?? 0 })), 30);
  const earlyRiseRate = (at30 - at0) / 30;

  // timeToFive: first time% intimacy >= 5
  let timeToFive = 100;
  for (const p of sorted) {
    if ((p.intimacy ?? 0) >= 5) {
      timeToFive = p.time;
      break;
    }
  }
  // Refine by interpolation between points
  if (timeToFive === 100) {
    for (let t = 0; t <= 100; t += 1) {
      const val = interpolate(sorted.map((p) => ({ time: p.time, intimacy: p.intimacy ?? 0 })), t);
      if (val >= 5) {
        timeToFive = t;
        break;
      }
    }
  }

  // midpointLevel: intimacy at 50%
  const midpointLevel = interpolate(sorted.map((p) => ({ time: p.time, intimacy: p.intimacy ?? 0 })), 50);

  // hasEarlySpike: reaches >= 5 before 20% then drops by >= 3
  let hasEarlySpike = false;
  let earlyPeak = 0;
  let earlyPeakTime = 0;
  for (const p of sorted) {
    if (p.time <= 20 && (p.intimacy ?? 0) >= 5) {
      if ((p.intimacy ?? 0) > earlyPeak) {
        earlyPeak = p.intimacy ?? 0;
        earlyPeakTime = p.time;
      }
    }
  }
  if (earlyPeak >= 5) {
    // Check for drop after the peak
    for (const p of sorted) {
      if (p.time > earlyPeakTime && p.time <= 40) {
        if (earlyPeak - (p.intimacy ?? 0) >= 3) {
          hasEarlySpike = true;
          break;
        }
      }
    }
  }

  // hasMidDrop: drop of >= 2 in 10-40% range from starting level
  let hasMidDrop = false;
  if (startLevel >= 2) {
    for (const p of sorted) {
      if (p.time >= 10 && p.time <= 40) {
        if (startLevel - (p.intimacy ?? 0) >= 2) {
          hasMidDrop = true;
          break;
        }
      }
    }
  }

  return { startLevel, earlyRiseRate, timeToFive, midpointLevel, hasEarlySpike, hasMidDrop };
}

/**
 * Classify an intimacy curve against all pacing patterns.
 * Returns { pattern: key, name, confidence, scores: { [key]: score } }.
 */
export function classifyPacingPattern(data) {
  const features = extractPacingFeatures(data);
  const scores = {};

  Object.entries(pacingPatterns).forEach(([key, pattern]) => {
    const profile = pattern.classifierProfile;
    let score = 0;
    let maxScore = 0;

    // startLevel (weight: 2)
    maxScore += 2;
    if (features.startLevel >= profile.startLevel[0] && features.startLevel <= profile.startLevel[1]) {
      score += 2;
    } else {
      const dist = Math.min(
        Math.abs(features.startLevel - profile.startLevel[0]),
        Math.abs(features.startLevel - profile.startLevel[1])
      );
      score += Math.max(0, 2 - dist * 0.5);
    }

    // earlyRiseRate (weight: 2)
    maxScore += 2;
    if (features.earlyRiseRate >= profile.earlyRiseRate[0] && features.earlyRiseRate <= profile.earlyRiseRate[1]) {
      score += 2;
    } else {
      const dist = Math.min(
        Math.abs(features.earlyRiseRate - profile.earlyRiseRate[0]),
        Math.abs(features.earlyRiseRate - profile.earlyRiseRate[1])
      );
      score += Math.max(0, 2 - dist * 10);
    }

    // timeToFive (weight: 3 - most discriminating)
    maxScore += 3;
    if (features.timeToFive >= profile.timeToFive[0] && features.timeToFive <= profile.timeToFive[1]) {
      score += 3;
    } else {
      const dist = Math.min(
        Math.abs(features.timeToFive - profile.timeToFive[0]),
        Math.abs(features.timeToFive - profile.timeToFive[1])
      );
      score += Math.max(0, 3 - dist * 0.1);
    }

    // midpointLevel (weight: 2)
    maxScore += 2;
    if (features.midpointLevel >= profile.midpointLevel[0] && features.midpointLevel <= profile.midpointLevel[1]) {
      score += 2;
    } else {
      const dist = Math.min(
        Math.abs(features.midpointLevel - profile.midpointLevel[0]),
        Math.abs(features.midpointLevel - profile.midpointLevel[1])
      );
      score += Math.max(0, 2 - dist * 0.5);
    }

    // hasEarlySpike (weight: 2 - binary)
    maxScore += 2;
    if (features.hasEarlySpike === profile.hasEarlySpike) {
      score += 2;
    }

    // hasMidDrop (weight: 2 - binary)
    maxScore += 2;
    if (features.hasMidDrop === profile.hasMidDrop) {
      score += 2;
    }

    scores[key] = Math.round((score / maxScore) * 100);
  });

  const bestKey = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  return {
    pattern: bestKey[0],
    name: pacingPatterns[bestKey[0]].name,
    confidence: bestKey[1],
    scores,
  };
}
