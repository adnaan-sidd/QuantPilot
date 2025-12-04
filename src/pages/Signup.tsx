import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: signUpError, data } = await signUp(email, password, fullName);

      if (signUpError) throw signUpError;
      
      // If we got a session immediately (or mock), navigate to dashboard
      if (data.session) {
          navigate('/app/dashboard');
      } else {
          // Real supabase usually requires email confirmation unless disabled
          alert('Check your email for the confirmation link!');
          navigate('/auth/login');
      }

    } catch (err: any) {
      setError(err.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      <Link to="/" className="flex items-center space-x-2 mb-8 hover:opacity-80 transition-opacity">
        <div className="bg-brand-600 p-1.5 rounded-lg">
          <Activity className="w-6 h-6 text-white" />
        </div>
        <span className="text-xl font-semibold text-white">Quant<span className="text-brand-500">Pilot AI</span></span>
      </Link>

      <div className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-2xl p-8 shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-2">Create an account</h2>
        <p className="text-slate-400 mb-6">Start backtesting your strategies with AI today.</p>

        {error && (
            <div className="flex items-center gap-2 p-3 mb-4 text-sm text-red-400 bg-red-900/20 border border-red-900/50 rounded-lg">
                <AlertCircle className="w-4 h-4" />
                {error}
            </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all"
              placeholder="Alex Trader"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all"
              placeholder="name@company.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all"
              placeholder="••••••••"
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-lg transition-all flex items-center justify-center"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link to="/auth/login" className="text-brand-400 hover:text-brand-300 font-medium">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;