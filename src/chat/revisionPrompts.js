import { dimensions, DIMENSION_KEYS } from '../data/dimensions';

/**
 * Build a system prompt for chapter revision.
 */
export function buildRevisionSystemPrompt(genreName, subgenreName) {
  return `You are an expert developmental editor and prose stylist specializing in ${genreName}, specifically ${subgenreName}. Your task is to revise a chapter of fiction.

RULES:
1. Output ONLY the revised chapter text. No preamble, no commentary, no explanation, no meta-discussion.
2. Preserve the author's voice, style, and POV.
3. Maintain all plot points and character actions — do not add or remove scenes.
4. Apply the revision guidance provided to adjust narrative dimensions through prose craft: word choice, pacing, interiority, dialogue subtext, physical detail, and scene structure.
5. Keep approximately the same word count (within 10%).
6. Preserve any markdown formatting (headings, emphasis, etc.).
7. Do not include any text before or after the revised chapter.
8. Make SUBSTANTIVE prose improvements. Trivial changes (curly vs straight quotes, punctuation normalization, parentheses substitution) are NOT acceptable as the only edits. Every paragraph should show meaningful craft improvement.
9. Rewrite weak sentences entirely rather than making minimal word swaps. Strengthen verbs, sharpen imagery, deepen subtext, vary rhythm.
10. NEVER use em-dashes (—) or double hyphens (--) in prose. The ONLY exception is for dialogue interruptions where a character's speech is cut off mid-word (e.g., "I can't believe you—"). For parenthetical asides, appositives, or clause breaks, use commas, semicolons, colons, or restructure the sentence instead. Do NOT substitute dashes for commas.`;
}

/**
 * Build a user prompt with chapter text and revision guidance.
 * @param {string} chapterText - Full chapter text
 * @param {'checklist'|'gaps'|'both'|'custom'} source - Revision source type
 * @param {object} analysisData - Source-specific data
 */
export function buildRevisionUserPrompt(chapterText, source, analysisData) {
  let guidance = '';

  if (source === 'checklist' || source === 'both') {
    const items = analysisData.revisionItems || [];
    if (items.length > 0) {
      guidance += '## Revision Checklist\n\n';
      items.forEach((item) => {
        guidance += `### ${item.beat} (${item.time}%) — Priority: ${item.priority}\n`;
        if (item.aiDiagnosis) guidance += `Diagnosis: ${item.aiDiagnosis}\n`;
        if (item.aiRecommendation) guidance += `Recommendation: ${item.aiRecommendation}\n`;
        item.adjustments.forEach((adj) => {
          guidance += `- ${adj.direction === 'reduce' ? 'Reduce' : 'Increase'} ${adj.dimensionName} by ~${adj.amount.toFixed(1)} (currently ${adj.actual.toFixed(1)}, target ~${adj.ideal.toFixed(1)})\n`;
        });
        guidance += '\n';
      });
    }
  }

  if (source === 'gaps' || source === 'both') {
    const details = analysisData.gapDetails || [];
    if (details.length > 0) {
      guidance += '## Dimension Gap Analysis\n\n';
      guidance += '| Dimension | Current | Ideal | Gap | Direction |\n';
      guidance += '|-----------|---------|-------|-----|-----------|\n';
      details.forEach((g) => {
        guidance += `| ${g.dimensionName} | ${g.actual.toFixed(1)} | ${g.ideal.toFixed(1)} | ${g.absGap.toFixed(1)} | ${g.direction} |\n`;
      });
      guidance += '\n';
    }
  }

  if (source === 'custom' && analysisData.customPrompt?.trim()) {
    guidance += '## Revision Instructions\n\n';
    guidance += analysisData.customPrompt + '\n\n';
  }

  // Fallback: if no specific guidance was generated, provide aggressive revision instructions
  if (!guidance.trim()) {
    guidance = `## Revision Focus

No specific dimension analysis is available for this chapter. Apply aggressive prose-level revision across all of the following areas. Every paragraph should be meaningfully improved — do NOT limit changes to punctuation or quote style.

1. **Verb Strength**: Replace weak/generic verbs (was, had, went, got, looked, felt) with precise, vivid alternatives. "She felt angry" → show the anger through action and body language.
2. **Sensory Detail**: Layer in at least two senses per scene beat. Ground abstract emotions in concrete physical sensation — texture, temperature, smell, sound.
3. **Sentence Rhythm**: Vary sentence length deliberately. Follow long complex sentences with short punchy ones. Break up same-length sentence chains. Use fragments for emphasis.
4. **Dialogue Subtext**: Characters should rarely say exactly what they mean. Add subtext through deflection, non-sequiturs, and what goes unsaid. Cut on-the-nose dialogue.
5. **Interiority Depth**: Deepen POV character's interior life — layer thought with sensation, memory, and impulse. Avoid surface-level emotional labels ("she was sad").
6. **Eliminate Filtering**: Remove filter words that distance the reader: "she saw", "he noticed", "she felt", "he heard", "she realized". Present the perception directly.
7. **Tighten Prose**: Cut redundancy, unnecessary adverbs, empty intensifiers (very, really, quite, just), and throat-clearing phrases. Every word must earn its place.
8. **Scene Transitions**: Strengthen paragraph-to-paragraph flow. Cut dead air between action beats. Enter scenes late, leave early.
9. **Metaphor & Imagery**: Replace clichéd comparisons with fresh, unexpected imagery that fits the character's worldview and the story's tonal register.

`;
  }

  return `${guidance}## Chapter Text to Revise\n\n${chapterText}`;
}

/**
 * Match a file's content/name to an analyzed chapter in the store.
 * Returns the matched chapter or null.
 */
export function matchFileToChapter(fileContent, fileName, chapters) {
  if (!chapters || chapters.length === 0) return null;

  // Primary: exact content match (trimmed)
  const trimmed = fileContent.trim();
  const contentMatch = chapters.find((ch) => ch.text?.trim() === trimmed);
  if (contentMatch) return contentMatch;

  // Secondary: filename pattern "##-Title.md" → match by index
  const nameMatch = fileName.match(/^(\d+)[_-](.+)\.md$/i);
  if (nameMatch) {
    const fileIndex = parseInt(nameMatch[1], 10) - 1;
    if (fileIndex >= 0 && fileIndex < chapters.length) {
      return chapters[fileIndex];
    }
    // Try title substring match
    const fileTitle = nameMatch[2].replace(/[-_]/g, ' ').toLowerCase();
    const titleMatch = chapters.find(
      (ch) =>
        ch.title?.toLowerCase().includes(fileTitle) ||
        fileTitle.includes(ch.title?.toLowerCase() || '')
    );
    if (titleMatch) return titleMatch;
  }

  return null;
}
