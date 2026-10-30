import React from 'react';
import { useStore } from '../context/StoreContext';
import {
  RotateCcw,
  Download,
  PlusCircle,
  Shield,
  Briefcase,
  LogOut,
  MessageCircle,
} from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  const {
    currentUser,
    switchRole,
    resetToSampleData,
    exportDatabaseSql,
    setActiveTab,
    activeTab,
    logoutUser,
  } = useStore();

  const isAdmin = currentUser.role === 'admin';

  return (
    <header className="bg-white/95 backdrop-blur border-b border-slate-200 px-6 py-3.5 flex items-center justify-between sticky top-0 z-10 shadow-xs relative">
      <div>
        <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <span>{title}</span>
          {!isAdmin && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Sales Staff Access
            </span>
          )}
        </h1>
        {subtitle && <p className="text-xs text-slate-500 font-medium">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2.5">
        {/* Quick Billing button */}
        {activeTab !== 'billing' && (
          <button
            onClick={() => setActiveTab('billing')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Bill</span>
          </button>
        )}

        {/* Sales Staff Quick Link: View Active Offers & Send WhatsApp */}
        {!isAdmin && activeTab !== 'offers' && (
          <button
            type="button"
            onClick={() => setActiveTab('offers')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition-all cursor-pointer"
            title="View active offers and send WhatsApp messages to customers"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Active Offers &amp; WhatsApp</span>
          </button>
        )}

        {/* Admin Only: SQL Export & Reset Database */}
        {isAdmin && (
          <>
            <button
              onClick={exportDatabaseSql}
              className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-300 transition-colors shadow-xs cursor-pointer"
              title="Download current state as MySQL .sql Dump"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden md:inline">Export SQL</span>
            </button>

            <button
              onClick={resetToSampleData}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-700 text-xs font-semibold border border-slate-300 hover:border-rose-300 transition-colors shadow-xs cursor-pointer"
              title="Reset database back to initial sample state"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden md:inline">Reset DB</span>
            </button>
          </>
        )}

        {/* User Role Badge: Admin can switch to Staff/Sales view when needed, but Sales Staff CANNOT switch to Admin */}
        {isAdmin ? (
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              <span>Admin ({currentUser.name})</span>
            </div>
            <button
              type="button"
              onClick={() => switchRole('sales_person')}
              className="cursor-pointer flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-xs text-blue-800 transition-colors shadow-xs font-semibold"
              title="Admin Only: Switch to Sales Staff View"
            >
              <Briefcase className="w-3.5 h-3.5 text-blue-600" />
              <span>Switch to Staff View</span>
            </button>
          </div>
        ) : (
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 font-semibold"
            title="Logged in as Sales Staff (Cannot switch to Admin)"
          >
            <Briefcase className="w-3.5 h-3.5 text-blue-600" />
            <span>
              {currentUser.name} ({currentUser.counter_no || 'Sales Staff'})
            </span>
          </div>
        )}

        {/* Logout Button */}
        <button
          type="button"
          onClick={logoutUser}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-xs text-rose-700 font-semibold transition-colors shadow-xs cursor-pointer"
          title="Log out and return to Login Page"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};
