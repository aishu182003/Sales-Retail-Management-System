import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  Percent,
  Calculator,
  AlertTriangle,
  ArrowUpRight,
  Filter,
  Lightbulb,
  Sparkles,
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export const DashboardView: React.FC = () => {
  const {
    sales,
    saleItems,
    products,
    customers,
    categories,
    brands,
    setActiveTab,
    addOffer,
    offers,
    updateProductStock,
  } = useStore();
  const [insightActionFeedback, setInsightActionFeedback] = useState<string | null>(null);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<'all' | '30d' | '90d' | 'year'>('all');

  // Filtered sales and items
  const { filteredSales, filteredItems } = useMemo(() => {
    let sList = [...sales];
    let siList = [...saleItems];

    if (timeRange !== 'all') {
      const now = new Date().getTime();
      const days = timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
      const cutoff = now - days * 24 * 60 * 60 * 1000;
      sList = sList.filter((s) => new Date(s.sale_date).getTime() >= cutoff);
      const validSaleIds = new Set(sList.map((s) => s.sale_id));
      siList = siList.filter((si) => validSaleIds.has(si.sale_id));
    }

    if (selectedCategory !== 'all') {
      const catId = parseInt(selectedCategory);
      const catProductIds = new Set(
        products.filter((p) => p.category_id === catId).map((p) => p.product_id)
      );
      siList = siList.filter((si) => catProductIds.has(si.product_id));
    }

    if (selectedBrand !== 'all') {
      const brandId = parseInt(selectedBrand);
      const brandProductIds = new Set(
        products.filter((p) => p.brand_id === brandId).map((p) => p.product_id)
      );
      siList = siList.filter((si) => brandProductIds.has(si.product_id));
    }

    return { filteredSales: sList, filteredItems: siList };
  }, [sales, saleItems, products, selectedCategory, selectedBrand, timeRange]);

  // KPI Calculations
  const totalSalesRevenue = useMemo(
    () => filteredSales.reduce((acc, s) => acc + s.total_amount, 0),
    [filteredSales]
  );
  const totalProfit = useMemo(
    () => filteredItems.reduce((acc, si) => acc + si.profit, 0),
    [filteredItems]
  );
  const totalOrders = filteredSales.length;
  const totalCustomersCount = customers.length;
  const totalActiveProducts = products.filter((p) => p.status === 'active').length;
  const totalDiscounts = useMemo(
    () => filteredSales.reduce((acc, s) => acc + s.discount, 0),
    [filteredSales]
  );
  const avgBillValue = totalOrders > 0 ? totalSalesRevenue / totalOrders : 0;
  const profitMarginPercent =
    totalSalesRevenue > 0 ? (totalProfit / totalSalesRevenue) * 100 : 0;

  // Low stock products alert (stock <= reorder_level)
  const lowStockProducts = useMemo(() => {
    return products
      .filter((p) => p.status === 'active' && p.stock <= p.reorder_level)
      .sort((a, b) => a.stock - b.stock);
  }, [products]);

  // Chart 1: Monthly Sales & Profit Trend
  const monthlyTrendData = useMemo(() => {
    const monthMap = new Map<string, { sales: number; profit: number; orderDate: number }>();

    sales.forEach((s) => {
      const d = new Date(s.sale_date);
      const key = d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
      const current = monthMap.get(key) || { sales: 0, profit: 0, orderDate: d.getTime() };
      current.sales += s.total_amount;
      monthMap.set(key, current);
    });

    saleItems.forEach((si) => {
      const parentSale = sales.find((s) => s.sale_id === si.sale_id);
      if (parentSale) {
        const d = new Date(parentSale.sale_date);
        const key = d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
        const current = monthMap.get(key);
        if (current) {
          current.profit += si.profit;
        }
      }
    });

    const sortedMonths = Array.from(monthMap.entries()).sort(
      (a, b) => a[1].orderDate - b[1].orderDate
    );

    return {
      labels: sortedMonths.map(([m]) => m),
      datasets: [
        {
          label: 'Sales Revenue (₹)',
          data: sortedMonths.map(([, data]) => Math.round(data.sales)),
          borderColor: '#059669',
          backgroundColor: 'rgba(5, 150, 105, 0.12)',
          fill: true,
          tension: 0.35,
        },
        {
          label: 'Net Profit (₹)',
          data: sortedMonths.map(([, data]) => Math.round(data.profit)),
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37, 99, 235, 0.08)',
          fill: true,
          tension: 0.35,
        },
      ],
    };
  }, [sales, saleItems]);

  // Chart 2: Category-wise Sales
  const categorySalesData = useMemo(() => {
    const catMap = new Map<string, number>();

    saleItems.forEach((si) => {
      const prod = products.find((p) => p.product_id === si.product_id);
      if (prod) {
        const cat = categories.find((c) => c.category_id === prod.category_id);
        const name = cat ? cat.category_name : 'Other';
        catMap.set(name, (catMap.get(name) || 0) + si.amount);
      }
    });

    const entries = Array.from(catMap.entries()).sort((a, b) => b[1] - a[1]);

    return {
      labels: entries.map(([name]) => name),
      datasets: [
        {
          data: entries.map(([, val]) => Math.round(val)),
          backgroundColor: [
            '#059669',
            '#2563eb',
            '#d97706',
            '#7c3aed',
            '#db2777',
            '#0d9488',
            '#ea580c',
            '#0891b2',
            '#4f46e5',
          ],
          borderColor: '#ffffff',
          borderWidth: 2,
        },
      ],
    };
  }, [saleItems, products, categories]);

  // Chart 3: Top Selling Products
  const topProductsData = useMemo(() => {
    const prodMap = new Map<number, { name: string; qty: number; revenue: number; profit: number }>();

    saleItems.forEach((si) => {
      const prod = products.find((p) => p.product_id === si.product_id);
      if (prod) {
        const current = prodMap.get(si.product_id) || {
          name: prod.product_name,
          qty: 0,
          revenue: 0,
          profit: 0,
        };
        current.qty += si.quantity;
        current.revenue += si.amount;
        current.profit += si.profit;
        prodMap.set(si.product_id, current);
      }
    });

    const sorted = Array.from(prodMap.values())
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    return {
      items: sorted,
    };
  }, [saleItems, products]);

  // Chart 4: Payment Methods Distribution
  const paymentMethodData = useMemo(() => {
    const pMap: Record<string, number> = { Cash: 0, UPI: 0, Card: 0 };
    sales.forEach((s) => {
      if (pMap[s.payment_method] !== undefined) {
        pMap[s.payment_method] += s.total_amount;
      }
    });

    return {
      labels: ['Cash', 'UPI', 'Card'],
      datasets: [
        {
          data: [Math.round(pMap.Cash), Math.round(pMap.UPI), Math.round(pMap.Card)],
          backgroundColor: ['#059669', '#4f46e5', '#d97706'],
          borderColor: '#ffffff',
          borderWidth: 2,
        },
      ],
    };
  }, [sales]);

  // Dynamic Business Insights & Suggestions calculated from actual sales, profit & stock data
  const businessInsights = useMemo(() => {
    const activeProds = products.filter((p) => {
      if (p.status !== 'active') return false;
      if (selectedCategory !== 'all' && p.category_id !== parseInt(selectedCategory)) return false;
      if (selectedBrand !== 'all' && p.brand_id !== parseInt(selectedBrand)) return false;
      return true;
    });

    const pool = activeProds.length > 0 ? activeProds : products;

    const stats = pool.map((p) => {
      const matchedItems = filteredItems.filter((si) => si.product_id === p.product_id);
      const qtySold = Math.round(matchedItems.reduce((sum, si) => sum + si.quantity, 0) * 1000) / 1000;
      const revenue = matchedItems.reduce((sum, si) => sum + si.amount, 0);
      const profit = matchedItems.reduce((sum, si) => sum + si.profit, 0);
      const unit = p.unit || 'Piece';
      return {
        product: p,
        name: p.product_name,
        unit,
        stock: p.stock,
        reorderLevel: p.reorder_level,
        qtySold,
        revenue,
        profit,
      };
    });

    // Best Selling Product (by quantity sold, tie-break by revenue)
    const sortedByBestSelling = [...stats].sort((a, b) =>
      b.qtySold !== a.qtySold ? b.qtySold - a.qtySold : b.revenue - a.revenue
    );
    const bestSelling = sortedByBestSelling[0];

    // Low Selling Product (lowest quantity sold with high stock so it pairs naturally with Possible Wastage & Suggestion)
    const sortedByLowSelling = [...stats]
      .filter((s) => s.product.product_id !== bestSelling?.product.product_id)
      .sort((a, b) => (a.qtySold !== b.qtySold ? a.qtySold - b.qtySold : b.stock - a.stock));
    const lowSelling = sortedByLowSelling[0] || bestSelling;

    // High Stock Product (prioritize Kg/Litre or highest stock items)
    const sortedByHighStock = [...stats].sort((a, b) => {
      const aIsWeight = a.unit === 'Kg' && a.stock >= 50 ? 1 : 0;
      const bIsWeight = b.unit === 'Kg' && b.stock >= 50 ? 1 : 0;
      if (bIsWeight !== aIsWeight) return bIsWeight - aIsWeight;
      return b.stock - a.stock;
    });
    const highStock = sortedByHighStock[0] || bestSelling;

    // Possible Wastage & Offer Suggestion (product with high stock and low sales)
    const wastageCandidate =
      [...stats]
        .filter((s) => s.stock > s.reorderLevel)
        .sort((a, b) => (a.qtySold !== b.qtySold ? a.qtySold - b.qtySold : b.stock - a.stock))[0] ||
      lowSelling;

    // Restock Alert (low stock or high demand relative to stock)
    const restockCandidate = [...stats].sort((a, b) => {
      const aRatio = a.stock / Math.max(1, a.reorderLevel);
      const bRatio = b.stock / Math.max(1, b.reorderLevel);
      if (aRatio !== bRatio) return aRatio - bRatio;
      return b.qtySold - a.qtySold;
    })[0] || bestSelling;

    // Profit Insight (product generating the highest net profit)
    const topProfit =
      [...stats].sort((a, b) =>
        b.profit !== a.profit ? b.profit - a.profit : b.revenue - a.revenue
      )[0] || bestSelling;

    return {
      bestSelling,
      lowSelling: wastageCandidate || lowSelling,
      highStock,
      wastageCandidate,
      restockCandidate,
      topProfit,
    };
  }, [products, filteredItems, selectedCategory, selectedBrand]);

  const handleQuickApplySuggestionOffer = (productId: number, productName: string) => {
    const existing = offers.find((o) => o.product_id === productId && o.status === 'active');
    if (existing) {
      setInsightActionFeedback(`Active offer "${existing.offer_name}" is already running for ${productName}.`);
      setTimeout(() => setInsightActionFeedback(null), 4000);
      return;
    }
    const today = new Date().toISOString().split('T')[0];
    const nextMonth = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
    addOffer({
      product_id: productId,
      offer_name: `Clearance Special - 10% Off ${productName}`,
      discount_percentage: 10,
      start_date: today,
      end_date: nextMonth,
      status: 'active',
    });
    setInsightActionFeedback(`10% discount offer activated for "${productName}"!`);
    setTimeout(() => setInsightActionFeedback(null), 4000);
  };

  const handleQuickRestock = (productId: number, productName: string, currentStock: number, unit: string) => {
    const addQty = unit === 'Piece' ? 50 : 50;
    updateProductStock(productId, Math.round((currentStock + addQty) * 1000) / 1000);
    setInsightActionFeedback(`Restocked +${addQty} ${unit} for "${productName}"!`);
    setTimeout(() => setInsightActionFeedback(null), 4000);
  };

  return (
    <div className="space-y-5">
      {/* Top Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs shadow-sm">
        <div className="flex items-center gap-2 text-slate-800">
          <Filter className="w-4 h-4 text-emerald-600" />
          <span className="font-bold">Analytics Filters:</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Time Range */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Period:</span>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 text-slate-800 rounded px-2.5 py-1 text-xs focus:border-emerald-600 outline-none"
            >
              <option value="all">All Available History</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="year">Current Year</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-800 rounded px-2.5 py-1 text-xs focus:border-emerald-600 outline-none"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.category_id} value={c.category_id}>
                  {c.category_name}
                </option>
              ))}
            </select>
          </div>

          {/* Brand Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Brand:</span>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-800 rounded px-2.5 py-1 text-xs focus:border-emerald-600 outline-none"
            >
              <option value="all">All Brands</option>
              {brands.map((b) => (
                <option key={b.brand_id} value={b.brand_id}>
                  {b.brand_name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {/* Total Sales */}
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Sales</span>
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-lg font-extrabold text-emerald-700">
            ₹{totalSalesRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
          <div className="text-[10px] text-slate-500 flex items-center gap-0.5 mt-0.5">
            <ArrowUpRight className="w-3 h-3 text-emerald-600" /> Revenue
          </div>
        </div>

        {/* Total Profit */}
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Profit</span>
            <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="text-lg font-extrabold text-blue-700">
            ₹{totalProfit.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
          <div className="text-[10px] text-slate-600 mt-0.5 font-medium">
            Margin: <span className="font-bold text-slate-900">{profitMarginPercent.toFixed(1)}%</span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Orders / Bills</span>
            <ShoppingBag className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="text-lg font-extrabold text-slate-900">{totalOrders}</div>
          <div className="text-[10px] text-slate-500 mt-0.5 font-medium">Bills processed</div>
        </div>

        {/* Total Customers */}
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Customers</span>
            <Users className="w-3.5 h-3.5 text-purple-600" />
          </div>
          <div className="text-lg font-extrabold text-slate-900">{totalCustomersCount}</div>
          <div className="text-[10px] text-slate-500 mt-0.5 font-medium">Active shoppers</div>
        </div>

        {/* Active Products */}
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Products</span>
            <Package className="w-3.5 h-3.5 text-teal-600" />
          </div>
          <div className="text-lg font-extrabold text-slate-900">{totalActiveProducts}</div>
          <div className="text-[10px] text-slate-500 mt-0.5 font-medium">Catalog items</div>
        </div>

        {/* Total Discounts */}
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Discounts</span>
            <Percent className="w-3.5 h-3.5 text-rose-600" />
          </div>
          <div className="text-lg font-extrabold text-rose-700">
            ₹{totalDiscounts.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5 font-medium">Customer savings</div>
        </div>

        {/* Avg Bill Value */}
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Avg Bill</span>
            <Calculator className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="text-lg font-extrabold text-amber-700">
            ₹{avgBillValue.toFixed(1)}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5 font-medium">Basket size</div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Monthly Sales & Profit Trend (2 columns) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Monthly Sales &amp; Profit Trend</h2>
              <p className="text-[11px] text-slate-500">
                Revenue vs actual net profit generated
              </p>
            </div>
            <span className="text-xs px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono font-semibold">
              Chart.js
            </span>
          </div>
          <div className="h-64">
            <Line
              data={monthlyTrendData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                plugins: {
                  legend: {
                    position: 'top',
                    labels: { color: '#334155', font: { size: 11, weight: 'bold' } },
                  },
                  tooltip: {
                    backgroundColor: '#0f172a',
                    titleColor: '#ffffff',
                    bodyColor: '#e2e8f0',
                  },
                },
                scales: {
                  x: {
                    grid: { color: 'rgba(241, 245, 249, 1)' },
                    ticks: { color: '#64748b', font: { size: 10 } },
                  },
                  y: {
                    grid: { color: 'rgba(241, 245, 249, 1)' },
                    ticks: {
                      color: '#64748b',
                      font: { size: 10 },
                      callback: (val) => '₹' + val,
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Category-wise Sales Distribution */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="mb-3">
            <h2 className="text-sm font-bold text-slate-900">Category-wise Sales</h2>
            <p className="text-[11px] text-slate-500">Revenue split across department categories</p>
          </div>
          <div className="h-64 flex items-center justify-center">
            <Doughnut
              data={categorySalesData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: { color: '#475569', font: { size: 10 }, boxWidth: 10 },
                  },
                  tooltip: {
                    callbacks: {
                      label: (ctx) => ` ${ctx.label}: ₹${ctx.parsed.toLocaleString('en-IN')}`,
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Second Row: Top Selling Products, Payment Breakdown, Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Top-selling products table */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Top-Selling Products</h2>
              <p className="text-[11px] text-slate-500">Ranked by volume of units sold</p>
            </div>
            <span className="text-xs font-bold text-slate-500">Top 5</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-slate-500 border-b border-slate-100 text-left font-semibold">
                  <th className="pb-2">Product</th>
                  <th className="pb-2 text-center">Units</th>
                  <th className="pb-2 text-right">Revenue</th>
                  <th className="pb-2 text-right">Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {topProductsData.items.map((tp, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="py-2.5 font-bold text-slate-800">
                      <div className="truncate max-w-[130px]">{tp.name}</div>
                    </td>
                    <td className="py-2.5 text-center">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono font-semibold">
                        {tp.qty}
                      </span>
                    </td>
                    <td className="py-2.5 text-right font-extrabold text-emerald-700">
                      ₹{Math.round(tp.revenue)}
                    </td>
                    <td className="py-2.5 text-right font-bold text-blue-600">
                      ₹{Math.round(tp.profit)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="mb-3">
            <h2 className="text-sm font-bold text-slate-900">Payment Method Distribution</h2>
            <p className="text-[11px] text-slate-500">Cash vs UPI vs Card transactions</p>
          </div>
          <div className="h-56 flex items-center justify-center">
            <Doughnut
              data={paymentMethodData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: { color: '#475569', font: { size: 11 }, boxWidth: 12 },
                  },
                  tooltip: {
                    callbacks: {
                      label: (ctx) => ` ${ctx.label}: ₹${ctx.parsed.toLocaleString('en-IN')}`,
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Low-Stock Alert Table */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Low-Stock Alert</h2>
                <p className="text-[11px] text-slate-500">Products at or below reorder level</p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
              {lowStockProducts.length} Reorder Items
            </span>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {lowStockProducts.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                All inventory levels are healthy!
              </div>
            ) : (
              lowStockProducts.map((p) => {
                const cat = categories.find((c) => c.category_id === p.category_id);
                const unit = p.unit || 'Piece';
                return (
                  <div
                    key={p.product_id}
                    className="p-2.5 rounded-lg bg-rose-50/50 border border-rose-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900">{p.product_name}</div>
                      <div className="text-[10px] text-slate-500">
                        {cat?.category_name} | Unit: {unit} | Barcode: {p.barcode}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold border border-rose-300 text-[11px]">
                        {p.stock} {unit} left
                      </span>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Min: {p.reorder_level} {unit}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Third Row: Business Insights & Suggestions Section (Dynamic Line-by-Line Insights) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
              <Lightbulb className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>Business Insights &amp; Suggestions</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Live Data Driven
                </span>
              </h2>
              <p className="text-[11px] text-slate-500">
                Real-time line-by-line insights dynamically generated from sales, profit, and inventory stock
              </p>
            </div>
          </div>

          {insightActionFeedback && (
            <div className="px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold animate-in fade-in">
              ✓ {insightActionFeedback}
            </div>
          )}
        </div>

        <ul className="space-y-2.5 text-xs text-slate-800">
          {/* 1. Total Sales */}
          <li className="flex items-center gap-2 py-1 px-2.5 rounded-lg hover:bg-slate-50 transition-colors">
            <span className="text-emerald-600 font-black text-sm leading-none">&bull;</span>
            <span>
              <strong className="text-slate-900">Total Sales:</strong>{' '}
              <span className="font-mono font-bold text-emerald-700">
                ₹{totalSalesRevenue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </span>
            </span>
          </li>

          {/* 2. Total Profit */}
          <li className="flex items-center gap-2 py-1 px-2.5 rounded-lg hover:bg-slate-50 transition-colors">
            <span className="text-blue-600 font-black text-sm leading-none">&bull;</span>
            <span>
              <strong className="text-slate-900">Total Profit:</strong>{' '}
              <span className="font-mono font-bold text-blue-700">
                ₹{totalProfit.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </span>
            </span>
          </li>

          {/* 3. Best Selling Product */}
          {businessInsights.bestSelling && (
            <li className="flex items-center gap-2 py-1 px-2.5 rounded-lg hover:bg-slate-50 transition-colors">
              <span className="text-emerald-600 font-black text-sm leading-none">&bull;</span>
              <span>
                <strong className="text-slate-900">Best Selling Product:</strong>{' '}
                <span className="font-semibold text-slate-900">
                  {businessInsights.bestSelling.name}
                </span>{' '}
                <span className="text-slate-500 font-mono text-[11px]">
                  ({businessInsights.bestSelling.qtySold} {businessInsights.bestSelling.unit} sold)
                </span>
              </span>
            </li>
          )}

          {/* 4. Low Selling Product */}
          {businessInsights.lowSelling && (
            <li className="flex items-center gap-2 py-1 px-2.5 rounded-lg hover:bg-slate-50 transition-colors">
              <span className="text-amber-600 font-black text-sm leading-none">&bull;</span>
              <span>
                <strong className="text-slate-900">Low Selling Product:</strong>{' '}
                <span className="font-semibold text-slate-900">
                  {businessInsights.lowSelling.name}
                </span>{' '}
                <span className="text-slate-500 font-mono text-[11px]">
                  ({businessInsights.lowSelling.qtySold} {businessInsights.lowSelling.unit} sold)
                </span>
              </span>
            </li>
          )}

          {/* 5. High Stock */}
          {businessInsights.highStock && (
            <li className="flex items-center gap-2 py-1 px-2.5 rounded-lg hover:bg-slate-50 transition-colors">
              <span className="text-teal-600 font-black text-sm leading-none">&bull;</span>
              <span>
                <strong className="text-slate-900">High Stock:</strong>{' '}
                <span className="font-semibold text-slate-900">
                  {businessInsights.highStock.name}
                </span>{' '}
                &ndash;{' '}
                <span className="font-mono font-bold text-teal-700">
                  {businessInsights.highStock.stock} {businessInsights.highStock.unit}
                </span>
              </span>
            </li>
          )}

          {/* 6. Possible Wastage */}
          {businessInsights.wastageCandidate && (
            <li className="flex items-center gap-2 py-1 px-2.5 rounded-lg hover:bg-slate-50 transition-colors">
              <span className="text-rose-600 font-black text-sm leading-none">&bull;</span>
              <span>
                <strong className="text-slate-900">Possible Wastage:</strong>{' '}
                <span className="font-semibold text-rose-700">
                  {businessInsights.wastageCandidate.name}
                </span>{' '}
                has high stock ({businessInsights.wastageCandidate.stock}{' '}
                {businessInsights.wastageCandidate.unit}) and low sales (
                {businessInsights.wastageCandidate.qtySold}{' '}
                {businessInsights.wastageCandidate.unit} sold)
              </span>
            </li>
          )}

          {/* 7. Suggestion */}
          {businessInsights.wastageCandidate && (
            <li className="flex flex-wrap items-center justify-between gap-2 py-1 px-2.5 rounded-lg bg-amber-50/60 border border-amber-200/70">
              <div className="flex items-center gap-2">
                <span className="text-amber-600 font-black text-sm leading-none">&bull;</span>
                <span>
                  <strong className="text-amber-950">Suggestion:</strong> Give a small offer/discount for{' '}
                  <strong className="text-slate-900">
                    {businessInsights.wastageCandidate.name}
                  </strong>
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  handleQuickApplySuggestionOffer(
                    businessInsights.wastageCandidate.product.product_id,
                    businessInsights.wastageCandidate.name
                  )
                }
                className="text-[11px] font-bold px-2.5 py-0.5 rounded bg-amber-600 hover:bg-amber-700 text-white transition-colors cursor-pointer shrink-0"
              >
                + Apply 10% Offer
              </button>
            </li>
          )}

          {/* 8. Restock Alert */}
          {businessInsights.restockCandidate && (
            <li className="flex flex-wrap items-center justify-between gap-2 py-1 px-2.5 rounded-lg bg-rose-50/60 border border-rose-200/70">
              <div className="flex items-center gap-2">
                <span className="text-rose-600 font-black text-sm leading-none">&bull;</span>
                <span>
                  <strong className="text-rose-950">Restock Alert:</strong>{' '}
                  <strong className="text-slate-900">
                    {businessInsights.restockCandidate.name}
                  </strong>{' '}
                  &ndash;{' '}
                  {businessInsights.restockCandidate.stock <=
                  businessInsights.restockCandidate.reorderLevel
                    ? `High demand, low stock (${businessInsights.restockCandidate.stock} ${businessInsights.restockCandidate.unit} left)`
                    : `Monitor stock (${businessInsights.restockCandidate.stock} ${businessInsights.restockCandidate.unit} available)`}
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  handleQuickRestock(
                    businessInsights.restockCandidate.product.product_id,
                    businessInsights.restockCandidate.name,
                    businessInsights.restockCandidate.stock,
                    businessInsights.restockCandidate.unit
                  )
                }
                className="text-[11px] font-bold px-2.5 py-0.5 rounded bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer shrink-0"
              >
                + Restock 50 {businessInsights.restockCandidate.unit}
              </button>
            </li>
          )}

          {/* 9. Profit Insight */}
          {businessInsights.topProfit && (
            <li className="flex items-center gap-2 py-1 px-2.5 rounded-lg hover:bg-slate-50 transition-colors">
              <span className="text-emerald-600 font-black text-sm leading-none">&bull;</span>
              <span>
                <strong className="text-slate-900">Profit Insight:</strong>{' '}
                <span className="font-semibold text-emerald-800">
                  {businessInsights.topProfit.name}
                </span>{' '}
                generates good profit (₹
                {Math.round(businessInsights.topProfit.profit).toLocaleString('en-IN')})
              </span>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};
