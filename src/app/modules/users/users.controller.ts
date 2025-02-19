import { Request, Response } from 'express';
import catchAsync from '../../../interface/catchAsync';
// import ApiError from '../../../error/ApiError';
// import config from '../../../config';

// import { ILoginUserResponse } from '../interfaces/users';
// import httpStatus from 'http-status';
// import sendResponse from '../../../common/sendResponse';
// import { jwtHelper } from '../../../common/jwtHelper';
import { supabase, supabaseAdmin } from '../../../config/supabase.config';
import { calculateUKGlobalTalentScore } from '../admin/visa_scores/uk';
import { calculateUSEB1EB2Score } from '../admin/visa_scores/us';
import { calculateDubaiGoldenVisaScore } from '../admin/visa_scores/dubai';
import { calculateCanadaExpressEntryScore } from '../admin/visa_scores/canada';

const allUsers = catchAsync(async (req: Request, res: Response) => {
  const { data, error } = await supabase.from('profiles').select();
  if (error) return res.status(401).json({ error: error.message });

  res.status(200).json(data);
});

/**
 * @swagger
 * /api/v1/users/take-assessment:
 *   post:
 *     summary: Take assessment
 *     tags: [Users]
 *     description: Take assessment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               education:
 *                 type: string
 *                 example: "phd"
 *               field:
 *                 type: string
 *                 example: "economics"
 *               experience:
 *                 type: object
 *                 properties:
 *                   years:
 *                     type: integer
 *                     example: 4
 *                   position:
 *                     type: string
 *                     example: "MidLevel"
 *               achievement:
 *                 type: object
 *                 properties:
 *                   achievementCount:
 *                     type: integer
 *                     example: 3
 *                   achievementImpact:
 *                     type: string
 *                     example: "National"
 *     responses:
 *       200:
 *         description: Assessment Score
 */
const takeAssessMentt = catchAsync(async (req: Request, res: Response) => {
  const ukVisa = await supabaseAdmin.from('visas').select('*').eq('visa_name', 'UK Global Talent Visa');
  const usVisa = await supabaseAdmin.from('visas').select('*').eq('visa_name', 'US EB-1/EB-2 VISA');
  const dubaiVisa = await supabaseAdmin.from('visas').select('*').eq('visa_name', 'DUBAI GOLDEN VISA');
  const canadaVisa = await supabaseAdmin.from('visas').select('*').eq('visa_name', 'CANADA EXPRESS ENTRY');

  let ukAssessmentScore, usAssessmentScore, dubaiAssessmentScore, canadaAssessmentScore;

  const userInput = req.body.assessment;
  const personalInfo = req.body.personal;
  const userEmail = req.body.personal.email;
  // console.log('userInput', userInput);
  // console.log('personalInfo', personalInfo);
  // console.log('userEmail', userEmail);

  if (!userInput || !personalInfo || !userEmail) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  if (ukVisa) {
    ukAssessmentScore = calculateUKGlobalTalentScore(userInput, ukVisa.data[0].criteras);
    console.log('ukAssessmentScore', ukAssessmentScore);
  }
  if (usVisa) {
    usAssessmentScore = calculateUSEB1EB2Score(userInput, usVisa.data[0].criteras);
    console.log('usAssessmentScore', usAssessmentScore);
  }
  if (dubaiVisa) {
    dubaiAssessmentScore = calculateDubaiGoldenVisaScore(userInput, dubaiVisa.data[0].criteras);
    console.log('dubaiAssessmentScore', dubaiAssessmentScore);
  }
  if (canadaVisa) {
    canadaAssessmentScore = calculateCanadaExpressEntryScore(userInput, canadaVisa.data[0].criteras);
    console.log('canadaAssessmentScore', canadaAssessmentScore);
  }

  const { error, data } = await supabaseAdmin.from('client_assessments').upsert(
    [
      {
        email: userEmail,
        personal: personalInfo,
        assessment_data: userInput,
        // score: assessmentScore,
        // updated_at: new Date(),
      },
    ],
    { onConflict: 'email' }
  );
  // console.log('error', error, data);

  if (error) return res.status(400).json({ error: error.message });

  res.status(200).json({
    success: true,
    assessmentResult: {
      uk: ukAssessmentScore,
      us: usAssessmentScore,
      dubai: dubaiAssessmentScore,
      canada: canadaAssessmentScore,
    },
  });
});

export const UserController = {
  // register,
  // login,
  allUsers,
  takeAssessMentt,
};
