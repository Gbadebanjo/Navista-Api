export type ILoginUser = {
  email: string;
  password: string;
};

// Response after user login
export type ILoginUserResponse = {
  email: string;
  accessToken: string;
  refreshToken?: string;
};

// Response after refreshing access token
export type IRefreshTokenResponse = {
  accessToken: string;
};

export type IUser = {
  id: string; // UUID from Supabase Auth
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;

  created_at?: Date;
};

export type IEligibilityAssessMent = {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  nationality: string;
  current_location: string;
  education_level: string;
  created_at: Date;
  updated_at: Date;
};

export type IEligibilityAssessment = {
  personalInfo: {
    age: number;
    nationality: string;
    location: string;
  };
  professionalBg: {
    industry: string;
    jobTitle: string;
    experience: number;
    achievements: {
      type: string;
      description: string;
    }[];
    leadership: {
      title: string;
      year: number;
      description: string;
    };
  };
  educationalQualification: {
    degreeLevel: string;
    institution: string;
    areaOfStudy: string;
  };

  achievementsAndRecognitions: {
    awards: {
      title: string;
      year: number;
      description: string;
    }[];
    // certifications: {
    //   title: string;
    //   year: number;
    //   description: string;
    // }[];

    publishedWorks: {
      title: string;
      year: number;
      description: string;
    }[];
  };

  preferences: {
    targetCountry: string;
    urgency: string;
    relocationGoal: string;
  };

  currentImmigrationStatus: {
    existingVisas: string;
    mainRelocationGoal: string;
  };
};
export type EligibilityModel = {
  id: string;
  user_id: string;
  assessment: IEligibilityAssessment;
  created_at: Date;
  updated_at: Date;
  // score:
};

export type IUserProfile = {
  id: string;
};
