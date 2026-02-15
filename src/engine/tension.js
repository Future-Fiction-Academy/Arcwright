export function calculateTension(point, activeWeights) {
  const misalignment = 10 - point.alignment;
  const vulnerabilityTrustGap = point.vulnerability * (10 - point.trust) / 10;
  const desireIntimacyGap = point.desire * (10 - point.intimacy) / 10;
  const proximityTrustGap = point.proximity * (10 - point.trust) / 10;

  const tension = (
    (activeWeights.infoAsym || 0) * point.infoAsym +
    (activeWeights.stakes || 0) * point.stakes +
    (activeWeights.misalignment || 0) * misalignment +
    (activeWeights.powerDiff || 0) * Math.abs(point.powerDiff) +
    (activeWeights.vulnerabilityTrust || 0) * vulnerabilityTrustGap +
    (activeWeights.desireIntimacy || 0) * desireIntimacyGap +
    (activeWeights.proximityTrust || 0) * proximityTrustGap +
    (activeWeights.danger || 0) * point.danger +
    (activeWeights.mystery || 0) * point.mystery
  );

  const maxPossible = (
    (activeWeights.infoAsym || 0) * 10 +
    (activeWeights.stakes || 0) * 10 +
    (activeWeights.misalignment || 0) * 10 +
    (activeWeights.powerDiff || 0) * 5 +
    (activeWeights.vulnerabilityTrust || 0) * 10 +
    (activeWeights.desireIntimacy || 0) * 10 +
    (activeWeights.proximityTrust || 0) * 10 +
    (activeWeights.danger || 0) * 10 +
    (activeWeights.mystery || 0) * 10
  );

  return maxPossible > 0 ? (tension / maxPossible) * 10 : 0;
}

export function enrichDataWithTension(data, activeWeights) {
  return data.map((point) => ({
    ...point,
    tension: calculateTension(point, activeWeights),
  }));
}
