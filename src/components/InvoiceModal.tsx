import React from 'react';
import { useStore } from '../context/StoreContext';
import { Printer, CheckCircle2, X } from 'lucide-react';

export const InvoiceModal: React.FC = () => {
  const { lastGeneratedSale, dismissInvoice, products } = useStore();

  if (!lastGeneratedSale) return null;

  const { sale, items, customer, user } = lastGeneratedSale;

  const handlePrint = () => {
    window.print();
  };

  const totalSavings = items.reduce((acc, it) => {
    const regularTotal = it.regular_price * it.quantity;
    return acc + (regularTotal - it.amount);
  }, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-md bg-white border border-slate-300 rounded-2xl shadow-2xl overflow-hidden my-auto text-slate-800">
        {/* Top Control Bar (Hidden during printing) */}
        <div className="no-print bg-slate-50 px-4 py-3 flex items-center justify-between border-b border-slate-200">
          <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
            <CheckCircle2 className="w-4 h-4" />
            <span>Bill Generated &amp; Saved to MySQL</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Bill</span>
            </button>
            <button
              onClick={dismissInvoice}
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Supermarket Thermal Receipt Style Printable Area */}
        <div className="printable-receipt p-6 bg-white text-slate-900 text-xs font-mono">
          {/* Header */}
          <div className="text-center pb-3 border-b border-dashed border-slate-300 mb-3">
            <h2 className="text-base font-black tracking-wider uppercase">SMART RETAIL SUPERMARKET</h2>
            <p className="text-[10px] text-slate-600">Main Market Road, Bangalore - 560001</p>
            <p className="text-[10px] text-slate-600">GSTIN: 29ABCDE1234F1Z5 | Ph: 080-23456789</p>
            <div className="mt-1 text-[11px] font-bold text-slate-800">TAX INVOICE / CASH MEMO</div>
          </div>

          {/* Meta Info */}
          <div className="grid grid-cols-2 gap-1 pb-2 border-b border-dashed border-slate-300 text-[11px] mb-2">
            <div>
              <span className="text-slate-500">Bill No: </span>
              <span className="font-bold text-black">#{sale.sale_id}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-500">Date: </span>
              <span>{sale.sale_date}</span>
            </div>
            <div>
              <span className="text-slate-500">Customer: </span>
              <span className="font-semibold">{customer.name}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-500">Mobile: </span>
              <span>{customer.mobile}</span>
            </div>
            <div>
              <span className="text-slate-500">Cashier: </span>
              <span className="font-semibold text-black">{user.name} ({user.counter_no || 'Counter 1'})</span>
            </div>
            <div className="text-right">
              <span className="text-slate-500">Pay Mode: </span>
              <span className="font-bold uppercase">{sale.payment_method}</span>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="pb-2 border-b border-dashed border-slate-300 mb-2">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-slate-300 text-slate-700">
                  <th className="text-left py-1">Item</th>
                  <th className="text-center py-1">Qty</th>
                  <th className="text-right py-1">Price</th>
                  <th className="text-right py-1">Net</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((it) => {
                  const prod = products.find((p) => p.product_id === it.product_id);
                  const name = prod ? prod.product_name : `Item #${it.product_id}`;
                  const unit = prod?.unit || 'Piece';
                  return (
                    <tr key={it.sale_item_id} className="py-1">
                      <td className="py-1">
                        <div className="font-semibold text-slate-900">{name}</div>
                        {it.discount > 0 && (
                          <span className="text-[10px] text-emerald-700">
                            (Disc -₹{(it.discount * it.quantity).toFixed(2)})
                          </span>
                        )}
                      </td>
                      <td className="text-center py-1">
                        {it.quantity} {unit}
                      </td>
                      <td className="text-right py-1">
                        ₹{it.selling_price.toFixed(2)}/{unit}
                      </td>
                      <td className="text-right py-1 font-bold">₹{it.amount.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Totals Breakdown */}
          <div className="space-y-1 text-[11px] pb-3 border-b border-dashed border-slate-300 mb-3">
            <div className="flex justify-between">
              <span className="text-slate-600">Subtotal:</span>
              <span className="font-semibold">₹{sale.subtotal.toFixed(2)}</span>
            </div>
            {sale.discount > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Total Offer Discount:</span>
                <span>-₹{sale.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-600">GST:</span>
              <span className="font-semibold">{sale.gst_rate ?? 5}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">GST Amount:</span>
              <span className="font-semibold">
                ₹{(sale.gst_amount ?? Math.round(((sale.subtotal * (sale.gst_rate ?? 5)) / 100) * 100) / 100).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm font-black text-slate-900 pt-1 border-t border-slate-200">
              <span>Grand Total:</span>
              <span>₹{sale.total_amount.toFixed(2)}</span>
            </div>
          </div>

          {/* Customer Savings highlight */}
          {totalSavings > 0 && (
            <div className="text-center py-1 px-2 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-[11px] mb-3">
              🎉 Total Customer Savings: ₹{totalSavings.toFixed(2)}!
            </div>
          )}

          {/* Footer Barcode representation and greeting */}
          <div className="text-center text-[10px] text-slate-500 space-y-1">
            <div className="font-mono text-xs tracking-widest text-slate-800 font-bold">
              ||| ||||| |||| |||||||| |||| |||
            </div>
            <p>Thank you for shopping at Smart Retail Supermarket!</p>
            <p>Please visit again. All items are inclusive of applicable GST.</p>
          </div>
        </div>

        {/* Bottom Actions for Screen */}
        <div className="no-print bg-slate-50 px-4 py-3 flex justify-end gap-2 border-t border-slate-200">
          <button
            onClick={dismissInvoice}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold transition-colors"
          >
            Close &amp; Start Next Bill
          </button>
        </div>
      </div>
    </div>
  );
};
