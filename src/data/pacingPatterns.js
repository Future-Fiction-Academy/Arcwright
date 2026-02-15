// Pacing patterns define the SHAPE of the intimacy curve (when/how fast intimacy changes).
// This is fundamentally different from modifiers which adjust WEIGHTS (what creates tension).
// Currently romance-focused; can be extended to other genres.
//
// IMPORTANT: Intimacy here measures EMOTIONAL ENTANGLEMENT — how enmeshed, engaged, and
// emotionally invested characters are with each other — NOT romantic closeness specifically.
// Anger, conflict, forced proximity, and rivalry all drive high intimacy because they create
// intense emotional engagement. This is supported by excitation transfer theory (Dutton & Aron)
// and craft consensus that "strong emotions like anger are just as intense as love."
//
// Low intimacy = indifference, emotional distance, strangers.
// High intimacy = deep entanglement, whether that manifests as love, fury, or obsession.
// Vulnerability is tracked separately — high intimacy without vulnerability = charged but guarded.

export const pacingPatterns = {
  slowBurn: {
    name: 'Slow Burn',
    description: 'Gradual entanglement. Characters start emotionally distant, build engagement slowly through proximity and small moments, then accelerate past midpoint.',
    intimacyCurve: [
      { time: 0, intimacy: 1 },    // aware of each other, mild engagement
      { time: 10, intimacy: 1.5 },
      { time: 20, intimacy: 2 },
      { time: 30, intimacy: 2.5 },
      { time: 40, intimacy: 3.5 },  // proximity forcing more engagement
      { time: 50, intimacy: 4.5 },
      { time: 60, intimacy: 6 },    // acceleration — can't ignore it anymore
      { time: 70, intimacy: 3 },    // black moment dip
      { time: 80, intimacy: 6 },
      { time: 90, intimacy: 8 },
      { time: 100, intimacy: 9 },
    ],
    companionSuggestions: {
      desire: [
        { time: 0, value: 1 },
        { time: 25, value: 3 },
        { time: 50, value: 5 },
        { time: 70, value: 8 },
        { time: 100, value: 9 },
      ],
      vulnerability: [
        { time: 0, value: 0.5 },
        { time: 30, value: 1.5 },
        { time: 50, value: 3 },
        { time: 70, value: 7 },
        { time: 100, value: 8 },
      ],
    },
    classifierProfile: {
      startLevel: [0.5, 2],        // avg intimacy at time <= 10%
      earlyRiseRate: [0, 0.07],    // slope from 0-30%
      timeToFive: [50, 100],       // first time% intimacy >= 5
      midpointLevel: [3, 5],       // intimacy at 50%
      hasEarlySpike: false,
      hasMidDrop: false,
    },
  },

  instalove: {
    name: 'Instalove',
    description: 'Immediate intense emotional connection. Characters are deeply entangled almost from first meeting — high engagement, high vulnerability early.',
    intimacyCurve: [
      { time: 0, intimacy: 1 },
      { time: 5, intimacy: 3 },
      { time: 10, intimacy: 5 },
      { time: 15, intimacy: 6.5 },
      { time: 25, intimacy: 7.5 },
      { time: 35, intimacy: 8 },
      { time: 50, intimacy: 8 },
      { time: 58, intimacy: 7 },
      { time: 70, intimacy: 4 },   // black moment
      { time: 80, intimacy: 6.5 },
      { time: 90, intimacy: 8.5 },
      { time: 100, intimacy: 9 },
    ],
    companionSuggestions: {
      desire: [
        { time: 0, value: 3 },
        { time: 15, value: 7 },
        { time: 50, value: 8 },
        { time: 100, value: 9 },
      ],
      vulnerability: [
        { time: 0, value: 2 },
        { time: 15, value: 5 },
        { time: 50, value: 7 },
        { time: 100, value: 8 },
      ],
    },
    classifierProfile: {
      startLevel: [0.5, 3],
      earlyRiseRate: [0.12, 1],
      timeToFive: [8, 20],
      midpointLevel: [6, 10],
      hasEarlySpike: false,
      hasMidDrop: false,
    },
  },

  fastBurn: {
    name: 'One Night Stand / Fast Burn',
    description: 'Early spike of intense entanglement (physical or emotional), then a drop as characters pull away. They remain entangled even while avoiding each other — the floor is higher than strangers.',
    intimacyCurve: [
      { time: 0, intimacy: 1 },
      { time: 5, intimacy: 3 },
      { time: 10, intimacy: 7 },   // spike — intense early encounter
      { time: 15, intimacy: 7.5 },
      { time: 20, intimacy: 4.5 }, // drop — but not to zero, still entangled
      { time: 30, intimacy: 3.5 },
      { time: 40, intimacy: 4 },
      { time: 50, intimacy: 5 },
      { time: 60, intimacy: 6 },
      { time: 70, intimacy: 3 },   // black moment
      { time: 80, intimacy: 5.5 },
      { time: 90, intimacy: 7.5 },
      { time: 100, intimacy: 9 },
    ],
    companionSuggestions: {
      desire: [
        { time: 0, value: 4 },
        { time: 10, value: 8 },
        { time: 20, value: 5 },
        { time: 50, value: 6 },
        { time: 100, value: 9 },
      ],
      vulnerability: [
        { time: 0, value: 1 },
        { time: 10, value: 4 },
        { time: 20, value: 2 },    // walls go back up after the encounter
        { time: 50, value: 5 },
        { time: 100, value: 8 },
      ],
    },
    classifierProfile: {
      startLevel: [0.5, 3],
      earlyRiseRate: [0.1, 1],
      timeToFive: [5, 18],
      midpointLevel: [4, 6],
      hasEarlySpike: true,
      hasMidDrop: false,
    },
  },

  secondChance: {
    name: 'Second Chance',
    description: 'Starts with high entanglement from shared history — these characters are already deeply enmeshed. Dips as old wounds surface, but never reaches indifference. Rebuilds on a more honest foundation.',
    intimacyCurve: [
      { time: 0, intimacy: 5 },    // high — shared history, can't be strangers
      { time: 10, intimacy: 4.5 },
      { time: 20, intimacy: 3.5 }, // old wounds opening — pulling away
      { time: 30, intimacy: 3 },   // lowest point — but still entangled
      { time: 40, intimacy: 3.5 },
      { time: 50, intimacy: 5 },
      { time: 60, intimacy: 6.5 },
      { time: 70, intimacy: 3 },   // black moment
      { time: 80, intimacy: 5.5 },
      { time: 90, intimacy: 8 },
      { time: 100, intimacy: 9 },
    ],
    companionSuggestions: {
      desire: [
        { time: 0, value: 3 },
        { time: 20, value: 5 },
        { time: 50, value: 7 },
        { time: 100, value: 9 },
      ],
      vulnerability: [
        { time: 0, value: 4 },
        { time: 20, value: 6 },
        { time: 50, value: 7 },
        { time: 100, value: 8 },
      ],
    },
    classifierProfile: {
      startLevel: [4, 6],
      earlyRiseRate: [-0.1, 0.02],  // flat or negative
      timeToFive: [45, 65],
      midpointLevel: [4, 6],
      hasEarlySpike: false,
      hasMidDrop: true,
    },
  },

  enemiesToLovers: {
    name: 'Enemies to Lovers',
    description: 'High emotional entanglement from the start — anger, rivalry, and forced proximity create intense engagement even without affection. The inflection at midpoint shifts from hostile entanglement to vulnerable entanglement.',
    intimacyCurve: [
      { time: 0, intimacy: 3.5 },  // high — hostility IS engagement
      { time: 10, intimacy: 4 },   // conflict escalating = more entangled
      { time: 20, intimacy: 4.5 },
      { time: 30, intimacy: 4 },   // cold war dip — active avoidance
      { time: 40, intimacy: 4.5 },
      { time: 48, intimacy: 5.5 }, // inflection — grudging respect, glimpses of humanity
      { time: 55, intimacy: 6.5 },
      { time: 65, intimacy: 7.5 },
      { time: 70, intimacy: 3 },   // black moment — betrayal/revelation
      { time: 80, intimacy: 6 },
      { time: 90, intimacy: 8 },
      { time: 100, intimacy: 9 },
    ],
    companionSuggestions: {
      desire: [
        { time: 0, value: 0.5 },   // desire starts very low — they hate each other
        { time: 20, value: 2 },
        { time: 40, value: 4 },
        { time: 50, value: 6 },
        { time: 100, value: 9 },
      ],
      vulnerability: [
        { time: 0, value: 0.5 },   // guarded — intimacy without vulnerability = charged
        { time: 30, value: 1 },
        { time: 48, value: 3 },     // vulnerability starts rising at inflection
        { time: 65, value: 6 },
        { time: 100, value: 8 },
      ],
    },
    classifierProfile: {
      startLevel: [3, 5],
      earlyRiseRate: [0, 0.05],
      timeToFive: [40, 58],
      midpointLevel: [4.5, 6.5],
      hasEarlySpike: false,
      hasMidDrop: false,
    },
  },

  friendsToLovers: {
    name: 'Friends to Lovers',
    description: 'Starts with moderate platonic entanglement — comfortable, warm, safe. The shift is not in engagement level but in its nature: from platonic to charged. Vulnerability spikes at the realization moment.',
    intimacyCurve: [
      { time: 0, intimacy: 4 },    // already entangled — they are close friends
      { time: 10, intimacy: 4 },
      { time: 20, intimacy: 4.5 },
      { time: 30, intimacy: 4.5 },
      { time: 40, intimacy: 5 },
      { time: 50, intimacy: 6 },   // realization — engagement takes on new charge
      { time: 60, intimacy: 7.5 },
      { time: 70, intimacy: 3.5 }, // black moment — fear of losing the friendship
      { time: 80, intimacy: 6.5 },
      { time: 90, intimacy: 8 },
      { time: 100, intimacy: 9 },
    ],
    companionSuggestions: {
      desire: [
        { time: 0, value: 1 },
        { time: 30, value: 2 },
        { time: 45, value: 4 },
        { time: 55, value: 7 },
        { time: 100, value: 9 },
      ],
      vulnerability: [
        { time: 0, value: 3.5 },   // platonic vulnerability — they're comfortable
        { time: 30, value: 3.5 },
        { time: 50, value: 6 },     // spikes at realization — new kind of exposed
        { time: 70, value: 8 },
        { time: 100, value: 8 },
      ],
    },
    classifierProfile: {
      startLevel: [3.5, 5],
      earlyRiseRate: [0, 0.04],
      timeToFive: [40, 58],
      midpointLevel: [5, 7],
      hasEarlySpike: false,
      hasMidDrop: false,
    },
  },
};

export const PACING_KEYS = Object.keys(pacingPatterns);
