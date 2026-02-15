// Narrative writing guidance per beat per plot structure.
// Each entry provides the narrative purpose, emotional goal, setup/avoid lists,
// and how the beat connects to the next.

export const beatGuidance = {
  romancingTheBeat: {
    setup: {
      purpose: 'Establish the protagonist\'s ordinary world and the emotional wound or need that will drive the romance.',
      emotionalGoal: 'Reader should feel grounded in the protagonist\'s life and sense what\'s missing.',
      establish: [
        'Protagonist\'s daily life and routines',
        'The emotional wound or internal conflict',
        'Key secondary characters and their relationships',
        'The setting/world that will frame the romance',
      ],
      avoid: [
        'Info-dumping backstory all at once',
        'Making the protagonist too content (no room for growth)',
        'Introducing the love interest too early in this beat',
      ],
      connectionToNext: 'The setup creates the conditions that make the Meet Cute feel inevitable or fateful.',
    },
    meetCute: {
      purpose: 'First significant interaction between the protagonists. Sparks or friction (or both) must be immediate.',
      emotionalGoal: 'Reader should feel the chemistry or tension crackle — this is the promise of the romance.',
      establish: [
        'Undeniable chemistry or magnetic friction',
        'A reason these two are drawn to each other',
        'An obstacle or complication that makes romance difficult',
        'Each character\'s first impression of the other',
      ],
      avoid: [
        'A bland or forgettable first meeting',
        'Making either character unlikeable without redemption signals',
        'Resolving the tension too quickly',
      ],
      connectionToNext: 'The meet cute creates a situation where the characters must interact despite resistance.',
    },
    noWay: {
      purpose: 'Characters resist the attraction. Internal or external forces push them apart.',
      emotionalGoal: 'Reader should feel the push-pull tension and root for them to overcome resistance.',
      establish: [
        'Why these characters believe they can\'t or shouldn\'t be together',
        'Escalating forced proximity or circumstances',
        'Glimpses of vulnerability beneath resistance',
        'Rising desire despite stated objections',
      ],
      avoid: [
        'Making the resistance feel contrived or easily solvable',
        'Having characters be mean without underlying attraction',
        'Stalling momentum with repetitive back-and-forth',
      ],
      connectionToNext: 'Resistance becomes unsustainable; a moment of genuine connection breaks through.',
    },
    connection: {
      purpose: 'Characters bond genuinely. Walls lower, vulnerability increases, trust begins to build.',
      emotionalGoal: 'Reader should feel warmth, hope, and increasing investment in the relationship.',
      establish: [
        'Shared experiences that build trust',
        'Emotional vulnerability from both characters',
        'Physical and emotional intimacy escalation',
        'A sense of "these two really get each other"',
      ],
      avoid: [
        'Moving too fast without earning emotional beats',
        'Neglecting the subplot or external plot',
        'Making connection feel one-sided',
      ],
      connectionToNext: 'The deepening connection leads to a pivotal commitment or declaration at the midpoint.',
    },
    midpoint: {
      purpose: 'A major turning point: first kiss, declaration, or physical intimacy. The relationship shifts gear.',
      emotionalGoal: 'Reader should feel the relationship has fundamentally changed — there\'s no going back.',
      establish: [
        'A clear before/after moment in the relationship',
        'Raised stakes — what they now stand to lose',
        'Deepened vulnerability and trust',
        'A sense of joy or rightness (even if brief)',
      ],
      avoid: [
        'Making the midpoint feel like the climax',
        'Rushing past the emotional weight of this moment',
        'Having the midpoint feel unearned by prior buildup',
      ],
      connectionToNext: 'The commitment creates new fears and vulnerabilities that the retreat will exploit.',
    },
    retreat: {
      purpose: 'Doubt, fear, or external pressure causes one or both characters to pull back.',
      emotionalGoal: 'Reader should feel anxiety and dread — sensing the black moment approaching.',
      establish: [
        'Cracks forming in the new intimacy',
        'Old wounds resurfacing under pressure',
        'Miscommunication or secrets gaining weight',
        'External antagonist forces gaining strength',
      ],
      avoid: [
        'Making the retreat feel like a repetition of the No Way beat',
        'Having characters act out of character for plot convenience',
        'Letting the retreat drag without escalation',
      ],
      connectionToNext: 'The retreat\'s escalating pressure leads directly to the devastating black moment.',
    },
    blackMoment: {
      purpose: 'The all-is-lost moment. The relationship appears doomed. Maximum emotional devastation.',
      emotionalGoal: 'Reader should feel genuine despair — believing for a moment that this love might not survive.',
      establish: [
        'The lie, secret, or wound that tears them apart',
        'Maximum emotional distance between characters',
        'Consequences that feel real and irreversible',
        'Each character facing their deepest fear',
      ],
      avoid: [
        'A breakup that feels easily fixable',
        'Making one character clearly "right" and the other "wrong"',
        'External-only conflict (both should have internal reasons)',
      ],
      connectionToNext: 'The devastation forces the epiphany — characters must face their truth.',
    },
    epiphany: {
      purpose: 'One or both characters realize what they must change or sacrifice for love.',
      emotionalGoal: 'Reader should feel the shift — from despair to determination.',
      establish: [
        'The internal realization or growth moment',
        'What the character is willing to sacrifice',
        'How the wound is finally healing',
        'A plan or decision to fight for the relationship',
      ],
      avoid: [
        'Having epiphany come from external advice only',
        'Making the realization too easy or sudden without setup',
        'Skipping the emotional processing between black moment and action',
      ],
      connectionToNext: 'The epiphany demands a grand gesture — words and realization aren\'t enough.',
    },
    grandGesture: {
      purpose: 'A dramatic, meaningful action that proves the character has changed and chooses love.',
      emotionalGoal: 'Reader should feel catharsis — the emotional payoff of the entire journey.',
      establish: [
        'An action that directly addresses the core wound',
        'Public or significant vulnerability',
        'Proof of genuine character growth',
        'A moment of choice that risks everything',
      ],
      avoid: [
        'A gesture that doesn\'t connect to the story\'s themes',
        'Grand gestures that are materialistic rather than emotional',
        'Having the other character accept too easily (some earned hesitation)',
      ],
      connectionToNext: 'The grand gesture earns the happily ever after.',
    },
    hea: {
      purpose: 'The Happily Ever After (or Happy For Now). Demonstrate the new normal of the relationship.',
      emotionalGoal: 'Reader should feel satisfied, warm, and certain these characters will be okay.',
      establish: [
        'The couple together, changed and happy',
        'Resolution of subplot threads',
        'A callback to an early moment, showing how far they\'ve come',
        'A sense of the future ahead',
      ],
      avoid: [
        'Introducing new conflict',
        'Rushing the ending — readers need to bask',
        'Leaving important threads unresolved',
      ],
      connectionToNext: 'This is the destination. The story is complete.',
    },
  },

  heroJourney: {
    ordinaryWorld: {
      purpose: 'Show the hero\'s normal life before the adventure. Establish what they stand to lose and what they lack.',
      emotionalGoal: 'Reader should feel connected to the hero and sense the restlessness or incompleteness.',
      establish: [
        'The hero\'s daily life and relationships',
        'A flaw or limitation that will be tested',
        'The world\'s rules and status quo',
        'Seeds of the coming disruption',
      ],
      avoid: [
        'Starting with action before the reader cares',
        'Making the ordinary world too boring to read',
        'Over-explaining the world-building',
      ],
      connectionToNext: 'The ordinary world is disrupted by the call to adventure.',
    },
    callToAdventure: {
      purpose: 'An event or revelation that demands the hero leave their comfort zone.',
      emotionalGoal: 'Reader should feel excitement mixed with the hero\'s trepidation.',
      establish: [
        'A clear inciting event that changes everything',
        'Stakes — what happens if the hero doesn\'t act',
        'The scale of the challenge ahead',
      ],
      avoid: [
        'A vague or underwhelming call',
        'Having the hero immediately accept',
      ],
      connectionToNext: 'The call creates internal conflict that manifests as the refusal.',
    },
    refusalOfCall: {
      purpose: 'The hero hesitates, showing the realistic human response to danger and change.',
      emotionalGoal: 'Reader should empathize with the fear while wanting the hero to step up.',
      establish: [
        'The hero\'s legitimate fears and doubts',
        'What they risk by accepting the call',
        'Escalating pressure that makes refusal unsustainable',
      ],
      avoid: [
        'Making the hero seem cowardly rather than cautious',
        'Dragging out the refusal too long',
      ],
      connectionToNext: 'A catalyst (often the mentor) tips the balance toward acceptance.',
    },
    meetingMentor: {
      purpose: 'The hero encounters a guide who provides tools, knowledge, or confidence.',
      emotionalGoal: 'Reader should feel hope — the hero isn\'t alone.',
      establish: [
        'The mentor\'s wisdom and the gift they offer',
        'The mentor\'s own limitations or cost',
        'A bond of trust between hero and mentor',
      ],
      avoid: [
        'Making the mentor solve the hero\'s problems',
        'Info-dump disguised as mentoring',
      ],
      connectionToNext: 'Armed with new knowledge/tools, the hero is ready to cross the threshold.',
    },
    crossingThreshold: {
      purpose: 'The hero commits to the adventure and enters the special world.',
      emotionalGoal: 'Reader should feel the point of no return — excitement and uncertainty.',
      establish: [
        'A clear boundary between ordinary and special worlds',
        'The hero\'s commitment despite fear',
        'New rules, dangers, and wonders of the special world',
      ],
      avoid: [
        'Making the crossing feel casual or reversible',
      ],
      connectionToNext: 'The special world introduces tests, allies, and enemies.',
    },
    testsAlliesEnemies: {
      purpose: 'The hero navigates the special world, forming bonds and facing challenges.',
      emotionalGoal: 'Reader should feel growing investment in the team and rising tension.',
      establish: [
        'Key allies and their motivations',
        'The nature and power of enemies',
        'The hero learning and growing through trials',
        'Rising stakes with each test',
      ],
      avoid: [
        'Episodic tests without escalation',
        'Introducing too many characters at once',
      ],
      connectionToNext: 'Tests prepare the hero for the approach to the greatest danger.',
    },
    approachInmostCave: {
      purpose: 'The hero and allies prepare for the central ordeal. Tension reaches a peak.',
      emotionalGoal: 'Reader should feel dread and anticipation.',
      establish: [
        'Final preparations and strategy',
        'The scale of what they\'re about to face',
        'Moments of bonding before the storm',
      ],
      avoid: [
        'Rushing past the buildup to get to action',
      ],
      connectionToNext: 'Preparation gives way to the ordeal itself.',
    },
    ordeal: {
      purpose: 'The hero faces their greatest challenge. Death (literal or symbolic) is a real possibility.',
      emotionalGoal: 'Reader should feel maximum tension, fear, and catharsis.',
      establish: [
        'A genuine threat of failure or death',
        'The hero using everything they\'ve learned',
        'A moment of apparent defeat before triumph',
        'Sacrifice or transformation',
      ],
      avoid: [
        'Making victory too easy',
        'Deus ex machina solutions',
      ],
      connectionToNext: 'Surviving the ordeal earns the reward.',
    },
    reward: {
      purpose: 'The hero seizes the prize — knowledge, an artifact, reconciliation.',
      emotionalGoal: 'Reader should feel triumph and relief.',
      establish: [
        'What the hero has gained',
        'How the hero has changed',
        'A brief moment of celebration',
      ],
      avoid: [
        'Lingering too long in celebration',
        'Forgetting that dangers still remain',
      ],
      connectionToNext: 'The reward must be brought back, and the road home has its own dangers.',
    },
    roadBack: {
      purpose: 'The hero begins the return, but faces pursuit or new complications.',
      emotionalGoal: 'Reader should feel urgency — it\'s not over yet.',
      establish: [
        'Consequences of the ordeal catching up',
        'A ticking clock or pursuit',
        'The hero\'s determination to return changed',
      ],
      avoid: [
        'Making the road back feel anticlimactic after the ordeal',
      ],
      connectionToNext: 'The road back leads to one final test: the resurrection.',
    },
    resurrection: {
      purpose: 'A final, ultimate test where the hero must apply everything they\'ve learned.',
      emotionalGoal: 'Reader should feel the stakes are even higher than the ordeal.',
      establish: [
        'The final confrontation with the central evil/problem',
        'The hero transformed — proving their growth',
        'The climactic moment of victory',
      ],
      avoid: [
        'Repeating the ordeal rather than escalating',
        'Having the hero succeed without cost',
      ],
      connectionToNext: 'Victory in resurrection earns the true return.',
    },
    returnWithElixir: {
      purpose: 'The hero returns to the ordinary world, transformed, bearing a gift for their community.',
      emotionalGoal: 'Reader should feel satisfaction and a sense of completion.',
      establish: [
        'How the hero has fundamentally changed',
        'The "elixir" — wisdom, peace, or treasure brought back',
        'The ordinary world improved by the journey',
      ],
      avoid: [
        'Rushing the ending',
        'Leaving key threads unresolved',
      ],
      connectionToNext: 'This is the destination. The journey is complete.',
    },
  },

  threeAct: {
    setup: {
      purpose: 'Introduce characters, world, and the status quo that will be disrupted.',
      emotionalGoal: 'Reader should feel oriented and invested in the characters.',
      establish: ['Protagonist and key relationships', 'The world and its rules', 'What\'s at stake'],
      avoid: ['Starting too slowly', 'Info-dumping'],
      connectionToNext: 'The setup is disrupted by the inciting incident.',
    },
    incitingIncident: {
      purpose: 'The event that sets the main conflict in motion.',
      emotionalGoal: 'Reader should feel the story has truly begun.',
      establish: ['A clear disruption to the status quo', 'The central question of the story', 'Initial stakes'],
      avoid: ['A weak or unclear inciting incident', 'Happening too late'],
      connectionToNext: 'The inciting incident forces a response at the first plot point.',
    },
    firstPlotPoint: {
      purpose: 'The protagonist commits to addressing the conflict. End of Act I.',
      emotionalGoal: 'Reader should feel momentum — the character has chosen to act.',
      establish: ['A clear decision or commitment', 'Point of no return', 'Rising stakes'],
      avoid: ['The protagonist being passive', 'An unclear transition between acts'],
      connectionToNext: 'The commitment launches the rising action of Act II.',
    },
    risingAction: {
      purpose: 'Escalating complications and obstacles as the protagonist pursues their goal.',
      emotionalGoal: 'Reader should feel increasing tension and investment.',
      establish: ['Escalating obstacles', 'Character development through adversity', 'Subplot development'],
      avoid: ['Flat tension without escalation', 'Repetitive obstacles'],
      connectionToNext: 'Rising action builds to the midpoint revelation.',
    },
    midpoint: {
      purpose: 'A major revelation or reversal that shifts the protagonist from reactive to proactive (or vice versa).',
      emotionalGoal: 'Reader should feel a fundamental shift in the story\'s dynamics.',
      establish: ['A clear shift in approach or understanding', 'Raised stakes', 'New information that changes everything'],
      avoid: ['A subtle midpoint the reader might miss', 'No actual shift in dynamics'],
      connectionToNext: 'The midpoint shift leads to new, more dangerous complications.',
    },
    crisis: {
      purpose: 'Complications intensify, subplots converge, and the protagonist faces their darkest moment.',
      emotionalGoal: 'Reader should feel escalating dread and uncertainty about the outcome.',
      establish: ['Converging threats', 'The protagonist\'s flaws tested', 'Maximum pressure'],
      avoid: ['Introducing entirely new plotlines', 'Letting tension plateau'],
      connectionToNext: 'The crisis forces a final confrontation at the second plot point.',
    },
    secondPlotPoint: {
      purpose: 'The final piece falls into place. The protagonist has what they need for the climax.',
      emotionalGoal: 'Reader should feel urgency — everything is about to come to a head.',
      establish: ['The final revelation or resource', 'A clear path to the climax', 'Maximum stakes'],
      avoid: ['Deus ex machina', 'Deflating tension'],
      connectionToNext: 'The second plot point launches Act III.',
    },
    climax: {
      purpose: 'The final confrontation where the central conflict is resolved.',
      emotionalGoal: 'Reader should feel maximum tension, then catharsis.',
      establish: ['The ultimate test of the protagonist', 'Resolution of the central conflict', 'Consequences'],
      avoid: ['An anticlimactic resolution', 'Victory without cost'],
      connectionToNext: 'The climax leads to the resolution.',
    },
    resolution: {
      purpose: 'Show the new status quo and tie up remaining threads.',
      emotionalGoal: 'Reader should feel satisfied and see how the world has changed.',
      establish: ['The new normal', 'Character transformation', 'Subplot closure'],
      avoid: ['Rushing the ending', 'Introducing new conflicts'],
      connectionToNext: 'This is the destination. The story is complete.',
    },
  },

  mysterySuspense: {
    ordinaryWorld: {
      purpose: 'Establish the detective/protagonist\'s world before the crime.',
      emotionalGoal: 'Reader should feel grounded and sense that something is about to disrupt this world.',
      establish: ['The protagonist\'s skills and flaws', 'The community or setting', 'A sense of normalcy'],
      avoid: ['Starting too slowly', 'Giving away too much'],
      connectionToNext: 'The ordinary world is shattered by the crime.',
    },
    crime: {
      purpose: 'The inciting crime or mystery that demands investigation.',
      emotionalGoal: 'Reader should feel shock, intrigue, and the desire to solve it.',
      establish: ['The crime and its immediate impact', 'Initial mystery and questions', 'Why the protagonist must investigate'],
      avoid: ['A crime that doesn\'t feel significant enough', 'Revealing too many clues immediately'],
      connectionToNext: 'The crime launches the investigation.',
    },
    initialInvestigation: {
      purpose: 'First round of clue-gathering, interviews, and suspect identification.',
      emotionalGoal: 'Reader should feel engaged in puzzle-solving alongside the detective.',
      establish: ['Key suspects and their motives', 'Early clues (some real, some red herrings)', 'The investigation method'],
      avoid: ['Making it too easy or too confusing', 'Neglecting character development'],
      connectionToNext: 'Initial leads converge on a surprising revelation.',
    },
    firstTwist: {
      purpose: 'A red herring or unexpected revelation that reframes the investigation.',
      emotionalGoal: 'Reader should feel surprised and realize the mystery is deeper than expected.',
      establish: ['A subverted expectation', 'New questions arising from the twist', 'Heightened stakes'],
      avoid: ['A twist that feels random or unearned', 'Resolving the mystery too early'],
      connectionToNext: 'The twist demands deeper investigation.',
    },
    deeperInvestigation: {
      purpose: 'More dangerous, more personal investigation as the protagonist gets closer to truth.',
      emotionalGoal: 'Reader should feel mounting tension as the detective gets closer and the danger grows.',
      establish: ['Rising personal danger for the protagonist', 'Deeper secrets uncovered', 'Shifting suspect pool'],
      avoid: ['Repetitive investigation scenes', 'Losing momentum'],
      connectionToNext: 'Persistent investigation yields a major breakthrough.',
    },
    midpointRevelation: {
      purpose: 'A significant clue or revelation that shifts the entire investigation.',
      emotionalGoal: 'Reader should feel the case cracking open — excitement and dread.',
      establish: ['A game-changing piece of evidence', 'New understanding of the crime', 'Higher stakes'],
      avoid: ['A weak or predictable revelation', 'Overexplaining the significance'],
      connectionToNext: 'The revelation leads to a premature conclusion.',
    },
    falseResolution: {
      purpose: 'An apparent solution that proves wrong — the wrong suspect, a cover-up, or a trap.',
      emotionalGoal: 'Reader should feel uneasy — something isn\'t right.',
      establish: ['A seemingly logical solution', 'Nagging doubts or contradictions', 'The real killer still at large'],
      avoid: ['Making the false resolution obviously wrong', 'Having the protagonist be foolish'],
      connectionToNext: 'The false resolution collapses, putting the protagonist in danger.',
    },
    darkestMoment: {
      purpose: 'The protagonist is threatened, isolated, or defeated. The killer fights back.',
      emotionalGoal: 'Reader should feel genuine fear for the protagonist.',
      establish: ['Direct threat to the protagonist', 'Isolation from allies', 'Maximum danger'],
      avoid: ['An anticlimactic threat', 'Relying on coincidence to create danger'],
      connectionToNext: 'Desperation drives a breakthrough.',
    },
    finalClues: {
      purpose: 'The last pieces of the puzzle fall into place. The protagonist sees the truth.',
      emotionalGoal: 'Reader should feel the rush of the solution coming together.',
      establish: ['The key insight that unlocks everything', 'How the clues connect', 'A plan to confront the killer'],
      avoid: ['A solution that requires information the reader didn\'t have', 'Deus ex machina'],
      connectionToNext: 'The solution demands a confrontation.',
    },
    climaxReveal: {
      purpose: 'The confrontation with the real culprit and the revelation of the complete truth.',
      emotionalGoal: 'Reader should feel the thrill of justice and the satisfaction of understanding.',
      establish: ['The confrontation scene', 'The full explanation', 'Justice (or its failure)'],
      avoid: ['A villain monologue that drags', 'A solution that contradicts established clues'],
      connectionToNext: 'The reveal leads to the denouement.',
    },
    denouement: {
      purpose: 'The aftermath — justice served, wounds healing, the world rebalanced.',
      emotionalGoal: 'Reader should feel closure and satisfaction.',
      establish: ['Resolution of the case', 'Impact on the protagonist', 'The community restored (or changed)'],
      avoid: ['Introducing new mysteries (unless it\'s a series hook)', 'Rushing past the aftermath'],
      connectionToNext: 'This is the destination. The mystery is solved.',
    },
  },
};
