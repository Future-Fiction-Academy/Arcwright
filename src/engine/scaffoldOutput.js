import { dimensions, DIMENSION_KEYS } from '../data/dimensions';
import { beatGuidance } from '../data/beatGuidance';
import { allStructures } from '../data/plotStructures';
import { genreSystem } from '../data/genreSystem';

/**
 * Generate a summary card object from scaffold data.
 */
export function generateSummaryCard(enrichedBeats, {
  selectedGenre, selectedSubgenre, selectedModifier, selectedPacing,
  structureKey, validation, blendMeta = null,
}) {
  const genre = genreSystem[selectedGenre];
  const subgenre = genre.subgenres[selectedSubgenre];
  const structure = allStructures[structureKey || genre.structure];

  // Find turning points (beats where tension shifts by >= 1.5 from previous)
  const turningPoints = [];
  for (let i = 1; i < enrichedBeats.length; i++) {
    const tensionShift = Math.abs(
      (enrichedBeats[i].tension ?? 0) - (enrichedBeats[i - 1].tension ?? 0)
    );
    if (tensionShift >= 1.5) {
      turningPoints.push({
        label: enrichedBeats[i].label,
        time: enrichedBeats[i].time,
        tension: enrichedBeats[i].tension,
        shift: tensionShift,
        direction: (enrichedBeats[i].tension ?? 0) > (enrichedBeats[i - 1].tension ?? 0) ? 'rise' : 'drop',
      });
    }
  }

  // Arc shape: avg tension per third of the story
  const thirds = [
    enrichedBeats.filter((b) => b.time <= 33),
    enrichedBeats.filter((b) => b.time > 33 && b.time <= 66),
    enrichedBeats.filter((b) => b.time > 66),
  ];
  const avgTensionPerThird = thirds.map((group) =>
    group.length > 0
      ? group.reduce((s, b) => s + (b.tension ?? 0), 0) / group.length
      : 0
  );

  let arcDescription = '';
  if (avgTensionPerThird[2] > avgTensionPerThird[0] + 1) {
    arcDescription = 'Rising arc — tension builds steadily toward the climax';
  } else if (avgTensionPerThird[1] > avgTensionPerThird[0] && avgTensionPerThird[1] > avgTensionPerThird[2]) {
    arcDescription = 'Peak-in-middle arc — tension crests at the midpoint then resolves';
  } else if (avgTensionPerThird[0] > avgTensionPerThird[2] + 1) {
    arcDescription = 'Front-loaded arc — high early tension that resolves';
  } else {
    arcDescription = 'Balanced arc — tension distributed evenly across the story';
  }

  // Critical moments: beats with tension >= 7
  const criticalMoments = enrichedBeats
    .filter((b) => (b.tension ?? 0) >= 7)
    .map((b) => ({ label: b.label, time: b.time, tension: b.tension }));

  return {
    genre: genre.name,
    subgenre: subgenre.name,
    modifier: selectedModifier || 'None',
    pacing: selectedPacing || 'None',
    structure: structure.name,
    beatCount: enrichedBeats.length,
    turningPoints,
    arcDescription,
    avgTensionPerThird,
    criticalMoments,
    validation,
    blendMeta,
  };
}

/**
 * Generate a beat sheet array with writing guidance for each beat.
 */
export function generateBeatSheet(enrichedBeats, structureKey) {
  const guidance = beatGuidance[structureKey] || {};

  return enrichedBeats.map((beat) => {
    const beatGuide = guidance[beat.beat] || null;

    // Identify tension drivers: top 3 dimensions contributing most to tension
    const dimValues = DIMENSION_KEYS.map((key) => ({
      key,
      name: dimensions[key].name,
      value: beat[key] ?? 0,
      color: dimensions[key].color,
    })).sort((a, b) => Math.abs(b.value) - Math.abs(a.value));

    const tensionDrivers = dimValues.slice(0, 3);

    return {
      label: beat.label,
      time: beat.time,
      beat: beat.beat,
      tension: beat.tension ?? 0,
      tensionDrivers,
      dimensions: Object.fromEntries(DIMENSION_KEYS.map((k) => [k, beat[k] ?? 0])),
      guidance: beatGuide,
    };
  });
}

/**
 * Export beat sheet as Markdown.
 */
export function exportBeatSheetMarkdown(beatSheet, summaryCard) {
  let md = `# Story Scaffold: ${summaryCard.genre} > ${summaryCard.subgenre}\n\n`;
  if (summaryCard.blendMeta) {
    md += `**Blended with:** ${summaryCard.blendMeta.secondaryGenre} > ${summaryCard.blendMeta.secondarySubgenre} (${summaryCard.blendMeta.blendRatio}% primary / ${100 - summaryCard.blendMeta.blendRatio}% secondary)  \n`;
  }
  md += `**Structure:** ${summaryCard.structure}  \n`;
  md += `**Modifier:** ${summaryCard.modifier}  \n`;
  md += `**Pacing:** ${summaryCard.pacing}  \n`;
  md += `**Beats:** ${summaryCard.beatCount}  \n\n`;

  // Summary
  md += `## Arc Summary\n\n`;
  md += `${summaryCard.arcDescription}\n\n`;
  md += `| Story Third | Avg Tension |\n|-------------|-------------|\n`;
  ['Beginning', 'Middle', 'End'].forEach((label, i) => {
    md += `| ${label} | ${summaryCard.avgTensionPerThird[i].toFixed(1)} |\n`;
  });
  md += '\n';

  if (summaryCard.turningPoints.length > 0) {
    md += `### Key Turning Points\n\n`;
    summaryCard.turningPoints.forEach((tp) => {
      md += `- **${tp.label}** (${tp.time}%) — tension ${tp.direction} of ${tp.shift.toFixed(1)}\n`;
    });
    md += '\n';
  }

  if (summaryCard.criticalMoments.length > 0) {
    md += `### Critical High-Tension Moments\n\n`;
    summaryCard.criticalMoments.forEach((cm) => {
      md += `- **${cm.label}** at ${cm.time}% (tension: ${cm.tension.toFixed(1)})\n`;
    });
    md += '\n';
  }

  // Validation
  md += `### Validation\n\n`;
  md += `- Intimacy: ${summaryCard.validation.intimacy ? 'PASS' : 'FAIL'}\n`;
  md += `- Trust: ${summaryCard.validation.trust ? 'PASS' : 'FAIL'}\n`;
  md += `- Tension: ${summaryCard.validation.tension ? 'PASS' : 'FAIL'}\n\n`;

  // Beat Sheet
  md += `---\n\n## Beat Sheet\n\n`;

  beatSheet.forEach((entry) => {
    md += `### ${entry.label} (${entry.time}%)\n\n`;
    if (entry.beat) md += `**Beat Type:** ${entry.beat}  \n`;
    md += `**Tension:** ${entry.tension.toFixed(1)}/10  \n`;
    md += `**Top Drivers:** ${entry.tensionDrivers.map((d) => `${d.name} (${d.value.toFixed(1)})`).join(', ')}  \n\n`;

    // Dimensional coordinates
    md += `| Dimension | Value |\n|-----------|-------|\n`;
    DIMENSION_KEYS.forEach((key) => {
      md += `| ${dimensions[key].name} | ${(entry.dimensions[key] ?? 0).toFixed(1)} |\n`;
    });
    md += '\n';

    // Writing guidance
    if (entry.guidance) {
      md += `**Purpose:** ${entry.guidance.purpose}  \n`;
      md += `**Emotional Goal:** ${entry.guidance.emotionalGoal}  \n\n`;

      if (entry.guidance.establish?.length > 0) {
        md += `**Establish:**\n`;
        entry.guidance.establish.forEach((item) => { md += `- ${item}\n`; });
        md += '\n';
      }

      if (entry.guidance.avoid?.length > 0) {
        md += `**Avoid:**\n`;
        entry.guidance.avoid.forEach((item) => { md += `- ${item}\n`; });
        md += '\n';
      }

      if (entry.guidance.connectionToNext) {
        md += `**Connection to Next:** ${entry.guidance.connectionToNext}\n\n`;
      }
    }

    md += `---\n\n`;
  });

  return md;
}

/**
 * Export beat sheet as standalone HTML.
 */
export function exportBeatSheetHTML(beatSheet, summaryCard) {
  const dimRows = (dims) => DIMENSION_KEYS.map((key) =>
    `<tr><td style="color:${dimensions[key].color};font-weight:600">${dimensions[key].name}</td><td>${(dims[key] ?? 0).toFixed(1)}</td></tr>`
  ).join('');

  const beats = beatSheet.map((entry) => {
    let guidanceHTML = '';
    if (entry.guidance) {
      guidanceHTML = `
        <div class="guidance">
          <p><strong>Purpose:</strong> ${entry.guidance.purpose}</p>
          <p><strong>Emotional Goal:</strong> ${entry.guidance.emotionalGoal}</p>
          ${entry.guidance.establish?.length ? `<p><strong>Establish:</strong></p><ul>${entry.guidance.establish.map((i) => `<li>${i}</li>`).join('')}</ul>` : ''}
          ${entry.guidance.avoid?.length ? `<p><strong>Avoid:</strong></p><ul class="avoid">${entry.guidance.avoid.map((i) => `<li>${i}</li>`).join('')}</ul>` : ''}
          ${entry.guidance.connectionToNext ? `<p class="connection"><strong>Connection to Next:</strong> ${entry.guidance.connectionToNext}</p>` : ''}
        </div>`;
    }

    return `
      <div class="beat-card">
        <div class="beat-header">
          <h3>${entry.label} <span class="time">(${entry.time}%)</span></h3>
          <div class="tension-badge" style="background:${entry.tension >= 7 ? '#dc2626' : entry.tension >= 4 ? '#d97706' : '#16a34a'}">
            Tension: ${entry.tension.toFixed(1)}
          </div>
        </div>
        ${entry.beat ? `<p class="beat-type">Beat: ${entry.beat}</p>` : ''}
        <p class="drivers">Top Drivers: ${entry.tensionDrivers.map((d) => `<span style="color:${d.color}">${d.name} (${d.value.toFixed(1)})</span>`).join(', ')}</p>
        <table class="dim-table">${dimRows(entry.dimensions)}</table>
        ${guidanceHTML}
      </div>`;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Story Scaffold: ${summaryCard.genre} - ${summaryCard.subgenre}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0f172a; color: #e2e8f0; padding: 2rem; max-width: 900px; margin: 0 auto; }
  h1 { color: #c4b5fd; margin-bottom: 0.5rem; }
  h2 { color: #a78bfa; margin: 2rem 0 1rem; border-bottom: 1px solid #7c3aed33; padding-bottom: 0.5rem; }
  h3 { color: #ddd6fe; }
  .meta { color: #a78bfa; font-size: 0.9rem; margin-bottom: 0.25rem; }
  .summary-card { background: #1e293b; border: 1px solid #7c3aed44; border-radius: 12px; padding: 1.5rem; margin: 1.5rem 0; }
  .summary-card p { margin: 0.5rem 0; }
  .turning-points li, .critical li { margin: 0.25rem 0; }
  .beat-card { background: #1e293b; border: 1px solid #7c3aed33; border-radius: 12px; padding: 1.5rem; margin: 1rem 0; page-break-inside: avoid; }
  .beat-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
  .time { color: #a78bfa; font-size: 0.85rem; }
  .tension-badge { color: white; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.8rem; font-weight: 600; }
  .beat-type { color: #94a3b8; font-size: 0.85rem; }
  .drivers { font-size: 0.85rem; margin: 0.5rem 0; }
  .dim-table { width: 100%; border-collapse: collapse; margin: 0.75rem 0; font-size: 0.8rem; }
  .dim-table td { padding: 0.2rem 0.5rem; border-bottom: 1px solid #334155; }
  .guidance { background: #7c3aed15; border: 1px solid #7c3aed33; border-radius: 8px; padding: 1rem; margin-top: 0.75rem; }
  .guidance p { margin: 0.5rem 0; font-size: 0.85rem; }
  .guidance ul { margin: 0.5rem 0 0.5rem 1.5rem; font-size: 0.85rem; }
  .guidance .avoid li { color: #fca5a5; }
  .connection { color: #93c5fd; font-style: italic; }
  .validation { display: flex; gap: 1rem; }
  .validation span { padding: 0.25rem 0.75rem; border-radius: 4px; font-size: 0.8rem; font-weight: 600; }
  .pass { background: #16a34a33; color: #86efac; }
  .fail { background: #dc262633; color: #fca5a5; }
  @media print {
    body { background: white; color: #1e293b; padding: 1rem; }
    .beat-card, .summary-card { border-color: #ddd; background: #fafafa; }
    .guidance { background: #f3f4f6; border-color: #ddd; }
  }
</style>
</head>
<body>
<h1>Story Scaffold</h1>
<p class="meta">${summaryCard.genre} &rarr; ${summaryCard.subgenre}</p>
${summaryCard.blendMeta ? `<p class="meta">Blended with: ${summaryCard.blendMeta.secondaryGenre} &rarr; ${summaryCard.blendMeta.secondarySubgenre} (${summaryCard.blendMeta.blendRatio}% primary / ${100 - summaryCard.blendMeta.blendRatio}% secondary)</p>` : ''}
<p class="meta">Structure: ${summaryCard.structure} | Modifier: ${summaryCard.modifier} | Pacing: ${summaryCard.pacing}</p>

<div class="summary-card">
  <h2>Arc Summary</h2>
  <p>${summaryCard.arcDescription}</p>
  <p>Avg Tension — Beginning: ${summaryCard.avgTensionPerThird[0].toFixed(1)} | Middle: ${summaryCard.avgTensionPerThird[1].toFixed(1)} | End: ${summaryCard.avgTensionPerThird[2].toFixed(1)}</p>
  ${summaryCard.turningPoints.length > 0 ? `
    <h3>Key Turning Points</h3>
    <ul class="turning-points">${summaryCard.turningPoints.map((tp) => `<li><strong>${tp.label}</strong> (${tp.time}%) — tension ${tp.direction} of ${tp.shift.toFixed(1)}</li>`).join('')}</ul>
  ` : ''}
  ${summaryCard.criticalMoments.length > 0 ? `
    <h3>Critical High-Tension Moments</h3>
    <ul class="critical">${summaryCard.criticalMoments.map((cm) => `<li><strong>${cm.label}</strong> at ${cm.time}% (tension: ${cm.tension.toFixed(1)})</li>`).join('')}</ul>
  ` : ''}
  <div class="validation" style="margin-top:1rem">
    <span class="${summaryCard.validation.intimacy ? 'pass' : 'fail'}">Intimacy: ${summaryCard.validation.intimacy ? 'PASS' : 'FAIL'}</span>
    <span class="${summaryCard.validation.trust ? 'pass' : 'fail'}">Trust: ${summaryCard.validation.trust ? 'PASS' : 'FAIL'}</span>
    <span class="${summaryCard.validation.tension ? 'pass' : 'fail'}">Tension: ${summaryCard.validation.tension ? 'PASS' : 'FAIL'}</span>
  </div>
</div>

<h2>Beat Sheet</h2>
${beats}

<footer style="margin-top:2rem;padding-top:1rem;border-top:1px solid #334155;font-size:0.75rem;color:#64748b;">
  Generated by Narrative Context Graph
</footer>
</body>
</html>`;
}
