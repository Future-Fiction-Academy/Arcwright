import { DIMENSION_KEYS } from '../data/dimensions';

export function getDefaultVisibleDims(genre) {
  const allDimsFalse = DIMENSION_KEYS.reduce((acc, key) => {
    acc[key] = false;
    return acc;
  }, { tension: false });

  const genreSpecific = {
    romance: {
      intimacy: true,
      desire: true,
      vulnerability: true,
      trust: true,
      stakes: true,
      tension: true,
    },
    scienceFiction: {
      danger: true,
      mystery: true,
      stakes: true,
      trust: true,
      alignment: true,
      infoAsym: true,
      tension: true,
    },
    fantasy: {
      danger: true,
      mystery: true,
      stakes: true,
      trust: true,
      alignment: true,
      vulnerability: true,
      tension: true,
    },
    mysteryThrillerSuspense: {
      mystery: true,
      infoAsym: true,
      danger: true,
      stakes: true,
      trust: true,
      vulnerability: true,
      tension: true,
    },
  };

  return { ...allDimsFalse, ...(genreSpecific[genre] || genreSpecific.romance) };
}

export function getGenreDescription(genreKey) {
  const descriptions = {
    romance: 'Intimacy, Desire, Vulnerability, Trust (relationship focus)',
    scienceFiction: 'Danger, Mystery, Stakes, Trust, Alignment, Info Asymmetry (external conflict & discovery)',
    fantasy: 'Danger, Mystery, Stakes, Trust, Alignment, Vulnerability (epic quest & fellowship)',
    mysteryThrillerSuspense: 'Mystery, Info Asymmetry, Danger, Stakes, Trust, Vulnerability (puzzle-solving & investigation)',
  };
  return descriptions[genreKey] || descriptions.romance;
}
