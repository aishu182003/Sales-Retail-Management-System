import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import {
  ShieldCheck,
  Briefcase,
  Lock,
  User as UserIcon,
  KeyRound,
  Eye,
  EyeOff,
  Store,
  ShoppingCart,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Clock,
  Laptop,
  CheckCircle2,
  Users,
  Building2,
  Receipt,
  ScanBarcode,
  ChevronRight,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const {
    users,
    loginPortalType,
    setLoginPortalType,
    loginAsAdmin,
    loginAsSalesPerson,
  } = useStore();

  // Admin form state
  const [adminUsername, setAdminUsername] = useState('admin');
  const [adminPassword, setAdminPassword] = useState('admin123');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [adminLoading, setAdminLoading] = useState(false);

  // Sales person form state
  const [salesUsername, setSalesUsername] = useState('sales');
  const [salesPassword, setSalesPassword] = useState('sales123');
  const [salesCounter, setSalesCounter] = useState('Counter 1');
  const [showSalesPassword, setShowSalesPassword] = useState(false);
  const [salesError, setSalesError] = useState<string | null>(null);
  const [salesLoading, setSalesLoading] = useState(false);

  // Active sales persons from database
  const activeSalesPersons = users.filter(
    (u) => u.role === 'sales_person' && u.status !== 'inactive'
  );

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);
    setAdminLoading(true);

    setTimeout(() => {
      const res = loginAsAdmin(adminUsername, adminPassword);
      setAdminLoading(false);
      if (!res.success) {
        setAdminError(res.message);
      }
    }, 250);
  };

  const handleSalesSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSalesError(null);
    setSalesLoading(true);

    setTimeout(() => {
      const res = loginAsSalesPerson(salesUsername, salesPassword, salesCounter);
      setSalesLoading(false);
      if (!res.success) {
        setSalesError(res.message);
      }
    }, 250);
  };

  const handleSelectSalesPersonCard = (user: typeof users[0]) => {
    setSalesUsername(user.username);
    setSalesPassword(user.password || 'sales123');
    setSalesCounter(user.counter_no || 'Counter 1');
    setSalesError(null);
  };

  const handleNumpadPress = (digit: string) => {
    if (loginPortalType === 'sales_person') {
      if (digit === 'CLEAR') {
        setSalesPassword('');
      } else if (digit === 'BACK') {
        setSalesPassword((prev) => prev.slice(0, -1));
      } else {
        setSalesPassword((prev) => prev + digit);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-slate-100 flex flex-col justify-between p-4 md:p-8 font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Header / Brand Bar */}
      <header className="max-w-6xl w-full mx-auto flex flex-wrap items-center justify-between gap-4 py-2 border-b border-slate-700/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-900/40">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-white">SmartRetail</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Supermarket ERP
              </span>
            </div>
            <p className="text-xs text-slate-400">Enterprise Point of Sale & Retail Management System</p>
          </div>
        </div>

        {/* Portal Switcher Navigation Pills */}
        <div className="flex items-center bg-slate-800/80 p-1.5 rounded-xl border border-slate-700 shadow-inner">
          <button
            type="button"
            onClick={() => {
              setLoginPortalType('admin');
              setAdminError(null);
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              loginPortalType === 'admin'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Admin Login</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setLoginPortalType('sales_person');
              setSalesError(null);
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              loginPortalType === 'sales_person'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Sales Person Login</span>
          </button>
        </div>
      </header>

      {/* Main Login Arena */}
      <main className="max-w-6xl w-full mx-auto my-6 flex-1 flex items-center justify-center">
        {loginPortalType === 'admin' ? (
          /* ========================================================= */
          /* ADMIN LOGIN PAGE                                         */
          /* ========================================================= */
          <div className="w-full grid lg:grid-cols-12 gap-8 items-stretch">
            {/* Left Column: Admin Portal Context & Features */}
            <div className="lg:col-span-5 bg-slate-800/60 backdrop-blur border border-slate-700/80 rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-2xl">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold mb-4">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Store Owner & Administrator Portal</span>
                </div>

                <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-tight">
                  Supermarket Control & Management
                </h1>
                <p className="text-xs md:text-sm text-slate-400 mt-2 leading-relaxed">
                  Administrator login alone has access to manage sales staff, add new sales persons, configure pricing, and view store-wide profit reports.
                </p>

                <div className="mt-6 space-y-3.5 text-xs text-slate-300">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/50 border border-slate-700/60">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="text-white block font-semibold">Staff & Sales Team Control</strong>
                      <span className="text-slate-400 text-[11px]">
                        Admin login alone can add, edit, shift-assign, or deactivate sales persons.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/50 border border-slate-700/60">
                    <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Receipt className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="text-white block font-semibold">Profit & Revenue Intelligence</strong>
                      <span className="text-slate-400 text-[11px]">
                        Access Star Schema dimensional reports, margin analytics, and Power BI models.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/50 border border-slate-700/60">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                      <ScanBarcode className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="text-white block font-semibold">Inventory & Barcode Catalog</strong>
                      <span className="text-slate-400 text-[11px]">
                        Set cost prices, selling rates, reorder levels, and promotional discounts.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Quick Switch Note */}
              <div className="mt-6 pt-5 border-t border-slate-700/60 flex items-center justify-between text-xs">
                <span className="text-slate-400">Cashier or Sales Person?</span>
                <button
                  type="button"
                  onClick={() => {
                    setLoginPortalType('sales_person');
                    setSalesError(null);
                  }}
                  className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 group transition-colors cursor-pointer"
                >
                  <span>Go to Sales Person Login</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>

            {/* Right Column: Admin Login Form */}
            <div className="lg:col-span-7 bg-white text-slate-800 rounded-3xl p-6 md:p-10 shadow-2xl flex flex-col justify-between border border-slate-200">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Administrator Sign In</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Authenticate with Store Admin credentials</p>
                  </div>
                  <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shadow-xs">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                </div>

                {adminError && (
                  <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                    <div>
                      <strong>Login Failed: </strong>
                      <span>{adminError}</span>
                    </div>
                  </div>
                )}

                <form onSubmit={handleAdminSubmit} className="mt-6 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Admin Username
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={adminUsername}
                        onChange={(e) => setAdminUsername(e.target.value)}
                        placeholder="admin"
                        className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 text-slate-900 rounded-xl px-4 py-2.5 pl-10 text-sm font-medium outline-none transition-all"
                        required
                      />
                      <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Master Password
                      </label>
                      <span className="text-[11px] text-slate-400">Default: admin123</span>
                    </div>
                    <div className="relative">
                      <input
                        type={showAdminPassword ? 'text' : 'password'}
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 text-slate-900 rounded-xl px-4 py-2.5 pl-10 pr-10 text-sm font-medium outline-none transition-all"
                        required
                      />
                      <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <button
                        type="button"
                        onClick={() => setShowAdminPassword(!showAdminPassword)}
                        className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Security Notice */}
                  <div className="p-3 bg-emerald-50/80 border border-emerald-200/80 rounded-xl text-emerald-900 text-[11px] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      Admin access grants authority to <strong>add new sales persons</strong> and manage counter shifts.
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={adminLoading}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 mt-2"
                  >
                    {adminLoading ? (
                      <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Sign In as Store Administrator</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* 1-Click Fast Fill for Demo */}
              <div className="mt-6 pt-5 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-semibold text-slate-600">Quick Test Credentials</span>
                  <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                    Demo Preset
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAdminUsername('admin');
                    setAdminPassword('admin123');
                    setAdminError(null);
                  }}
                  className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                      SP
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-700">
                        Suresh Patel (Owner & Admin)
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">admin / admin123</div>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                    Fill & Ready <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ========================================================= */
          /* SALES PERSON LOGIN PAGE                                   */
          /* ========================================================= */
          <div className="w-full grid lg:grid-cols-12 gap-8 items-stretch">
            {/* Left Column: Cashier Context & Staff Roster Selector */}
            <div className="lg:col-span-5 bg-slate-800/60 backdrop-blur border border-slate-700/80 rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-2xl">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 text-xs font-semibold mb-4">
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>Sales Person & POS Cashier Terminal</span>
                </div>

                <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-tight">
                  Point of Sale (POS) Counter Login
                </h1>
                <p className="text-xs md:text-sm text-slate-400 mt-2 leading-relaxed">
                  Log in to start barcode billing, customer lookup, and invoice generation at your designated register.
                </p>

                {/* Active Cashier Roster Quick Select */}
                <div className="mt-5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300 uppercase tracking-wider text-[11px]">
                      Select Active Sales Person
                    </span>
                    <span className="text-[10px] text-blue-400 font-mono">
                      {activeSalesPersons.length} Registered
                    </span>
                  </div>

                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {activeSalesPersons.map((user) => {
                      const isSelected = salesUsername.toLowerCase() === user.username.toLowerCase();
                      return (
                        <button
                          key={user.user_id}
                          type="button"
                          onClick={() => handleSelectSalesPersonCard(user)}
                          className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? 'bg-blue-600/30 border-blue-500 text-white shadow-md shadow-blue-900/30'
                              : 'bg-slate-900/40 border-slate-700/70 hover:bg-slate-800 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
                              {user.name.charAt(0)}
                            </div>
                            <div className="truncate">
                              <div className="text-xs font-bold truncate text-white">{user.name}</div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                @{user.username} • {user.counter_no || 'Counter 1'}
                              </div>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                              {user.shift || 'General'}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Role Boundary Notice */}
                <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                  <span>
                    <strong>Role Policy:</strong> Sales persons cannot add or manage other staff members. Only the store administrator holds staff management privileges.
                  </span>
                </div>
              </div>

              {/* Bottom Quick Switch to Admin */}
              <div className="mt-6 pt-5 border-t border-slate-700/60 flex items-center justify-between text-xs">
                <span className="text-slate-400">Store Owner or Manager?</span>
                <button
                  type="button"
                  onClick={() => {
                    setLoginPortalType('admin');
                    setAdminError(null);
                  }}
                  className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 group transition-colors cursor-pointer"
                >
                  <span>Go to Admin Login</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>

            {/* Right Column: Sales Person Login Form */}
            <div className="lg:col-span-7 bg-white text-slate-800 rounded-3xl p-6 md:p-10 shadow-2xl flex flex-col justify-between border border-slate-200">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Sales Person Sign In</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Counter assignment & cashier PIN authentication</p>
                  </div>
                  <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center shadow-xs">
                    <Briefcase className="w-6 h-6" />
                  </div>
                </div>

                {salesError && (
                  <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                    <div>
                      <strong>Login Notice: </strong>
                      <span>{salesError}</span>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSalesSubmit} className="mt-5 space-y-4">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Sales Person Username
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={salesUsername}
                          onChange={(e) => setSalesUsername(e.target.value)}
                          placeholder="sales"
                          className="w-full bg-slate-50 border border-slate-300 focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-500/20 text-slate-900 rounded-xl px-4 py-2.5 pl-10 text-sm font-medium outline-none transition-all"
                          required
                        />
                        <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Billing Counter Register
                      </label>
                      <div className="relative">
                        <select
                          value={salesCounter}
                          onChange={(e) => setSalesCounter(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-500/20 text-slate-900 rounded-xl px-4 py-2.5 pl-10 text-sm font-medium outline-none transition-all cursor-pointer"
                        >
                          <option value="Counter 1">Counter 1 - Main Checkout</option>
                          <option value="Counter 2">Counter 2 - FMCG & Staples</option>
                          <option value="Counter 3">Counter 3 - Bakery & Packaged</option>
                          <option value="Express Counter">Express Counter (Fast Lane)</option>
                        </select>
                        <Laptop className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Cashier PIN / Password
                      </label>
                      <span className="text-[11px] text-slate-400">Default: sales123</span>
                    </div>
                    <div className="relative">
                      <input
                        type={showSalesPassword ? 'text' : 'password'}
                        value={salesPassword}
                        onChange={(e) => setSalesPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-50 border border-slate-300 focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-500/20 text-slate-900 rounded-xl px-4 py-2.5 pl-10 pr-10 text-sm font-medium outline-none transition-all"
                        required
                      />
                      <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <button
                        type="button"
                        onClick={() => setShowSalesPassword(!showSalesPassword)}
                        className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showSalesPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Quick Numpad for Touchscreen / Fast PIN Entry */}
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 text-center">
                      Touch Keypad / Fast PIN
                    </div>
                    <div className="grid grid-cols-6 gap-1.5 text-xs font-semibold">
                      {['1', '2', '3', '4', '5', '6'].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => handleNumpadPress(num)}
                          className="py-1.5 bg-white hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200 transition-colors shadow-2xs font-mono"
                        >
                          {num}
                        </button>
                      ))}
                      {['7', '8', '9', '0'].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => handleNumpadPress(num)}
                          className="py-1.5 bg-white hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200 transition-colors shadow-2xs font-mono"
                        >
                          {num}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => handleNumpadPress('BACK')}
                        className="py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg border border-slate-300 transition-colors font-mono text-[10px]"
                      >
                        ⌫ Del
                      </button>
                      <button
                        type="button"
                        onClick={() => handleNumpadPress('CLEAR')}
                        className="py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-lg border border-rose-200 transition-colors font-mono text-[10px]"
                      >
                        Clr
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={salesLoading}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                  >
                    {salesLoading ? (
                      <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4" />
                        <span>Sign In to POS Billing Terminal</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* 1-Click Fast Fill for Sales Person Demo */}
              <div className="mt-5 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-semibold text-slate-600">Quick Test Credentials</span>
                  <span className="text-[11px] text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded-full">
                    Demo Preset
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSalesUsername('sales');
                    setSalesPassword('sales123');
                    setSalesCounter('Counter 1');
                    setSalesError(null);
                  }}
                  className="w-full text-left p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs">
                      RS
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800 group-hover:text-blue-700">
                        Ramesh Sharma (Sales Person)
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">sales / sales123 • Counter 1</div>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-blue-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                    Fill & Ready <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer Info */}
      <footer className="max-w-6xl w-full mx-auto pt-4 border-t border-slate-700/60 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Dual Authentication Gateways: Admin Portal & Cashier Terminal Active</span>
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <span>Database: MySQL 8.0</span>
          <span>•</span>
          <span>PHP / XAMPP Compatible</span>
          <span>•</span>
          <span>Star Schema BI Engine</span>
        </div>
      </footer>
    </div>
  );
};
