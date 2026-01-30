import express from 'express';
import { getAllBanks, createBank, updateBank, deleteBank } from '../controllers/bankController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
router.use(protect);

router.route('/').get(getAllBanks).post(createBank);
router.route('/:id').put(updateBank).delete(deleteBank);

export default router;