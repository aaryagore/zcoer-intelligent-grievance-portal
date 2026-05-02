import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, AlertCircle, Eye, EyeOff, ArrowRight, Lock } from 'lucide-react';
import { STAFF_ACCOUNTS } from '../constants';
import { storage } from '../lib/storage';

export const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [showPass, setShowPass] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    await new Promise(r => setTimeout(r, 800));
    
    const staff = STAFF_ACCOUNTS[username.toLowerCase()];
    
    if (!staff) {
      setError('Username not found in the staff registry.');
      setIsLoading(false);
      return;
    }
    
    if (staff.password !== password) {
      setError('Incorrect password. Please try again.');
      setIsLoading(false);
      return;
    }
    
    storage.loginAdmin({ id: staff.id, username: staff.username, name: staff.name, assignedCategory: staff.assignedCategory, role: staff.role });
    navigate('/admin/dashboard');
  };

  return (
    <div className="min-h-screen bg-indigo-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-zeal-gold/10 rounded-full blur-[100px] animate-pulse-soft"></div>
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px] animate-float"></div>
      <div className="absolute inset-0 blueprint-pattern-light opacity-5"></div>
      
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 border border-white/10 rounded-3xl shadow-2xl mb-6">
            <Shield className="w-10 h-10 text-zeal-gold" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight">Staff Portal</h1>
          <p className="text-indigo-300 mt-2 font-medium">Authorized personnel only</p>
        </div>

        <div className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-[2.5rem] p-10">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-black text-indigo-200 mb-3 uppercase tracking-wider">Username</label>
              <input
                id="admin-username-input"
                required
                type="text"
                placeholder="e.g. super_dean"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-white/10 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-indigo-400 font-medium focus:ring-4 focus:ring-white/10 focus:border-white/30 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-black text-indigo-200 mb-3 uppercase tracking-wider">Password</label>
              <div className="relative">
                <input
                  id="admin-password-input"
                  required
                  type={showPass ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/10 border border-white/10 rounded-2xl px-5 py-4 pr-14 text-white placeholder-indigo-400 font-medium focus:ring-4 focus:ring-white/10 focus:border-white/30 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-400 hover:text-white transition-colors"
                >
                  {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center space-x-3 bg-rose-500/10 border border-rose-500/30 px-5 py-4 rounded-2xl">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                <p className="text-sm text-rose-300 font-medium">{error}</p>
              </div>
            )}

            <button
              id="admin-login-btn"
              type="submit"
              disabled={isLoading}
              className="w-full bg-zeal-gold text-indigo-950 py-5 rounded-2xl font-black text-lg hover:opacity-90 transition-all shadow-xl disabled:opacity-50 flex items-center justify-center space-x-3"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-indigo-950/30 border-t-indigo-950 rounded-full animate-spin"></div>
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  <span>Secure Login</span>
                </>
              )}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};
