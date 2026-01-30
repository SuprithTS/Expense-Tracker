# 💰 ExpenseTracker - Full Stack Expense Management Application

A modern, full-featured expense tracking application built with React, Node.js, Express, and MongoDB. Track your finances across multiple bank accounts with beautiful analytics and insights.

![ExpenseTracker Dashboard](https://via.placeholder.com/800x400/1f2937/ffffff?text=ExpenseTracker+Dashboard)

## ✨ Features

### 🏦 Bank Account Management
- Add multiple bank accounts (Savings, Credit, Wallet, Cash)
- Support for multiple currencies (USD, EUR, GBP, INR, CAD, AUD)
- Real-time balance calculation
- Edit and delete bank accounts with confirmation
- Track total income, expenses, and current balance per account

### 💸 Transaction Tracking
- Add income and expense transactions
- Categorized transactions (Food, Travel, Rent, Shopping, Salary, etc.)
- Rich filtering options (by bank, category, date range, search)
- Pagination and sorting
- Edit and delete transactions
- Automatic balance updates

### 📊 Analytics & Visualization
- **Line Chart**: Daily expense trends
- **Bar Chart**: Income vs Expense comparison
- **Pie Chart**: Category-wise expense breakdown
- **Bank Balance Comparison**: Visual comparison of all accounts
- Monthly analytics with detailed breakdowns
- Export transactions to CSV

### 🎨 Modern UI/UX
- Dark and light theme support
- Responsive design for all devices
- Smooth animations and transitions
- Card-based layout
- Mobile-friendly sidebar navigation
- Beautiful icons and visual indicators

### 🔐 Security Features
- JWT-based authentication
- Password hashing with bcrypt
- Protected API routes
- Input validation and sanitization
- Rate limiting
- Secure environment variables

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd expense-tracker
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your MongoDB connection string
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   cp .env.example .env
   # Edit .env if needed (API URL)
   npm run dev
   ```

4. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## 📁 Project Structure

```
expense-tracker/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js              # Database configuration
│   │   ├── controllers/
│   │   │   ├── authController.js   # Authentication logic
│   │   │   ├── bankController.js   # Bank account CRUD
│   │   │   └── transactionController.js # Transaction CRUD & Analytics
│   │   ├── middleware/
│   │   │   ├── auth.js            # JWT authentication middleware
│   │   │   └── errorHandler.js    # Global error handling
│   │   ├── models/
│   │   │   ├── User.js            # User schema
│   │   │   ├── Bank.js            # Bank account schema
│   │   │   └── Transaction.js     # Transaction schema
│   │   ├── routes/
│   │   │   ├── authRoutes.js      # Authentication routes
│   │   │   ├── bankRoutes.js      # Bank account routes
│   │   │   └── transactionRoutes.js # Transaction routes
│   │   ├── utils/
│   │   │   ├── tokenManager.js    # JWT token utilities
│   │   │   └── validation.js      # Input validation schemas
│   │   └── server.js              # Express server setup
│   ├── .env.example
│   ├── .gitignore
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   ├── LoginPage.jsx   # Login component
│   │   │   │   └── SignupPage.jsx  # Signup component
│   │   │   └── layout/
│   │   │       ├── Sidebar.jsx     # Navigation sidebar
│   │   │       └── Header.jsx      # Top header
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx       # Main dashboard
│   │   │   ├── BankAccounts.jsx    # Bank management
│   │   │   ├── Transactions.jsx    # Transaction management
│   │   │   └── Analytics.jsx       # Charts and analytics
│   │   ├── services/
│   │   │   └── api.js              # API service layer
│   │   ├── App.jsx                 # Main app component
│   │   ├── main.jsx               # React entry point
│   │   └── index.css              # Global styles
│   ├── public/
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── postcss.config.js
└── README.md
```

## 🗄️ Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  createdAt: Date
}
```

### Bank Model
```javascript
{
  userId: ObjectId (ref: User),
  bankName: String,
  accountType: String (Savings/Credit/Wallet/Cash),
  initialBalance: Number,
  currency: String,
  createdAt: Date
}
```

### Transaction Model
```javascript
{
  userId: ObjectId (ref: User),
  bankId: ObjectId (ref: Bank),
  amount: Number,
  type: String (income/expense),
  category: String,
  date: Date,
  description: String,
  createdAt: Date
}
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile

### Bank Accounts
- `GET /api/banks` - Get all user banks
- `POST /api/banks` - Create new bank account
- `PUT /api/banks/:id` - Update bank account
- `DELETE /api/banks/:id` - Delete bank account

### Transactions
- `GET /api/transactions` - Get transactions (with filtering & pagination)
- `POST /api/transactions` - Create new transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction
- `GET /api/transactions/analytics/monthly` - Get monthly analytics
- `GET /api/transactions/export` - Export transactions as CSV

## 🎯 Key Features Implemented

### ✅ Bank Account Management
- [x] Add multiple bank accounts
- [x] Support for different account types
- [x] Multiple currency support
- [x] Real-time balance calculation
- [x] Edit/Delete functionality with confirmation

### ✅ Transaction Management
- [x] Income and expense tracking
- [x] Category-based organization
- [x] Advanced filtering (bank, category, date, search)
- [x] Pagination and sorting
- [x] CRUD operations
- [x] Automatic balance updates

### ✅ Analytics & Visualization
- [x] Daily expense line chart
- [x] Income vs expense bar chart
- [x] Category-wise pie chart
- [x] Bank balance comparison
- [x] Monthly analytics
- [x] CSV export functionality

### ✅ UI/UX Features
- [x] Dark/Light theme toggle
- [x] Responsive design
- [x] Mobile-friendly navigation
- [x] Smooth animations
- [x] Loading states
- [x] Error handling
- [x] Form validation

### ✅ Security & Performance
- [x] JWT authentication
- [x] Password hashing
- [x] Input validation
- [x] Protected routes
- [x] Error handling middleware
- [x] API rate limiting ready

## 🛠️ Technologies Used

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Recharts** - Chart library for analytics
- **Lucide React** - Beautiful icons
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Zod** - Input validation
- **Nodemon** - Development server

## 🚀 Deployment

### Backend Deployment
1. Set up MongoDB Atlas or use local MongoDB
2. Configure environment variables
3. Deploy to platforms like Heroku, Railway, or DigitalOcean
4. Update CORS settings for production

### Frontend Deployment
1. Build the production version: `npm run build`
2. Deploy to Vercel, Netlify, or any static hosting
3. Update API URL in environment variables

## 📝 Environment Variables

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/expense-tracker
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Icons by [Lucide](https://lucide.dev/)
- Charts by [Recharts](https://recharts.org/)
- UI components inspired by modern design systems
- Built with love and lots of coffee ☕

---

**Happy Expense Tracking! 💰📊**