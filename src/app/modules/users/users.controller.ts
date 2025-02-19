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
 *               assessment:
 *                 type: object
 *                 properties:
 *                   education:
 *                     type: string
 *                     example: "phd"
 *                   field:
 *                     type: string
 *                     example: "economics"
 *                   experience:
 *                     type: object
 *                     properties:
 *                       years:
 *                         type: integer
 *                         example: 9
 *                       position:
 *                         type: string
 *                         example: "Expert"
 *                       foreignYears:
 *                         type: integer
 *                         example: 3
 *                   achievement:
 *                     type: object
 *                     properties:
 *                       achievementCount:
 *                         type: integer
 *                         example: 4
 *                       achievementImpact:
 *                         type: string
 *                         example: "National"
 *                       recognitionLevel:
 *                         type: string
 *                         example: "International"
 *                   language:
 *                     type: string
 *                     example: "clb8"
 *                   financialCategory:
 *                     type: string
 *                     example: "publicinvestment10mplus"
 *                   salaryCategory:
 *                     type: string
 *                     example: "salary30kplus"
 *                   positionCategory:
 *                     type: string
 *                     example: "ceo/md"
 *               personal:
 *                 type: object
 *                 properties:
 *                   email:
 *                     type: string
 *                     example: "example@gmail.com"
 *                   fullName:
 *                     type: string
 *                     example: "John Mackerel"
 *                   nationality:
 *                     type: string
 *                     example: "American"
 *                   currentLocation:
 *                     type: string
 *                     example: "Cameroon"
 *     responses:
 *       200:
 *         description: Assessment Score
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 assessmentResult:
 *                   type: object
 *                   properties:
 *                     uk:
 *                       type: object
 *                       properties:
 *                         education:
 *                           type: number
 *                           example: 28.75
 *                         experience:
 *                           type: number
 *                           example: 0
 *                         achievements:
 *                           type: number
 *                           example: 27.5
 *                         finalScore:
 *                           type: number
 *                           example: 56.25
 *                     us:
 *                       type: object
 *                       properties:
 *                         education:
 *                           type: number
 *                           example: 28.75
 *                         experience:
 *                           type: number
 *                           example: 45
 *                         achievements:
 *                           type: number
 *                           example: 25
 *                         finalScore:
 *                           type: number
 *                           example: 98.75
 *                     dubai:
 *                       type: object
 *                       properties:
 *                         financial:
 *                           type: number
 *                           example: 100
 *                         professional:
 *                           type: number
 *                           example: 50
 *                         finalScore:
 *                           type: number
 *                           example: 150
 *                     canada:
 *                       type: object
 *                       properties:
 *                         education:
 *                           type: number
 *                           example: 25
 *                         language:
 *                           type: number
 *                           example: 20
 *                         workExperience:
 *                           type: number
 *                           example: 48.5
 *                         finalScore:
 *                           type: number
 *                           example: 93.5
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
