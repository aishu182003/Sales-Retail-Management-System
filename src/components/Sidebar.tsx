import React from 'react';
import { useStore } from '../context/StoreContext';
import { ActiveTab } from '../types';
import {
  LayoutDashboard,
  ScanLine,
  Users,
  Package,
  Tags,
  Percent,
  Receipt,
  FileBarChart2,
  BarChart3,
  FolderArchive,
  LogOut,
  ShieldCheck,
  Briefcase,
  Store,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    currentUser,
    users,
    switchUser,
    switchRole,
    logoutUser,
    offers,
  } = useStore();

  const isAdmin = currentUser.role === 'admin';
  const activeOffersCount = offers.filter((o) => o.status === 'active').length;

  interface NavItem {
    id: ActiveTab;
    label: string;
    icon: React.ReactNode;
    roles: ('admin' | 'sales_person' | 'owner')[];
    badge?: string;
  }

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
      roles: ['admin', 'owner'],
    },
    {
      id: 'billing',
      label: 'Barcode Billing',
      icon: <ScanLine className="w-4 h-4" />,
      roles: ['admin', 'sales_person', 'owner'],
      badge: 'POS',
    },
    {
      id: 'products',
      label: isAdmin ? 'Products & Stock' : 'Products (Billing View)',
      icon: <Package className="w-4 h-4" />,
      roles: ['admin', 'sales_person', 'owner'],
    },
    {
      id: 'offers',
      label: isAdmin ? 'Offers & Discounts' : 'Active Offers & WhatsApp',
      icon: <Percent className="w-4 h-4" />,
      roles: ['admin', 'sales_person', 'owner'],
      badge: `${activeOffersCount} LIVE`,
    },
    {
      id: 'customers',
      label: isAdmin ? 'Customers & Loyalty' : 'Customer WhatsApp',
      icon: <Users className="w-4 h-4" />,
      roles: ['admin', 'sales_person', 'owner'],
    },
    {
      id: 'categories',
      label: 'Categories & Brands',
      icon: <Tags className="w-4 h-4" />,
      roles: ['admin', 'owner'],
    },
    {
      id: 'staff',
      label: 'Staff & Sales Team',
      icon: <Users className="w-4 h-4" />,
      roles: ['admin', 'owner'],
      badge: `${users.filter((u) => u.role === 'sales_person').length}`,
    },
    {
      id: 'sales',
      label: 'Sales History',
      icon: <Receipt className="w-4 h-4" />,
      roles: ['admin', 'owner'],
    },
    {
      id: 'reports',
      label: 'Reports & Profit',
      icon: <FileBarChart2 className="w-4 h-4" />,
      roles: ['admin', 'owner'],
    },
    {
      id: 'powerbi',
      label: 'Power BI Analytics',
      icon: <BarChart3 className="w-4 h-4" />,
      roles: ['admin', 'owner'],
      badge: 'BI',
    },
    {
      id: 'php_source',
      label: 'XAMPP Project Export',
      icon: <FolderArchive className="w-4 h-4" />,
      roles: ['admin', 'owner'],
      badge: 'PHP',
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen select-none shrink-0 sticky top-0 shadow-xs">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-xs">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 tracking-tight">Smart Retail</h1>
            <p className="text-[11px] text-slate-500 font-medium">
              {isAdmin ? 'Admin & BI Console' : 'Sales Staff POS'}
            </p>
          </div>
        </div>

        {/* Current Active User Card (Admin can switch to Staff view; Sales Staff cannot switch to Admin) */}
        <div className="mt-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              {isAdmin ? (
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              ) : (
                <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
              )}
              <span>Active Session</span>
            </div>
            <span
              className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase ${
                isAdmin ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              {isAdmin ? 'Admin' : 'Sales Staff'}
            </span>
          </div>

          {isAdmin ? (
            <>
              <select
                value={currentUser.user_id}
                onChange={(e) => switchUser(Number(e.target.value))}
                className="w-full bg-white border border-slate-200 text-slate-900 rounded px-2 py-1 text-xs font-semibold outline-none focus:border-emerald-600 cursor-pointer shadow-2xs"
                title="Admin Only: Switch to Sales Staff view when needed"
              >
                {users
                  .filter((u) => u.status !== 'inactive')
                  .map((u) => (
                    <option key={u.user_id} value={u.user_id}>
                      {u.name} ({u.role === 'admin' ? 'Admin' : u.counter_no || 'Sales Staff'})
                    </option>
                  ))}
              </select>
              <button
                type="button"
                onClick={() => switchRole('sales_person')}
                className="w-full py-1 px-2 rounded bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-[11px] font-bold transition-colors cursor-pointer"
              >
                Switch to Sales Staff View &rarr;
              </button>
            </>
          ) : (
            <div className="bg-white border border-slate-200 rounded px-2.5 py-1.5">
              <div className="text-xs font-bold text-slate-900">{currentUser.name}</div>
              <div className="text-[10px] text-slate-500 font-mono">
                {currentUser.counter_no || 'Counter 1'} • Shift: {currentUser.shift || 'General'}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-1">
        <div className="px-2 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          {isAdmin ? 'Admin Full Access' : 'Sales Staff Access'}
        </div>
        {navItems.map((item) => {
          const hasAccess = item.roles.includes(currentUser.role);
          if (!hasAccess) return null;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className={isActive ? 'text-white' : 'text-slate-400'}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                    isActive
                      ? 'bg-emerald-700 text-emerald-100'
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-100 text-slate-500 text-xs bg-slate-50/50">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-mono">
            {isAdmin ? 'Admin Mode' : 'Sales Staff POS'}
          </span>
          <button
            onClick={logoutUser}
            className="text-[11px] flex items-center gap-1 font-semibold text-rose-600 hover:text-rose-700 transition-colors cursor-pointer"
          >
            <LogOut className="w-3 h-3" /> Logout
          </button>
        </div>
      </div>
    </aside>
  );
};
