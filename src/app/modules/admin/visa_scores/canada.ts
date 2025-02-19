// --- Assume these types are defined elsewhere ---

// Education Scoring for Canada Express Entry
type CanadaEducationScoring = {
  PhD: number;
  Masters: number;
  Bachelors: number;
  ThreeYearDiploma: number;
  OneTwoYearDiploma: number;
};

// Language Proficiency (CLB) Scoring
type CLBScoring = {
  CLB9Plus: number;
  CLB8: number;
  CLB7: number;
  CLB6: number;
  BelowCLB6: 'Ineligible';
};

// Work Experience Scoring
type CanadaWorkExperienceScoring = {
  '1Year': number;
  '2-3Years': number;
  '4-5Years': number;
  '6+Years': number;
};

// Foreign Experience Bonus
type CanadaForeignExperienceBonus = {
  '1-2Years': number;
  '3-4Years': number;
  '5+Years': number;
};

// Main Canada Express Entry Criteria Type
export type ICanadaExpressEntry = {
  education: CanadaEducationScoring;
  languageProficiency: CLBScoring;
  workExperience: {
    scoring: CanadaWorkExperienceScoring;
    foreignBonus: CanadaForeignExperienceBonus;
  };
};

// --- User Input Type ---
export type CanadaUserInput = {
  education: string; // e.g., "phd", "masters", "bachelors", "three-year diploma", "one-two year diploma"
  language: string; // e.g., "clb9plus", "clb8", "clb7", "clb6", "below clb6"
  experience: {
    years: number; // years of Canadian work experience
    foreignYears: number; // years of foreign work experience (bonus)
  };
};

// --- Mapping Functions ---
const mapCanadaEducation = (input: string): keyof CanadaEducationScoring => {
  const mapping: Record<string, keyof CanadaEducationScoring> = {
    phd: 'PhD',
    masters: 'Masters',
    bachelors: 'Bachelors',
    'three-year diploma': 'ThreeYearDiploma',
    '3-year diploma': 'ThreeYearDiploma',
    'one-two year diploma': 'OneTwoYearDiploma',
    '1-2 year diploma': 'OneTwoYearDiploma',
  };
  return mapping[input.toLowerCase()] || 'OneTwoYearDiploma';
};

const mapCanadaLanguage = (input: string): keyof CLBScoring => {
  const mapping: Record<string, keyof CLBScoring> = {
    clb9plus: 'CLB9Plus',
    clb8: 'CLB8',
    clb7: 'CLB7',
    clb6: 'CLB6',
    'below clb6': 'BelowCLB6',
  };
  return mapping[input.toLowerCase()] || 'CLB6';
};

/**
 * Helper function to determine the work experience category.
 */
const getWorkExperienceCategory = (years: number): keyof CanadaWorkExperienceScoring => {
  if (years === 1) return '1Year';
  if (years >= 2 && years <= 3) return '2-3Years';
  if (years >= 4 && years <= 5) return '4-5Years';
  if (years >= 6) return '6+Years';
  // Default if below minimum; you might want to handle this as an error
  return '1Year';
};

/**
 * Helper function to determine the foreign experience bonus category.
 */
const getForeignExperienceCategory = (years: number): keyof CanadaForeignExperienceBonus | null => {
  if (years >= 1 && years < 3) return '1-2Years';
  if (years >= 3 && years < 5) return '3-4Years';
  if (years >= 5) return '5+Years';
  return null;
};

/**
 * Calculating the final Canada Express Entry score.
 *
 * We use the following weights:
 *   Education: 25%
 *   Language: 25%
 *   Work Experience (including foreign bonus): 50%
 *
 * If the language level is "BelowCLB6", the candidate is ineligible.
 */
export function calculateCanadaExpressEntryScore(
  user: CanadaUserInput,
  criteria: ICanadaExpressEntry
): { education: number; language: number; workExperience: number; finalScore: number } {
  const eduKey = mapCanadaEducation(user.education);
  const educationScore = criteria.education[eduKey] * 0.25;

  const languageKey = mapCanadaLanguage(user.language);
  if (languageKey === 'BelowCLB6') {
    // Candidate is ineligible if below CLB6
    return { education: educationScore, language: 0, workExperience: 0, finalScore: 0 };
  }
  const languageScore = criteria.languageProficiency[languageKey] * 0.25;

  const expCategory = getWorkExperienceCategory(user.experience.years);
  const baseWorkScore = criteria.workExperience.scoring[expCategory];

  let bonusWorkScore = 0;
  const foreignCategory = getForeignExperienceCategory(user.experience.foreignYears);
  if (foreignCategory) {
    bonusWorkScore = criteria.workExperience.foreignBonus[foreignCategory];
  }

  const workExperienceScore = (baseWorkScore + bonusWorkScore) * 0.5;

  const finalScore = educationScore + languageScore + workExperienceScore;

  return {
    education: educationScore,
    language: languageScore,
    workExperience: workExperienceScore,
    finalScore,
  };
}
