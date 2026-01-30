import Bank from '../models/Bank.js';
import Transaction from '../models/Transaction.js';
import { bankSchema } from '../utils/validation.js';

export const getAllBanks = async (req, res, next) => {
  try {
    const banks = await Bank.find({ userId: req.user.id }).sort({ createdAt: -1 });
    const banksWithBalance = await Promise.all(
      banks.map(async (bank) => {
        const transactions = await Transaction.find({ bankId: bank._id });
        const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        const currentBalance = bank.initialBalance + totalIncome - totalExpense;
        return { ...bank.toObject(), currentBalance, totalIncome, totalExpense };
      })
    );
    res.json({ success: true, data: { banks: banksWithBalance } });
  } catch (error) {
    next(error);
  }
};

export const createBank = async (req, res, next) => {
  try {
    const validatedData = bankSchema.parse(req.body);
    const bank = await Bank.create({ ...validatedData, userId: req.user.id });
    res.status(201).json({
      success: true,
      message: 'Bank account created successfully',
      data: { bank: { ...bank.toObject(), currentBalance: bank.initialBalance, totalIncome: 0, totalExpense: 0 } }
    });
  } catch (error) {
    next(error);
  }
};

export const updateBank = async (req, res, next) => {
  try {
    const validatedData = bankSchema.parse(req.body);
    const bank = await Bank.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      validatedData,
      { new: true }
    );
    if (!bank) {
      return res.status(404).json({ success: false, message: 'Bank not found' });
    }
    
    // Calculate current balance
    const transactions = await Transaction.find({ bankId: bank._id });
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const currentBalance = bank.initialBalance + totalIncome - totalExpense;
    
    res.json({
      success: true,
      message: 'Bank account updated successfully',
      data: { bank: { ...bank.toObject(), currentBalance, totalIncome, totalExpense } }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteBank = async (req, res, next) => {
  try {
    const bank = await Bank.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!bank) {
      return res.status(404).json({ success: false, message: 'Bank not found' });
    }
    await Transaction.deleteMany({ bankId: req.params.id });
    res.json({ success: true, message: 'Bank deleted successfully' });
  } catch (error) {
    next(error);
  }
};