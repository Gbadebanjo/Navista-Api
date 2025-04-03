import { Request, Response } from 'express';
import catchAsync from '../../../interface/catchAsync';
import { calculateUKGlobalTalentScore } from '../admin/visa_scores/uk';
import { calculateUSEB1EB2Score } from '../admin/visa_scores/us';
import { calculateDubaiGoldenVisaScore } from '../admin/visa_scores/dubai';
import { calculateCanadaExpressEntryScore } from '../admin/visa_scores/canada';
import { decode } from 'base64-arraybuffer';
import { supabase, supabaseAdmin } from '../../../config/supabase.config';
import config from '../../../config';
import { Multer } from 'multer';
import { doc_typeSchema, visaTypeSchema } from '../../middlewares/visa.data.validator';

type MulterRequest = Request & {
  file: Multer.File;
};

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
  const userEmail = (req.body.personal.email as string).toLowerCase();
  // //console.log('userInput', userInput);
  // //console.log('personalInfo', personalInfo);
  // //console.log('userEmail', userEmail);

  if (!userInput || !personalInfo || !userEmail) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  if (ukVisa) {
    ukAssessmentScore = calculateUKGlobalTalentScore(userInput, ukVisa.data[0].criteras);
    //console.log('ukAssessmentScore', ukAssessmentScore);
  }
  if (usVisa) {
    usAssessmentScore = calculateUSEB1EB2Score(userInput, usVisa.data[0].criteras);
    //console.log('usAssessmentScore', usAssessmentScore);
  }
  if (dubaiVisa) {
    dubaiAssessmentScore = calculateDubaiGoldenVisaScore(userInput, dubaiVisa.data[0].criteras);
    //console.log('dubaiAssessmentScore', dubaiAssessmentScore);
  }
  if (canadaVisa) {
    canadaAssessmentScore = calculateCanadaExpressEntryScore(userInput, canadaVisa.data[0].criteras);
    //console.log('canadaAssessmentScore', canadaAssessmentScore);
  }

  const { error } = await supabaseAdmin.from('client_assessments').upsert(
    [
      {
        email: userEmail,
        personal: { ...personalInfo, email: userEmail },
        assessment_data: userInput,
        score: {
          uk: ukAssessmentScore,
          us: usAssessmentScore,
          dubai: dubaiAssessmentScore,
          canada: canadaAssessmentScore,
        },
        // client_id: req.body.user.id
        // score: assessmentScore,
        // updated_at: new Date(),
      },
    ],
    { onConflict: 'email' }
  );
  // //console.log('error', error, data);

  if (error) return res.status(400).json({ error: error.message });

  const saveApplicationStatus = await supabaseAdmin.from('application_trackings').upsert(
    [
      {
        email: userEmail,
        stage: 'Assessment Test',
        status: 'Completed',
        comment: 'Assessment test completed successfully',
      },
    ],
    {
      onConflict: 'email',
    }
  );

  if (saveApplicationStatus.error) return res.status(400).json({ error: saveApplicationStatus.error.message });

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

const getAssessmentScore = catchAsync(async (req: Request, res: Response) => {
  const { user } = req.body;

  if (!user) {
    return res.status(400).json({ error: 'User not found' });
  }

  try {
    const { data, error } = await supabaseAdmin.from('client_assessments').select('*').eq('email', user.email).single();

    if (error) return res.status(400).json({ error: error.message });

    if (!data) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/v1/users/upload:
 *   post:
 *     summary: Upload documents
 *     tags: [Users]
 *     description: Upload documents
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               visa_type:
 *                 type: string
 *                 enum: ['UK Global Talent Visa', 'US EB-1/EB-2 VISA', 'CANADA EXPRESS ENTRY', 'DUBAI GOLDEN VISA']
 *               uploadingFor:
 *                 type: string
 *                 enum: ['Resume', 'Personal Statement', 'Letter of Recommendation', 'Degree Certificate', 'Language Proficiency Result', 'Proof of Funds']
 *               doc_number:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 fileUrl:
 *                   type: string
 *                   example: "https://your-supabase-url.com/storage/v1/object/public/bucket_name/user123/visa_type/uploadingFor"
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Please upload a file"
 *                 error:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       path:
 *                         type: string
 *                         example: "visa_type"
 *                       message:
 *                         type: string
 *                         example: "Invalid visa type"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "An error occurred while uploading the file"
 */
const uploadDocuments = catchAsync(async (req: MulterRequest, res) => {
  try {
    const file = req.file;

    //console.log(file);

    if (!file) {
      res.status(400).json({ message: 'Please upload a file' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      res.status(400).json({ message: 'File size exceeds 5MB' });
      return;
    }

    const mimeType = file.mimetype;

    const { user } = req.body;

    const visa_type = visaTypeSchema.safeParse(req.body.visa_type);
    // const uploadingFor = doc_typeSchema.safeParse(req.body.uploadingFor);
    const uploadingFor = req.body.uploadingFor;
    const doc_number = req.body.doc_number;

    const max_doc_number = 3;

    if (doc_number < 1 || doc_number > 3 || isNaN(doc_number)) {
      return res.status(400).json({ message: 'Please provide a valid document number' });
    }

    if (!visa_type.success) {
      res.status(400).json({ message: 'Please provide appropriate valid visa type', error: visa_type.error.errors });
      return;
    }

    if (!uploadingFor.success) {
      res
        .status(400)
        .json({ message: 'Please provide appropriate valid document type', error: uploadingFor.error.errors });
      return;
    }

    //console.log('user info', user);

    if (!user) {
      res.status(400).json({ message: 'User not provided' });
      return;
    }

    const bucket_name = config.supabase.bucket_name;
    const fileExt = file.originalname.split('.').pop();

    // decode file buffer to base64
    const fileBase64 = decode(file.buffer.toString('base64'));
    const file_path = `${user.id}/${visa_type.data}/${uploadingFor.data}/${doc_number}.${fileExt}`;

    // Check if the file already exists
    const { data: existingFile, error: checkError } = await supabaseAdmin.storage
      .from(bucket_name)
      .list(file_path.split('/').slice(0, -1).join('/')); // List files in the folder

    if (checkError) throw checkError;

    const fileExists = existingFile?.some((file) => file.name === file_path.split('/').pop());

    // If file exists, delete it first
    if (fileExists) {
      const { error: deleteError } = await supabaseAdmin.storage.from(bucket_name).remove([file_path]);

      if (deleteError) throw deleteError;
    }

    // Upload new file
    const { data, error } = await supabaseAdmin.storage
      .from(bucket_name)
      .upload(file_path, fileBase64, { contentType: mimeType });

    if (error) throw error;

    //console.log(visa_type.data, uploadingFor.data, user.id);

    const findDoc = await supabaseAdmin
      .from('documents')
      .select('*')
      .eq('user_id', user.id)
      .eq('visa_type', visa_type.data)
      .eq('document_type', uploadingFor.data);

    const checkFilePath = findDoc.data.find((doc) => doc.file_path === file_path);

    if (!checkFilePath && findDoc.data.length >= max_doc_number) {
      return res
        .status(400)
        .json({ success: false, message: 'You have exceeded the maximum number of documents for this category' });
    }

    if (checkFilePath) {
      const { error: updateErr } = await supabaseAdmin
        .from('documents')
        .update({ file_path: file_path })
        .eq('user_id', user.id)
        .eq('visa_type', visa_type.data)
        .eq('document_type', uploadingFor.data)
        .eq('file_path', checkFilePath.file_path);
      //console.log('updateErr', updateErr);
      if (updateErr) throw updateErr;
    } else {
      const addToDb = await supabaseAdmin.from('documents').insert({
        user_id: user.id,
        visa_type: visa_type.data,
        document_type: uploadingFor.data,
        file_path: file_path,
      });

      if (addToDb.error) throw addToDb.error;
    }

    const saveApplicationStatus = await supabaseAdmin.from('application_trackings').upsert(
      [
        {
          email: user.email,
          stage: 'Document Upload',
          status: 'Ongoing',
          comment: 'Document Upload in progress',
        },
      ],
      { onConflict: 'email' }
    );

    if (saveApplicationStatus.error) return res.status(400).json({ error: saveApplicationStatus.error.message });

    // get public url of the uploaded file
    const { data: fileUrl } = await supabaseAdmin.storage
      .from(bucket_name)
      .createSignedUrl(file_path, Number(config.supabase.document_expiry));

    // //console.log(file);
    res.status(200).json({ fileUrl: fileUrl });
  } catch (error) {
    //console.log(error);
    res.status(500).json({ error: error });
  }
});

/**
 * @swagger
 * /api/v1/users/remove-document:
 *   post:
 *     summary: Remove a document
 *     tags: [Users]
 *     description: Remove a document based on the provided file path.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               file_path:
 *                 type: string
 *                 example: "path/to/your/document"
 *     responses:
 *       200:
 *         description: File removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "File removed successfully"
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Please provide a file path"
 *                 error:
 *                   type: string
 *                   example: "Error message"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "An error occurred while removing the file"
 */

const removeDocument = catchAsync(async (req: Request, res: Response) => {
  const { file_path } = req.body;

  if (!file_path) {
    return res.status(400).json({ message: 'Please provide a file path' });
  }

  const bucket_name = config.supabase.bucket_name;

  const { error } = await supabaseAdmin.storage.from(bucket_name).remove([file_path]);

  if (error) return res.status(400).json({ error: error.message });

  res.status(200).json({ message: 'File removed successfully' });
});

/**
 * @swagger
 * /api/v1/users/update-trackings:
 *   post:
 *     summary: Update application trackings
 *     tags: [Users]
 *     description: Update application trackings based on the provided user email.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *               stage:
 *                 type: string
 *               visa_type:
 *                 type: string
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Trackings updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
const updateTrackings = catchAsync(async (req: Request, res: Response) => {
  const { user, status, stage, visa_type, comment } = req.body;

  if (!user) {
    return res.status(400).json({ error: 'User not found' });
  }

  console.log('user-details', user);

  try {
    const { data, error } = await supabaseAdmin
      .from('application_trackings')
      .update({
        status,
        stage,
        comment,
        visa_type,
      })
      .eq('email', user.email);

    if (error) return res.status(400).json({ error: error.message });

    res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/v1/users/get-signed-url:
 *   post:
 *     summary: Get signed URL for a document
 *     tags: [Users]
 *     description: Retrieve a signed URL for a document based on user ID, visa type, and document type.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               visa_type:
 *                 type: string
 *                 enum: ['UK Global Talent Visa', 'US EB-1/EB-2 VISA', 'CANADA EXPRESS ENTRY', 'DUBAI GOLDEN VISA']
 *               uploadingFor:
 *                 type: string
 *                 enum: ['Resume', 'Personal Statement', 'Letter of Recommendation', 'Degree Certificate', 'Language Proficiency Result', 'Proof of Funds']
 *     responses:
 *       200:
 *         description: Signed URL retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 fileUrl:
 *                   type: string
 *                   example: "https://your-supabase-url.com/storage/v1/object/public/bucket_name/user123/visa_type/uploadingFor"
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Please upload a file"
 *                 error:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       path:
 *                         type: string
 *                         example: "visa_type"
 *                       message:
 *                         type: string
 *                         example: "Invalid visa type"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "An error occurred while uploading the file"
 */

const getSignedUrl = catchAsync(async (req: Request, res: Response) => {
  try {
    const { user } = req.body;

    const visa_type = visaTypeSchema.safeParse(req.body.visa_type);
    const uploadingFor = doc_typeSchema.safeParse(req.body.uploadingFor);

    if (!visa_type.success) {
      res.status(400).json({ message: 'Please provide appropriate valid visa type', error: visa_type.error.errors });
      return;
    }

    if (!uploadingFor.success) {
      res
        .status(400)
        .json({ message: 'Please provide appropriate valid document type', error: uploadingFor.error.errors });
      return;
    }

    if (!user) {
      res.status(400).json({ message: 'User not provided' });
      return;
    }

    const bucket_name = config.supabase.bucket_name;

    const { data } = await supabaseAdmin
      .from('documents')
      .select('*')
      .eq('user_id', user.id)
      .eq('visa_type', visa_type.data)
      .eq('document_type', uploadingFor.data)
      .single();

    // if (error) throw error;

    if (!data) {
      res.status(404).json({ message: 'Document not found' });
      return;
    }
    // //console.log(data);

    // get public url of the uploaded file

    const { data: fileUrl } = await supabaseAdmin.storage
      .from(bucket_name)
      .createSignedUrl(data.file_path, Number(config.supabase.document_expiry));

    //console.log(config.supabase.document_expiry);

    res.status(200).json({ fileUrl: fileUrl });
  } catch (error) {
    //console.log(error);
    res.status(500).json({ error: error });
  }
});

export const UserController = {
  // register,
  // login,
  allUsers,
  takeAssessMentt,
  uploadDocuments,
  getSignedUrl,
  getAssessmentScore,
  removeDocument,
  updateTrackings,
};
