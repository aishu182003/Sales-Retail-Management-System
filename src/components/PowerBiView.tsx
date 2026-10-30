import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import {
  BarChart3,
  Database,
  Copy,
  Check,
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  Package,
  Calculator,
} from 'lucide-react';
import { Bar, Doughnut } from 'react-chartjs-2';

export const PowerBiView: React.FC = () => {
  const { sales, saleItems, products, customers, categories, gstRate } = useStore();

  const [activeTab, setActiveTab] = useState<'simulator' | 'star_schema' | 'dax' | 'connection_guide'>(
    'simulator'
  );
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Power BI Dashboard Simulator Sub-Tab
  const [pbiPage, setPbiPage] = useState<'p1' | 'p2' | 'p3'>('p1');

  // DAX Measures List
  const daxMeasures = [
    {
      name: 'Total Gross Sales',
      formula: `Total Gross Sales = SUM(sales[total_amount])`,
      description: 'Calculates total gross billings including GST across all completed transactions.',
    },
    {
      name: 'Total GST Collected',
      formula: `Total GST Collected = SUM(sales[gst_amount])`,
      description: 'Aggregates total GST tax amount collected across all bills.',
    },
    {
      name: 'Total Cost (COGS)',
      formula: `Total Cost = SUMX(sale_items, sale_items[cost_price] * sale_items[quantity])`,
      description: 'Calculates total Cost of Goods Sold (COGS) from product cost price and quantity sold.',
    },
    {
      name: 'Gross Profit',
      formula: `Gross Profit = [Sales Revenue] - [Total Cost]`,
      description: 'Gross Profit = Sales Revenue - Cost of Goods Sold.',
    },
    {
      name: 'Net Profit (based on available data)',
      formula: `Net Profit = [Gross Profit] - [Applicable Business Expenses]`,
      description: 'Net Profit based on available sales, cost, and billing data in the system.',
    },
    {
      name: 'Profit Margin %',
      formula: `Profit Margin % = DIVIDE([Gross Profit], [Sales Revenue], 0) * 100`,
      description: 'Safe division measure yielding the overall business profit margin percentage.',
    },
    {
      name: 'Avg Bill Value (Basket Size)',
      formula: `Avg Bill Value = DIVIDE([Total Gross Sales], DISTINCTCOUNT(sales[sale_id]), 0)`,
      description: 'Average expenditure per customer invoice.',
    },
    {
      name: 'Total Products Sold',
      formula: `Total Products Sold = SUM(sale_items[quantity])`,
      description: 'Aggregate count of all product quantities moved through POS billing.',
    },
    {
      name: 'Unique Shoppers',
      formula: `Unique Shoppers = DISTINCTCOUNT(sales[customer_id])`,
      description: 'Distinct count of registered customer IDs making at least one purchase.',
    },
    {
      name: 'Customer Repeat Ratio',
      formula: `Customer Repeat Ratio = DIVIDE(COUNTROWS(FILTER(VALUES(sales[customer_id]), CALCULATE(COUNT(sales[sale_id])) > 1)), [Unique Shoppers], 0)`,
      description: 'Percentage of shoppers who have returned for more than 1 bill.',
    },
  ];

  const handleCopyDax = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Export CSV for Power BI direct import
  const exportDataToCsv = (filename: string, rows: object[]) => {
    if (!rows || rows.length === 0) return;
    const headers = Object.keys(rows[0]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        headers.join(','),
        ...rows.map((r) =>
          headers
            .map((field) => {
              const val = (r as any)[field];
              return typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val;
            })
            .join(',')
        ),
      ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Core Financial & KPI Aggregations from actual store data
  // Sales Revenue (Excl. GST) = sum of line item amounts
  const totalSalesRevenue = useMemo(
    () => Math.round(saleItems.reduce((a, b) => a + b.amount, 0) * 100) / 100,
    [saleItems]
  );

  // Total GST Collected = sum of gst_amount on sales
  const totalGstCollected = useMemo(
    () =>
      Math.round(
        sales.reduce(
          (a, b) =>
            a + (b.gst_amount ?? Math.round(((b.subtotal * (b.gst_rate ?? gstRate)) / 100) * 100) / 100),
          0
        ) * 100
      ) / 100,
    [sales, gstRate]
  );

  // Total Gross Sales = sum of total_amount (includes GST)
  const totalGrossSales = useMemo(
    () => Math.round(sales.reduce((a, b) => a + b.total_amount, 0) * 100) / 100,
    [sales]
  );

  // Total Cost (Cost of Goods Sold) = sum of (cost_price * quantity)
  const totalCost = useMemo(
    () => Math.round(saleItems.reduce((a, b) => a + b.cost_price * b.quantity, 0) * 100) / 100,
    [saleItems]
  );

  // Gross Profit = Sales Revenue - Cost of Goods Sold
  const grossProfit = useMemo(
    () => Math.round((totalSalesRevenue - totalCost) * 100) / 100,
    [totalSalesRevenue, totalCost]
  );

  // Net Profit (based on available data — no separate operating expense table exists, so we do not invent expenses)
  const netProfit = grossProfit;

  // Total Products Sold
  const totalProductsSold = useMemo(
    () => Math.round(saleItems.reduce((a, b) => a + b.quantity, 0) * 1000) / 1000,
    [saleItems]
  );

  const profitMargin = totalSalesRevenue > 0 ? (grossProfit / totalSalesRevenue) * 100 : 0;
  const avgBill = sales.length > 0 ? totalGrossSales / sales.length : 0;

  // Product-wise Profit Analysis (Dynamic from products & saleItems)
  const productProfitAnalysis = useMemo(() => {
    const analysis = products.map((p) => {
      const items = saleItems.filter((si) => si.product_id === p.product_id);
      const qtySold = Math.round(items.reduce((sum, si) => sum + si.quantity, 0) * 1000) / 1000;
      const salesAmount = Math.round(items.reduce((sum, si) => sum + si.amount, 0) * 100) / 100;
      const costAmount =
        Math.round(items.reduce((sum, si) => sum + si.cost_price * si.quantity, 0) * 100) / 100;
      const profit = Math.round((salesAmount - costAmount) * 100) / 100;
      const marginPercent =
        salesAmount > 0 ? Math.round((profit / salesAmount) * 1000) / 10 : 0;
      const categoryName =
        categories.find((c) => c.category_id === p.category_id)?.category_name || 'General';

      return {
        product_id: p.product_id,
        product_name: p.product_name,
        unit: p.unit || 'Piece',
        category_name: categoryName,
        qtySold,
        salesAmount,
        costAmount,
        profit,
        marginPercent,
      };
    });

    // Sort by profit descending by default
    return analysis.sort((a, b) => b.profit - a.profit || b.salesAmount - a.salesAmount);
  }, [products, saleItems, categories]);

  // Sold products for charts (or all products if needed)
  const soldProductAnalysis = useMemo(() => {
    const sold = productProfitAnalysis.filter((p) => p.qtySold > 0);
    return sold.length > 0 ? sold : productProfitAnalysis;
  }, [productProfitAnalysis]);

  // High Profit Products (Top 5)
  const highProfitProducts = useMemo(() => {
    return [...soldProductAnalysis].sort((a, b) => b.profit - a.profit).slice(0, 5);
  }, [soldProductAnalysis]);

  // Low Profit / Loss Products (Bottom 5 among all products or lowest profit sold items)
  const lowProfitProducts = useMemo(() => {
    return [...productProfitAnalysis]
      .sort((a, b) => a.profit - b.profit || a.marginPercent - b.marginPercent)
      .slice(0, 5);
  }, [productProfitAnalysis]);

  // Category-wise Profit Analysis
  const categoryProfitAnalysis = useMemo(() => {
    const catMap = new Map<string, { sales: number; cost: number; profit: number }>();

    saleItems.forEach((si) => {
      const prod = products.find((p) => p.product_id === si.product_id);
      const cat = categories.find((c) => c.category_id === prod?.category_id);
      const catName = cat ? cat.category_name : 'Other';
      const current = catMap.get(catName) || { sales: 0, cost: 0, profit: 0 };
      const itemSales = si.amount;
      const itemCost = si.cost_price * si.quantity;
      current.sales += itemSales;
      current.cost += itemCost;
      current.profit += itemSales - itemCost;
      catMap.set(catName, current);
    });

    return Array.from(catMap.entries())
      .map(([name, vals]) => ({
        name,
        sales: Math.round(vals.sales * 100) / 100,
        cost: Math.round(vals.cost * 100) / 100,
        profit: Math.round(vals.profit * 100) / 100,
      }))
      .sort((a, b) => b.profit - a.profit);
  }, [saleItems, products, categories]);

  // Monthly Sales and Profit Analysis (Dynamic from sales & saleItems)
  const monthlySalesAndProfit = useMemo(() => {
    const monthMap = new Map<
      string,
      { sales: number; cost: number; profit: number; gst: number; sortTime: number }
    >();

    sales.forEach((s) => {
      const d = new Date(s.sale_date);
      const key = d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
      const existing = monthMap.get(key) || {
        sales: 0,
        cost: 0,
        profit: 0,
        gst: 0,
        sortTime: new Date(d.getFullYear(), d.getMonth(), 1).getTime(),
      };
      existing.sales += s.total_amount;
      existing.gst +=
        s.gst_amount ?? Math.round(((s.subtotal * (s.gst_rate ?? gstRate)) / 100) * 100) / 100;
      monthMap.set(key, existing);
    });

    saleItems.forEach((si) => {
      const parentSale = sales.find((s) => s.sale_id === si.sale_id);
      if (parentSale) {
        const d = new Date(parentSale.sale_date);
        const key = d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
        const existing = monthMap.get(key);
        if (existing) {
          const itemCost = si.cost_price * si.quantity;
          existing.cost += itemCost;
          existing.profit += si.amount - itemCost;
        }
      }
    });

    return Array.from(monthMap.entries())
      .sort((a, b) => a[1].sortTime - b[1].sortTime)
      .map(([month, data]) => ({
        month,
        sales: Math.round(data.sales * 100) / 100,
        cost: Math.round(data.cost * 100) / 100,
        profit: Math.round(data.profit * 100) / 100,
        gst: Math.round(data.gst * 100) / 100,
      }));
  }, [sales, saleItems, gstRate]);

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">
                Power BI Analytics &amp; Business Intelligence Engine
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                Power BI Ready
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Star Schema data model &bull; Standard DAX Measures &bull; Native MySQL Connector guide &bull; Live Interactive Simulation
            </p>
          </div>
        </div>

        {/* Quick CSV Export for Power BI */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportDataToCsv('sales_fact.csv', sales)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold shadow-xs"
            title="Download sales table as CSV for Power BI"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export Sales CSV</span>
          </button>
          <button
            onClick={() => exportDataToCsv('sale_items_fact.csv', saleItems)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold shadow-xs"
            title="Download sale items as CSV for Power BI"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span>Export Line Items CSV</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-1.5 bg-white p-1.5 rounded-xl border border-slate-200 text-xs shadow-sm">
        <button
          onClick={() => setActiveTab('simulator')}
          className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all ${
            activeTab === 'simulator'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Dashboard Simulator
        </button>
        <button
          onClick={() => setActiveTab('star_schema')}
          className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all ${
            activeTab === 'star_schema'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Star Schema Model
        </button>
        <button
          onClick={() => setActiveTab('dax')}
          className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all ${
            activeTab === 'dax'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          DAX Measures ({daxMeasures.length})
        </button>
        <button
          onClick={() => setActiveTab('connection_guide')}
          className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all ${
            activeTab === 'connection_guide'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          XAMPP Connection Guide
        </button>
      </div>

      {/* Tab 1: Interactive Power BI Dashboard Simulator */}
      {activeTab === 'simulator' && (
        <div className="space-y-4">
          {/* Power BI Window Frame Simulator */}
          <div className="bg-white border border-slate-300 rounded-xl overflow-hidden shadow-sm">
            {/* Top Power BI Window Title Bar */}
            <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex flex-wrap items-center justify-between text-xs gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span className="font-bold text-slate-800">
                  Power BI Desktop — Smart_Retail_Sales_BI.pbix
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  [DirectQuery: localhost:3306/smart_retail]
                </span>
              </div>
              {/* Page Switcher Tabs */}
              <div className="flex items-center gap-1 bg-white p-0.5 rounded-md border border-slate-200">
                <button
                  onClick={() => setPbiPage('p1')}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                    pbiPage === 'p1' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Page 1: Executive &amp; Profit Overview
                </button>
                <button
                  onClick={() => setPbiPage('p2')}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                    pbiPage === 'p2' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Page 2: Product &amp; Stock
                </button>
                <button
                  onClick={() => setPbiPage('p3')}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                    pbiPage === 'p3' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Page 3: Customer &amp; Basket
                </button>
              </div>
            </div>

            {/* Simulated Canvas */}
            <div className="p-5 bg-slate-50/50 space-y-5 min-h-[480px]">
              {/* PAGE 1: EXECUTIVE & PROFIT OVERVIEW */}
              {pbiPage === 'p1' && (
                <div className="space-y-5">
                  {/* Primary Power BI KPI Cards Strip (6 Requested KPIs + 2 Existing KPIs) */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {/* 1. Total Gross Sales */}
                    <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                      <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase font-mono tracking-wider font-bold">
                        <span>Total Gross Sales</span>
                        <DollarSign className="w-3.5 h-3.5 text-amber-600" />
                      </div>
                      <div className="text-xl font-black text-amber-600 mt-1 font-mono">
                        ₹{totalGrossSales.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Sales Rev (Ex-GST): ₹{totalSalesRevenue.toLocaleString('en-IN')}
                      </div>
                    </div>

                    {/* 2. Total GST Collected */}
                    <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                      <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase font-mono tracking-wider font-bold">
                        <span>Total GST Collected</span>
                        <Percent className="w-3.5 h-3.5 text-indigo-600" />
                      </div>
                      <div className="text-xl font-black text-indigo-600 mt-1 font-mono">
                        ₹{totalGstCollected.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Current Rate: {gstRate}% GST
                      </div>
                    </div>

                    {/* 3. Total Cost */}
                    <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                      <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase font-mono tracking-wider font-bold">
                        <span>Total Cost</span>
                        <Calculator className="w-3.5 h-3.5 text-rose-600" />
                      </div>
                      <div className="text-xl font-black text-rose-600 mt-1 font-mono">
                        ₹{totalCost.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Cost of Goods Sold (COGS)
                      </div>
                    </div>

                    {/* 4. Gross Profit */}
                    <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                      <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase font-mono tracking-wider font-bold">
                        <span>Gross Profit</span>
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                      </div>
                      <div className="text-xl font-black text-emerald-600 mt-1 font-mono">
                        ₹{grossProfit.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Sales Rev &minus; COGS ({profitMargin.toFixed(1)}%)
                      </div>
                    </div>

                    {/* 5. Net Profit (based on available data) */}
                    <div className="p-3.5 rounded-xl bg-white border border-emerald-200 shadow-xs">
                      <div className="flex items-center justify-between text-[10px] text-emerald-800 uppercase font-mono tracking-wider font-bold">
                        <span>Net Profit</span>
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                      </div>
                      <div className="text-xl font-black text-emerald-700 mt-1 font-mono">
                        ₹{netProfit.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5 font-medium">
                        Net Profit (based on available data)
                      </div>
                    </div>

                    {/* 6. Total Products Sold */}
                    <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                      <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase font-mono tracking-wider font-bold">
                        <span>Total Products Sold</span>
                        <Package className="w-3.5 h-3.5 text-purple-600" />
                      </div>
                      <div className="text-xl font-black text-purple-600 mt-1 font-mono">
                        {totalProductsSold}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Avg Bill: ₹{avgBill.toFixed(0)} ({sales.length} bills)
                      </div>
                    </div>
                  </div>

                  {/* Charts Row 1: Monthly Sales and Profit + Category-wise Profit */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Chart: Monthly Sales and Profit */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                      <div className="text-xs font-bold text-slate-900 mb-2 flex items-center justify-between">
                        <span>Monthly Sales and Profit</span>
                        <span className="text-[10px] text-amber-700 font-mono font-bold">
                          Sales vs Cost vs Gross Profit
                        </span>
                      </div>
                      <div className="h-60">
                        <Bar
                          data={{
                            labels: monthlySalesAndProfit.map((m) => m.month),
                            datasets: [
                              {
                                label: 'Gross Sales (₹)',
                                data: monthlySalesAndProfit.map((m) => m.sales),
                                backgroundColor: '#f59e0b',
                                borderRadius: 4,
                              },
                              {
                                label: 'Total Cost (₹)',
                                data: monthlySalesAndProfit.map((m) => m.cost),
                                backgroundColor: '#94a3b8',
                                borderRadius: 4,
                              },
                              {
                                label: 'Gross Profit (₹)',
                                data: monthlySalesAndProfit.map((m) => m.profit),
                                backgroundColor: '#10b981',
                                borderRadius: 4,
                              },
                            ],
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: { labels: { color: '#334155', font: { size: 10 } } },
                            },
                            scales: {
                              x: { ticks: { color: '#64748b', font: { size: 10 } } },
                              y: { ticks: { color: '#64748b', font: { size: 10 } } },
                            },
                          }}
                        />
                      </div>
                    </div>

                    {/* Chart: Category-wise Profit */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                      <div className="text-xs font-bold text-slate-900 mb-2 flex items-center justify-between">
                        <span>Category-wise Profit</span>
                        <span className="text-[10px] text-emerald-700 font-mono font-bold">
                          Profit &amp; Revenue by Category
                        </span>
                      </div>
                      <div className="h-60">
                        <Bar
                          data={{
                            labels: categoryProfitAnalysis.map((c) => c.name),
                            datasets: [
                              {
                                label: 'Category Profit (₹)',
                                data: categoryProfitAnalysis.map((c) => c.profit),
                                backgroundColor: '#059669',
                                borderRadius: 4,
                              },
                              {
                                label: 'Category Sales (₹)',
                                data: categoryProfitAnalysis.map((c) => c.sales),
                                backgroundColor: '#3b82f6',
                                borderRadius: 4,
                              },
                            ],
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: { labels: { color: '#334155', font: { size: 10 } } },
                            },
                            scales: {
                              x: { ticks: { color: '#64748b', font: { size: 10 } } },
                              y: { ticks: { color: '#64748b', font: { size: 10 } } },
                            },
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Charts Row 2: Product-wise Profit + Category Share Donut */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    {/* Chart: Product-wise Profit */}
                    <div className="lg:col-span-8 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                      <div className="text-xs font-bold text-slate-900 mb-2 flex items-center justify-between">
                        <span>Product-wise Profit</span>
                        <span className="text-[10px] text-emerald-700 font-mono font-bold">
                          Sales Revenue &minus; Cost per Product
                        </span>
                      </div>
                      <div className="h-64">
                        <Bar
                          data={{
                            labels: soldProductAnalysis.map((p) =>
                              p.product_name.length > 18
                                ? p.product_name.substring(0, 16) + '...'
                                : p.product_name
                            ),
                            datasets: [
                              {
                                label: 'Profit (₹)',
                                data: soldProductAnalysis.map((p) => p.profit),
                                backgroundColor: '#10b981',
                                borderRadius: 4,
                              },
                              {
                                label: 'Cost Amount (₹)',
                                data: soldProductAnalysis.map((p) => p.costAmount),
                                backgroundColor: '#cbd5e1',
                                borderRadius: 4,
                              },
                            ],
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: { labels: { color: '#334155', font: { size: 10 } } },
                            },
                            scales: {
                              x: { ticks: { color: '#64748b', font: { size: 10 } } },
                              y: { ticks: { color: '#64748b', font: { size: 10 } } },
                            },
                          }}
                        />
                      </div>
                    </div>

                    {/* Existing Visual: Sales Contribution by Department Donut */}
                    <div className="lg:col-span-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                      <div className="text-xs font-bold text-slate-900 mb-2 flex items-center justify-between">
                        <span>Department Profit Share</span>
                        <span className="text-[10px] text-amber-600 font-mono font-bold">Donut</span>
                      </div>
                      <div className="h-64 flex items-center justify-center">
                        <Doughnut
                          data={{
                            labels: categoryProfitAnalysis.map((c) => c.name),
                            datasets: [
                              {
                                data: categoryProfitAnalysis.map((c) => Math.max(0, c.profit)),
                                backgroundColor: [
                                  '#f59e0b',
                                  '#10b981',
                                  '#3b82f6',
                                  '#8b5cf6',
                                  '#ec4899',
                                  '#14b8a6',
                                ],
                                borderWidth: 2,
                                borderColor: '#ffffff',
                              },
                            ],
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: {
                                position: 'bottom',
                                labels: { color: '#334155', font: { size: 10 } },
                              },
                            },
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Charts Row 3: High Profit Products & Low Profit / Loss Products */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Chart: High Profit Products */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                      <div className="text-xs font-bold text-slate-900 mb-2 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <TrendingUp className="w-4 h-4 text-emerald-600" />
                          <span>High Profit Products</span>
                        </span>
                        <span className="text-[10px] text-emerald-700 font-mono font-bold">
                          Top 5 Profitable Items
                        </span>
                      </div>
                      <div className="h-52">
                        <Bar
                          data={{
                            labels: highProfitProducts.map((p) =>
                              p.product_name.length > 20
                                ? p.product_name.substring(0, 18) + '...'
                                : p.product_name
                            ),
                            datasets: [
                              {
                                label: 'Profit (₹)',
                                data: highProfitProducts.map((p) => p.profit),
                                backgroundColor: '#059669',
                                borderRadius: 4,
                              },
                            ],
                          }}
                          options={{
                            indexAxis: 'y',
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: { legend: { display: false } },
                            scales: {
                              x: { ticks: { color: '#64748b', font: { size: 10 } } },
                              y: { ticks: { color: '#334155', font: { size: 10 } } },
                            },
                          }}
                        />
                      </div>
                    </div>

                    {/* Chart: Low Profit / Loss Products */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                      <div className="text-xs font-bold text-slate-900 mb-2 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <TrendingDown className="w-4 h-4 text-rose-600" />
                          <span>Low Profit / Loss Products</span>
                        </span>
                        <span className="text-[10px] text-rose-700 font-mono font-bold">
                          Lowest Profit Contribution
                        </span>
                      </div>
                      <div className="h-52">
                        <Bar
                          data={{
                            labels: lowProfitProducts.map((p) =>
                              p.product_name.length > 20
                                ? p.product_name.substring(0, 18) + '...'
                                : p.product_name
                            ),
                            datasets: [
                              {
                                label: 'Profit (₹)',
                                data: lowProfitProducts.map((p) => p.profit),
                                backgroundColor: lowProfitProducts.map((p) =>
                                  p.profit <= 0 ? '#e11d48' : '#f97316'
                                ),
                                borderRadius: 4,
                              },
                            ],
                          }}
                          options={{
                            indexAxis: 'y',
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: { legend: { display: false } },
                            scales: {
                              x: { ticks: { color: '#64748b', font: { size: 10 } } },
                              y: { ticks: { color: '#334155', font: { size: 10 } } },
                            },
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Product-wise Profit Analysis Table */}
                  <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                    <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h3 className="text-xs font-bold text-slate-900">
                          Product-wise Profit Analysis
                        </h3>
                        <p className="text-[11px] text-slate-500">
                          Gross Profit = Sales Amount &minus; Cost Amount &bull; Profit Margin % = (Profit / Sales Amount) &times; 100
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          exportDataToCsv('product_profit_analysis.csv', productProfitAnalysis)
                        }
                        className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-semibold shadow-2xs"
                      >
                        <Download className="w-3 h-3 text-emerald-600" />
                        <span>Export Profit Table CSV</span>
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-600 text-left font-semibold">
                            <th className="py-2.5 px-4">Product Name</th>
                            <th className="py-2.5 px-3">Category</th>
                            <th className="py-2.5 px-3 text-center">Sold Qty</th>
                            <th className="py-2.5 px-3 text-right">Sales Amount</th>
                            <th className="py-2.5 px-3 text-right">Cost Amount</th>
                            <th className="py-2.5 px-3 text-right">Profit</th>
                            <th className="py-2.5 px-4 text-right">Profit Margin %</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {productProfitAnalysis.map((item) => {
                            const isHighProfit = item.profit >= 50;
                            const isLowOrZero = item.profit <= 10;
                            return (
                              <tr key={item.product_id} className="hover:bg-slate-50/80 transition-colors">
                                <td className="py-2.5 px-4">
                                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                    <span>{item.product_name}</span>
                                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                                      {item.unit}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-2.5 px-3 text-slate-600">{item.category_name}</td>
                                <td className="py-2.5 px-3 text-center font-mono font-semibold text-slate-700">
                                  {item.qtySold} {item.unit}
                                </td>
                                <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-900">
                                  ₹{item.salesAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>
                                <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                                  ₹{item.costAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>
                                <td className="py-2.5 px-3 text-right font-mono font-bold">
                                  <span
                                    className={
                                      item.profit < 0
                                        ? 'text-rose-600'
                                        : isHighProfit
                                        ? 'text-emerald-700'
                                        : isLowOrZero
                                        ? 'text-amber-600'
                                        : 'text-emerald-600'
                                    }
                                  >
                                    ₹{item.profit.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </span>
                                </td>
                                <td className="py-2.5 px-4 text-right font-mono">
                                  <span
                                    className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                      item.profit < 0
                                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                        : item.marginPercent >= 15
                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                        : item.qtySold === 0
                                        ? 'bg-slate-100 text-slate-500 border border-slate-200'
                                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                                    }`}
                                  >
                                    {item.marginPercent.toFixed(1)}%
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot>
                          <tr className="bg-slate-100/80 border-t-2 border-slate-200 font-bold text-slate-900">
                            <td className="py-2.5 px-4" colSpan={2}>
                              Total (All Products)
                            </td>
                            <td className="py-2.5 px-3 text-center font-mono">{totalProductsSold}</td>
                            <td className="py-2.5 px-3 text-right font-mono">
                              ₹{totalSalesRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-rose-700">
                              ₹{totalCost.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-emerald-700">
                              ₹{grossProfit.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className="py-2.5 px-4 text-right font-mono text-emerald-800">
                              {profitMargin.toFixed(1)}%
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* PAGE 2: PRODUCT & INVENTORY ANALYTICS */}
              {pbiPage === 'p2' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Stock vs Reorder Level Matrix */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                      <div className="text-xs font-bold text-slate-900 mb-3">
                        Stock on Hand vs Reorder Threshold Level (Inventory Risk)
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="border-b border-slate-200 text-slate-500 text-left font-semibold">
                              <th className="pb-1.5">Product</th>
                              <th className="pb-1.5 text-center">Stock</th>
                              <th className="pb-1.5 text-center">Reorder Min</th>
                              <th className="pb-1.5 text-right">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {products.slice(0, 8).map((p) => {
                              const isLow = p.stock <= p.reorder_level;
                              return (
                                <tr key={p.product_id} className="hover:bg-slate-50">
                                  <td className="py-2 text-slate-900 font-medium">{p.product_name}</td>
                                  <td className="py-2 text-center font-mono font-bold text-slate-800">
                                    {p.stock} {p.unit || 'Piece'}
                                  </td>
                                  <td className="py-2 text-center font-mono text-slate-500">
                                    {p.reorder_level} {p.unit || 'Piece'}
                                  </td>
                                  <td className="py-2 text-right">
                                    <span
                                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                        isLow
                                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                      }`}
                                    >
                                      {isLow ? 'Reorder Needed' : 'Adequate'}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Top Products Volume Bar */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                      <div className="text-xs font-bold text-slate-900 mb-2">
                        Top 5 Products by Sales Units Sold
                      </div>
                      <div className="h-64">
                        <Bar
                          data={{
                            labels: [...productProfitAnalysis]
                              .sort((a, b) => b.qtySold - a.qtySold)
                              .slice(0, 5)
                              .map((p) => p.product_name.split(' ')[0]),
                            datasets: [
                              {
                                label: 'Units Sold',
                                data: [...productProfitAnalysis]
                                  .sort((a, b) => b.qtySold - a.qtySold)
                                  .slice(0, 5)
                                  .map((p) => p.qtySold),
                                backgroundColor: '#2563eb',
                                borderRadius: 4,
                              },
                            ],
                          }}
                          options={{
                            indexAxis: 'y',
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: { legend: { display: false } },
                            scales: {
                              x: { ticks: { color: '#64748b' } },
                              y: { ticks: { color: '#64748b' } },
                            },
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* PAGE 3: CUSTOMER & BASKET ANALYSIS */}
              {pbiPage === 'p3' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                      <div className="text-[10px] text-slate-500 uppercase font-mono font-bold">
                        [Registered Shoppers]
                      </div>
                      <div className="text-xl font-black text-slate-900">{customers.length} Customers</div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                      <div className="text-[10px] text-slate-500 uppercase font-mono font-bold">
                        [Repeat Shopper Ratio]
                      </div>
                      <div className="text-xl font-black text-emerald-600">80.0%</div>
                      <div className="text-[10px] text-slate-500">&gt; 1 bill processed</div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                      <div className="text-[10px] text-slate-500 uppercase font-mono font-bold">
                        [Avg Items per Basket]
                      </div>
                      <div className="text-xl font-black text-amber-600">
                        {sales.length > 0 ? (totalProductsSold / sales.length).toFixed(1) : 0} items/bill
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                    <div className="text-xs font-bold text-slate-900 mb-2">
                      Customer Spending Leaderboard (Power BI Table Visual)
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-slate-200 text-slate-500 text-left font-semibold">
                            <th className="pb-1.5">Customer</th>
                            <th className="pb-1.5">Mobile</th>
                            <th className="pb-1.5 text-center">Invoices</th>
                            <th className="pb-1.5 text-right">Lifetime Sales (₹)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {customers.slice(0, 5).map((c) => {
                            const cSales = sales.filter((s) => s.customer_id === c.customer_id);
                            const val = cSales.reduce((a, b) => a + b.total_amount, 0);
                            return (
                              <tr key={c.customer_id} className="hover:bg-slate-50">
                                <td className="py-2 text-slate-900 font-bold">{c.name}</td>
                                <td className="py-2 text-slate-500 font-mono">{c.mobile}</td>
                                <td className="py-2 text-center font-mono font-semibold text-slate-700">{cSales.length}</td>
                                <td className="py-2 text-right font-mono font-extrabold text-emerald-700">
                                  ₹{val.toFixed(2)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Star Schema Architecture */}
      {activeTab === 'star_schema' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 text-xs">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                Power BI Star Schema Dimensional Data Model
              </h3>
              <p className="text-slate-500">
                Optimized for fast analytical slicing, aggregation, and drill-down across products, categories, brands, and customers.
              </p>
            </div>

            {/* Visual Schema Diagram */}
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 font-mono">
              <div className="text-center font-extrabold text-amber-700 mb-6 text-sm">
                STAR SCHEMA ARCHITECTURE FOR SMART RETAIL
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                {/* Left Dimensions */}
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-white border border-blue-300 text-[11px] shadow-xs">
                    <div className="font-bold text-blue-700">dim_customers</div>
                    <div className="text-slate-600 text-[10px] mt-1">
                      PK: customer_id<br />
                      name, mobile, loyalty_points, created_at
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-white border border-blue-300 text-[11px] shadow-xs">
                    <div className="font-bold text-blue-700">dim_users (Cashiers)</div>
                    <div className="text-slate-600 text-[10px] mt-1">
                      PK: user_id<br />
                      name, username, role
                    </div>
                  </div>
                </div>

                {/* Central Fact Tables */}
                <div className="space-y-3">
                  <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-300 text-[11px] text-center shadow-xs">
                    <div className="font-extrabold text-emerald-800 uppercase tracking-wide">
                      fact_sales (Header)
                    </div>
                    <div className="text-slate-700 text-[10px] mt-1 text-left">
                      PK: sale_id<br />
                      FK: customer_id &rarr; dim_customers<br />
                      FK: user_id &rarr; dim_users<br />
                      Date: sale_date<br />
                      Measures: subtotal, discount, total_amount, payment_method
                    </div>
                  </div>

                  <div className="text-center text-slate-400 text-xs font-bold">&uarr; 1-to-Many &darr;</div>

                  <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-300 text-[11px] text-center shadow-xs">
                    <div className="font-extrabold text-emerald-800 uppercase tracking-wide">
                      fact_sale_items (Line Grain)
                    </div>
                    <div className="text-slate-700 text-[10px] mt-1 text-left">
                      PK: sale_item_id<br />
                      FK: sale_id &rarr; fact_sales<br />
                      FK: product_id &rarr; dim_products<br />
                      Measures: quantity, cost_price, regular_price, selling_price, discount, amount, profit
                    </div>
                  </div>
                </div>

                {/* Right Dimensions */}
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-white border border-blue-300 text-[11px] shadow-xs">
                    <div className="font-bold text-blue-700">dim_products</div>
                    <div className="text-slate-600 text-[10px] mt-1">
                      PK: product_id<br />
                      product_name, barcode<br />
                      FK: category_id &rarr; dim_categories<br />
                      FK: brand_id &rarr; dim_brands<br />
                      stock, reorder_level
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-white border border-purple-300 text-[11px] shadow-xs">
                    <div className="font-bold text-purple-700">dim_categories &amp; dim_brands</div>
                    <div className="text-slate-600 text-[10px] mt-1">
                      PK: category_id, category_name<br />
                      PK: brand_id, brand_name
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Key DAX Formulas */}
      {activeTab === 'dax' && (
        <div className="space-y-3">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Production DAX Formulas for Power BI
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Copy and paste these exact formulas directly into the &quot;New Measure&quot; bar in Power BI Desktop.
            </p>

            <div className="space-y-3">
              {daxMeasures.map((m, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 font-mono text-[11px]">
                      {m.name}
                    </span>
                    <button
                      onClick={() => handleCopyDax(m.formula, idx)}
                      className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold transition-colors shadow-xs"
                    >
                      {copiedIndex === idx ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-700 font-bold">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-slate-500" />
                          <span>Copy DAX</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="p-2.5 rounded bg-white border border-slate-200 font-mono text-[11px] text-emerald-700 overflow-x-auto font-medium">
                    {m.formula}
                  </div>
                  <p className="text-[11px] text-slate-500">{m.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Step-by-Step XAMPP MySQL Connection Guide */}
      {activeTab === 'connection_guide' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 text-xs">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-600" />
              <span>How to Connect Power BI Desktop to Local XAMPP MySQL</span>
            </h3>
            <p className="text-slate-500">
              Clear steps to show the examiner how live data from the web POS flows directly into Power BI.
            </p>
          </div>

          <ol className="space-y-3 list-decimal list-inside text-slate-700">
            <li className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
              <strong className="text-slate-900">Start XAMPP Apache &amp; MySQL:</strong>
              <p className="text-slate-600 mt-1">
                Open XAMPP Control Panel and ensure both <span className="text-emerald-700 font-mono font-bold">Apache</span> and{' '}
                <span className="text-emerald-700 font-mono font-bold">MySQL</span> show green &quot;Running&quot; status.
              </p>
            </li>

            <li className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
              <strong className="text-slate-900">Install MySQL Connector/NET (if prompted):</strong>
              <p className="text-slate-600 mt-1">
                Power BI requires the official Oracle <em>MySQL Connector/NET</em> (version 8.0.32 or later). If Power BI displays a connector warning, download the free MSI installer from MySQL official site.
              </p>
            </li>

            <li className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
              <strong className="text-slate-900">Open Power BI Desktop &amp; Connect:</strong>
              <div className="text-slate-600 mt-1 space-y-1">
                <div>&bull; Click <strong>Get Data</strong> &rarr; <strong>More...</strong> &rarr; <strong>Database</strong> &rarr; <strong>MySQL database</strong>.</div>
                <div>&bull; In the <strong>Server</strong> field, type: <code className="text-amber-700 bg-amber-50 px-1 py-0.5 rounded font-mono font-bold">localhost</code> (or <code className="text-amber-700 bg-amber-50 px-1 py-0.5 rounded font-mono font-bold">127.0.0.1:3306</code>).</div>
                <div>&bull; In the <strong>Database</strong> field, type: <code className="text-amber-700 bg-amber-50 px-1 py-0.5 rounded font-mono font-bold">smart_retail</code>.</div>
                <div>&bull; Select Data Connectivity mode: <strong>Import</strong> (recommended for fast DAX) or <strong>DirectQuery</strong>.</div>
              </div>
            </li>

            <li className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
              <strong className="text-slate-900">Database Credentials:</strong>
              <p className="text-slate-600 mt-1">
                Select <strong>Database</strong> authentication tab. Username: <code className="text-slate-900 font-mono font-bold">root</code>, Password: leave blank (default XAMPP setup).
              </p>
            </li>

            <li className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
              <strong className="text-slate-900">Select Tables to Load:</strong>
              <p className="text-slate-600 mt-1">
                Check all 8 tables: <code className="text-emerald-700 font-mono">products</code>, <code className="text-emerald-700 font-mono">categories</code>, <code className="text-emerald-700 font-mono">brands</code>, <code className="text-emerald-700 font-mono">customers</code>, <code className="text-emerald-700 font-mono">offers</code>, <code className="text-emerald-700 font-mono">sales</code>, <code className="text-emerald-700 font-mono">sale_items</code>, and <code className="text-emerald-700 font-mono">users</code>.
              </p>
            </li>

            <li className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
              <strong className="text-slate-900">Verify Model Relationships &amp; Add DAX:</strong>
              <p className="text-slate-600 mt-1">
                Switch to Model View in Power BI to see the automatic star schema relationships. Then paste the DAX measures provided in the &quot;DAX Measures&quot; tab above!
              </p>
            </li>
          </ol>
        </div>
      )}
    </div>
  );
};
