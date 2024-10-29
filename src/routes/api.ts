import express from 'express';
import { getUsers, getUserById } from '../controllers/userController.js';
<<<<<<< HEAD
import { getPackageInfo } from '../controllers/packageController.js';
=======
>>>>>>> 8f545f1 (merged in from main)

const router = express.Router();

router.get('/users', getUsers);
router.get('/users/:id', getUserById);

<<<<<<< HEAD
router.get('/packages', getPackageInfo);

=======
>>>>>>> 8f545f1 (merged in from main)
export default router;