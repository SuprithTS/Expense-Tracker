const fs = require('fs');
const path = require('path');

const frontendStructure = {
  'frontend': {
    'src': {
      'components': {
        'layout': {
          'Sidebar.jsx': `import { Home, Wallet, History, BarChart3, LogOut, User, X } from 'lucide-react';

export default function Sidebar({ currentPage, setCurrentPage, sidebarOpen, setSidebarOpen, user, onLogout, darkMode }) {
  const menuItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'banks', icon: Wallet, label: 'Bank Accounts' },
    { id: 'transactions', icon: History, label: 'Transactions' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' }
  ];

  return (
    <div className={\`fixed inset-y-0 left-0 z-50 w-64 transform \${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 \${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-r\`}>
      <div className="flex items-center justify-between p-6 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <span className={\`font-bold text-xl \${darkMode ? 'text-white' : 'text-gray-800'}\`}>ExpenseTrack</span>
        </div>
        <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
          <X className={darkMode ? 'text-gray-400' : 'text-gray-600'} />
        </button>
      </div>

      <nav className="p-4 space-y-2">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => setCurrentPage(item.id)}
            className={\`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all \${
              currentPage === item.id ? 'bg-indigo-600 text-white' : darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
            }\`}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="absolute bottom-0 w-full p-4 border-t border-gray-700">
        <div className={\`flex items-center gap-3 p-3 rounded-lg \${darkMode ? 'bg-gray-700' : 'bg-gray-100'} mb-2\`}>
          <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className={\`font-medium truncate \${darkMode ? 'text-white' : 'text-gray-800'}\`}>{user?.name}</p>
            <p className={\`text-sm truncate \${darkMode ? 'text-gray-400' : 'text-gray-600'}\`}>{user?.email}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className={\`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all \${darkMode ? 'text-red-400 hover:bg-gray-700' : 'text-red-600 hover:bg-gray-100'}\`}
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}`,
          'Header.jsx': `import { Moon, Sun, Menu } from 'lucide-react';

export default function Header({ darkMode, setDarkMode, setSidebarOpen, sidebarOpen }) {
  return (
    <header className={\`sticky top-0 z-40 \${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-6 py-4\`}>
      <div className="flex items-center justify-between">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={\`p-2 rounded-lg \${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}\`}
        >
          <Menu className={\`w-6 h-6 \${darkMode ? 'text-gray-300' : 'text-gray-700'}\`} />
        </button>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={\`p-2 rounded-lg \${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}\`}
        >
          {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-700" />}
        </button>
      </div>
    </header>
  );
}`
        },
        'auth': {
          'LoginPage.jsx': `import { useState } from 'react';
import { Wallet } from 'lucide-react';

export default function LoginPage({ onLogin, onSwitchToSignup, darkMode }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onLogin(email, password);
    setLoading(false);
  };

  return (
    <div className={\`min-h-screen flex items-center justify-center \${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-indigo-100'}\`}>
      <div className={\`w-full max-w-md p-8 rounded-2xl shadow-2xl \${darkMode ? 'bg-gray-800' : 'bg-white'}\`}>
        <div className="text-center mb-8">
          <div className={\`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 \${darkMode ? 'bg-indigo-600' : 'bg-indigo-500'}\`}>
            <Wallet className="w-8 h-8 text-white" />
          </div>
          <h1 className={\`text-3xl font-bold \${darkMode ? 'text-white' : 'text-gray-800'}\`}>Expense Tracker</h1>
          <p className={\`mt-2 \${darkMode ? 'text-gray-400' : 'text-gray-600'}\`}>Welcome back!</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={\`block text-sm font-medium mb-2 \${darkMode ? 'text-gray-300' : 'text-gray-700'}\`}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={\`w-full px-4 py-3 rounded-lg border \${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-indigo-500 outline-none\`}
              placeholder="john@example.com"
              required
            />
          </div>
          <div>
            <label className={\`block text-sm font-medium mb-2 \${darkMode ? 'text-gray-300' : 'text-gray-700'}\`}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={\`w-full px-4 py-3 rounded-lg border \${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-indigo-500 outline-none\`}
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={onSwitchToSignup}
            className={\`text-sm \${darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700'}\`}
          >
            Don't have an account? Sign up
          </button>
        </div>
      </div>
    </div>
  );
}`
        }
      },
      'pages': {
        'Dashboard.jsx': `import { DollarSign, TrendingUp, TrendingDown, Wallet } from 'lucide-react';

export default function Dashboard({ banks, transactions, selectedMonth, setSelectedMonth, darkMode }) {
  const totalBalance = banks.reduce((sum, bank) => sum + (bank.currentBalance || 0), 0);
  const monthTransactions = transactions.filter(t => new Date(t.date).getMonth() === selectedMonth);
  const monthlyIncome = monthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const monthlyExpense = monthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const savings = monthlyIncome - monthlyExpense;

  const stats = [
    { label: 'Total Balance', value: '$' + totalBalance.toFixed(2), icon: DollarSign, color: 'bg-blue-500' },
    { label: 'Monthly Income', value: '$' + monthlyIncome.toFixed(2), icon: TrendingUp, color: 'bg-green-500' },
    { label: 'Monthly Expense', value: '$' + monthlyExpense.toFixed(2), icon: TrendingDown, color: 'bg-red-500' },
    { label: 'Savings', value: '$' + savings.toFixed(2), icon: Wallet, color: savings >= 0 ? 'bg-purple-500' : 'bg-orange-500' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className={\`text-3xl font-bold \${darkMode ? 'text-white' : 'text-gray-800'}\`}>Dashboard</h1>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
          className={\`px-4 py-2 rounded-lg border \${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}\`}
        >
          {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((month, idx) => (
            <option key={idx} value={idx}>{month} 2026</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className={\`p-6 rounded-xl \${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg\`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={\`text-sm \${darkMode ? 'text-gray-400' : 'text-gray-600'}\`}>{stat.label}</p>
                <p className={\`text-2xl font-bold mt-2 \${darkMode ? 'text-white' : 'text-gray-800'}\`}>{stat.value}</p>
              </div>
              <div className={\`w-12 h-12 rounded-full \${stat.color} flex items-center justify-center\`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={\`p-6 rounded-xl \${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg\`}>
          <h2 className={\`text-xl font-bold mb-4 \${darkMode ? 'text-white' : 'text-gray-800'}\`}>Recent Transactions</h2>
          <div className="space-y-3">
            {transactions.slice(-5).reverse().map(transaction => {
              const bank = banks.find(b => b._id === transaction.bankId || b._id === transaction.bankId?._id);
              const bankName = bank?.bankName || transaction.bankId?.bankName || 'Unknown';
              const transDate = new Date(transaction.date).toLocaleDateString();
              return (
                <div key={transaction._id} className={\`flex items-center justify-between p-3 rounded-lg \${darkMode ? 'bg-gray-700' : 'bg-gray-50'}\`}>
                  <div className="flex items-center gap-3">
                    <div className={\`w-10 h-10 rounded-full \${transaction.type === 'income' ? 'bg-green-500' : 'bg-red-500'} flex items-center justify-center\`}>
                      {transaction.type === 'income' ? <TrendingUp className="w-5 h-5 text-white" /> : <TrendingDown className="w-5 h-5 text-white" />}
                    </div>
                    <div>
                      <p className={\`font-medium \${darkMode ? 'text-white' : 'text-gray-800'}\`}>{transaction.category}</p>
                      <p className={\`text-sm \${darkMode ? 'text-gray-400' : 'text-gray-600'}\`}>{bankName} • {transDate}</p>
                    </div>
                  </div>
                  <p className={\`font-bold \${transaction.type === 'income' ? 'text-green-500' : 'text-red-500'}\`}>
                    {transaction.type === 'income' ? '+' : '-'}$\{transaction.amount}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className={\`p-6 rounded-xl \${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg\`}>
          <h2 className={\`text-xl font-bold mb-4 \${darkMode ? 'text-white' : 'text-gray-800'}\`}>Bank Accounts</h2>
          <div className="space-y-3">
            {banks.map(bank => {
              const balance = (bank.currentBalance || bank.initialBalance).toFixed(2);
              return (
                <div key={bank._id} className={\`flex items-center justify-between p-3 rounded-lg \${darkMode ? 'bg-gray-700' : 'bg-gray-50'}\`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center">
                      <Wallet className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className={\`font-medium \${darkMode ? 'text-white' : 'text-gray-800'}\`}>{bank.bankName}</p>
                      <p className={\`text-sm \${darkMode ? 'text-gray-400' : 'text-gray-600'}\`}>{bank.accountType}</p>
                    </div>
                  </div>
                  <p className={\`font-bold \${darkMode ? 'text-white' : 'text-gray-800'}\`}>$\{balance}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}`
      },
      'services': {
        'api.js': `import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = 'Bearer ' + token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile')
};

export const bankAPI = {
  getAll: () => api.get('/banks'),
  create: (data) => api.post('/banks', data),
  delete: (id) => api.delete('/banks/' + id)
};

export const transactionAPI = {
  getAll: (params) => api.get('/transactions', { params }),
  create: (data) => api.post('/transactions', data),
  delete: (id) => api.delete('/transactions/' + id),
  getMonthlyAnalytics: (month, year) => api.get('/transactions/analytics/monthly', { params: { month, year } }),
  export: () => api.get('/transactions/export', { responseType: 'blob' })
};

export default api;`
      },
      'App.jsx': `import { useState, useEffect } from 'react';
import LoginPage from './components/auth/LoginPage';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Dashboard from './pages/Dashboard';
import { authAPI, bankAPI, transactionAPI } from './services/api';

function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [banks, setBanks] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
      fetchData();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchData = async () => {
    try {
      const [banksRes, transactionsRes] = await Promise.all([
        bankAPI.getAll(),
        transactionAPI.getAll()
      ]);
      setBanks(banksRes.data.data.banks);
      setTransactions(transactionsRes.data.data.transactions);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      const { user, accessToken } = response.data.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      setIsAuthenticated(true);
      await fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Login failed');
    }
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
      setBanks([]);
      setTransactions([]);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="text-white text-xl">Loading...</div>
    </div>;
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} onSwitchToSignup={() => {}} darkMode={darkMode} />;
  }

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className={\`min-h-screen \${darkMode ? 'bg-gray-900' : 'bg-gray-50'}\`}>
        <Sidebar
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          user={user}
          onLogout={handleLogout}
          darkMode={darkMode}
        />
        <div className={\`\${sidebarOpen ? 'lg:ml-64' : 'ml-0'} transition-all duration-300\`}>
          <Header darkMode={darkMode} setDarkMode={setDarkMode} setSidebarOpen={setSidebarOpen} sidebarOpen={sidebarOpen} />
          <main className="p-6">
            {currentPage === 'dashboard' && (
              <Dashboard
                banks={banks}
                transactions={transactions}
                selectedMonth={selectedMonth}
                setSelectedMonth={setSelectedMonth}
                darkMode={darkMode}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;`,
      'main.jsx': `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,
      'index.css': `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}`
    },
    'public': {
      'vite.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><path fill="#646cff" d="M64 0L16 64l48 48 48-48L64 0z"/></svg>`
    },
    'index.html': `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Expense Tracker</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`,
    'package.json': `{
  "name": "expense-tracker-frontend",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "axios": "^1.6.2",
    "lucide-react": "^0.263.1",
    "recharts": "^2.10.3"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.3.6",
    "vite": "^5.0.8"
  }
}`,
    'vite.config.js': `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
});`,
    'tailwind.config.js': `export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {},
  },
  plugins: [],
};`,
    'postcss.config.js': `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};`,
    '.env.example': `VITE_API_URL=http://localhost:5000/api`,
    '.gitignore': `node_modules
dist
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

console.log('🚀 Generating Expense Tracker Frontend...\n');
createStructure(projectRoot, frontendStructure);
console.log('\n✅ Frontend structure created successfully!');
console.log('\n📦 Next steps:');
console.log('1. cd expense-tracker/frontend');
console.log('2. npm install');
console.log('3. Copy .env.example to .env');
console.log('4. npm run dev');