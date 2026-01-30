import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Wallet, CreditCard, PiggyBank, DollarSign } from 'lucide-react';
import { bankAPI } from '../services/api';
import { formatCurrency } from '../utils/currency';

export default function BankAccounts({ darkMode, banks: propBanks, transactions: propTransactions = [], refreshData }) {
  const [banks, setBanks] = useState(propBanks || []);
  const [showModal, setShowModal] = useState(false);
  const [editingBank, setEditingBank] = useState(null);
  const [loading, setLoading] = useState(!propBanks);
  const [formData, setFormData] = useState({
    bankName: '',
    accountType: 'Savings',
    initialBalance: '',
    currency: 'USD'
  });

  const accountTypes = [
    { value: 'Savings', icon: PiggyBank, color: 'bg-green-500' },
    { value: 'Credit', icon: CreditCard, color: 'bg-red-500' },
    { value: 'Wallet', icon: Wallet, color: 'bg-blue-500' },
    { value: 'Cash', icon: DollarSign, color: 'bg-yellow-500' }
  ];

  const currencies = ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD'];

  useEffect(() => {
    if (propBanks) {
      setBanks(propBanks);
      setLoading(false);
    } else {
      fetchBanks();
    }
  }, [propBanks]);

  const fetchBanks = async () => {
    try {
      const response = await bankAPI.getAll();
      setBanks(response.data.data.banks);
    } catch (error) {
      console.error('Failed to fetch banks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const bankData = {
        ...formData,
        initialBalance: parseFloat(formData.initialBalance)
      };

      if (editingBank) {
        await bankAPI.update(editingBank._id, bankData);
      } else {
        await bankAPI.create(bankData);
      }

      if (refreshData) {
        await refreshData();
      } else {
        await fetchBanks();
      }
      resetForm();
    } catch (error) {
      console.error('Failed to save bank:', error);
      alert(error.response?.data?.message || 'Failed to save bank account');
    }
  };

  const handleEdit = (bank) => {
    setEditingBank(bank);
    setFormData({
      bankName: bank.bankName,
      accountType: bank.accountType,
      initialBalance: bank.initialBalance.toString(),
      currency: bank.currency
    });
    setShowModal(true);
  };

  const handleDelete = async (bankId) => {
    if (window.confirm('Are you sure you want to delete this bank account? This will also delete all associated transactions.')) {
      try {
        await bankAPI.delete(bankId);
        if (refreshData) {
          await refreshData();
        } else {
          await fetchBanks();
        }
      } catch (error) {
        console.error('Failed to delete bank:', error);
        alert(error.response?.data?.message || 'Failed to delete bank account');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      bankName: '',
      accountType: 'Savings',
      initialBalance: '',
      currency: 'USD'
    });
    setEditingBank(null);
    setShowModal(false);
  };

  const getAccountIcon = (type) => {
    const accountType = accountTypes.find(t => t.value === type);
    return accountType || accountTypes[0];
  };

  // Calculate totals for each bank from transactions
  const calculateBankTotals = (bankId) => {
    const bankTransactions = propTransactions.filter(t => 
      (t.bankId._id || t.bankId) === bankId
    );
    
    const totalIncome = bankTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + (t.amount || 0), 0);
      
    const totalExpenses = bankTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + (t.amount || 0), 0);
      
    return { totalIncome, totalExpenses };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-500">Loading bank accounts...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          Bank Accounts
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Bank Account
        </button>
      </div>

      {banks.length === 0 ? (
        <div className={`text-center py-12 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <Wallet className={`w-16 h-16 mx-auto mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-300'}`} />
          <h3 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            No Bank Accounts Yet
          </h3>
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
            Add your first bank account to start tracking your finances
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            Add Bank Account
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banks.map((bank) => {
            const accountType = getAccountIcon(bank.accountType);
            const IconComponent = accountType.icon;
            const currentBalance = bank.currentBalance || bank.initialBalance;
            const { totalIncome, totalExpenses } = calculateBankTotals(bank._id);

            return (
              <div
                key={bank._id}
                className={`p-6 rounded-xl shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} hover:shadow-xl transition-shadow`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-full ${accountType.color} flex items-center justify-center`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(bank)}
                      className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                    >
                      <Edit2 className="w-4 h-4 text-blue-500" />
                    </button>
                    <button
                      onClick={() => handleDelete(bank._id)}
                      className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>

                <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {bank.bankName}
                </h3>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Account Type
                    </span>
                    <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {bank.accountType}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Currency
                    </span>
                    <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {bank.currency}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Current Balance
                    </span>
                    <span className={`text-lg font-bold ${currentBalance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {formatCurrency(currentBalance, bank.currency)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div className={`text-center p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="text-green-500 font-semibold">
                      +{formatCurrency(totalIncome, bank.currency)}
                    </div>
                    <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Total Income
                    </div>
                  </div>
                  <div className={`text-center p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="text-red-500 font-semibold">
                      -{formatCurrency(totalExpenses, bank.currency)}
                    </div>
                    <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Total Expenses
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Bank Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-md rounded-xl shadow-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="p-6">
              <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {editingBank ? 'Edit Bank Account' : 'Add Bank Account'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Bank Name
                  </label>
                  <input
                    type="text"
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    className={`w-full px-4 py-3 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-indigo-500 outline-none`}
                    placeholder="Enter bank name"
                    required
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Account Type
                  </label>
                  <select
                    value={formData.accountType}
                    onChange={(e) => setFormData({ ...formData, accountType: e.target.value })}
                    className={`w-full px-4 py-3 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-indigo-500 outline-none`}
                  >
                    {accountTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.value}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Initial Balance
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.initialBalance}
                    onChange={(e) => setFormData({ ...formData, initialBalance: e.target.value })}
                    className={`w-full px-4 py-3 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-indigo-500 outline-none`}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Currency
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className={`w-full px-4 py-3 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-indigo-500 outline-none`}
                  >
                    {currencies.map((currency) => (
                      <option key={currency} value={currency}>
                        {currency}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className={`flex-1 py-3 px-4 rounded-lg border ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} transition-colors`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                  >
                    {editingBank ? 'Update' : 'Add'} Bank
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}