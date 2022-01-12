import express from 'express';
import * as examController from '../../../controllers/examController';
import auth from '../../../middlewares/auth';

const router = express.Router();
router.get('/testing-route', examController.testing);
router.get('/tags', examController.getTags);
router.get('/question-types', examController.getQuestionTypes);
router.get('/create-tables', examController.createTables);
router.post('/create', auth, examController.createExam);
router.get('/evaluate/force', examController.forceEvaluateExam);
router.get('/exam-registered', auth, examController.examRegisterStatus);
router.get('/solution', auth, examController.getExamSolution);
router.get('/scores', auth, examController.getExamScores);
router.patch('/:id', auth, examController.editExam);
router.post('/all', examController.getExams);
router.get('/:id', examController.getExamDetails);
router.get('/:id/start', auth, examController.startExam);
router.post('/register', auth, examController.registerInExam);
router.post('/submit', auth, examController.submitExam);

export default router;
