import {
  CanadaExpressEntrySchema,
  DubaiGoldenVisaSchema,
  IUKGlobalTalentVisaSchema,
  IUSEB1EB2VisaSchema,
} from '../../middlewares/visa.data.validator';
import { IUKGlobalTalentVisa } from '../interfaces/visa';

// 1. Education Calculation
const calculateEducationScore = (
  education: IUKGlobalTalentVisa['education'],
  educationLevel: 'PhD' | 'Masters' | 'Bachelors' | 'Diploma' | 'Other',
  field: 'STEMDigitalArts' | 'OtherFields',
  institutionRanking: 'Top100Global' | 'Top500Global' | 'OtherAccredited'
): number => {
  let score = education.scoring[educationLevel]; // Base score for education level
  score *= education.fieldMultipliers[field]; // Apply field multiplier
  if (institutionRanking === 'Top100Global') {
    score *= 1 + education.institutionRankings.Top100Global;
  } else if (institutionRanking === 'Top500Global') {
    score *= 1 + education.institutionRankings.Top500Global;
  }
  return score;
};

// 2. Experience Calculation
const calculateExperienceScore = (
  experience: IUKGlobalTalentVisa['experience'],
  yearsOfExperience: number,
  positionLevel: 'SeniorLevel' | 'MidLevel' | 'JuniorLevel'
): number => {
  let experiencePoints = 0;
  if (yearsOfExperience >= 8) {
    experiencePoints = experience.experiencePoints['8+Years'];
  } else if (yearsOfExperience >= 5) {
    experiencePoints = experience.experiencePoints['5-8Years'];
  } else if (yearsOfExperience >= 3) {
    experiencePoints = experience.experiencePoints['3-5Years'];
  }
  experiencePoints *= experience.positionMultipliers[positionLevel];
  return experiencePoints;
};

// 3. Achievements Calculation
const calculateAchievementsScore = (
  achievements: IUKGlobalTalentVisa['achievements'],
  numberOfAchievements: number,
  impactLevel: 'International' | 'National' | 'Regional'
): number => {
  let score = 0;
  if (numberOfAchievements === 2) {
    score = achievements.scoring['2Items'];
  } else if (numberOfAchievements === 3) {
    score = achievements.scoring['3Items'];
  } else if (numberOfAchievements >= 4) {
    score = achievements.scoring['4PlusItems'];
  }
  score *= achievements.impactMultipliers[impactLevel];
  return score;
};

// 4. Program Criteria Score Calclation
const calculateProgramCriteriaScore = (programCriteria: number): number => {
  return programCriteria;
};

// 5. Apply Adjustments
const applyAdjustments = (
  baseScore: number,
  positiveAdjustments: {
    inDemandSkills?: boolean;
    multipleQualifications?: boolean;
    languageProficiency?: number; // Between 5 and 15
    regionalPriority?: boolean;
  },
  negativeAdjustments: {
    incompleteDocumentation?: boolean;
    employmentGaps?: boolean;
    nonRelevantExperience?: boolean;
  }
): number => {
  // Positive adjustments
  if (positiveAdjustments.inDemandSkills) {
    baseScore *= 1.1; // +10%
  }
  if (positiveAdjustments.multipleQualifications) {
    baseScore *= 1.05; // +5%
  }
  if (positiveAdjustments.languageProficiency) {
    baseScore *= 1 + positiveAdjustments.languageProficiency / 100; // between 5-15%
  }
  if (positiveAdjustments.regionalPriority) {
    baseScore *= 1.05; // +5%
  }

  // Negative adjustments
  if (negativeAdjustments.incompleteDocumentation) {
    baseScore *= 0.9; // -10%
  }
  if (negativeAdjustments.employmentGaps) {
    baseScore *= 0.95; // -5%
  }
  if (negativeAdjustments.nonRelevantExperience) {
    baseScore *= 0.9; // -10%
  }

  return baseScore;
};

// 6. Base Score Calcultion
const calculateBaseScore = (
  educationScore: number,
  experienceScore: number,
  achievementsScore: number,
  programCriteriaScore: number
): number => {
  return educationScore * 0.25 + experienceScore * 0.3 + achievementsScore * 0.25 + programCriteriaScore * 0.2;
};

// 7. Sucess Probability Calculation
const calculateSuccessProbability = (
  baseScore: number,
  programDifficulty: number,
  historicalSuccessRate: number,
  currentAcceptanceRate: number
): number => {
  return baseScore * programDifficulty * historicalSuccessRate * currentAcceptanceRate;
};

// Final Score Calculation
const calculateFinalVisaScore = (
  visaData: IUKGlobalTalentVisa,
  educationLevel: 'PhD' | 'Masters' | 'Bachelors' | 'Diploma' | 'Other',
  field: 'STEMDigitalArts' | 'OtherFields',
  institutionRanking: 'Top100Global' | 'Top500Global' | 'OtherAccredited',
  yearsOfExperience: number,
  positionLevel: 'SeniorLevel' | 'MidLevel' | 'JuniorLevel',
  numberOfAchievements: number,
  impactLevel: 'International' | 'National' | 'Regional',
  programCriteria: number,
  positiveAdjustments: {
    inDemandSkills?: boolean;
    multipleQualifications?: boolean;
    languageProficiency?: number;
    regionalPriority?: boolean;
  },
  negativeAdjustments: {
    incompleteDocumentation?: boolean;
    employmentGaps?: boolean;
    nonRelevantExperience?: boolean;
  },
  programDifficulty: number,
  historicalSuccessRate: number,
  currentAcceptanceRate: number
): number => {
  const educationScore = calculateEducationScore(visaData.education, educationLevel, field, institutionRanking);

  const experienceScore = calculateExperienceScore(visaData.experience, yearsOfExperience, positionLevel);

  const achievementsScore = calculateAchievementsScore(visaData.achievements, numberOfAchievements, impactLevel);

  const programCriteriaScore = calculateProgramCriteriaScore(programCriteria);

  let baseScore = calculateBaseScore(educationScore, experienceScore, achievementsScore, programCriteriaScore);

  baseScore = applyAdjustments(baseScore, positiveAdjustments, negativeAdjustments);

  const successProbability = calculateSuccessProbability(
    baseScore,
    programDifficulty,
    historicalSuccessRate,
    currentAcceptanceRate
  );

  return successProbability;
};

//VISA DATA VALIDATOR
export const validateVisaData = (visaType, data) => {
  switch (visaType) {
    case 'UK Global Talent Visa':
      return IUKGlobalTalentVisaSchema.safeParse(data);
    case 'US EB-1/EB-2 VISA':
      return IUSEB1EB2VisaSchema.safeParse(data);
    case 'CANADA EXPRESS ENTRY':
      return CanadaExpressEntrySchema.safeParse(data);
    case 'DUBAI GOLDEN VISA':
      return DubaiGoldenVisaSchema.safeParse(data);
    default:
      return null;
  }
};
