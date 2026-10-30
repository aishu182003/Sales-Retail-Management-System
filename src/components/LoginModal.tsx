import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ShieldCheck, Briefcase, Lock, User, KeyRound, X } from 'lucide-react';

export const LoginModal: React.FC = () => {
  const { isLoginOpen, loginUser, setLoginOpen } = useStore();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState<string | null>(null);

  if (!isLoginOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = loginUser(username, password);
    if (success) {
      setError(null);
    } else {
      setError('Invalid username or password. Use demo credentials below.');
    }
  };

  const handleQuickFill = (user: 'admin' | 'sales') => {
    if (user === 'admin') {
      setUsername('admin');
      setPassword('admin123');
    } else {
      setUsername('sales');
      setPassword('sales123');
    }
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="w-full max-w-sm bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl text-slate-800 space-y-4">
        <div className="flex justify-end -mt-2 -mr-2">
          <button
            onClick={() => setLoginOpen(false)}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="text-center space-y-1 -mt-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 mx-auto flex items-center justify-center mb-2 shadow-xs">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-slate-900">Smart Retail Authentication</h2>
          <p className="text-xs text-slate-500">Role-Based Access Control (RBAC)</p>
        </div>

        {error && (
          <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Username</label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 pl-9 text-slate-900 focus:border-emerald-600 outline-none"
                required
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 pl-9 text-slate-900 focus:border-emerald-600 outline-none"
                required
              />
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-lg text-xs shadow-xs transition-all mt-2 cursor-pointer"
          >
            Sign In to System
          </button>
        </form>

        {/* Demo Fast Fill Buttons */}
        <div className="pt-3 border-t border-slate-100 space-y-2">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold text-center">
            Click to fill test credentials
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('admin')}
              className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-bold">
                <ShieldCheck className="w-3.5 h-3.5" /> Admin (Owner)
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5 font-medium">admin / admin123</div>
              <div className="text-[9px] text-emerald-600 font-semibold mt-1">Can add sales persons</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('sales')}
              className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-1.5 text-blue-700 text-xs font-bold">
                <Briefcase className="w-3.5 h-3.5" /> Sales Person
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5 font-medium">sales / sales123</div>
              <div className="text-[9px] text-slate-500 mt-1">POS Billing only (no staff add)</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
