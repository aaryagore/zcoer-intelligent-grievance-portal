import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GraduationCap, AlertCircle, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { STUDENT_DATABASE } from '../constants';
import { storage } from '../lib/storage';

export const StudentLogin: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [zprn, setZprn] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [showPass, setShowPass] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  
  const message = (location.state as any)?.message;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    await new Promise(r => setTimeout(r, 800));
    
    const student = STUDENT_DATABASE[zprn.toLowerCase()];
    
    if (!student) {
      setError('ZPRN not found in the system. Please check your credentials.');
      setIsLoading(false);
      return;
    }
    
    if (student.password !== password) {
      setError('Incorrect password. Please try again.');
      setIsLoading(false);
      return;
    }
    
    storage.loginStudent({ zprn: student.zprn, name: student.name, email: student.email });
    
    const from = (location.state as any)?.from || '/submit';
    navigate(from);
  };

  return (
    <div className="min-h-screen zeal-light-gradient flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-zeal-gold/10 rounded-full blur-[80px] animate-pulse-soft"></div>
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-indigo-600/5 rounded-full blur-[80px] animate-float"></div>
      
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-600 rounded-3xl shadow-2xl shadow-indigo-200 mb-6">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Student Portal</h1>
          <p className="text-slate-500 mt-2 font-medium">Login with your ZCOER credentials</p>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-100 p-10">
          {message && (
            <div className="mb-6 flex items-center space-x-3 bg-amber-50 border border-amber-200 px-5 py-4 rounded-2xl">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
              <p className="text-sm text-amber-800 font-medium">{message}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-black text-slate-700 mb-3 uppercase tracking-wider">ZPRN Number</label>
              <input
                id="zprn-input"
                required
                type="text"
                placeholder="e.g. zcoer2310"
                value={zprn}
                onChange={(e) => setZprn(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 font-medium focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-black text-slate-700 mb-3 uppercase tracking-wider">Password</label>
              <div className="relative">
                <input
                  id="password-input"
                  required
                  type={showPass ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 pr-14 text-slate-900 font-medium focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center space-x-3 bg-rose-50 border border-rose-200 px-5 py-4 rounded-2xl">
                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
                <p className="text-sm text-rose-700 font-medium">{error}</p>
              </div>
            )}

            <button
              type="submit"
              id="login-submit-btn"
              disabled={isLoading}
              className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 disabled:opacity-70 flex items-center justify-center space-x-3"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <span>Login to Portal</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};
