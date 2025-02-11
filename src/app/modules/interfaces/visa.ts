/**VISA CRITERIAS */

// Education Scoring Type
type EducationScoring = {
  PhD: number;
  Masters: number;
  Bachelors: number;
  Diploma: number;
  Other: number;
};

type FieldMultipliers = {
  STEMDigitalArts: number;
  OtherFields: number;
};

type InstitutionRankings = {
  Top100Global: number; // Percentage bonus (e.g., +20%)
  Top500Global: number; // Percentage bonus (e.g., +10%)
  OtherAccredited: number; // No adjustment
};

// Experience Scoring Type
type ExperiencePoints = {
  '3-5Years': number;
  '5-8Years': number;
  '8+Years': number;
};

type PositionMultipliers = {
  SeniorLevel: number;
  MidLevel: number;
  JuniorLevel: number;
};

// Achievements Scoring Type
type AchievementScoring = {
  '2Items': number;
  '3Items': number;
  '4PlusItems': number;
};

type ImpactMultipliers = {
  International: number;
  National: number;
  Regional: number;
};

// The main UK Global Talent Visa Type
export type IUKGlobalTalentVisa = {
  // Education section
  education: {
    scoring: EducationScoring;
    fieldMultipliers: FieldMultipliers;
    institutionRankings: InstitutionRankings;
  };

  // Experience section
  experience: {
    minimumYearsRequired: number; // For example, 3 years
    experiencePoints: ExperiencePoints;
    positionMultipliers: PositionMultipliers;
  };

  // Achievements section
  achievements: {
    required: number; // Minimum required achievements, e.g., 2
    scoring: AchievementScoring;
    impactMultipliers: ImpactMultipliers;
  };
};
