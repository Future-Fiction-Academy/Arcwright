import { dimensions, DIMENSION_KEYS } from '../data/dimensions';

export function buildScoringSystemPrompt(genreName, subgenreName, structureName) {
  const dimDescriptions = DIMENSION_KEYS.map(
    (k) => `- ${k} (${dimensions[k].name}): range ${dimensions[k].range[0]} to ${dimensions[k].range[1]}`
  ).join('\n');

  return `You are a narrative analysis engine. You score fiction text across 11 narrative dimensions.

The dimensions are:
${dimDescriptions}

Context: This text is from a ${subgenreName} story using the ${structureName} plot structure.

For each chapter/section provided, return a JSON object with scores for all 11 dimensions. Consider:
- Subtext and implication, not just surface events
- Character internal states and relationship dynamics
- Genre conventions and reader expectations
- Where this section likely falls in the overall story structure

Return ONLY valid JSON in this exact format (no other text):
{
  "chapters": [
    {
      "chapterTitle": "string",
      "timePercent": number,
      "beat": "string (best matching beat from the plot structure)",
      "scores": {
        "intimacy": number,
        "powerDiff": number,
        "infoAsym": number,
        "alignment": number,
        "proximity": number,
        "vulnerability": number,
        "desire": number,
        "stakes": number,
        "trust": number,
        "danger": number,
        "mystery": number
      },
      "reasoning": "Brief explanation of key scoring decisions"
    }
  ]
}`;
}

export function buildScoringUserMessage(chapters, totalChapters) {
  const chapterTexts = chapters.map((ch, i) => {
    const chapterNum = ch.index !== undefined ? ch.index + 1 : i + 1;
    const pct = totalChapters > 0 ? Math.round((chapterNum / totalChapters) * 100) : null;
    return `--- CHAPTER ${chapterNum}${ch.title ? `: ${ch.title}` : ''}${pct ? ` (approximately ${pct}% through the story)` : ''} ---\n${ch.text}`;
  }).join('\n\n');

  return `Analyze the following chapters and score each across all 11 narrative dimensions:\n\n${chapterTexts}`;
}

export function buildGetWellSystemPrompt(genreName, subgenreName) {
  return `You are an expert developmental editor specializing in ${genreName}, specifically ${subgenreName}. You provide specific, actionable narrative advice.

Given the gap analysis between a manuscript's actual dimensional scores and the ideal genre template scores, provide beat-by-beat editorial recommendations.

For each beat with significant gaps, explain:
1. What the gap means narratively (not just numerically)
2. Specific scenes, dialogue, or structural changes to close the gap
3. Priority level (HIGH/MEDIUM/LOW) based on genre impact

Be specific to the genre conventions. Reference tropes and reader expectations.

Return ONLY valid JSON in this format:
{
  "executiveSummary": "2-3 sentence overall assessment",
  "beatRecommendations": [
    {
      "beat": "beat label",
      "timePercent": number,
      "priority": "HIGH|MEDIUM|LOW",
      "diagnosis": "what's wrong narratively",
      "recommendation": "specific actionable advice",
      "dimensions": ["list of most impacted dimensions"]
    }
  ],
  "topPriorities": [
    "ranked list of the 3-5 most important changes to make"
  ]
}`;
}

export function buildGetWellUserMessage(gapAnalysis) {
  return `Here is the gap analysis between the manuscript and the ideal genre template:

${JSON.stringify(gapAnalysis, null, 2)}

Provide beat-by-beat editorial recommendations. Focus on the highest-impact gaps first.`;
}
