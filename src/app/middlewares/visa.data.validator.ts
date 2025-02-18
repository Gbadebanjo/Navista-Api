import { z } from 'zod';

export const visaTypeSchema = z.enum([
  'UK Global Talent Visa',
  'US EB-1/EB-2 VISA',
  'CANADA EXPRESS ENTRY',
  'DUBAI GOLDEN VISA',
]);
const EducationScoringSchema = z.object({
  PhD: z.number(),
  Masters: z.number(),
  Bachelors: z.number(),
  Diploma: z.number(),
  Other: z.number(),
});

const FieldMultipliersSchema = z.object({
  STEMDigitalArts: z.number(),
  BusinessEconomics: z.number(),
  OtherFields: z.number(),
});

const InstitutionRankingsSchema = z.object({
  Top100Global: z.number(),
  Top500Global: z.number(),
  OtherAccredited: z.number(),
});

const ExperiencePointsSchema = z.object({
  '3-5Years': z.number(),
  '5-8Years': z.number(),
  '8+Years': z.number(),
});

const PositionMultipliersSchema = z.object({
  SeniorLevel: z.number(),
  MidLevel: z.number(),
  JuniorLevel: z.number(),
});

const AchievementScoringSchema = z.object({
  '2Items': z.number(),
  '3Items': z.number(),
  '4PlusItems': z.number(),
});

const ImpactMultipliersSchema = z.object({
  International: z.number(),
  National: z.number(),
  Regional: z.number(),
});

export const IUKGlobalTalentVisaSchema = z.object({
  education: z.object({
    scoring: EducationScoringSchema,
    fieldMultipliers: FieldMultipliersSchema,
    institutionRankings: InstitutionRankingsSchema,
  }),
  experience: z.object({
    minimumYearsRequired: z.number(),
    experiencePoints: ExperiencePointsSchema,
    positionMultipliers: PositionMultipliersSchema,
  }),
  achievements: z.object({
    required: z.number(),
    scoring: AchievementScoringSchema,
    impactMultipliers: ImpactMultipliersSchema,
  }),
});

const USEducationScoringSchema = z.object({
  PhD: z.number(), // e.g., 100 points
  Masters: z.number(), // e.g., 80 points
  BachelorsExceptional: z.number(), // e.g., 60 points (with exceptional ability)
});

// Field Bonuses
const USFieldMultipliersSchema = z.object({
  STEM: z.number(), // e.g., +20 points
  BusinessEconomics: z.number(), // e.g., +15 points
  ArtsCulture: z.number(), // e.g., +15 points
});

// Experience Scoring
const USExperiencePointsSchema = z.object({
  '5-7Years': z.number(), // e.g., 60 points
  '8-10Years': z.number(), // e.g., 80 points
  '10+Years': z.number(), // e.g., 100 points
});

// Position Scoring
const USPositionsSchema = z.object({
  Executive: z.number(), // e.g., 100 points
  SeniorManagement: z.number(), // e.g., 80 points
  Expert: z.number(), // e.g., 70 points
  Other: z.number(), // e.g., 50 points
});

// Achievements Scoring & Recognition Levels
const USAchievementsSchema = z.object({
  // The minimum number of required achievements, e.g., 3
  required: z.number(),
  // Recognition levels for achievements
  recognitionLevels: z.object({
    International: z.number(), // e.g., 100 points
    National: z.number(), // e.g., 80 points
    Industry: z.number(), // e.g., 60 points
  }),
});

// Main US EB-1/EB-2 Visa Schema
export const IUSEB1EB2VisaSchema = z.object({
  education: z.object({
    scoring: USEducationScoringSchema,
    fieldMultipliers: USFieldMultipliersSchema,
  }),
  experience: z.object({
    minimumYearsRequired: z.number(), // e.g., 5 years
    experiencePoints: USExperiencePointsSchema,
  }),
  positions: USPositionsSchema,
  achievements: USAchievementsSchema,
});

const CanadaEducationScoringSchema = z.object({
  PhD: z.number(),
  Masters: z.number(),
  Bachelors: z.number(),
  ThreeYearDiploma: z.number(),
  OneTwoYearDiploma: z.number(),
});

// Language Proficiency (CLB Levels)
// Note: BelowCLB6 is set as a literal since it’s a string value ("Ineligible")
const CanadaLanguageProficiencySchema = z.object({
  CLB9Plus: z.number(),
  CLB8: z.number(),
  CLB7: z.number(),
  CLB6: z.number(),
  BelowCLB6: z.literal('Ineligible'),
});

// Work Experience Scoring
const CanadaWorkExperienceScoringSchema = z.object({
  '1Year': z.number(),
  '2-3Years': z.number(),
  '4-5Years': z.number(),
  '6+Years': z.number(),
});

// Foreign Work Experience Bonus
const CanadaForeignExperienceBonusSchema = z.object({
  '1-2Years': z.number(),
  '3-4Years': z.number(),
  '5+Years': z.number(),
});

// Main Canada Express Entry Schema
export const CanadaExpressEntrySchema = z.object({
  education: CanadaEducationScoringSchema,
  languageProficiency: CanadaLanguageProficiencySchema,
  workExperience: z.object({
    scoring: CanadaWorkExperienceScoringSchema,
    foreignBonus: CanadaForeignExperienceBonusSchema,
  }),
});

// Financial Criteria Scoring Schema
const DubaiFinancialScoringSchema = z.object({
  PublicInvestment10MPlus: z.number(), // Public Investment (AED 10M+): 100 points
  PublicInvestment5To10M: z.number(), // Public Investment (AED 5-10M): 80 points
  PrivateCompany5MPlus: z.number(), // Private Company (AED 5M+): 80 points
  PrivateCompany3To5M: z.number(), // Private Company (AED 3-5M): 60 points
  PropertyInvestment2MPlus: z.number(), // Property Investment (AED 2M+): 60 points
  PropertyInvestment1To2M: z.number(), // Property Investment (AED 1-2M): 40 points
});

// Professional Criteria Scoring Schema
const DubaiProfessionalScoringSchema = z.object({
  Salary30KPlus: z.number(), // Monthly Salary (AED 30k+): 100 points
  Salary20To30K: z.number(), // Monthly Salary (AED 20-30k): 80 points
  Salary15To20K: z.number(), // Monthly Salary (AED 15-20k): 60 points
  PositionCEOMD: z.number(), // Position (CEO/MD): 100 points
  PositionSeniorManagement: z.number(), // Position (Senior Management): 80 points
  PositionDepartmentHead: z.number(), // Position (Department Head): 60 points
});

// Main Dubai Golden Visa Schema
export const DubaiGoldenVisaSchema = z.object({
  financialCriteria: DubaiFinancialScoringSchema,
  professionalCriteria: DubaiProfessionalScoringSchema,
});
