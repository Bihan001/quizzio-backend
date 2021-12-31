import express from 'express';
import * as examController from '../../../controllers/examController';
import auth from '../../../middlewares/auth';

const router = express.Router();
router.get('/create-tables', examController.createTables);
router.post('/create', examController.createExam);
router.post('/edit', examController.editExam);
router.get('/all-upcoming-exams', examController.getAllUpcomingExams);
router.get('/details/:id', examController.getExamDetails);

export default router;
