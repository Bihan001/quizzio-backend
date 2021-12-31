import express from 'express';
import * as userController from '../../../controllers/userController';
import auth from '../../../middlewares/auth';
import upload from '../../../utils/multer';

const router = express.Router();
router.post('/get', auth, userController.getuser);
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.post('/logout', auth, userController.logoutUser);
router.post('/edit', upload.single('image'), userController.editUser);
router.get('/get-exam', userController.getExam);
router.post('/register-in-exam', userController.registerInExam);

export default router;
