import { DIMENSION_KEYS } from '../data/dimensions';
import { modifierEffects } from '../data/modifierEffects';

// The tension engine uses 9 composite weight channels, not the 11 dimension keys.
// Some weight channels compute derived gaps from multiple dimensions.
export const WEIGHT_KEYS = [
  'infoAsym',
  'stakes',
  'misalignment',
  'powerDiff',
  'vulnerabilityTrust',
  'desireIntimacy',
  'proximityTrust',
  'danger',
  'mystery',
];

export function getCompleteWeights(subgenreWeights) {
  const complete = {};
  WEIGHT_KEYS.forEach((key) => {
    complete[key] = subgenreWeights[key] !== undefined ? subgenreWeights[key] : 0;
  });
  return complete;
}

export function getModifierAdjustedWeights(weights, selectedModifier) {
  if (!selectedModifier || !modifierEffects[selectedModifier]) {
    return weights;
  }

  const adjustments = modifierEffects[selectedModifier].adjustments;
  const adjusted = { ...weights };

  Object.entries(adjustments).forEach(([key, multiplier]) => {
    if (adjusted[key] !== undefined) {
      adjusted[key] = weights[key] * multiplier;
    }
  });

  return adjusted;
}
