import express from 'express';
import { UserController } from './users.controller';
import multer from 'multer';
import authorize from './user.middleware';

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// router.post('/login', UserController.login);
router.get('/all', UserController.allUsers);
router.post('/take-assessment', UserController.takeAssessMentt);
// router.use
router.post('/upload', upload.single('file'), authorize, UserController.uploadDocuments);
router.post('/get-signed-url', authorize, UserController.getSignedUrl);
router.get('/get-score', authorize, UserController.getAssessmentScore);

export const UserRoutes = router;
