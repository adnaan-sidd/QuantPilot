import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import StrategyNew from './pages/StrategyNew';
import StrategiesList from './pages/StrategiesList';
import StrategyDetail from './pages/StrategyDetail';
import BacktestPreview from './pages/BacktestPreview';
import BacktestsList from './pages/BacktestsList';
import BacktestResult from './pages/BacktestResult';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Loader2 } from 'lucide-react';

// Protected Route Wrapper
const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-brand-500">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  // NOTE: For demo purposes, if supabase is not configured, we might allow access or fail.
  // The AuthContext handles "mock" auth if env vars are missing, so user might be null or mock-user.
  // If we want to force login even in demo, we check for user.
  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  return <Outlet />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/signup" element={<Signup />} />

          {/* Protected App Routes */}
          <Route path="/app" element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              {/* Redirect straight to the Chat Interface (New Strategy) on login */}
              <Route index element={<Navigate to="/app/strategies/new" replace />} />
              
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="strategies" element={<StrategiesList />} />
              <Route path="strategies/new" element={<StrategyNew />} />
              <Route path="strategies/:id" element={<StrategyDetail />} />
              <Route path="strategies/preview" element={<BacktestPreview />} />
              
              <Route path="backtests" element={<BacktestsList />} />
              <Route path="backtests/:id" element={<BacktestResult />} />
              
              <Route path="billing" element={<div className="text-white p-8">Billing Page Placeholder</div>} />
              <Route path="settings" element={<div className="text-white p-8">Settings Page Placeholder</div>} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;