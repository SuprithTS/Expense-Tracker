import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/auth/LoginPage';
import SignupPage from './components/auth/SignupPage';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Dashboard from './pages/Dashboard';
import BankAccounts from './pages/BankAccounts';
import Transactions from './pages/Transactions';
import Analytics from './pages/Analytics';
import { authAPI, bankAPI, transactionAPI } from './services/api';

function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [banks, setBanks] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        setIsAuthenticated(true);
        fetchData();
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        setLoading(false);
      }
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
      setBanks(banksRes.data.data.banks || []);
      setTransactions(transactionsRes.data.data.transactions || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      // Don't logout on data fetch error, just show empty data
      setBanks([]);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    try {
      const [banksRes, transactionsRes] = await Promise.all([
        bankAPI.getAll(),
        transactionAPI.getAll()
      ]);
      setBanks(banksRes.data.data.banks || []);
      setTransactions(transactionsRes.data.data.transactions || []);
    } catch (error) {
      console.error('Failed to refresh data:', error);
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
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const handleSignup = async (userData) => {
    try {
      const response = await authAPI.signup(userData);
      const { user, accessToken } = response.data.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      setIsAuthenticated(true);
      await fetchData();
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Signup failed');
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
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Protected Route Component
  const ProtectedRoute = ({ children }) => {
    return isAuthenticated ? children : <Navigate to="/login" replace />;
  };

  // Auth Route Component (redirects to dashboard if already authenticated)
  const AuthRoute = ({ children }) => {
    return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
  };

  // Layout wrapper for authenticated pages
  const AppLayout = ({ children }) => (
    <>
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        user={user}
        onLogout={handleLogout}
        darkMode={darkMode}
      />
      <div className={`${sidebarOpen ? 'lg:ml-64' : 'ml-0'} transition-all duration-300`}>
        <Header 
          darkMode={darkMode} 
          setDarkMode={setDarkMode} 
          setSidebarOpen={setSidebarOpen} 
          sidebarOpen={sidebarOpen} 
        />
        <main className="p-6">
          {children}
        </main>
      </div>
    </>
  );

  return (
    <Router>
      <div className={darkMode ? 'dark' : ''}>
        <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
          <Routes>
            {/* Auth Routes */}
            <Route 
              path="/login" 
              element={
                <AuthRoute>
                  <LoginPage 
                    onLogin={handleLogin} 
                    darkMode={darkMode} 
                  />
                </AuthRoute>
              } 
            />
            <Route 
              path="/signup" 
              element={
                <AuthRoute>
                  <SignupPage 
                    onSignup={handleSignup} 
                    darkMode={darkMode} 
                  />
                </AuthRoute>
              } 
            />
            
            {/* Root Route */}
            <Route 
              path="/" 
              element={
                isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
              } 
            />
            
            {/* Protected Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Dashboard
                      banks={banks}
                      transactions={transactions}
                      selectedMonth={selectedMonth}
                      setSelectedMonth={setSelectedMonth}
                      darkMode={darkMode}
                      refreshData={refreshData}
                    />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/banks" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <BankAccounts 
                      darkMode={darkMode} 
                      banks={banks}
                      transactions={transactions}
                      refreshData={refreshData}
                    />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/transactions" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Transactions 
                      darkMode={darkMode}
                      banks={banks}
                      transactions={transactions}
                      refreshData={refreshData}
                    />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/analytics" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Analytics 
                      darkMode={darkMode}
                      banks={banks}
                      transactions={transactions}
                    />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;