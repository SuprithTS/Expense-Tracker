import express from 'express';
import { getAllTransactions, createTransaction, updateTransaction, deleteTransaction, getMonthlyAnalytics, exportTransactions } from '../controllers/transactionController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
router.use(protect);

router.get('/export', exportTransactions);
router.get('/analytics/monthly', getMonthlyAnalytics);
router.route('/').get(getAllTransactions).post(createTransaction);
router.route('/:id').put(updateTransaction).delete(deleteTransaction);

export default router;