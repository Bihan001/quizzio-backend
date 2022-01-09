import express from 'express';
import * as userController from '../../../controllers/userController';
import auth from '../../../middlewares/auth';
import upload from '../../../utils/multer';

const router = express.Router();

router.post('/login', userController.loginUser);
router.post('/register', userController.registerUser);
router.post('/logout', auth, userController.logoutUser);
router.get('/current', auth, userController.getCurrentUser);
router.get('/exams-hosted', auth, userController.getExamHosted);
router.get('/exams-given', auth, userController.getExamGiven);
router.get('/:id', userController.getuser);
router.patch('/', auth, upload.single('image'), userController.editUser);

export default router;
