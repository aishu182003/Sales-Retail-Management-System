import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import {
  FileBarChart2,
  Calendar,
  Printer,
  TrendingUp,
  AlertTriangle,
  Users,
  Package,
  Layers,
  DollarSign,
  Download,
} from 'lucide-react';

type ReportType =
  | 'profit_analysis'
  | 'product_sales'
  | 'category_sales'
  | 'customer_spending'
  | 'stock_reorder';

export const ReportsView: React.FC = () => {
  const { sales, saleItems, products, categories, brands, customers } = useStore();

  const [activeReport, setActiveReport] = useState<ReportType>('profit_analysis');
  const [startDate, setStartDate] = useState('2025-01-01');
  const [endDate, setEndDate] = useState('2025-12-31');

  // Filtered sales by date
  const filteredSales = useMemo(() => {
    return sales.filter((s) => {
      const d = s.sale_date.split(' ')[0];
      return d >= startDate && d <= endDate;
    });
  }, [sales, startDate, endDate]);

  const filteredSaleIds = useMemo(
    () => new Set(filteredSales.map((s) => s.sale_id)),
    [filteredSales]
  );

  const filteredItems = useMemo(
    () => saleItems.filter((si) => filteredSaleIds.has(si.sale_id)),
    [saleItems, filteredSaleIds]
  );

  // Profit Analysis Data
  const profitReportData = useMemo(() => {
    const pMap = new Map<
      number,
      {
        product_name: string;
        barcode: string;
        category: string;
        units: number;
        cost_total: number;
        revenue_total: number;
        profit_total: number;
      }
    >();

    filteredItems.forEach((si) => {
      const prod = products.find((p) => p.product_id === si.product_id);
      const cat = prod ? categories.find((c) => c.category_id === prod.category_id) : null;
      const current = pMap.get(si.product_id) || {
        product_name: prod?.product_name || `Item #${si.product_id}`,
        barcode: prod?.barcode || '—',
        category: cat?.category_name || 'General',
        units: 0,
        cost_total: 0,
        revenue_total: 0,
        profit_total: 0,
      };

      current.units += si.quantity;
      current.cost_total += si.cost_price * si.quantity;
      current.revenue_total += si.amount;
      current.profit_total += si.profit;
      pMap.set(si.product_id, current);
    });

    return Array.from(pMap.values()).sort((a, b) => b.profit_total - a.profit_total);
  }, [filteredItems, products, categories]);

  // Product Sales Data
  const productSalesReport = useMemo(() => {
    return profitReportData.map((p) => ({
      name: p.product_name,
      barcode: p.barcode,
      category: p.category,
      units: p.units,
      revenue: p.revenue_total,
      avgRate: p.units > 0 ? p.revenue_total / p.units : 0,
    }));
  }, [profitReportData]);

  // Category Sales Data
  const categorySalesReport = useMemo(() => {
    const cMap = new Map<
      number,
      { category_name: string; units: number; revenue: number; profit: number }
    >();

    categories.forEach((c) => {
      cMap.set(c.category_id, {
        category_name: c.category_name,
        units: 0,
        revenue: 0,
        profit: 0,
      });
    });

    filteredItems.forEach((si) => {
      const prod = products.find((p) => p.product_id === si.product_id);
      if (prod && cMap.has(prod.category_id)) {
        const entry = cMap.get(prod.category_id)!;
        entry.units += si.quantity;
        entry.revenue += si.amount;
        entry.profit += si.profit;
      }
    });

    return Array.from(cMap.values()).sort((a, b) => b.revenue - a.revenue);
  }, [categories, filteredItems, products]);

  // Customer Spending Data
  const customerSpendingReport = useMemo(() => {
    const custMap = new Map<
      number,
      { name: string; mobile: string; orders: number; totalSpend: number; lastDate: string }
    >();

    customers.forEach((c) => {
      custMap.set(c.customer_id, {
        name: c.name,
        mobile: c.mobile,
        orders: 0,
        totalSpend: 0,
        lastDate: '—',
      });
    });

    filteredSales.forEach((s) => {
      const entry = custMap.get(s.customer_id);
      if (entry) {
        entry.orders += 1;
        entry.totalSpend += s.total_amount;
        if (entry.lastDate === '—' || s.sale_date > entry.lastDate) {
          entry.lastDate = s.sale_date;
        }
      }
    });

    return Array.from(custMap.values()).sort((a, b) => b.totalSpend - a.totalSpend);
  }, [customers, filteredSales]);

  // Stock Reorder Report
  const stockReorderData = useMemo(() => {
    return products
      .filter((p) => p.status === 'active' && p.stock <= p.reorder_level)
      .map((p) => {
        const cat = categories.find((c) => c.category_id === p.category_id);
        const brand = brands.find((b) => b.brand_id === p.brand_id);
        return {
          ...p,
          category_name: cat?.category_name || 'General',
          brand_name: brand?.brand_name || 'General',
          deficit: p.reorder_level - p.stock,
        };
      })
      .sort((a, b) => a.stock - b.stock);
  }, [products, categories, brands]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Report Selector Tabs */}
      <div className="no-print bg-white border border-slate-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: 'profit_analysis', label: 'Profit Analysis', icon: TrendingUp },
            { id: 'product_sales', label: 'Product Sales', icon: Package },
            { id: 'category_sales', label: 'Category Sales', icon: Layers },
            { id: 'customer_spending', label: 'Customer Spending', icon: Users },
            { id: 'stock_reorder', label: 'Stock Reorder Report', icon: AlertTriangle },
          ].map((r) => {
            const Icon = r.icon;
            const isActive = activeReport === r.id;
            return (
              <button
                key={r.id}
                onClick={() => setActiveReport(r.id as ReportType)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{r.label}</span>
              </button>
            );
          })}
        </div>

        {/* Date Filter & Print */}
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent text-slate-800 text-xs outline-none"
            />
            <span className="text-slate-400">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent text-slate-800 text-xs outline-none"
            />
          </div>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold transition-colors shadow-xs"
          >
            <Printer className="w-3.5 h-3.5 text-emerald-600" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Printable Report Canvas */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        {/* Report Header for Prints and Screen */}
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div>
            <div className="text-xs font-mono text-emerald-700 uppercase tracking-wider font-bold">
              Smart Retail Supermarket &bull; Management Information System
            </div>
            <h2 className="text-lg font-bold text-slate-900 capitalize">
              {activeReport.replace(/_/g, ' ')} Report
            </h2>
            <p className="text-xs text-slate-500">
              Generated period: {startDate} to {endDate} &bull; Filtered transactions: {filteredSales.length} bills
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs px-2.5 py-1 rounded bg-slate-100 text-slate-700 font-mono font-medium">
              Formula: (Selling Price - Cost Price) &times; Qty
            </span>
          </div>
        </div>

        {/* 1. Profit Analysis Report */}
        {activeReport === 'profit_analysis' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 text-left border-b border-slate-200 font-semibold">
                  <th className="py-2.5 px-3">Product Name</th>
                  <th className="py-2.5 px-2 font-mono">Barcode</th>
                  <th className="py-2.5 px-2">Category</th>
                  <th className="py-2.5 px-2 text-center">Qty Sold</th>
                  <th className="py-2.5 px-3 text-right">Cost Value</th>
                  <th className="py-2.5 px-3 text-right">Revenue Sold</th>
                  <th className="py-2.5 px-3 text-right font-bold text-emerald-700">Net Profit</th>
                  <th className="py-2.5 px-2 text-right">Margin %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {profitReportData.map((row, i) => {
                  const margin = row.revenue_total > 0 ? (row.profit_total / row.revenue_total) * 100 : 0;
                  return (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3 font-bold text-slate-900">{row.product_name}</td>
                      <td className="py-2.5 px-2 font-mono text-slate-500 text-[11px]">{row.barcode}</td>
                      <td className="py-2.5 px-2 text-slate-600">{row.category}</td>
                      <td className="py-2.5 px-2 text-center font-mono text-slate-800 font-medium">{row.units}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-500">
                        ₹{row.cost_total.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-800 font-medium">
                        ₹{row.revenue_total.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-extrabold text-emerald-700">
                        ₹{row.profit_total.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono text-blue-600 font-semibold">
                        {margin.toFixed(1)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-300 bg-slate-50 font-bold text-slate-900">
                  <td colSpan={3} className="py-3 px-3">
                    TOTALS ({profitReportData.length} items)
                  </td>
                  <td className="py-3 px-2 text-center font-mono">
                    {profitReportData.reduce((a, b) => a + b.units, 0)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-600">
                    ₹{profitReportData.reduce((a, b) => a + b.cost_total, 0).toFixed(2)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-900">
                    ₹{profitReportData.reduce((a, b) => a + b.revenue_total, 0).toFixed(2)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-emerald-700 text-sm font-extrabold">
                    ₹{profitReportData.reduce((a, b) => a + b.profit_total, 0).toFixed(2)}
                  </td>
                  <td className="py-3 px-2 text-right font-mono text-blue-700 font-extrabold">
                    {(
                      (profitReportData.reduce((a, b) => a + b.profit_total, 0) /
                        (profitReportData.reduce((a, b) => a + b.revenue_total, 0) || 1)) *
                      100
                    ).toFixed(1)}
                    %
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* 2. Product-wise Sales Report */}
        {activeReport === 'product_sales' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 text-left border-b border-slate-200 font-semibold">
                  <th className="py-2.5 px-3">Product Name</th>
                  <th className="py-2.5 px-2 font-mono">Barcode</th>
                  <th className="py-2.5 px-2">Category</th>
                  <th className="py-2.5 px-2 text-center">Units Sold</th>
                  <th className="py-2.5 px-3 text-right">Avg Rate</th>
                  <th className="py-2.5 px-3 text-right font-bold text-emerald-700">Total Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {productSalesReport.map((r, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-slate-900">{r.name}</td>
                    <td className="py-2.5 px-2 font-mono text-slate-500 text-[11px]">{r.barcode}</td>
                    <td className="py-2.5 px-2 text-slate-600">{r.category}</td>
                    <td className="py-2.5 px-2 text-center font-mono font-bold text-slate-800">
                      {r.units}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-500">
                      ₹{r.avgRate.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-extrabold text-emerald-700">
                      ₹{r.revenue.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 3. Category Sales Report */}
        {activeReport === 'category_sales' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 text-left border-b border-slate-200 font-semibold">
                  <th className="py-2.5 px-3">Department Category</th>
                  <th className="py-2.5 px-2 text-center">Total Units Sold</th>
                  <th className="py-2.5 px-3 text-right">Gross Revenue</th>
                  <th className="py-2.5 px-3 text-right font-bold text-emerald-700">Net Profit Contribution</th>
                  <th className="py-2.5 px-2 text-right">Profit Margin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categorySalesReport.map((c, i) => {
                  const margin = c.revenue > 0 ? (c.profit / c.revenue) * 100 : 0;
                  return (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3 font-bold text-slate-900">{c.category_name}</td>
                      <td className="py-2.5 px-2 text-center font-mono text-slate-800">{c.units}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                        ₹{c.revenue.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-extrabold text-emerald-700">
                        ₹{c.profit.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono text-blue-600 font-semibold">
                        {margin.toFixed(1)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 4. Customer Spending Report */}
        {activeReport === 'customer_spending' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 text-left border-b border-slate-200 font-semibold">
                  <th className="py-2.5 px-3">Customer Name</th>
                  <th className="py-2.5 px-3 font-mono">Mobile Number</th>
                  <th className="py-2.5 px-2 text-center">Bills Count</th>
                  <th className="py-2.5 px-3 text-right font-bold text-emerald-700">Total Spend</th>
                  <th className="py-2.5 px-3">Last Active Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customerSpendingReport.map((c, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-slate-900">{c.name}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">{c.mobile}</td>
                    <td className="py-2.5 px-2 text-center font-mono font-semibold text-slate-800">{c.orders}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-extrabold text-emerald-700">
                      ₹{c.totalSpend.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">{c.lastDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 5. Stock Reorder Report */}
        {activeReport === 'stock_reorder' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 text-left border-b border-slate-200 font-semibold">
                  <th className="py-2.5 px-3">Product Name</th>
                  <th className="py-2.5 px-2 font-mono">Barcode</th>
                  <th className="py-2.5 px-2">Category</th>
                  <th className="py-2.5 px-2">Brand</th>
                  <th className="py-2.5 px-2 text-center">Current Stock</th>
                  <th className="py-2.5 px-2 text-center">Reorder Threshold</th>
                  <th className="py-2.5 px-2 text-center font-bold text-rose-700">Deficit Units</th>
                  <th className="py-2.5 px-3 text-right">Cost per Unit</th>
                  <th className="py-2.5 px-3 text-right font-bold text-blue-700">Restock Budget</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stockReorderData.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-8 text-slate-400">
                      All products currently have healthy stock above their reorder thresholds.
                    </td>
                  </tr>
                ) : (
                  stockReorderData.map((p, i) => {
                    const unit = p.unit || 'Piece';
                    return (
                      <tr key={i} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-3 font-bold text-slate-900">{p.product_name}</td>
                        <td className="py-2.5 px-2 font-mono text-slate-500 text-[11px]">{p.barcode}</td>
                        <td className="py-2.5 px-2 text-slate-600">{p.category_name}</td>
                        <td className="py-2.5 px-2 text-slate-600">{p.brand_name}</td>
                        <td className="py-2.5 px-2 text-center font-mono font-bold text-rose-700">
                          {p.stock} {unit}
                        </td>
                        <td className="py-2.5 px-2 text-center font-mono text-slate-500">
                          {p.reorder_level} {unit}
                        </td>
                        <td className="py-2.5 px-2 text-center font-mono font-bold text-rose-700">
                          +{p.deficit > 0 ? Math.round(p.deficit * 1000) / 1000 : 0} {unit}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-500">
                          ₹{p.cost_price.toFixed(2)}/{unit}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-blue-700">
                          ₹{((p.deficit > 0 ? p.deficit : 15) * p.cost_price).toFixed(2)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
