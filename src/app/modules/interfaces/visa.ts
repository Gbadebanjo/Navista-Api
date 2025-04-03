/** VISA CRITERIAS */

// Education Scoring Type
export type EducationScoring = {
  PhD: number;
  Masters: number;
  Bachelors: number;
  Diploma: number;
  Other: number;
};

export type FieldMultipliers = {
  STEMDigitalArts: number;
  BusinessEconomics: number; //  Added Business/Economics
  OtherFields: number;
};

export type InstitutionRankings = {
  Top100Global: number; // Percentage bonus (e.g., +20%)
  Top500Global: number; // Percentage bonus (e.g., +10%)
  OtherAccredited: number; // No adjustment
};

// Experience Scoring Type
export type ExperiencePoints = {
  '3-5Years': number;
  '5-8Years': number;
  '8+Years': number;
};

export type PositionMultipliers = {
  SeniorLevel: number;
  MidLevel: number;
  JuniorLevel: number;
};

// Achievements Scoring Type
export type AchievementScoring = {
  '2Items': number;
  '3Items': number;
  '4PlusItems': number;
};

export type ImpactMultipliers = {
  International: number;
  National: number;
  Regional: number;
};

// Main UK Global Talent Visa Type
export type IUKGlobalTalentVisa = {
  // Education section
  education: {
    scoring: EducationScoring;
    fieldMultipliers: FieldMultipliers;
    institutionRankings: InstitutionRankings;
  };

  // Experience section
  experience: {
    minimumYearsRequired: number; // Minimum required years (e.g., 3 years)
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

/** US EB-1/EB-2 VISA SCORING SYSTEM */

// Education Scoring Type
type USEducationScoring = {
  PhD: number;
  Masters: number;
  BachelorsExceptional: number; // Bachelors with exceptional ability
};

type USFieldMultipliers = {
  STEM: number;
  BusinessEconomics: number;
  ArtsCulture: number;
};

// Experience Scoring Type
type USExperiencePoints = {
  '5-7Years': number;
  '8-10Years': number;
  '10+Years': number;
};

// Position Scoring Type
type USPositionScoring = {
  Executive: number;
  SeniorManagement: number;
  Expert: number;
  Other: number;
};

// Achievements Scoring Type
type USAchievementScoring = {
  required: number; // Minimum required achievements, e.g., 3
  categories: string[]; // List of achievement categories
};

type USRecognitionScoring = {
  International: number;
  National: number;
  Industry: number;
};

// Main US EB-1/EB-2 Visa Type
export type IUSEB1EB2Visa = {
  // Education section
  education: {
    scoring: USEducationScoring;
    fieldMultipliers: USFieldMultipliers;
  };

  // Experience section
  experience: {
    minimumYearsRequired: number; // Minimum years required (e.g., 5 years)
    experiencePoints: USExperiencePoints;
  };

  // Position section
  positions: USPositionScoring;

  // Achievements section
  achievements: {
    scoring: USAchievementScoring;
    recognitionLevels: USRecognitionScoring;
  };
};

/** CANADA EXPRESS ENTRY SCORING SYSTEM */

// Education Scoring Type
type CanadaEducationScoring = {
  PhD: number;
  Masters: number;
  Bachelors: number;
  ThreeYearDiploma: number;
  OneTwoYearDiploma: number;
};

// Language Proficiency Scoring Type (CLB: Canadian Language Benchmark)
type CLBScoring = {
  CLB9Plus: number;
  CLB8: number;
  CLB7: number;
  CLB6: number;
  BelowCLB6: 'Ineligible';
};

// Work Experience Scoring Type
type CanadaWorkExperienceScoring = {
  '1Year': number;
  '2-3Years': number;
  '4-5Years': number;
  '6+Years': number;
};

// Foreign Work Experience Bonus
type ForeignExperienceBonus = {
  '1-2Years': number;
  '3-4Years': number;
  '5+Years': number;
};

// Main Canada Express Entry Type
export type ICanadaExpressEntry = {
  // Education section
  education: CanadaEducationScoring;

  // Language section
  languageProficiency: CLBScoring;

  // Work Experience section
  workExperience: {
    scoring: CanadaWorkExperienceScoring;
    foreignBonus: ForeignExperienceBonus;
  };
};

/** DUBAI GOLDEN VISA SCORING SYSTEM */

// Financial Criteria Scoring Type
type DubaiFinancialScoring = {
  PublicInvestment10MPlus: number;
  PublicInvestment5To10M: number;
  PrivateCompany5MPlus: number;
  PrivateCompany3To5M: number;
  PropertyInvestment2MPlus: number;
  PropertyInvestment1To2M: number;
};

// Professional Criteria Scoring Type
type DubaiProfessionalScoring = {
  Salary30KPlus: number;
  Salary20To30K: number;
  Salary15To20K: number;
  PositionCEO_MD: number;
  PositionSeniorManagement: number;
  PositionDepartmentHead: number;
};

// Main Dubai Golden Visa Type
export type IDubaiGoldenVisa = {
  financialCriteria: DubaiFinancialScoring;
  professionalCriteria: DubaiProfessionalScoring;
};
