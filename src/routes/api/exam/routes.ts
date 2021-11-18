import express from 'express';
import * as examController from '../../../controllers/examController';
import auth from '../../../middlewares/auth';

const router = express.Router();
router.get('/createTables', examController.createTables);
router.post('/createExam', examController.createExam);
router.post('/editExam', examController.editExam);

export default router;
