import mongoose from 'mongoose';

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
    enum: ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD']
  }
}, {
  timestamps: true
});

export default mongoose.model('Bank', bankSchema);