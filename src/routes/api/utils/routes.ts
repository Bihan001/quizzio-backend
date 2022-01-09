import express from 'express';
import * as utilsController from '../../../controllers/utilsController';
import auth from '../../../middlewares/auth';
import upload from '../../../utils/multer';

const router = express.Router();

router.post('/upload/images', auth, upload.array('image'), utilsController.uploadImages);

export default router;
