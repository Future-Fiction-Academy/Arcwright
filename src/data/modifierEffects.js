export const modifierEffects = {
  // Romance modifiers
  'Small Town': { description: 'Increased proximity, community pressure', adjustments: { proximityTrust: 1.3, alignment: 1.2 } },
  'Big City': { description: 'Lower proximity, higher independence', adjustments: { proximityTrust: 0.7, powerDiff: 0.8 } },
  'Workplace': { description: 'Forced proximity, power dynamics', adjustments: { proximityTrust: 1.4, powerDiff: 1.3 } },
  'Second Chance': { description: 'High vulnerability, trust issues', adjustments: { vulnerabilityTrust: 1.5, infoAsym: 1.2 } },
  'Fake Relationship': { description: 'Deception, gradual truth reveals', adjustments: { infoAsym: 1.4, desireIntimacy: 1.3 } },
  'Mafia': { description: 'Extreme danger, loyalty conflicts', adjustments: { danger: 1.6, stakes: 1.4, powerDiff: 1.5 } },
  'Captive': { description: 'Maximum power imbalance, forced proximity', adjustments: { powerDiff: 1.8, proximityTrust: 1.6, danger: 1.4 } },
  'Stalker': { description: 'Info asymmetry, psychological tension', adjustments: { infoAsym: 1.7, danger: 1.5, vulnerabilityTrust: 1.4 } },
  'Revenge': { description: 'High stakes, goal misalignment initially', adjustments: { stakes: 1.5, misalignment: 1.4, danger: 1.3 } },
  'Morally Grey': { description: 'Trust challenges, moral complexity', adjustments: { vulnerabilityTrust: 1.4, infoAsym: 1.3, stakes: 1.3 } },
  // Science Fiction modifiers
  'Technology Driven': { description: 'AI, tech focus, innovation', adjustments: { mystery: 1.3, infoAsym: 1.2 } },
  'Political Intrigue': { description: 'Power struggles, conspiracies', adjustments: { infoAsym: 1.5, powerDiff: 1.3, misalignment: 1.2 } },
  'Alien Contact': { description: 'First contact, unknown threats', adjustments: { mystery: 1.6, danger: 1.3, infoAsym: 1.3 } },
  'Space Combat': { description: 'Military action, survival', adjustments: { danger: 1.6, stakes: 1.4 } },
  // Fantasy modifiers
  'Quest': { description: 'Journey structure, clear goal', adjustments: { alignment: 1.4, stakes: 1.3 } },
  'War': { description: 'Large-scale conflict, sacrifice', adjustments: { danger: 1.6, stakes: 1.5, alignment: 1.2 } },
  'Grimdark': { description: 'Moral ambiguity, suffering', adjustments: { danger: 1.5, vulnerabilityTrust: 1.4, stakes: 1.4 } },
  // Mystery modifiers
  'Unreliable Narrator': { description: 'Reality questioning, deception', adjustments: { infoAsym: 1.8, mystery: 1.5, vulnerabilityTrust: 1.4 } },
  'Mind Games': { description: 'Psychological manipulation', adjustments: { infoAsym: 1.5, vulnerabilityTrust: 1.5, mystery: 1.3 } },
  'Noir': { description: 'Cynical, atmospheric', adjustments: { danger: 1.3, misalignment: 1.2, vulnerabilityTrust: 1.2 } },
};
