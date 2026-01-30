import { Home, Wallet, History, BarChart3, LogOut, User, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function Sidebar({ sidebarOpen, setSidebarOpen, user, onLogout, darkMode }) {
  const location = useLocation();
  const navigate = useNavigate();
  
  const menuItems = [
    { id: 'dashboard', path: '/dashboard', icon: Home, label: 'Dashboard' },
    { id: 'banks', path: '/banks', icon: Wallet, label: 'Bank Accounts' },
    { id: 'transactions', path: '/transactions', icon: History, label: 'Transactions' },
    { id: 'analytics', path: '/analytics', icon: BarChart3, label: 'Analytics' }
  ];

  const currentPath = location.pathname;

  return (
    <div className={`fixed inset-y-0 left-0 z-50 w-64 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-r`}>
      <div className="flex items-center justify-between p-6 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <span className={`font-bold text-xl ${darkMode ? 'text-white' : 'text-gray-800'}`}>ExpenseTrack</span>
        </div>
        <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
          <X className={darkMode ? 'text-gray-400' : 'text-gray-600'} />
        </button>
      </div>

      <nav className="p-4 space-y-2">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => navigate(item.path)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              currentPath === item.path ? 'bg-indigo-600 text-white' : darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="absolute bottom-0 w-full p-4 border-t border-gray-700">
        <div className={`flex items-center gap-3 p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} mb-2`}>
          <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className={`font-medium truncate ${darkMode ? 'text-white' : 'text-gray-800'}`}>{user?.name}</p>
            <p className={`text-sm truncate ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{user?.email}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${darkMode ? 'text-red-400 hover:bg-gray-700' : 'text-red-600 hover:bg-gray-100'}`}
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}