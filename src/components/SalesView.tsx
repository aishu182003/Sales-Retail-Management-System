import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import {
  Search,
  Printer,
  UserCheck,
  Trash2,
  ListOrdered,
  X,
  AlertCircle,
  CheckCircle,
  Package,
} from 'lucide-react';
import { Sale } from '../types';

export const SalesView: React.FC = () => {
  const { sales, customers, users, reprintSale, saleItems, products, removeSaleItem, voidSale } = useStore();

  const [search, setSearch] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [cashierFilter, setCashierFilter] = useState('all');

  // Modal to manage / remove items from a selected past bill
  const [selectedSaleForItems, setSelectedSaleForItems] = useState<Sale | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const filteredSales = useMemo(() => {
    return sales
      .filter((s) => {
        const cust = customers.find((c) => c.customer_id === s.customer_id);
        const cashier = users.find((u) => u.user_id === s.user_id);
        const matchesQuery =
          s.sale_id.toString().includes(search) ||
          (cust && (cust.name.toLowerCase().includes(search.toLowerCase()) || cust.mobile.includes(search))) ||
          (cashier && (cashier.name.toLowerCase().includes(search.toLowerCase()) || cashier.username.toLowerCase().includes(search.toLowerCase())));
        const matchesPayment = paymentFilter === 'all' || s.payment_method === paymentFilter;
        const matchesCashier = cashierFilter === 'all' || s.user_id.toString() === cashierFilter;
        return matchesQuery && matchesPayment && matchesCashier;
      })
      .sort((a, b) => new Date(b.sale_date).getTime() - new Date(a.sale_date).getTime());
  }, [sales, customers, users, search, paymentFilter, cashierFilter]);

  // Current items of the actively selected bill in modal
  const activeBillItems = useMemo(() => {
    if (!selectedSaleForItems) return [];
    return saleItems.filter((si) => si.sale_id === selectedSaleForItems.sale_id);
  }, [saleItems, selectedSaleForItems]);

  // Keep selectedSale synchronized with updated sales state
  const currentSelectedSale = useMemo(() => {
    if (!selectedSaleForItems) return null;
    return sales.find((s) => s.sale_id === selectedSaleForItems.sale_id) || null;
  }, [sales, selectedSaleForItems]);

  const handleRemoveItemFromBill = (saleId: number, saleItemId: number, prodName: string, qty: number) => {
    const res = removeSaleItem(saleId, saleItemId);
    setFeedbackMessage({
      type: res.success ? 'success' : 'error',
      text: res.message,
    });
    // If the bill was voided because no items remain, close modal
    const remaining = saleItems.filter((si) => si.sale_id === saleId && si.sale_item_id !== saleItemId);
    if (remaining.length === 0) {
      setTimeout(() => setSelectedSaleForItems(null), 1800);
    }
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  const handleVoidWholeBill = (saleId: number) => {
    if (window.confirm(`Are you sure you want to cancel and void Bill #${saleId}? All items will be returned to store inventory.`)) {
      const res = voidSale(saleId);
      setFeedbackMessage({ type: 'success', text: res.message });
      setSelectedSaleForItems(null);
      setTimeout(() => setFeedbackMessage(null), 4000);
    }
  };

  return (
    <div className="space-y-4">
      {/* Toast feedback */}
      {feedbackMessage && (
        <div
          className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs shadow-sm animate-in fade-in ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMessage.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span className="font-semibold">{feedbackMessage.text}</span>
          </div>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="text-slate-400 hover:text-slate-600 p-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Bill #, Customer Name, Mobile, or Cashier..."
            className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg pl-9 pr-3 py-1.5 text-xs focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Billed By (Cashier):</span>
            <select
              value={cashierFilter}
              onChange={(e) => setCashierFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-800 rounded px-2.5 py-1 text-xs outline-none focus:border-emerald-600"
            >
              <option value="all">All Cashiers ({users.length})</option>
              {users.map((u) => (
                <option key={u.user_id} value={u.user_id.toString()}>
                  {u.name} ({u.role === 'admin' ? 'Admin' : u.counter_no || 'Cashier'})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Payment Mode:</span>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-800 rounded px-2.5 py-1 text-xs outline-none focus:border-emerald-600"
            >
              <option value="all">All Modes</option>
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
              <option value="Card">Card</option>
            </select>
          </div>
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-left border-b border-slate-200 font-semibold">
                <th className="py-3 px-3">Bill #</th>
                <th className="py-3 px-3">Date &amp; Time</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">Billed By (Cashier)</th>
                <th className="py-3 px-2 text-right">Subtotal</th>
                <th className="py-3 px-2 text-right">Discount</th>
                <th className="py-3 px-2 text-right">GST</th>
                <th className="py-3 px-3 text-right">Grand Total</th>
                <th className="py-3 px-2 text-center">Payment</th>
                <th className="py-3 px-3 text-center">Items &amp; Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSales.map((sale) => {
                const cust = customers.find((c) => c.customer_id === sale.customer_id);
                const cashier = users.find((u) => u.user_id === sale.user_id);
                const itemCount = saleItems.filter((si) => si.sale_id === sale.sale_id).length;
                const saleGstRate = sale.gst_rate ?? 5;
                const saleGstAmount =
                  sale.gst_amount ?? Math.round(((sale.subtotal * saleGstRate) / 100) * 100) / 100;

                return (
                  <tr key={sale.sale_id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">#{sale.sale_id}</td>
                    <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">
                      {sale.sale_date}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{cust?.name || 'Walk-in'}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{cust?.mobile}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-800 flex items-center gap-1">
                        <UserCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>{cashier?.name || `Staff #${sale.user_id}`}</span>
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {cashier?.counter_no || 'Counter 1'}
                      </div>
                    </td>
                    <td className="py-3 px-2 text-right font-mono text-slate-500">
                      ₹{sale.subtotal.toFixed(2)}
                    </td>
                    <td className="py-3 px-2 text-right font-mono text-rose-600 font-medium">
                      {sale.discount > 0 ? `-₹${sale.discount.toFixed(2)}` : '—'}
                    </td>
                    <td className="py-3 px-2 text-right font-mono text-indigo-700 font-medium">
                      <div>₹{saleGstAmount.toFixed(2)}</div>
                      <div className="text-[10px] text-slate-400">({saleGstRate}%)</div>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-extrabold text-emerald-700 text-sm">
                      ₹{sale.total_amount.toFixed(2)}
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-mono text-[10px] uppercase font-semibold">
                        {sale.payment_method}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedSaleForItems(sale)}
                          className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-[11px] font-semibold transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
                          title="View and remove items from this bill"
                        >
                          <ListOrdered className="w-3 h-3" />
                          <span>Items ({itemCount})</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => reprintSale(sale.sale_id)}
                          className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-semibold transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
                          title="Print customer receipt"
                        >
                          <Printer className="w-3 h-3 text-emerald-600" />
                          <span>Print</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Manage & Remove Items From A Past Bill */}
      {selectedSaleForItems && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="bg-slate-50 border-b border-slate-200 px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Manage Items in Bill #{selectedSaleForItems.sale_id}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Billed on {selectedSaleForItems.sale_date} • Remove individual items or void the bill
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSaleForItems(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Bill Summary Banner */}
            {currentSelectedSale && (
              <div className="p-3.5 bg-indigo-50/50 border-b border-indigo-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-slate-500">Customer: </span>
                  <strong className="text-slate-900">
                    {customers.find((c) => c.customer_id === currentSelectedSale.customer_id)?.name || 'Walk-in Customer'}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500">Payment: </span>
                  <span className="font-mono font-semibold text-slate-800">{currentSelectedSale.payment_method}</span>
                </div>
                <div>
                  <span className="text-slate-500">Bill Total: </span>
                  <strong className="text-emerald-700 font-mono text-sm">₹{currentSelectedSale.total_amount.toFixed(2)}</strong>
                </div>
              </div>
            )}

            {/* Items Table */}
            <div className="p-4 overflow-y-auto flex-1">
              <div className="mb-2 text-xs text-slate-600">
                <strong>Bill Line Items:</strong> Removing an item automatically returns its quantity back to inventory stock and recalculates the bill total.
              </div>

              {activeBillItems.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  All items in this bill have been removed.
                </div>
              ) : (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 text-left border-b border-slate-200 font-semibold">
                        <th className="py-2.5 px-3">Product Name</th>
                        <th className="py-2.5 px-2 text-center">Qty</th>
                        <th className="py-2.5 px-2 text-right">Price</th>
                        <th className="py-2.5 px-2 text-right">Disc</th>
                        <th className="py-2.5 px-3 text-right">Line Total</th>
                        <th className="py-2.5 px-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {activeBillItems.map((item) => {
                        const prod = products.find((p) => p.product_id === item.product_id);
                        const unit = prod?.unit || 'Piece';
                        return (
                          <tr key={item.sale_item_id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-2.5 px-3">
                              <div className="font-bold text-slate-900">{prod?.product_name || `Product #${item.product_id}`}</div>
                              <div className="text-[10px] text-slate-400 font-mono">{prod?.barcode} • Unit: {unit}</div>
                            </td>
                            <td className="py-2.5 px-2 text-center font-mono font-bold text-slate-800">
                              {item.quantity} {unit}
                            </td>
                            <td className="py-2.5 px-2 text-right font-mono text-slate-600">
                              ₹{item.selling_price.toFixed(2)}/{unit}
                            </td>
                            <td className="py-2.5 px-2 text-right font-mono text-rose-600">
                              {item.discount > 0 ? `-₹${(item.discount * item.quantity).toFixed(2)}` : '—'}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                              ₹{item.amount.toFixed(2)}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveItemFromBill(
                                    item.sale_id,
                                    item.sale_item_id,
                                    prod?.product_name || 'Product',
                                    item.quantity
                                  )
                                }
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition-colors cursor-pointer shadow-2xs group"
                                title="Remove this item from the bill and restore stock"
                              >
                                <Trash2 className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                                <span>Remove Item</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleVoidWholeBill(selectedSaleForItems.sale_id)}
                className="px-3 py-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Void Whole Bill</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedSaleForItems(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Done / Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
