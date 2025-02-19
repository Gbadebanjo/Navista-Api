// Type definitions for the US EB-1/EB-2 Visa Criteria For the sake of calcumtion
// Education Scoring for US
type USEducationScoring = {
  PhD: number;
  Masters: number;
  BachelorsExceptional: number;
};

// Field Bonuses for US
type USFieldMultipliers = {
  STEM: number;
  BusinessEconomics: number;
  ArtsCulture: number;
};

// Experience Scoring for US
type USExperiencePoints = {
  '5-7Years': number;
  '8-10Years': number;
  '10+Years': number;
};

// Positions Scoring for US
type USPositions = {
  Executive: number;
  SeniorManagement: number;
  Expert: number;
  Other: number;
};

// Achievements Scoring for US
type USAchievementScoring = {
  '2Items': number;
  '3Items': number;
  '4PlusItems': number;
};

// Recognition Levels for Achievements
type USRecognitionLevels = {
  International: number;
  National: number;
  Industry: number;
};

// Main US EB-1/EB-2 Visa Criteria Type
export type IUSEB1EB2Visa = {
  education: {
    scoring: USEducationScoring;
    fieldMultipliers: USFieldMultipliers;
  };
  experience: {
    minimumYearsRequired: number;
    experiencePoints: USExperiencePoints;
  };
  positions: USPositions;
  achievements: {
    required: number;
    scoring: USAchievementScoring;
    recognitionLevels: USRecognitionLevels;
  };
};

// Uer input type for the US visa assesssmentt
export type USUserInput = {
  education: string;
  field: string;
  experience: {
    years: number;
    position: keyof USPositions;
  };
  achievement: {
    achievementCount: number;
    achievementImpact: keyof USRecognitionLevels;
  };
};

/**
 * Mapping functions to convert siple user input into the keys used in the criteria.
 */
const mapUSEducation = (input: string): keyof USEducationScoring => {
  const mapping: Record<string, keyof USEducationScoring> = {
    phd: 'PhD',
    masters: 'Masters',
    bachelors: 'BachelorsExceptional',
  };
  return mapping[input.toLowerCase()] || 'BachelorsExceptional';
};

const mapUSField = (input: string): keyof USFieldMultipliers => {
  const mapping: Record<string, keyof USFieldMultipliers> = {
    stem: 'STEM',
    economics: 'BusinessEconomics',
    arts: 'ArtsCulture',
  };
  return mapping[input.toLowerCase()] || 'ArtsCulture';
};

/**
 * Helper function to map years of experience to an experience category.
 */
const getUSExperienceCategory = (years: number): keyof USExperiencePoints => {
  if (years >= 5 && years <= 7) return '5-7Years';
  if (years >= 8 && years <= 10) return '8-10Years';
  if (years > 10) return '10+Years';
  // If below the minimum required, default to "5-7Years"
  return '5-7Years';
};

export function calculateUSEB1EB2Score(
  user: USUserInput,
  criteria: IUSEB1EB2Visa
): { education: number; experience: number; achievements: number; finalScore: number } {
  // --- Education Component ---
  const eduKey = mapUSEducation(user.education);
  const fieldKey = mapUSField(user.field);
  const eduBase = criteria.education.scoring[eduKey] + criteria.education.fieldMultipliers[fieldKey] || 0;
  const educationScore = eduBase * 0.25;

  // --- Experience Component ---
  const expCategory = getUSExperienceCategory(user.experience.years);
  const experienceBase =
    criteria.experience.experiencePoints[expCategory] + criteria.positions[user.experience.position] || 0;
  const experienceScore = experienceBase * 0.3;

  // --- Achievements Component ---
  let achBase = 0;
  //   if (user.achievement.achievementCount === 3) {
  //     achBase = criteria.achievements.scoring['3Items'];
  //   } else if (user.achievement.achievementCount >= 4) {
  //     achBase = criteria.achievements.scoring['4PlusItems'];
  //   } else {
  //     // If the user has less than 3 achievements (though minimum is 3), use "2Items" as fallback.
  //     achBase = criteria.achievements.scoring['2Items'];
  //   }
  // Add recognition bonus
  achBase += criteria.achievements.recognitionLevels[user.achievement.achievementImpact] || 0;
  const achievementsScore = achBase * 0.25;

  // --- Final Score ---
  const finalScore = educationScore + experienceScore + achievementsScore;

  return {
    education: educationScore,
    experience: experienceScore,
    achievements: achievementsScore,
    finalScore,
  };
}
