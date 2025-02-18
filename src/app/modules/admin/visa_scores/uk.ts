import {
  EducationScoring,
  ExperiencePoints,
  FieldMultipliers,
  ImpactMultipliers,
  InstitutionRankings,
  IUKGlobalTalentVisa,
  PositionMultipliers,
} from '../../interfaces/visa';

/**
 * Input types for scoring calculation.
 */
type BaseScores = {
  education: number;
  experience: number;
  achievements: number;
  programCriteria?: number;
};

type Adjustments = {
  inDemandSkills?: boolean;
  multipleQualifications?: boolean;
  languageProficiencyBonus?: number;
  regionalPriorityBonus?: number;
  incompleteDocumentation?: boolean;
  employmentGaps?: boolean;
  nonRelevantExperience?: boolean;
};

type SuccessFactors = {
  programDifficulty: number;
  historicalSuccessRate: number;
  currentAcceptanceRate: number;
};

type UKUserInput = {
  education: string;
  field: string;
  experience: {
    years: number;
    position: keyof PositionMultipliers;
  };
  achievement: {
    achievementCount: number;
    achievementImpact: keyof ImpactMultipliers;
  };
};

const mapEducation = (input: string): keyof EducationScoring => {
  const mapping: Record<string, keyof EducationScoring> = {
    phd: 'PhD',
    masters: 'Masters',
    bachelors: 'Bachelors',
    diploma: 'Diploma',
    other: 'Other',
  };
  return mapping[input.toLowerCase()] || 'Other';
};

const mapField = (input: string): keyof FieldMultipliers => {
  const mapping: Record<string, keyof FieldMultipliers> = {
    stem: 'STEMDigitalArts',
    economics: 'BusinessEconomics',
    arts: 'OtherFields',
  };
  return mapping[input.toLowerCase()] || 'OtherFields';
};

/**
 * Helper function to map years of experience to an experience category.
 */
const getExperienceCategory = (years: number): keyof ExperiencePoints => {
  if (years >= 3 && years <= 5) return '3-5Years';
  if (years >= 6 && years <= 8) return '5-8Years';
  if (years >= 9) return '8+Years';
  // If below required minimum
  return '3-5Years';
};

export function calculateUKGlobalTalentScore(
  user: UKUserInput,
  criteria: IUKGlobalTalentVisa
): BaseScores & { finalScore: number } {
  const eduKey = mapEducation(user.education);
  const fieldKey = mapField(user.field);
  // Assume institution ranking defaults to "OtherAccredited"
  const institutionKey: keyof InstitutionRankings = 'OtherAccredited';

  const eduBase =
    criteria.education.scoring[eduKey] +
    criteria.education.fieldMultipliers[fieldKey] +
    criteria.education.institutionRankings[institutionKey];
  const educationScore = eduBase * 0.25;

  const expCategory = getExperienceCategory(user.experience.years);

  const userPosition: keyof PositionMultipliers = user.experience.position;

  const experienceBase =
    criteria.experience.experiencePoints[expCategory] + criteria.experience.positionMultipliers[userPosition];
  const experienceScore = experienceBase * 0.3;

  // --- Achievements Compo ---

  let achBase = 0;
  if (user.achievement.achievementCount === 2) {
    achBase = criteria.achievements.scoring['2Items'];
  } else if (user.achievement.achievementCount === 3) {
    achBase = criteria.achievements.scoring['3Items'];
  } else if (user.achievement.achievementCount >= 4) {
    achBase = criteria.achievements.scoring['4PlusItems'];
  }

  achBase += criteria.achievements.impactMultipliers[user.achievement.achievementImpact];
  const achievementsScore = achBase * 0.25;

  //    const programCriteriaScore = criteria.programCriteria * 0.20; // Assuming we have a fixed program criteria score for UK

  // --- Final Score ---
  const finalScore = educationScore + experienceScore + achievementsScore;

  return {
    education: educationScore,
    experience: experienceScore,
    achievements: achievementsScore,
    // programCriteria: programCriteriaScore,
    finalScore,
  };
}

export function calculateFinalScore(base: BaseScores, adjustments: Adjustments): number {
  let baseScore = base.education * 0.25 + base.experience * 0.3 + base.achievements * 0.25 + base.programCriteria * 0.2;

  if (adjustments.inDemandSkills) {
    baseScore *= 1.1;
  }
  if (adjustments.multipleQualifications) {
    baseScore *= 1.05;
  }
  if (adjustments.languageProficiencyBonus) {
    baseScore *= 1 + adjustments.languageProficiencyBonus / 100;
  }
  if (adjustments.regionalPriorityBonus) {
    baseScore *= 1 + adjustments.regionalPriorityBonus / 100;
  }

  if (adjustments.incompleteDocumentation) {
    baseScore *= 0.9;
  }
  if (adjustments.employmentGaps) {
    baseScore *= 0.95;
  }
  if (adjustments.nonRelevantExperience) {
    baseScore *= 0.9;
  }

  return baseScore;
}

/**
 * Estimates the success probability based on the final score and success factors.
 *
 * Calculation: Probability = Final Score × Program Difficulty × Historical Success Rate × Current Acceptance Rate
 */
export function estimateSuccessProbability(finalScore: number, factors: SuccessFactors): number {
  const probability =
    finalScore * factors.programDifficulty * factors.historicalSuccessRate * factors.currentAcceptanceRate;
  // Return a probability capped at 100%
  return Math.min(probability, 100);
}
