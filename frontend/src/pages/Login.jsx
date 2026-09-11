import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sprout, Lock, User, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('kunal');
  const [password, setPassword] = useState('kunal');
  const [fullName, setFullName] = useState('');
  const [crop, setCrop] = useState('Tomato');
  const [location, setLocation] = useState('Maharashtra, India');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        await register({ username, password, full_name: fullName, crop, location });
      } else {
        await login(username, password);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setUsername('kunal');
    setPassword('kunal');
    setIsRegister(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 text-white flex items-center justify-center p-3.5 sm:p-4 w-full">
      <div className="max-w-md w-full farm-card bg-white text-slate-900 p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-2xl border border-emerald-900/40">
        {/* Brand Header */}
        <div className="text-center mb-5 sm:mb-6">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-600/30">
            <Sprout className="w-7 h-7 sm:w-8 sm:h-8 stroke-[2.5]" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">RASmalAI Portal</h1>
          <p className="text-xs font-semibold text-emerald-700 mt-1">Rural Agriculture System using Machine Learning & AI</p>
        </div>

        {/* Demo One-Click Login Banner */}
        <div className="mb-5 sm:mb-6 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="truncate">Login: <strong>kunal</strong> | Pass: <strong>kunal</strong></span>
          </div>
          <button
            type="button"
            onClick={fillDemoCredentials}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px] shadow-sm shrink-0 min-h-[32px] flex items-center justify-center"
          >
            Auto Fill
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Kunal Sharma"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-medium focus:outline-none focus:border-emerald-500"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Farmer Username</label>
            <div className="relative">
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-xs font-medium focus:outline-none focus:border-emerald-500"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-xs font-medium focus:outline-none focus:border-emerald-500"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          {isRegister && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Main Crop</label>
                <select
                  value={crop}
                  onChange={(e) => setCrop(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-xs font-medium focus:outline-none focus:border-emerald-500"
                >
                  <option value="Tomato">Tomato</option>
                  <option value="Potato">Potato</option>
                  <option value="Corn">Corn</option>
                  <option value="Grape">Grape</option>
                  <option value="Pepper">Pepper</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-xs font-medium focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary justify-center py-3.5 text-sm rounded-xl font-bold shadow-lg shadow-emerald-600/30 mt-2"
          >
            <span>{isRegister ? 'Create Farmer Account' : 'Farmer Login'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800"
          >
            {isRegister ? 'Already registered? Sign in here' : "Don't have an account? Register new farm"}
          </button>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>SIH Production Smart Farming AI Platform</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
