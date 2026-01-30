# Expense Tracker

A full-stack expense tracking application built with React, Node.js, Express, and MongoDB. Track your income and expenses across multiple bank accounts with support for multiple currencies.

## Features

### 🏦 Bank Account Management
- Add, edit, and delete bank accounts
- Support for multiple account types (Savings, Credit, Wallet, Cash)
- Multi-currency support (USD, EUR, GBP, INR, CAD, AUD)
- Real-time balance calculations
- Total income and expense tracking per account

### 💰 Transaction Management
- Add income and expense transactions
- Categorized transactions (Food, Travel, Rent, Salary, etc.)
- Advanced filtering and search
- Pagination for large datasets
- Date-based filtering
- Real-time updates across all pages

### 📊 Analytics & Reporting
- Interactive charts using Recharts
- Monthly income vs expense analysis
- Category-wise expense breakdown
- Bank balance comparisons
- CSV export functionality
- Customizable date ranges

### 🎨 User Interface
- Modern, responsive design with Tailwind CSS
- Dark/Light theme support
- Mobile-friendly interface
- Smooth animations and transitions
- Intuitive navigation

### 🔐 Authentication & Security
- JWT-based authentication
- Secure password hashing with bcrypt
- Protected routes
- Session management

## Tech Stack

### Frontend
- **React 18** - UI library
- **React Router** - Client-side routing
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization
- **Lucide React** - Icons
- **Axios** - HTTP client
- **Vite** - Build tool

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **CORS** - Cross-origin requests

## Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd expense-tracker/backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/Expense_tracker
JWT_SECRET=your-super-secret-jwt-key-here
NODE_ENV=development
```

4. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd expense-tracker/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```env
VITE_API_URL=http://localhost:5000/api
```

4. Start the frontend development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5174`

## Usage

1. **Sign Up/Login**: Create an account or login with existing credentials
2. **Add Bank Accounts**: Set up your bank accounts with initial balances
3. **Record Transactions**: Add income and expense transactions
4. **View Analytics**: Monitor your spending patterns and financial health
5. **Export Data**: Download your transaction data as CSV

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Bank Accounts
- `GET /api/banks` - Get all bank accounts
- `POST /api/banks` - Create new bank account
- `PUT /api/banks/:id` - Update bank account
- `DELETE /api/banks/:id` - Delete bank account

### Transactions
- `GET /api/transactions` - Get all transactions (with filtering)
- `POST /api/transactions` - Create new transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction
- `GET /api/transactions/export` - Export transactions as CSV

## Currency Support

The application supports multiple currencies with proper symbol display:
- USD ($)
- EUR (€)
- GBP (£)
- INR (₹)
- CAD (C$)
- AUD (A$)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Screenshots

### Dashboard
![Dashboard](screenshots/dashboard.png)

### Bank Accounts
![Bank Accounts](screenshots/bank-accounts.png)

### Transactions
![Transactions](screenshots/transactions.png)

### Analytics
![Analytics](screenshots/analytics.png)

## Support

If you encounter any issues or have questions, please open an issue on GitHub.

## Acknowledgments

- Icons by [Lucide](https://lucide.dev/)
- Charts by [Recharts](https://recharts.org/)
- Styling by [Tailwind CSS](https://tailwindcss.com/)