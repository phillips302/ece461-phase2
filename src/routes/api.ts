import express from 'express';
import { getUsers, getUserById } from '../controllers/userController.js';
import { getPackageInfo } from '../controllers/packageController.js';

const router = express.Router();

router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.get('/packages', getPackageInfo);

export default router;