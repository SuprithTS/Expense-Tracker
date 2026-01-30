const fs = require('fs');
const path = require('path');

const projectStructure = {
  'backend': {
    'src': {
      'config': {
        'db.js': `import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(\`✅ MongoDB Connected: \${conn.connection.host}\`);
  } catch (error) {
    console.error(\`❌ MongoDB Connection Error: \${error.message}\`);
    process.exit(1);
  }
};

export default connectDB;`
      },
      'models': {
        'User.js': `import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\\S+@\\S+\\.\\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  refreshToken: {
    type: String,
    select: false
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);`,
        'Bank.js': `import mongoose from 'mongoose';

const bankSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  bankName: {
    type: String,
    required: [true, 'Bank name is required'],
    trim: true
  },
  accountType: {
    type: String,
    enum: ['Savings', 'Credit', 'Wallet', 'Cash'],
    required: [true, 'Account type is required']
  },
  initialBalance: {
    type: Number,
    required: [true, 'Initial balance is required'],
    min: [0, 'Initial balance cannot be negative']
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'INR', 'JPY']
  }
}, {
  timestamps: true
});

export default mongoose.model('Bank', bankSchema);`,
        'Transaction.js': `import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  bankId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bank',
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0.01, 'Amount must be greater than 0']
  },
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: [true, 'Transaction type is required']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Salary', 'Freelance', 'Investment', 'Healthcare', 'Education', 'Travel', 'Rent', 'Other']
  },
  date: {
    type: Date,
    required: [true, 'Transaction date is required'],
    default: Date.now
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters']
  }
}, {
  timestamps: true
});

transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ bankId: 1, date: -1 });

export default mongoose.model('Transaction', transactionSchema);`
      },
      'controllers': {
        'authController.js': `import User from '../models/User.js';
import { generateAccessToken, generateRefreshToken } from '../utils/tokenManager.js';
import { signupSchema, loginSchema } from '../utils/validation.js';

export const signup = async (req, res, next) => {
  try {
    const validatedData = signupSchema.parse(req.body);
    const existingUser = await User.findOne({ email: validatedData.email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }
    const user = await User.create(validatedData);
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    user.refreshToken = refreshToken;
    await user.save();
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: { user: { id: user._id, name: user.name, email: user.email }, accessToken, refreshToken }
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const user = await User.findOne({ email: validatedData.email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const isPasswordValid = await user.comparePassword(validatedData.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    user.refreshToken = refreshToken;
    await user.save();
    res.json({
      success: true,
      message: 'Login successful',
      data: { user: { id: user._id, name: user.name, email: user.email }, accessToken, refreshToken }
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { refreshToken: null });
    res.json({ success: true, message: 'Logout successful' });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      success: true,
      data: { user: { id: user._id, name: user.name, email: user.email, createdAt: user.createdAt } }
    });
  } catch (error) {
    next(error);
  }
};`,
        'bankController.js': `import Bank from '../models/Bank.js';
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
};`,
        'transactionController.js': `import Transaction from '../models/Transaction.js';
import Bank from '../models/Bank.js';
import { transactionSchema } from '../utils/validation.js';

export const getAllTransactions = async (req, res, next) => {
  try {
    const { bankId, category, type } = req.query;
    const query = { userId: req.user.id };
    if (bankId) query.bankId = bankId;
    if (category) query.category = category;
    if (type) query.type = type;
    const transactions = await Transaction.find(query).populate('bankId', 'bankName accountType').sort({ date: -1 });
    res.json({ success: true, data: { transactions } });
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
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    const transactions = await Transaction.find({
      userId: req.user.id,
      date: { $gte: startDate, $lte: endDate }
    });
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    res.json({
      success: true,
      data: { summary: { totalIncome, totalExpense, netSavings: totalIncome - totalExpense } }
    });
  } catch (error) {
    next(error);
  }
};

export const exportTransactions = async (req, res, next) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.id }).populate('bankId', 'bankName').sort({ date: -1 });
    let csv = 'Date,Bank,Type,Category,Amount,Description\\n';
    transactions.forEach(t => {
      csv += \`\${t.date.toISOString().split('T')[0]},\${t.bankId.bankName},\${t.type},\${t.category},\${t.amount},"\${t.description}"\\n\`;
    });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');
    res.send(csv);
  } catch (error) {
    next(error);
  }
};`
      },
      'middleware': {
        'auth.js': `import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    req.user = { id: user._id, email: user.email };
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};`,
        'errorHandler.js': `import { ZodError } from 'zod';

export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: err.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
    });
  }
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => ({ field: e.path, message: e.message }));
    return res.status(400).json({ success: false, message: 'Validation error', errors });
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({ success: false, message: \`\${field} already exists\` });
  }
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
};`
      },
      'routes': {
        'authRoutes.js': `import express from 'express';
import { signup, login, logout, getProfile } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', protect, logout);
router.get('/profile', protect, getProfile);

export default router;`,
        'bankRoutes.js': `import express from 'express';
import { getAllBanks, createBank, deleteBank } from '../controllers/bankController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
router.use(protect);

router.route('/').get(getAllBanks).post(createBank);
router.route('/:id').delete(deleteBank);

export default router;`,
        'transactionRoutes.js': `import express from 'express';
import { getAllTransactions, createTransaction, deleteTransaction, getMonthlyAnalytics, exportTransactions } from '../controllers/transactionController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
router.use(protect);

router.get('/export', exportTransactions);
router.get('/analytics/monthly', getMonthlyAnalytics);
router.route('/').get(getAllTransactions).post(createTransaction);
router.route('/:id').delete(deleteTransaction);

export default router;`
      },
      'utils': {
        'validation.js': `import { z } from 'zod';

export const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required')
});

export const bankSchema = z.object({
  bankName: z.string().min(1, 'Bank name is required'),
  accountType: z.enum(['Savings', 'Credit', 'Wallet', 'Cash']),
  initialBalance: z.number().min(0, 'Balance cannot be negative'),
  currency: z.enum(['USD', 'EUR', 'GBP', 'INR', 'JPY']).default('USD')
});

export const transactionSchema = z.object({
  bankId: z.string().min(1, 'Bank ID is required'),
  amount: z.number().positive('Amount must be positive'),
  type: z.enum(['income', 'expense']),
  category: z.enum(['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Salary', 'Freelance', 'Investment', 'Healthcare', 'Education', 'Travel', 'Rent', 'Other']),
  date: z.string().or(z.date()),
  description: z.string().min(1, 'Description is required').max(200)
});`,
        'tokenManager.js': `import jwt from 'jsonwebtoken';

export const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '15m' });
};

export const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' });
};`
      },
      'server.js': `import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import bankRoutes from './routes/bankRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests'
});
app.use('/api/', limiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/banks', bankRoutes);
app.use('/api/transactions', transactionRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(\`🚀 Server running on port \${PORT}\`);
});`
    },
    'package.json': `{
  "name": "expense-tracker-backend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^8.0.3",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "dotenv": "^16.3.1",
    "cors": "^2.8.5",
    "express-rate-limit": "^7.1.5",
    "helmet": "^7.1.0",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}`,
    '.env.example': `PORT=5000
MONGODB_URI=mongodb://localhost:27017/expense-tracker
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
NODE_ENV=development
CLIENT_URL=http://localhost:5173`,
    '.gitignore': `node_modules
.env
.DS_Store
*.log`
  }
};

function createStructure(basePath, structure) {
  for (const [name, content] of Object.entries(structure)) {
    const fullPath = path.join(basePath, name);
    
    if (typeof content === 'object' && content !== null) {
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }
      createStructure(fullPath, content);
    } else {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ Created: ${fullPath}`);
    }
  }
}

const projectRoot = path.join(process.cwd(), 'expense-tracker');

if (!fs.existsSync(projectRoot)) {
  fs.mkdirSync(projectRoot, { recursive: true });
}

console.log('🚀 Generating Expense Tracker Backend...\n');
createStructure(projectRoot, projectStructure);
console.log('\n✅ Backend structure created successfully!');
console.log('\n📦 Next steps:');
console.log('1. cd expense-tracker/backend');
console.log('2. npm install');
console.log('3. Copy .env.example to .env and configure');
console.log('4. npm run dev');