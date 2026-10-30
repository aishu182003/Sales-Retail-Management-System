import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { Customer } from '../types';
import {
  Users,
  Search,
  Plus,
  ShoppingBag,
  Star,
  MessageCircle,
  Phone,
  Calendar,
  DollarSign,
  Receipt,
  X,
  ExternalLink,
} from 'lucide-react';

export const CustomersView: React.FC = () => {
  const { customers, sales, saleItems, products, addNewCustomer, reprintSale, currentUser, setActiveTab } = useStore();
  const isAdmin = currentUser.role === 'admin';

  const [searchMobile, setSearchMobile] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // New customer quick add modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newMobile, setNewMobile] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newAddress, setNewAddress] = useState('');

  // Filtered customers
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const q = searchMobile.toLowerCase().trim();
      return (
        c.mobile.includes(q) ||
        c.name.toLowerCase().includes(q) ||
        `cust-${c.customer_id}`.includes(q)
      );
    });
  }, [customers, searchMobile]);

  // Purchase analytics per customer
  const customerAnalytics = useMemo(() => {
    const map = new Map<
      number,
      {
        totalSpend: number;
        billCount: number;
        lastPurchase: string;
        frequentProduct: string;
        allBills: typeof sales;
        productCounts: Record<number, number>;
      }
    >();

    customers.forEach((c) => {
      const custSales = sales.filter((s) => s.customer_id === c.customer_id);
      const spend = custSales.reduce((acc, s) => acc + s.total_amount, 0);
      const sortedSales = [...custSales].sort(
        (a, b) => new Date(b.sale_date).getTime() - new Date(a.sale_date).getTime()
      );
      const lastDate = sortedSales[0] ? sortedSales[0].sale_date : 'No purchases';

      // Find frequently purchased product
      const productCounts: Record<number, number> = {};
      const custSaleIds = new Set(custSales.map((s) => s.sale_id));
      saleItems.forEach((si) => {
        if (custSaleIds.has(si.sale_id)) {
          productCounts[si.product_id] = (productCounts[si.product_id] || 0) + si.quantity;
        }
      });

      let freqProdName = 'None';
      let maxCount = 0;
      Object.entries(productCounts).forEach(([pId, count]) => {
        if (count > maxCount) {
          maxCount = count;
          const prod = products.find((p) => p.product_id === parseInt(pId));
          if (prod) {
            freqProdName = `${prod.product_name} (${count} units)`;
          }
        }
      });

      map.set(c.customer_id, {
        totalSpend: spend,
        billCount: custSales.length,
        lastPurchase: lastDate,
        frequentProduct: freqProdName,
        allBills: sortedSales,
        productCounts,
      });
    });

    return map;
  }, [customers, sales, saleItems, products]);

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMobile.trim() || newMobile.trim().length !== 10) {
      alert('Please enter a valid 10-digit mobile number.');
      return;
    }
    const c = addNewCustomer({
      name: newName.trim() || 'Valued Shopper',
      mobile: newMobile.trim(),
      email: newEmail.trim() || undefined,
      address: newAddress.trim() || undefined,
      loyalty_points: 50,
    });
    setNewName('');
    setNewMobile('');
    setNewEmail('');
    setNewAddress('');
    setIsAddOpen(false);
    setSelectedCustomer(c);
  };

  const activeAnalytics = selectedCustomer
    ? customerAnalytics.get(selectedCustomer.customer_id)
    : null;

  return (
    <div className="space-y-4">
      {/* Search & Actions Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchMobile}
            onChange={(e) => setSearchMobile(e.target.value)}
            placeholder="Search customer by name, mobile, or ID..."
            className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg pl-9 pr-3 py-1.5 text-xs focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('offers')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition-all cursor-pointer"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Active Offer WhatsApp Broadcast</span>
          </button>

          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Customer</span>
          </button>
        </div>
      </div>

      {/* Customer Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-left border-b border-slate-200 font-semibold">
                <th className="py-3 px-3">ID</th>
                <th className="py-3 px-3">Customer Name</th>
                <th className="py-3 px-3 font-mono">Mobile Number</th>
                <th className="py-3 px-2 text-center">Loyalty Points</th>
                <th className="py-3 px-2 text-center">Total Bills</th>
                {isAdmin && <th className="py-3 px-3 text-right">Lifetime Spend</th>}
                <th className="py-3 px-3">Favorite Product</th>
                <th className="py-3 px-3 text-center">WhatsApp</th>
                <th className="py-3 px-3 text-center">History</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.map((c) => {
                const stat = customerAnalytics.get(c.customer_id);
                const waUrl = `https://api.whatsapp.com/send?phone=91${c.mobile}&text=Hello%20${encodeURIComponent(
                  c.name
                )},%20greetings%20from%20Smart%20Retail!%20You%20have%20${c.loyalty_points || 0}%20Loyalty%20Points%20in%20your%20account.`;

                return (
                  <tr key={c.customer_id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3 font-mono text-slate-400 font-semibold">
                      #{c.customer_id}
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-900">{c.name}</td>
                    <td className="py-3 px-3 font-mono text-slate-600">{c.mobile}</td>
                    <td className="py-3 px-2 text-center">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        <span>{c.loyalty_points || 0} pts</span>
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono font-semibold">
                        {stat?.billCount || 0}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="py-3 px-3 text-right font-mono font-extrabold text-emerald-700">
                        ₹{(stat?.totalSpend || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </td>
                    )}
                    <td className="py-3 px-3">
                      <span className="text-[11px] text-slate-700 font-medium truncate block max-w-[200px]">
                        {stat?.frequentProduct}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[11px] font-semibold transition-colors"
                        title="Chat or Send Offer on WhatsApp"
                      >
                        <MessageCircle className="w-3 h-3 text-emerald-600" />
                        <span>WhatsApp</span>
                      </a>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => setSelectedCustomer(c)}
                        className="px-2.5 py-1 rounded bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-semibold transition-colors shadow-xs"
                      >
                        View Bills
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Purchase History Modal */}
      {selectedCustomer && activeAnalytics && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-xl p-5 w-full max-w-2xl shadow-2xl text-slate-800 my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-600" />
                  <span>{selectedCustomer.name} - Purchase History</span>
                </h3>
                <p className="text-[11px] text-slate-500 font-mono">
                  Mobile: {selectedCustomer.mobile} | Loyalty Points: ⭐ {selectedCustomer.loyalty_points || 0} pts
                </p>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-1 rounded text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* KPI Summary Cards */}
            <div className={`grid ${isAdmin ? 'grid-cols-3' : 'grid-cols-2'} gap-3 mb-4`}>
              {isAdmin && (
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">
                    Lifetime Value
                  </span>
                  <span className="text-base font-extrabold text-emerald-700 font-mono">
                    ₹{activeAnalytics.totalSpend.toFixed(2)}
                  </span>
                </div>
              )}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">
                  Total Visits / Bills
                </span>
                <span className="text-base font-extrabold text-slate-900 font-mono">
                  {activeAnalytics.billCount} transactions
                </span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">
                  Favorite Item
                </span>
                <span className="text-xs font-bold text-slate-800 block truncate">
                  {activeAnalytics.frequentProduct}
                </span>
              </div>
            </div>

            {/* Bills List */}
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              <h4 className="text-xs font-bold text-slate-800 mb-2">Previous Bills (From Sales Table):</h4>
              {activeAnalytics.allBills.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">No bills found for this customer.</div>
              ) : (
                activeAnalytics.allBills.map((bill) => {
                  const billItems = saleItems.filter((si) => si.sale_id === bill.sale_id);
                  return (
                    <div
                      key={bill.sale_id}
                      className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900">#INV-{bill.sale_id}</span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-500">{bill.sale_date}</span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {bill.payment_method}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-extrabold text-slate-900">
                            ₹{bill.total_amount.toFixed(2)}
                          </span>
                          <button
                            onClick={() => reprintSale(bill.sale_id)}
                            className="text-emerald-700 hover:text-emerald-800 font-semibold underline text-[11px]"
                          >
                            Print Receipt
                          </button>
                        </div>
                      </div>

                      {/* Items row */}
                      <div className="text-[11px] text-slate-600 bg-white p-2 rounded border border-slate-200/80">
                        {billItems.map((bi) => {
                          const p = products.find((prod) => prod.product_id === bi.product_id);
                          return (
                            <span key={bi.sale_item_id} className="inline-block mr-3">
                              • {p?.product_name || 'Item'} &times; {bi.quantity} (₹{bi.amount.toFixed(2)})
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Register New Customer</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateCustomer} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Mobile Number (10 Digits) *</label>
                <input
                  type="tel"
                  value={newMobile}
                  onChange={(e) => setNewMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="e.g. 9876543210"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono text-sm focus:border-emerald-600 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Customer Full Name *</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Ramesh Patel"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:border-emerald-600 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Email Address (Optional)</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="e.g. ramesh@example.com"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:border-emerald-600 outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Address / Landmark (Optional)</label>
                <input
                  type="text"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="e.g. 104 Greenfield Avenue"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:border-emerald-600 outline-none"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="w-1/2 py-2 rounded-lg bg-slate-100 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  Create &amp; Give 50 Pts
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
