import Transaction from '../models/Transaction.js';
import Bank from '../models/Bank.js';
import { transactionSchema } from '../utils/validation.js';

export const getAllTransactions = async (req, res, next) => {
  try {
    const { 
      bankId, 
      category, 
      type, 
      dateFrom, 
      dateTo, 
      search, 
      page = 1, 
      limit = 10 
    } = req.query;
    
    const query = { userId: req.user.id };
    
    if (bankId) query.bankId = bankId;
    if (category) query.category = category;
    if (type) query.type = type;
    if (search) {
      query.$or = [
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (dateFrom || dateTo) {
      query.date = {};
      if (dateFrom) query.date.$gte = new Date(dateFrom);
      if (dateTo) query.date.$lte = new Date(dateTo);
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Transaction.countDocuments(query);
    
    const transactions = await Transaction.find(query)
      .populate('bankId', 'bankName accountType currency')
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    res.json({ 
      success: true, 
      data: { 
        transactions,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      } 
    });
  } catch (error) {
    next(error);
  }
};

export const createTransaction = async (req, res, next) => {
  try {
    const validatedData = transactionSchema.parse(req.body);
    const bank = await Bank.findOne({ _id: validatedData.bankId, userId: req.user.id });
    if (!bank) {
      return res.status(404).json({ success: false, message: 'Bank not found' });
    }
    const transaction = await Transaction.create({ ...validatedData, userId: req.user.id });
    await transaction.populate('bankId', 'bankName accountType');
    res.status(201).json({ success: true, message: 'Transaction created', data: { transaction } });
  } catch (error) {
    next(error);
  }
};

export const updateTransaction = async (req, res, next) => {
  try {
    const validatedData = transactionSchema.parse(req.body);
    const bank = await Bank.findOne({ _id: validatedData.bankId, userId: req.user.id });
    if (!bank) {
      return res.status(404).json({ success: false, message: 'Bank not found' });
    }
    
    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      validatedData,
      { new: true }
    );
    
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }
    
    await transaction.populate('bankId', 'bankName accountType');
    res.json({ success: true, message: 'Transaction updated', data: { transaction } });
  } catch (error) {
    next(error);
  }
};

export const deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }
    res.json({ success: true, message: 'Transaction deleted' });
  } catch (error) {
    next(error);
  }
};

export const getMonthlyAnalytics = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, parseInt(month) + 1, 0, 23, 59, 59);
    
    const transactions = await Transaction.find({
      userId: req.user.id,
      date: { $gte: startDate, $lte: endDate }
    }).populate('bankId', 'bankName');

    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

    // Daily breakdown
    const dailyBreakdown = [];
    const daysInMonth = new Date(year, parseInt(month) + 1, 0).getDate();
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dayStart = new Date(year, month, day);
      const dayEnd = new Date(year, month, day, 23, 59, 59);
      const dayTransactions = transactions.filter(t => 
        t.date >= dayStart && t.date <= dayEnd
      );
      
      const dayIncome = dayTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      const dayExpense = dayTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
      
      if (dayIncome > 0 || dayExpense > 0) {
        dailyBreakdown.push({
          _id: dayStart,
          totalIncome: dayIncome,
          totalExpense: dayExpense
        });
      }
    }

    // Category breakdown
    const categoryMap = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      if (!categoryMap[t.category]) {
        categoryMap[t.category] = { total: 0, count: 0 };
      }
      categoryMap[t.category].total += t.amount;
      categoryMap[t.category].count += 1;
    });

    const categoryBreakdown = Object.entries(categoryMap).map(([category, data]) => ({
      _id: category,
      total: data.total,
      count: data.count
    }));

    res.json({
      success: true,
      data: {
        totalIncome,
        totalExpense,
        netSavings: totalIncome - totalExpense,
        dailyBreakdown,
        categoryBreakdown
      }
    });
  } catch (error) {
    next(error);
  }
};

export const exportTransactions = async (req, res, next) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.id }).populate('bankId', 'bankName').sort({ date: -1 });
    let csv = 'Date,Bank,Type,Category,Amount,Description\n';
    transactions.forEach(t => {
      csv += `${t.date.toISOString().split('T')[0]},${t.bankId.bankName},${t.type},${t.category},${t.amount},"${t.description}"\n`;
    });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');
    res.send(csv);
  } catch (error) {
    next(error);
  }
};