import { useState, useEffect } from 'react';
import { Calendar, TrendingUp, TrendingDown, PieChart, Download } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart as RechartsPieChart, Cell, Pie, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { transactionAPI, bankAPI } from '../services/api';
import { formatCurrency } from '../utils/currency';

export default function Analytics({ darkMode, banks: propBanks, transactions: propTransactions }) {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedBank, setSelectedBank] = useState('');
  const [banks, setBanks] = useState(propBanks || []);
  const [analytics, setAnalytics] = useState({
    dailyExpenses: [],
    incomeVsExpense: [],
    categoryExpenses: [],
    bankBalances: [],
    monthlyTotals: {
      totalIncome: 0,
      totalExpense: 0,
      netSavings: 0
    }
  });
  const [loading, setLoading] = useState(!propBanks || !propTransactions);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0', '#ffb347', '#87ceeb'];

  useEffect(() => {
    if (propBanks) {
      setBanks(propBanks);
    } else {
      fetchBanks();
    }
    
    if (propBanks && propTransactions) {
      processLocalAnalytics(propTransactions);
    } else {
      fetchAnalytics();
    }
  }, [selectedMonth, selectedYear, selectedBank, propBanks, propTransactions]);

  const processLocalAnalytics = (transactions) => {
    try {
      setLoading(true);
      
      // Filter transactions by selected month, year, and bank
      let filteredTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        const matchesMonth = transactionDate.getMonth() === selectedMonth;
        const matchesYear = transactionDate.getFullYear() === selectedYear;
        const matchesBank = !selectedBank || (t.bankId._id || t.bankId) === selectedBank;
        return matchesMonth && matchesYear && matchesBank;
      });

      // Process daily expenses for line chart
      const dailyExpenses = processDailyData(filteredTransactions);
      
      // Process income vs expense for bar chart
      const incomeVsExpense = processIncomeVsExpense(filteredTransactions);
      
      // Process category expenses for pie chart
      const categoryExpenses = processCategoryData(filteredTransactions);
      
      // Process bank balances
      const bankBalances = processBankBalances();

      // Calculate monthly totals
      const totalIncome = filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      const totalExpense = filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

      setAnalytics({
        dailyExpenses,
        incomeVsExpense,
        categoryExpenses,
        bankBalances,
        monthlyTotals: {
          totalIncome,
          totalExpense,
          netSavings: totalIncome - totalExpense
        }
      });
    } catch (error) {
      console.error('Failed to process analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBanks = async () => {
    try {
      const response = await bankAPI.getAll();
      setBanks(response.data.data.banks);
    } catch (error) {
      console.error('Failed to fetch banks:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      const response = await transactionAPI.getMonthlyAnalytics(selectedMonth, selectedYear);
      const data = response.data.data;

      // Process daily expenses for line chart
      const dailyExpenses = processDailyData(data.dailyBreakdown);
      
      // Process income vs expense for bar chart
      const incomeVsExpense = processIncomeVsExpense(data.dailyBreakdown);
      
      // Process category expenses for pie chart
      const categoryExpenses = processCategoryData(data.categoryBreakdown);
      
      // Process bank balances
      const bankBalances = processBankBalances();

      setAnalytics({
        dailyExpenses,
        incomeVsExpense,
        categoryExpenses,
        bankBalances,
        monthlyTotals: {
          totalIncome: data.totalIncome || 0,
          totalExpense: data.totalExpense || 0,
          netSavings: (data.totalIncome || 0) - (data.totalExpense || 0)
        }
      });
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const processDailyData = (transactions) => {
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const dailyData = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const dayTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getDate() === day;
      });
      
      const dayIncome = dayTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      const dayExpense = dayTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
      
      dailyData.push({
        day: day,
        expense: dayExpense,
        income: dayIncome
      });
    }

    return dailyData;
  };

  const processIncomeVsExpense = (transactions) => {
    // Group transactions by date
    const dateGroups = {};
    transactions.forEach(t => {
      const date = new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!dateGroups[date]) {
        dateGroups[date] = { income: 0, expense: 0 };
      }
      if (t.type === 'income') {
        dateGroups[date].income += t.amount;
      } else {
        dateGroups[date].expense += t.amount;
      }
    });
    
    return Object.entries(dateGroups).map(([date, data]) => ({
      date,
      income: data.income,
      expense: data.expense
    }));
  };

  const processCategoryData = (transactions) => {
    const categoryGroups = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      if (!categoryGroups[t.category]) {
        categoryGroups[t.category] = { total: 0, count: 0 };
      }
      categoryGroups[t.category].total += t.amount;
      categoryGroups[t.category].count += 1;
    });
    
    return Object.entries(categoryGroups).map(([category, data]) => ({
      name: category,
      value: data.total,
      count: data.count
    }));
  };

  const processBankBalances = () => {
    return banks.map(bank => ({
      name: bank.bankName,
      balance: bank.currentBalance || bank.initialBalance,
      currency: bank.currency
    }));
  };

  const exportData = async () => {
    try {
      const response = await transactionAPI.export();
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions-${months[selectedMonth]}-${selectedYear}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to export data:', error);
      alert('Failed to export data');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-500">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          Analytics
        </h1>
        <button
          onClick={exportData}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
        >
          <Download className="w-5 h-5" />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className={`p-6 rounded-xl shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5" />
          <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Filters
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Month
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-indigo-500 outline-none`}
            >
              {months.map((month, index) => (
                <option key={index} value={index}>
                  {month}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-indigo-500 outline-none`}
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Bank Account
            </label>
            <select
              value={selectedBank}
              onChange={(e) => setSelectedBank(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-indigo-500 outline-none`}
            >
              <option value="">All Banks</option>
              {banks.map((bank) => (
                <option key={bank._id} value={bank._id}>
                  {bank.bankName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`p-6 rounded-xl shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Income</p>
              <p className="text-2xl font-bold text-green-500">
                {formatCurrency(analytics.monthlyTotals.totalIncome, banks.length > 0 ? banks[0].currency : 'USD')}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Expense</p>
              <p className="text-2xl font-bold text-red-500">
                {formatCurrency(analytics.monthlyTotals.totalExpense, banks.length > 0 ? banks[0].currency : 'USD')}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Net Savings</p>
              <p className={`text-2xl font-bold ${analytics.monthlyTotals.netSavings >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {formatCurrency(analytics.monthlyTotals.netSavings, banks.length > 0 ? banks[0].currency : 'USD')}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-full ${analytics.monthlyTotals.netSavings >= 0 ? 'bg-green-500' : 'bg-red-500'} flex items-center justify-center`}>
              <PieChart className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Expense Line Chart */}
        <div className={`p-6 rounded-xl shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Daily Expense Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.dailyExpenses}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
              <XAxis 
                dataKey="day" 
                stroke={darkMode ? '#9ca3af' : '#6b7280'}
                fontSize={12}
              />
              <YAxis 
                stroke={darkMode ? '#9ca3af' : '#6b7280'}
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                  border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                  borderRadius: '8px',
                  color: darkMode ? '#ffffff' : '#000000'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="expense" 
                stroke="#ef4444" 
                strokeWidth={2}
                dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#ef4444', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Income vs Expense Bar Chart */}
        <div className={`p-6 rounded-xl shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Income vs Expense
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.incomeVsExpense}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
              <XAxis 
                dataKey="date" 
                stroke={darkMode ? '#9ca3af' : '#6b7280'}
                fontSize={12}
              />
              <YAxis 
                stroke={darkMode ? '#9ca3af' : '#6b7280'}
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                  border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                  borderRadius: '8px',
                  color: darkMode ? '#ffffff' : '#000000'
                }}
              />
              <Legend />
              <Bar dataKey="income" fill="#10b981" name="Income" />
              <Bar dataKey="expense" fill="#ef4444" name="Expense" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Expense Pie Chart */}
        <div className={`p-6 rounded-xl shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Category-wise Expenses
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie
                data={analytics.categoryExpenses}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {analytics.categoryExpenses.map((category, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                  border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                  borderRadius: '8px',
                  color: darkMode ? '#ffffff' : '#000000'
                }}
              />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>

        {/* Bank Balance Comparison */}
        <div className={`p-6 rounded-xl shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Bank Balance Comparison
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.bankBalances} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
              <XAxis 
                type="number"
                stroke={darkMode ? '#9ca3af' : '#6b7280'}
                fontSize={12}
              />
              <YAxis 
                type="category"
                dataKey="name"
                stroke={darkMode ? '#9ca3af' : '#6b7280'}
                fontSize={12}
                width={100}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                  border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                  borderRadius: '8px',
                  color: darkMode ? '#ffffff' : '#000000'
                }}
                formatter={(value, _, props) => [
                  `${props.payload.currency} ${value.toFixed(2)}`,
                  'Balance'
                ]}
              />
              <Bar dataKey="balance" fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Breakdown Table */}
      {analytics.categoryExpenses.length > 0 && (
        <div className={`p-6 rounded-xl shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Category Breakdown
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <th className={`text-left py-3 px-4 font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Category
                  </th>
                  <th className={`text-right py-3 px-4 font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Amount
                  </th>
                  <th className={`text-right py-3 px-4 font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Transactions
                  </th>
                  <th className={`text-right py-3 px-4 font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Percentage
                  </th>
                </tr>
              </thead>
              <tbody>
                {analytics.categoryExpenses.map((category, index) => {
                  const percentage = (category.value / analytics.monthlyTotals.totalExpense) * 100;
                  return (
                    <tr key={category.name} className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                            {category.name}
                          </span>
                        </div>
                      </td>
                      <td className={`py-3 px-4 text-right font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                        {formatCurrency(category.value, banks.length > 0 ? banks[0].currency : 'USD')}
                      </td>
                      <td className={`py-3 px-4 text-right ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {category.count}
                      </td>
                      <td className={`py-3 px-4 text-right ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {percentage.toFixed(1)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}