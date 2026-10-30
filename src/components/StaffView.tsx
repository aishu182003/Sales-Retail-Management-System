import React, { useState, useMemo, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { User, UserRole } from '../types';
import {
  Users,
  UserPlus,
  Search,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  LogIn,
  Clock,
  Store,
  Phone,
  Receipt,
  IndianRupee,
  ShieldCheck,
  TrendingUp,
  X,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

export const StaffView: React.FC = () => {
  const {
    users,
    currentUser,
    sales,
    addUser,
    updateUser,
    toggleUserStatus,
    deleteUser,
    switchUser,
    setActiveTab,
  } = useStore();

  const isAdmin = currentUser.role === 'admin';

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [shiftFilter, setShiftFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Delete modal state
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  // User feedback notification
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Auto dismiss notification after 4 seconds
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => setNotification(null), 4000);
    return () => clearTimeout(timer);
  }, [notification]);

  // Form state
  const [formData, setFormData] = useState<{
    name: string;
    username: string;
    password: string;
    role: UserRole;
    mobile: string;
    shift: 'Morning' | 'Evening' | 'General' | 'Night';
    counter_no: string;
    status: 'active' | 'inactive';
  }>({
    name: '',
    username: '',
    password: 'sales123',
    role: 'sales_person',
    mobile: '',
    shift: 'Morning',
    counter_no: 'Counter 1',
    status: 'active',
  });

  const [formError, setFormError] = useState<string | null>(null);

  // Open Add modal
  const handleOpenAdd = () => {
    if (!isAdmin) {
      setNotification({
        type: 'error',
        message: 'Admin login alone has access to add new sales persons. Both Admin and Sales Persons can edit and delete accounts.',
      });
      return;
    }
    setEditingUser(null);
    const nextCounterNum = users.filter((u) => u.role === 'sales_person').length + 1;
    setFormData({
      name: '',
      username: '',
      password: 'sales123',
      role: 'sales_person',
      mobile: '',
      shift: 'Morning',
      counter_no: `Counter ${nextCounterNum}`,
      status: 'active',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  // Open Edit modal (Accessible by both Admin and Sales Persons for any account)
  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      username: user.username,
      password: user.password || 'sales123',
      role: user.role,
      mobile: user.mobile || '',
      shift: user.shift || 'General',
      counter_no: user.counter_no || 'Counter 1',
      status: user.status || 'active',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  // Save form (Updates allowed for both Admin and Sales Persons)
  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedName = formData.name.trim();
    const trimmedUsername = formData.username.trim().toLowerCase();

    if (!trimmedName) {
      setFormError('Staff name is required.');
      return;
    }
    if (!trimmedUsername) {
      setFormError('Username is required.');
      return;
    }
    if (trimmedUsername.length < 3) {
      setFormError('Username must be at least 3 characters.');
      return;
    }

    // Check username uniqueness
    const duplicate = users.find(
      (u) =>
        u.username.toLowerCase() === trimmedUsername &&
        (!editingUser || u.user_id !== editingUser.user_id)
    );
    if (duplicate) {
      setFormError(`Username "${trimmedUsername}" is already taken by another staff member.`);
      return;
    }

    if (editingUser) {
      updateUser(editingUser.user_id, {
        name: trimmedName,
        username: trimmedUsername,
        password: formData.password.trim() || 'sales123',
        role: formData.role,
        mobile: formData.mobile.trim(),
        shift: formData.shift,
        counter_no: formData.counter_no.trim(),
        status: formData.status,
      });
      setNotification({
        type: 'success',
        message: `${formData.role === 'admin' ? 'Administrator' : 'Sales Person'} "${trimmedName}" updated successfully!`,
      });
    } else {
      if (!isAdmin) {
        setFormError('Admin login alone has access to add new sales persons. Both Admin and Sales Persons can edit and delete accounts.');
        return;
      }
      addUser({
        name: trimmedName,
        username: trimmedUsername,
        password: formData.password.trim() || 'sales123',
        role: formData.role,
        mobile: formData.mobile.trim(),
        shift: formData.shift,
        counter_no: formData.counter_no.trim(),
        status: formData.status,
      });
      setNotification({
        type: 'success',
        message: `New Sales Person "${trimmedName}" created and assigned to ${formData.counter_no}!`,
      });
    }

    setIsModalOpen(false);
  };

  // Delete user execution (Accessible by both Admin and Sales Persons)
  const handleConfirmDelete = () => {
    if (!deletingUser) return;
    const res = deleteUser(deletingUser.user_id);
    if (res.success) {
      setNotification({ type: 'success', message: res.message });
    } else {
      setNotification({ type: 'error', message: res.message });
    }
    setDeletingUser(null);
  };

  // Metrics calculation per user
  const userPerformance = useMemo(() => {
    const stats: Record<number, { billsCount: number; totalRevenue: number; avgBill: number }> = {};
    users.forEach((u) => {
      const userSales = sales.filter((s) => s.user_id === u.user_id);
      const billsCount = userSales.length;
      const totalRevenue = userSales.reduce((acc, s) => acc + s.total_amount, 0);
      const avgBill = billsCount > 0 ? totalRevenue / billsCount : 0;
      stats[u.user_id] = { billsCount, totalRevenue, avgBill };
    });
    return stats;
  }, [users, sales]);

  // Overall statistics
  const totalStaff = users.length;
  const activeSalesPersons = users.filter((u) => u.role === 'sales_person' && u.status !== 'inactive').length;
  const totalBillsByStaff = sales.length;
  const totalStaffRevenue = sales.reduce((acc, s) => acc + s.total_amount, 0);

  // Filtered users list
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        (u.mobile && u.mobile.includes(q)) ||
        (u.counter_no && u.counter_no.toLowerCase().includes(q));

      const matchesRole = roleFilter === 'all' || u.role === roleFilter;
      const matchesShift = shiftFilter === 'all' || u.shift === shiftFilter;
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && u.status !== 'inactive') ||
        (statusFilter === 'inactive' && u.status === 'inactive');

      return matchesSearch && matchesRole && matchesShift && matchesStatus;
    });
  }, [users, searchQuery, roleFilter, shiftFilter, statusFilter]);

  return (
    <div className="space-y-5">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Total Staff Members
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{totalStaff}</div>
            <div className="text-xs text-slate-500 mt-0.5">Admin &amp; Sales Persons</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Active Sales Persons
            </div>
            <div className="text-2xl font-bold text-emerald-600 mt-1">{activeSalesPersons}</div>
            <div className="text-xs text-slate-500 mt-0.5">Ready on billing counters</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Store className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Bills Generated
            </div>
            <div className="text-2xl font-bold text-blue-600 mt-1">{totalBillsByStaff}</div>
            <div className="text-xs text-slate-500 mt-0.5">Across all billing registers</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Receipt className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Total Staff Revenue
            </div>
            <div className="text-2xl font-bold text-slate-900 font-mono mt-1">
              ₹{totalStaffRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">Cumulative billing counter sales</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <IndianRupee className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Edit & Delete Control Info Banner */}
      <div className="bg-emerald-50/90 border border-emerald-200 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs text-emerald-950 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <strong className="block text-emerald-950 font-bold">
              Staff Management: Edit &amp; Delete Options Active
            </strong>
            <span className="text-emerald-800 text-[11px]">
              Administrators and Sales Persons can click <strong>Edit</strong> to modify details, shifts, counters, or PINs, and <strong>Delete</strong> to remove accounts.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white/80 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs">
          <span className="text-slate-500 font-medium">Logged in as:</span>
          <strong className="text-slate-900">{currentUser.name}</strong>
          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
            {currentUser.role === 'admin' ? 'Store Admin' : 'Sales Person'}
          </span>
        </div>
      </div>

      {/* Action Notification Toast */}
      {notification && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs shadow-sm animate-in fade-in slide-in-from-top-1 ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span className="font-semibold">{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-slate-600 cursor-pointer p-0.5 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Action Bar & Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="relative w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search staff by name, username, mobile, counter..."
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg pl-9 pr-3 py-1.5 text-xs focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin ? (
              <button
                onClick={handleOpenAdd}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add Sales Person</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 border border-slate-200 text-slate-500 rounded-lg text-xs font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                <span>Admin Login Alone Can Add Sales Persons</span>
              </div>
            )}
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 text-slate-700 rounded px-2.5 py-1 text-xs outline-none focus:border-emerald-600"
            >
              <option value="all">All Roles ({users.length})</option>
              <option value="sales_person">
                Sales Persons ({users.filter((u) => u.role === 'sales_person').length})
              </option>
              <option value="admin">
                Administrators ({users.filter((u) => u.role === 'admin').length})
              </option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Shift:</span>
            <select
              value={shiftFilter}
              onChange={(e) => setShiftFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 rounded px-2.5 py-1 text-xs outline-none focus:border-emerald-600"
            >
              <option value="all">All Shifts</option>
              <option value="Morning">Morning Shift (08:00 - 16:00)</option>
              <option value="Evening">Evening Shift (14:00 - 22:00)</option>
              <option value="General">General Shift (09:00 - 18:00)</option>
              <option value="Night">Night Shift (18:00 - 02:00)</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 text-slate-700 rounded px-2.5 py-1 text-xs outline-none focus:border-emerald-600"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>

          <div className="ml-auto text-slate-500 text-[11px]">
            Showing <strong className="text-slate-800">{filteredUsers.length}</strong> of{' '}
            <strong className="text-slate-800">{users.length}</strong> staff members
          </div>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-left border-b border-slate-200 font-semibold">
                <th className="py-3 px-3.5">Staff Member &amp; Account</th>
                <th className="py-3 px-3">Role &amp; Counter</th>
                <th className="py-3 px-3">Shift Timing</th>
                <th className="py-3 px-3">Contact</th>
                <th className="py-3 px-3 text-right">Bills Handled</th>
                <th className="py-3 px-3 text-right">Total Sales</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-center">Active User</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    No staff members match your criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const perf = userPerformance[user.user_id] || { billsCount: 0, totalRevenue: 0, avgBill: 0 };
                  const isCurrent = currentUser.user_id === user.user_id;
                  const isActive = user.status !== 'inactive';

                  return (
                    <tr
                      key={user.user_id}
                      className={`hover:bg-slate-50 transition-colors ${
                        isCurrent ? 'bg-emerald-50/40' : ''
                      }`}
                    >
                      {/* Name & Username */}
                      <td className="py-3 px-3.5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs uppercase shadow-sm ${
                              user.role === 'admin'
                                ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                                : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {user.name.slice(0, 2)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{user.name}</span>
                              {isCurrent && (
                                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded border border-emerald-300">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono">
                              @{user.username} • PIN: {user.password || 'sales123'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role & Counter */}
                      <td className="py-3 px-3">
                        <div className="space-y-1">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              user.role === 'admin'
                                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                          >
                            <ShieldCheck className="w-3 h-3" />
                            {user.role === 'admin' ? 'Store Admin / Owner' : 'Sales Person / Cashier'}
                          </span>
                          <div className="text-[11px] text-slate-600 flex items-center gap-1">
                            <Store className="w-3 h-3 text-slate-400" />
                            <span className="font-medium">{user.counter_no || 'Counter 1'}</span>
                          </div>
                        </div>
                      </td>

                      {/* Shift Timing */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1 text-slate-700">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-medium">{user.shift || 'General'}</span>
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {user.shift === 'Morning' && '08:00 AM – 04:00 PM'}
                          {user.shift === 'Evening' && '02:00 PM – 10:00 PM'}
                          {user.shift === 'Night' && '06:00 PM – 02:00 AM'}
                          {(!user.shift || user.shift === 'General') && '09:00 AM – 06:00 PM'}
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-3 px-3">
                        {user.mobile ? (
                          <div className="flex items-center gap-1 text-slate-700 font-mono text-[11px]">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{user.mobile}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Bills Count */}
                      <td className="py-3 px-3 text-right">
                        <div className="font-mono font-bold text-slate-900">{perf.billsCount}</div>
                        <div className="text-[10px] text-slate-500">receipts</div>
                      </td>

                      {/* Total Sales */}
                      <td className="py-3 px-3 text-right">
                        <div className="font-mono font-bold text-emerald-700">
                          ₹{perf.totalRevenue.toFixed(2)}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          avg ₹{perf.avgBill.toFixed(0)}/bill
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => toggleUserStatus(user.user_id)}
                          title="Click to toggle Active/Inactive status"
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold cursor-pointer transition-colors ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                              : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                          }`}
                        >
                          {isActive ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              Active
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3" />
                              Inactive
                            </>
                          )}
                        </button>
                      </td>

                      {/* Active User Switch */}
                      <td className="py-3 px-3 text-center">
                        {isCurrent ? (
                          <span className="text-[11px] font-bold text-emerald-700 flex items-center justify-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Logged In
                          </span>
                        ) : (
                          <button
                            onClick={() => {
                              switchUser(user.user_id);
                            }}
                            className="px-2 py-1 bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-700 rounded text-[11px] font-medium border border-slate-200 transition-colors flex items-center justify-center gap-1 mx-auto cursor-pointer"
                            title="Switch active session to this user to test billing or counter"
                          >
                            <LogIn className="w-3 h-3" />
                            Switch
                          </button>
                        )}
                      </td>

                      {/* Actions: Edit & Delete for Admin and Sales Persons */}
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(user)}
                            className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                            title={`Edit ${user.name}'s profile, shift, password or counter`}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingUser(user)}
                            className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                            title={`Delete ${user.name} from system`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Switch Help Card */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-start gap-2.5">
          <Store className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-slate-900">
              Multiple Cashiers &amp; Shift Management Ready
            </div>
            <div className="text-slate-600 mt-0.5">
              Every sales person can be assigned their own counter and shift. When billing, the POS counter
              automatically stamps their name, register ID, and credentials onto customer tax invoices.
            </div>
          </div>
        </div>
        <button
          onClick={() => setActiveTab('billing')}
          className="px-3.5 py-1.5 bg-white border border-slate-300 text-slate-800 hover:border-emerald-600 hover:text-emerald-700 font-semibold rounded-lg shadow-sm transition-colors shrink-0 cursor-pointer"
        >
          Open POS Billing Counter &rarr;
        </button>
      </div>

      {/* Add / Edit Staff Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            {/* Modal Header */}
            <div className="bg-slate-50 border-b border-slate-200 px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${
                  editingUser ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {editingUser ? <Edit2 className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    {editingUser
                      ? editingUser.role === 'admin'
                        ? `Edit Administrator Account (${editingUser.name})`
                        : `Edit Sales Person Account (${editingUser.name})`
                      : 'Add New Sales Person'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {editingUser
                      ? 'Update shift timing, assigned counter, password/PIN, role, or contact details'
                      : 'Create a new cashier account for supermarket billing'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveUser} className="p-5 space-y-4 text-xs">
              {formError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 px-3 py-2 rounded-lg flex items-center gap-2 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Full Name */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="font-semibold text-slate-700">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Anand Sharma, Priya Verma"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none"
                  />
                </div>

                {/* Username */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Username *</label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="e.g. anand, priya, sales2"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-mono focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none"
                  />
                  <span className="text-[10px] text-slate-400">Used for fast login</span>
                </div>

                {/* Password / PIN */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Password / PIN *</label>
                  <input
                    type="text"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="e.g. sales123, 1234"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-mono focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none"
                  />
                  <span className="text-[10px] text-slate-400">Cashier login password</span>
                </div>

                {/* Role */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:bg-white focus:border-emerald-600 outline-none"
                  >
                    <option value="sales_person">Sales Person / Cashier</option>
                    <option value="admin">Store Admin / Owner</option>
                  </select>
                </div>

                {/* Assigned Counter */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Assigned Counter / Register</label>
                  <input
                    type="text"
                    value={formData.counter_no}
                    onChange={(e) => setFormData({ ...formData, counter_no: e.target.value })}
                    placeholder="e.g. Counter 1, Counter 2, Express"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:bg-white focus:border-emerald-600 outline-none"
                  />
                </div>

                {/* Shift Timing */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Shift Timing</label>
                  <select
                    value={formData.shift}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        shift: e.target.value as 'Morning' | 'Evening' | 'General' | 'Night',
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:bg-white focus:border-emerald-600 outline-none"
                  >
                    <option value="Morning">Morning (08:00 AM - 04:00 PM)</option>
                    <option value="Evening">Evening (02:00 PM - 10:00 PM)</option>
                    <option value="General">General (09:00 AM - 06:00 PM)</option>
                    <option value="Night">Night (06:00 PM - 02:00 AM)</option>
                  </select>
                </div>

                {/* Mobile Number */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Contact Mobile</label>
                  <input
                    type="tel"
                    maxLength={10}
                    value={formData.mobile}
                    onChange={(e) =>
                      setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, '') })
                    }
                    placeholder="e.g. 9845012345"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-mono focus:bg-white focus:border-emerald-600 outline-none"
                  />
                </div>

                {/* Status */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="font-semibold text-slate-700">Account Status</label>
                  <div className="flex items-center gap-4 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        checked={formData.status === 'active'}
                        onChange={() => setFormData({ ...formData, status: 'active' })}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-slate-800 font-medium">Active (Can log in &amp; bill)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        checked={formData.status === 'inactive'}
                        onChange={() => setFormData({ ...formData, status: 'inactive' })}
                        className="text-rose-600 focus:ring-rose-500"
                      />
                      <span className="text-slate-600">Inactive (Account suspended)</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-sm transition-colors cursor-pointer"
                >
                  {editingUser ? 'Save Changes' : 'Create Sales Person'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Delete {deletingUser.role === 'admin' ? 'Administrator' : 'Sales Person'}?
                </h3>
                <p className="text-xs text-slate-500">
                  Are you sure you want to remove {deletingUser.name}?
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs text-slate-700">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Staff Name:</span>
                <strong className="text-slate-900">{deletingUser.name}</strong>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Username:</span>
                <span className="font-mono text-slate-800">@{deletingUser.username}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Role:</span>
                <span className="font-semibold text-slate-800 capitalize">
                  {deletingUser.role === 'admin' ? 'Store Administrator' : 'Sales Person / Cashier'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Assigned Counter:</span>
                <span className="font-mono text-slate-800">{deletingUser.counter_no || 'Counter 1'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Shift Timing:</span>
                <span className="text-slate-800">{deletingUser.shift || 'General'}</span>
              </div>
            </div>

            <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-3 leading-relaxed">
              <strong className="font-bold text-amber-900 block mb-0.5">Audit Trail Preserved:</strong>
              This deletes the login account from the active roster. Any previous sales invoices and receipts issued by this staff member are safely preserved under the store records.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-700/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Yes, Delete Account</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
