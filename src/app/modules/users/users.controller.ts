import { Request, RequestHandler, Response } from 'express';
import catchAsync from '../../../interface/catchAsync';
// import ApiError from '../../../error/ApiError';
// import config from '../../../config';

// import { ILoginUserResponse } from '../interfaces/users';
// import httpStatus from 'http-status';
// import sendResponse from '../../../common/sendResponse';
// import { jwtHelper } from '../../../common/jwtHelper';
import { supabase, supabaseAdmin } from '../../../config/supabase.config';
import { calculateUKGlobalTalentScore } from '../admin/visa_scores/uk';

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
  const visa = await supabaseAdmin.from('visas').select('*').eq('visa_name', 'UK Global Talent Visa');

  if (visa.error) return res.status(401).json({ error: visa.error.message });

  const userInput = req.body;

  console.log('userInput', userInput);
  console.log(visa.data);

  const assessmentScore = calculateUKGlobalTalentScore(userInput, visa.data[0].criteras);

  res.status(200).json({ success: true, score: assessmentScore });
});

export const UserController = {
  // register,
  // login,
  allUsers,
  takeAssessMentt,
};
