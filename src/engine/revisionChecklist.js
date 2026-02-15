import { dimensions, DIMENSION_KEYS } from '../data/dimensions';

/**
 * Generate a revision checklist from gap analysis.
 * Each item: chapter/beat, priority, dimensions to adjust, direction, amount.
 */
export function generateRevisionChecklist(gapAnalysis, aiPlan = null) {
  const items = [];

  gapAnalysis.perBeatGaps.forEach((beatGap) => {
    const significantGaps = DIMENSION_KEYS
      .filter((key) => beatGap.gaps[key] && beatGap.gaps[key].absGap >= 1.5)
      .sort((a, b) => beatGap.gaps[b].absGap - beatGap.gaps[a].absGap);

    if (significantGaps.length === 0) return;

    // Find AI recommendation if available
    const aiRec = aiPlan?.beatRecommendations?.find(
      (r) => r.timePercent === beatGap.time || r.beat === beatGap.label
    );

    const adjustments = significantGaps.map((key) => {
      const g = beatGap.gaps[key];
      return {
        dimension: key,
        dimensionName: dimensions[key].name,
        direction: g.gap > 0 ? 'reduce' : 'increase',
        amount: g.absGap,
        actual: g.actual,
        ideal: g.ideal,
        color: dimensions[key].color,
      };
    });

    items.push({
      id: `rev_${beatGap.time}_${beatGap.label}`,
      beat: beatGap.label,
      time: beatGap.time,
      priority: beatGap.priority,
      adjustments,
      aiDiagnosis: aiRec?.diagnosis || null,
      aiRecommendation: aiRec?.recommendation || null,
      checked: false,
    });
  });

  // Sort by priority (HIGH first), then by time
  const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
  items.sort((a, b) => (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2) || a.time - b.time);

  return items;
}

/**
 * Export revision checklist as Markdown.
 */
export function exportChecklistMarkdown(items, genreName, subgenreName, overallScore) {
  let md = `# Revision Checklist: ${genreName} > ${subgenreName}\n\n`;
  md += `**Overall Health Score:** ${overallScore}/100\n\n`;

  const highItems = items.filter((i) => i.priority === 'HIGH');
  const medItems = items.filter((i) => i.priority === 'MEDIUM');
  const lowItems = items.filter((i) => i.priority === 'LOW');

  if (highItems.length > 0) {
    md += `## High Priority\n\n`;
    highItems.forEach((item) => {
      md += formatChecklistItem(item);
    });
  }

  if (medItems.length > 0) {
    md += `## Medium Priority\n\n`;
    medItems.forEach((item) => {
      md += formatChecklistItem(item);
    });
  }

  if (lowItems.length > 0) {
    md += `## Low Priority\n\n`;
    lowItems.forEach((item) => {
      md += formatChecklistItem(item);
    });
  }

  return md;
}

function formatChecklistItem(item) {
  let md = `### - [ ] ${item.beat} (${item.time}%)\n\n`;

  if (item.aiDiagnosis) {
    md += `**Diagnosis:** ${item.aiDiagnosis}\n\n`;
  }

  if (item.aiRecommendation) {
    md += `**Recommendation:** ${item.aiRecommendation}\n\n`;
  }

  md += `**Adjustments needed:**\n`;
  item.adjustments.forEach((adj) => {
    md += `- [ ] ${adj.direction === 'reduce' ? 'Reduce' : 'Increase'} **${adj.dimensionName}** by ~${adj.amount.toFixed(1)} (currently ${adj.actual.toFixed(1)}, target ~${adj.ideal.toFixed(1)})\n`;
  });
  md += '\n';

  return md;
}
