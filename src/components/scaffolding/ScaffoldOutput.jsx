import React, { useMemo } from 'react';
import useAppStore from '../../store/useAppStore';
import { genreSystem } from '../../data/genreSystem';
import { allStructures } from '../../data/plotStructures';
import { getCompleteWeights, getModifierAdjustedWeights } from '../../engine/weights';
import { enrichDataWithTension } from '../../engine/tension';
import { validateAgainstGenre } from '../../engine/validation';
import { blendWeights, blendRequirements } from '../../engine/blending';
import { generateSummaryCard, generateBeatSheet } from '../../engine/scaffoldOutput';
import SummaryCard from './SummaryCard';
import BeatSheetView from './BeatSheetView';
import WritingGuideExporter from './WritingGuideExporter';
import PacingClassifierBadge from '../shared/PacingClassifierBadge';

export default function ScaffoldOutput() {
  const {
    selectedGenre, selectedSubgenre, selectedModifier, selectedPacing, selectedStructure,
    weights, scaffoldBeats,
    blendEnabled, secondaryGenre, secondarySubgenre, blendRatio,
  } = useAppStore();

  const currentGenre = genreSystem[selectedGenre];
  const currentSubgenre = currentGenre.subgenres[selectedSubgenre];
  const structureKey = selectedStructure || currentGenre.structure;
  const currentStructure = allStructures[structureKey];

  const activeWeights = useMemo(() => {
    const primary = getModifierAdjustedWeights(weights, selectedModifier);
    if (blendEnabled && secondaryGenre && secondarySubgenre) {
      const secWeights = getCompleteWeights(
        genreSystem[secondaryGenre].subgenres[secondarySubgenre].weights
      );
      return blendWeights(primary, secWeights, blendRatio);
    }
    return primary;
  }, [weights, selectedModifier, blendEnabled, secondaryGenre, secondarySubgenre, blendRatio]);

  const enrichedData = useMemo(
    () => enrichDataWithTension(scaffoldBeats, activeWeights),
    [scaffoldBeats, activeWeights]
  );

  const activeRequirements = useMemo(() => {
    const primary = currentSubgenre.requirements;
    if (blendEnabled && secondaryGenre && secondarySubgenre) {
      const secReqs = genreSystem[secondaryGenre].subgenres[secondarySubgenre].requirements;
      return blendRequirements(primary, secReqs, blendRatio);
    }
    return primary;
  }, [currentSubgenre, blendEnabled, secondaryGenre, secondarySubgenre, blendRatio]);

  const validation = useMemo(
    () => enrichedData.length > 0
      ? validateAgainstGenre(enrichedData, activeRequirements)
      : { intimacy: false, trust: false, tension: false },
    [enrichedData, activeRequirements]
  );

  const blendMeta = blendEnabled && secondaryGenre && secondarySubgenre
    ? {
        secondaryGenre: genreSystem[secondaryGenre]?.name || secondaryGenre,
        secondarySubgenre: genreSystem[secondaryGenre]?.subgenres[secondarySubgenre]?.name || secondarySubgenre,
        blendRatio,
      }
    : null;

  const summaryCard = useMemo(
    () => enrichedData.length > 0
      ? generateSummaryCard(enrichedData, {
          selectedGenre, selectedSubgenre, selectedModifier, selectedPacing,
          structureKey, validation, blendMeta,
        })
      : null,
    [enrichedData, selectedGenre, selectedSubgenre, selectedModifier, selectedPacing, structureKey, validation, blendMeta]
  );

  const beatSheet = useMemo(
    () => enrichedData.length > 0
      ? generateBeatSheet(enrichedData, structureKey)
      : [],
    [enrichedData, structureKey]
  );

  if (enrichedData.length === 0) return null;

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Scaffold Output</h2>
        <div className="flex items-center gap-3">
          {selectedGenre === 'romance' && (
            <PacingClassifierBadge beats={scaffoldBeats} />
          )}
          <WritingGuideExporter
            beatSheet={beatSheet}
            summaryCard={summaryCard}
            selectedGenre={selectedGenre}
            selectedSubgenre={selectedSubgenre}
          />
        </div>
      </div>

      <SummaryCard summary={summaryCard} />
      <BeatSheetView beatSheet={beatSheet} />
    </div>
  );
}
