// Type definitions for Dubai Golden Visa scoring system

// Financial Criteria for Dubai Golden Visa
type DubaiFinancialScoring = {
  PublicInvestment10MPlus: number;
  PublicInvestment5To10M: number;
  PrivateCompany5MPlus: number;
  PrivateCompany3To5M: number;
  PropertyInvestment2MPlus: number;
  PropertyInvestment1To2M: number;
};

// Professional Criteria for Dubai Golden Visa
type DubaiProfessionalScoring = {
  Salary30KPlus: number;
  Salary20To30K: number;
  Salary15To20K: number;
  PositionCEOMD: number;
  PositionSeniorManagement: number;
  PositionDepartmentHead: number;
};

// Main criteria type for Dubai Golden Visa
export type IDubaiGoldenVisa = {
  financialCriteria: DubaiFinancialScoring;
  professionalCriteria: DubaiProfessionalScoring;
};

// User input type for Dubai Golden Visa
export type DubaiUserInput = {
  financialCategory: string;
  salaryCategory: string;
  positionCategory: string;
};

/**
 * Mapping function for financial criteria.
 */
const mapDubaiFinancial = (input: string): keyof DubaiFinancialScoring => {
  const mapping: Record<string, keyof DubaiFinancialScoring> = {
    publicinvestment10mplus: 'PublicInvestment10MPlus',
    publicinvestment5to10m: 'PublicInvestment5To10M',
    privatecompany5mplus: 'PrivateCompany5MPlus',
    privatecompany3to5m: 'PrivateCompany3To5M',
    propertyinvestment2mplus: 'PropertyInvestment2MPlus',
    propertyinvestment1to2m: 'PropertyInvestment1To2M',
  };
  return mapping[input.toLowerCase()] || 'PropertyInvestment1To2M'; // Default fallback
};

/**
 * Mapping function for salary criteria.
 */
const mapDubaiSalary = (input: string): keyof DubaiProfessionalScoring => {
  const mapping: Record<string, keyof DubaiProfessionalScoring> = {
    salary30kplus: 'Salary30KPlus',
    salary20to30k: 'Salary20To30K',
    salary15to20k: 'Salary15To20K',
  };
  return mapping[input.toLowerCase()] || 'Salary15To20K'; // Default fallback
};

/**
 * Mapping function for position criteria.
 */
const mapDubaiPosition = (input: string): keyof DubaiProfessionalScoring => {
  const mapping: Record<string, keyof DubaiProfessionalScoring> = {
    'ceo/md': 'PositionCEOMD',
    seniormanagement: 'PositionSeniorManagement',
    departmenthead: 'PositionDepartmentHead',
  };
  // Remove any whitespace and convert to lower-case for matching
  const key = input.toLowerCase().replace(/\s+/g, '');
  return mapping[key] || 'PositionDepartmentHead'; // Default fallback
};

export function calculateDubaiGoldenVisaScore(
  user: DubaiUserInput,
  criteria: IDubaiGoldenVisa
): { financial: number; professional: number; finalScore: number } {
  // --- Financial Component ---
  const financialKey = mapDubaiFinancial(user.financialCategory);
  const financialScore = criteria.financialCriteria[financialKey] || 0 * 0.5;

  // --- Professiona ---
  const salaryKey = mapDubaiSalary(user.salaryCategory);
  const positionKey = mapDubaiPosition(user.positionCategory);
  const professionalBase =
    criteria.professionalCriteria[salaryKey] || 0 + criteria.professionalCriteria[positionKey] || 0;
  const professionalScore = professionalBase * 0.5;

  // --- Final Score ---
  const finalScore = financialScore + professionalScore;

  return {
    financial: financialScore,
    professional: professionalScore,
    finalScore,
  };
}
