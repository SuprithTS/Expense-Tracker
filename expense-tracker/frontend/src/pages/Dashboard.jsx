import { DollarSign, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { formatCurrency } from '../utils/currency';

export default function Dashboard({ banks = [], transactions = [], selectedMonth, setSelectedMonth, darkMode, refreshData }) {
  // Ensure we have valid arrays
  const safeBanks = Array.isArray(banks) ? banks : [];
  const safeTransactions = Array.isArray(transactions) ? transactions : [];
  
  // Calculate totals with error handling
  let totalBalance = 0;
  let monthlyIncome = 0;
  let monthlyExpense = 0;
  
  try {
    totalBalance = safeBanks.reduce((sum, bank) => {
      const balance = bank.currentBalance || bank.initialBalance || 0;
      return sum + (typeof balance === 'number' ? balance : 0);
    }, 0);
    
    const monthTransactions = safeTransactions.filter(t => {
      try {
        if (!t.date) return false;
        const transactionDate = new Date(t.date);
        return transactionDate.getMonth() === selectedMonth;
      } catch {
        return false;
      }
    });
    
    monthlyIncome = monthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + (t.amount || 0), 0);
      
    monthlyExpense = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + (t.amount || 0), 0);
  } catch (error) {
    console.error('Error calculating dashboard totals:', error);
  }
  
  const savings = monthlyIncome - monthlyExpense;
  const primaryCurrency = safeBanks.length > 0 ? (safeBanks[0].currency || 'USD') : 'USD';

  const stats = [
    { 
      label: 'Total Balance', 
      value: formatCurrency(totalBalance, primaryCurrency), 
      icon: DollarSign, 
      color: 'bg-blue-500' 
    },
    { 
      label: 'Monthly Income', 
      value: formatCurrency(monthlyIncome, primaryCurrency), 
      icon: TrendingUp, 
      color: 'bg-green-500' 
    },
    { 
      label: 'Monthly Expense', 
      value: formatCurrency(monthlyExpense, primaryCurrency), 
      icon: TrendingDown, 
      color: 'bg-red-500' 
    },
    { 
      label: 'Savings', 
      value: formatCurrency(savings, primaryCurrency), 
      icon: Wallet, 
      color: savings >= 0 ? 'bg-purple-500' : 'bg-orange-500' 
    }
  ];

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          Dashboard
        </h1>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth && setSelectedMonth(parseInt(e.target.value))}
          className={`px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
        >
          {months.map((month, idx) => (
            <option key={idx} value={idx}>
              {month} 2026
            </option>
          ))}
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {stat.label}
                </p>
                <p className={`text-2xl font-bold mt-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {stat.value}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-full ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Transactions and Bank Accounts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Recent Transactions
          </h2>
          <div className="space-y-3">
            {safeTransactions.length === 0 ? (
              <p className={`text-center py-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                No transactions yet
              </p>
            ) : (
              safeTransactions.slice(-5).reverse().map((transaction, index) => {
                const bank = safeBanks.find(b => 
                  b._id === transaction.bankId || 
                  b._id === transaction.bankId?._id
                );
                const bankName = bank?.bankName || transaction.bankId?.bankName || 'Unknown Bank';
                
                let transDate = 'Invalid Date';
                try {
                  transDate = new Date(transaction.date).toLocaleDateString();
                } catch {
                  transDate = 'Invalid Date';
                }
                
                return (
                  <div key={transaction._id || index} className={`flex items-center justify-between p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full ${transaction.type === 'income' ? 'bg-green-500' : 'bg-red-500'} flex items-center justify-center`}>
                        {transaction.type === 'income' ? 
                          <TrendingUp className="w-5 h-5 text-white" /> : 
                          <TrendingDown className="w-5 h-5 text-white" />
                        }
                      </div>
                      <div>
                        <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                          {transaction.category || 'Unknown'}
                        </p>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {bankName} • {transDate}
                        </p>
                      </div>
                    </div>
                    <p className={`font-bold ${transaction.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatCurrency(transaction.amount || 0, bank?.currency || 'USD')}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Bank Accounts */}
        <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Bank Accounts
          </h2>
          <div className="space-y-3">
            {safeBanks.length === 0 ? (
              <p className={`text-center py-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                No bank accounts yet
              </p>
            ) : (
              safeBanks.map((bank, index) => {
                const balance = bank.currentBalance || bank.initialBalance || 0;
                
                return (
                  <div key={bank._id || index} className={`flex items-center justify-between p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center">
                        <Wallet className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                          {bank.bankName || 'Unknown Bank'}
                        </p>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {bank.accountType || 'Unknown Type'}
                        </p>
                      </div>
                    </div>
                    <p className={`font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {formatCurrency(balance, bank.currency || 'USD')}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}