import { z } from 'zod';

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
  currency: z.enum(['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD']).default('USD')
});

export const transactionSchema = z.object({
  bankId: z.string().min(1, 'Bank ID is required'),
  amount: z.number().positive('Amount must be positive'),
  type: z.enum(['income', 'expense']),
  category: z.enum(['Food', 'Travel', 'Rent', 'Shopping', 'Entertainment', 'Healthcare', 'Education', 'Utilities', 'Transport', 'Bills', 'Salary', 'Freelance', 'Investment', 'Business', 'Gift', 'Other']),
  date: z.string().or(z.date()),
  description: z.string().min(1, 'Description is required').max(200)
});