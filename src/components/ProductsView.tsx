import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { Product, ProductUnit } from '../types';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Barcode,
  Layers,
  Tags,
  AlertTriangle,
  X,
  Scale,
  Lightbulb,
  Check,
  Percent,
  TrendingUp,
  Trash2,
  ShoppingBag,
} from 'lucide-react';

interface PriceSuggestionResult {
  costPrice: number;
  stock: number;
  unit: ProductUnit;
  qtySold: number;
  suggestedRegularPrice: number;
  expectedProfitPerUnit: number;
  profitMarginPercent: number;
  isHighStockLowSales: boolean;
  suggestedOfferPrice: number | null;
  offerDiscountPercent: number;
  offerProfitPerUnit: number;
  ruleExplanation: string;
}

// Simple rule-based price suggestion calculator using Cost Price, Stock Quantity, and Sales volume
function calculateRuleBasedPriceSuggestion(
  costPrice: number,
  stock: number,
  reorderLevel: number,
  unit: ProductUnit,
  qtySold: number
): PriceSuggestionResult {
  const safeCost = Math.max(0, Number(costPrice) || 0);
  const safeStock = Math.max(0, Number(stock) || 0);
  const safeReorder = Math.max(1, Number(reorderLevel) || 10);

  // Rule: Suggest a Regular Price that yields a 20% Profit Margin on Regular Price
  // Since Profit Margin % = (Expected Profit / Suggested Regular Price) * 100 = 20%,
  // Suggested Regular Price = Cost Price / (1 - 0.20) = Cost Price * 1.25
  // Example: Cost Price = ₹40 -> Suggested Regular Price = ₹50 -> Expected Profit = ₹10 -> Margin = 20%
  const rawSuggestedRegular = safeCost > 0 ? safeCost * 1.25 : 0;
  const suggestedRegularPrice = Math.round(rawSuggestedRegular * 100) / 100;
  const expectedProfitPerUnit = Math.round((suggestedRegularPrice - safeCost) * 100) / 100;
  const profitMarginPercent =
    suggestedRegularPrice > 0
      ? Math.round(((expectedProfitPerUnit / suggestedRegularPrice) * 100) * 10) / 10
      : 0;

  // High stock & low sales rule: stock >= 50 (or >= 2x reorder level) and low sales volume (<= 3 units sold)
  const isHighStockLowSales =
    safeStock >= Math.max(40, safeReorder * 2) && qtySold <= 3;

  // If high stock & low sales, suggest a 10% discount offer price off the suggested regular price
  // (ensuring it remains above cost price so the store still makes a profit while reducing wastage)
  const offerDiscountPercent = 10;
  const rawOfferPrice = suggestedRegularPrice * (1 - offerDiscountPercent / 100);
  const suggestedOfferPrice =
    isHighStockLowSales && safeCost > 0
      ? Math.max(Math.round((safeCost * 1.08) * 100) / 100, Math.round(rawOfferPrice * 100) / 100)
      : null;
  const offerProfitPerUnit =
    suggestedOfferPrice !== null
      ? Math.round((suggestedOfferPrice - safeCost) * 100) / 100
      : 0;

  let ruleExplanation = 'Standard 20% margin rule (Cost + 25% markup) for balanced retail pricing.';
  if (isHighStockLowSales) {
    ruleExplanation =
      'High stock & low sales detected — suggest 10% offer/discount price to boost sales and prevent wastage.';
  } else if (safeStock <= safeReorder) {
    ruleExplanation =
      'Low stock alert — maintain suggested regular price and restock soon.';
  }

  return {
    costPrice: safeCost,
    stock: safeStock,
    unit,
    qtySold,
    suggestedRegularPrice,
    expectedProfitPerUnit,
    profitMarginPercent,
    isHighStockLowSales,
    suggestedOfferPrice,
    offerDiscountPercent,
    offerProfitPerUnit,
    ruleExplanation,
  };
}

export const ProductsView: React.FC = () => {
  const {
    products,
    categories,
    brands,
    saleItems,
    addProduct,
    updateProduct,
    toggleProductStatus,
    deleteProduct,
    addCategory,
    addBrand,
    addOffer,
    offers,
    currentUser,
    getActiveOfferForProduct,
    addToCartByProductId,
    setActiveTab,
  } = useStore();

  const isAdmin = currentUser.role === 'admin';

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [brandFilter, setBrandFilter] = useState<string>('all');
  const [unitFilter, setUnitFilter] = useState<string>('all');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Price Suggestion Modal for any individual product
  const [suggestionProduct, setSuggestionProduct] = useState<Product | null>(null);
  const [customRegularPriceInput, setCustomRegularPriceInput] = useState<number>(0);
  const [customSellingPriceInput, setCustomSellingPriceInput] = useState<number>(0);
  const [feedbackBanner, setFeedbackBanner] = useState<string | null>(null);

  // Quick category/brand inline modal
  const [isInlineCatOpen, setIsInlineCatOpen] = useState(false);
  const [inlineCatName, setInlineCatName] = useState('');
  const [isInlineBrandOpen, setIsInlineBrandOpen] = useState(false);
  const [inlineBrandName, setInlineBrandName] = useState('');

  // Form State
  const [formData, setFormData] = useState<{
    product_name: string;
    barcode: string;
    category_id: number;
    brand_id: number;
    unit: ProductUnit;
    cost_price: number;
    regular_price: number;
    selling_price: number;
    stock: number;
    reorder_level: number;
    status: 'active' | 'inactive';
  }>({
    product_name: '',
    barcode: '',
    category_id: categories[0]?.category_id || 1,
    brand_id: brands[0]?.brand_id || 1,
    unit: 'Piece',
    cost_price: 0,
    regular_price: 0,
    selling_price: 0,
    stock: 0,
    reorder_level: 10,
    status: 'active',
  });

  // Map of product_id -> total quantity sold from existing saleItems data
  const productSalesVolumeMap = useMemo(() => {
    const map = new Map<number, number>();
    saleItems.forEach((si) => {
      map.set(si.product_id, Math.round(((map.get(si.product_id) || 0) + si.quantity) * 1000) / 1000);
    });
    return map;
  }, [saleItems]);

  // Live Price Suggestion for the Add/Edit Product Modal form
  const formPriceSuggestion = useMemo(() => {
    const soldQty = editingProduct ? productSalesVolumeMap.get(editingProduct.product_id) || 0 : 0;
    return calculateRuleBasedPriceSuggestion(
      formData.cost_price,
      formData.stock,
      formData.reorder_level,
      formData.unit,
      soldQty
    );
  }, [formData.cost_price, formData.stock, formData.reorder_level, formData.unit, editingProduct, productSalesVolumeMap]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const prodUnit = p.unit || 'Piece';
      const matchesSearch =
        p.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.barcode.includes(searchQuery);
      const matchesCategory =
        categoryFilter === 'all' || p.category_id === parseInt(categoryFilter);
      const matchesBrand = brandFilter === 'all' || p.brand_id === parseInt(brandFilter);
      const matchesUnit = unitFilter === 'all' || prodUnit === unitFilter;
      return matchesSearch && matchesCategory && matchesBrand && matchesUnit;
    });
  }, [products, searchQuery, categoryFilter, brandFilter, unitFilter]);

  const handleOpenAdd = () => {
    setFormData({
      product_name: '',
      barcode: '890' + Math.floor(1000000000 + Math.random() * 9000000000),
      category_id: categories[0]?.category_id || 1,
      brand_id: brands[0]?.brand_id || 1,
      unit: 'Kg',
      cost_price: 40,
      regular_price: 50,
      selling_price: 45,
      stock: 100,
      reorder_level: 15,
      status: 'active',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      product_name: p.product_name,
      barcode: p.barcode,
      category_id: p.category_id,
      brand_id: p.brand_id,
      unit: p.unit || 'Piece',
      cost_price: p.cost_price,
      regular_price: p.regular_price,
      selling_price: p.selling_price,
      stock: p.stock,
      reorder_level: p.reorder_level,
      status: p.status,
    });
  };

  const handleOpenSuggestionModal = (p: Product) => {
    const soldQty = productSalesVolumeMap.get(p.product_id) || 0;
    const suggestion = calculateRuleBasedPriceSuggestion(
      p.cost_price,
      p.stock,
      p.reorder_level,
      p.unit || 'Piece',
      soldQty
    );
    setSuggestionProduct(p);
    setCustomRegularPriceInput(suggestion.suggestedRegularPrice);
    setCustomSellingPriceInput(
      suggestion.suggestedOfferPrice !== null ? suggestion.suggestedOfferPrice : p.selling_price
    );
  };

  const handleAcceptSuggestionInModal = (applyOfferDiscount: boolean = false) => {
    if (!suggestionProduct) return;
    const updatedRegular = Math.max(0, Number(customRegularPriceInput) || suggestionProduct.regular_price);
    const updatedSelling = applyOfferDiscount
      ? Math.max(0, Number(customSellingPriceInput) || suggestionProduct.selling_price)
      : suggestionProduct.selling_price;

    updateProduct({
      ...suggestionProduct,
      regular_price: updatedRegular,
      selling_price: updatedSelling,
    });

    if (applyOfferDiscount) {
      const existingOffer = offers.find(
        (o) => o.product_id === suggestionProduct.product_id && o.status === 'active'
      );
      if (!existingOffer) {
        const today = new Date().toISOString().split('T')[0];
        const nextMonth = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
        addOffer({
          product_id: suggestionProduct.product_id,
          offer_name: `Stock Clearance Offer - 10% Off ${suggestionProduct.product_name}`,
          discount_percentage: 10,
          start_date: today,
          end_date: nextMonth,
          status: 'active',
        });
      }
    }

    setFeedbackBanner(
      applyOfferDiscount
        ? `Updated "${suggestionProduct.product_name}": Regular Price set to ₹${updatedRegular.toFixed(
            2
          )} and Offer Selling Price set to ₹${updatedSelling.toFixed(2)}!`
        : `Accepted Suggested Regular Price of ₹${updatedRegular.toFixed(2)} for "${
            suggestionProduct.product_name
          }".`
    );
    setSuggestionProduct(null);
    setTimeout(() => setFeedbackBanner(null), 4500);
  };

  const handleDeleteProduct = (p: Product) => {
    const attachedSalesCount = saleItems.filter((si) => si.product_id === p.product_id).length;
    if (attachedSalesCount > 0) {
      const confirmDeactivate = window.confirm(
        `⚠️ Product "${p.product_name}" is recorded in ${attachedSalesCount} completed billing transaction(s).\n\nTo preserve historical sales receipts and reporting data, records with sales history cannot be permanently deleted.\n\nWould you like to safely set this product to INACTIVE instead?`
      );
      if (confirmDeactivate) {
        updateProduct({ ...p, status: 'inactive' });
        setFeedbackBanner(`Product "${p.product_name}" has been safely deactivated to preserve sales records.`);
        setTimeout(() => setFeedbackBanner(null), 4000);
      }
      return;
    }

    if (
      window.confirm(
        `Are you sure you want to permanently delete "${p.product_name}" from the product catalog?`
      )
    ) {
      const res = deleteProduct(p.product_id);
      setFeedbackBanner(res.message);
      setTimeout(() => setFeedbackBanner(null), 4000);
    }
  };

  const handleSubmitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.product_name.trim() || !formData.barcode.trim()) {
      alert('Product name and barcode are required.');
      return;
    }
    addProduct({
      ...formData,
      stock:
        formData.unit === 'Piece'
          ? Math.max(0, Math.round(Number(formData.stock)))
          : Math.max(0, Math.round(Number(formData.stock) * 1000) / 1000),
    });
    setIsAddModalOpen(false);
  };

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    updateProduct({
      ...editingProduct,
      product_name: formData.product_name,
      barcode: formData.barcode,
      category_id: Number(formData.category_id),
      brand_id: Number(formData.brand_id),
      unit: formData.unit,
      cost_price: Number(formData.cost_price),
      regular_price: Number(formData.regular_price),
      selling_price: Number(formData.selling_price),
      stock:
        formData.unit === 'Piece'
          ? Math.max(0, Math.round(Number(formData.stock)))
          : Math.max(0, Math.round(Number(formData.stock) * 1000) / 1000),
      reorder_level: Number(formData.reorder_level),
      status: formData.status,
    });
    setEditingProduct(null);
  };

  const handleCreateInlineCat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inlineCatName.trim()) return;
    const newCat = addCategory(inlineCatName.trim(), 'active');
    setFormData((prev) => ({ ...prev, category_id: newCat.category_id }));
    setInlineCatName('');
    setIsInlineCatOpen(false);
  };

  const handleCreateInlineBrand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inlineBrandName.trim()) return;
    const newB = addBrand(inlineBrandName.trim(), 'active');
    setFormData((prev) => ({ ...prev, brand_id: newB.brand_id }));
    setInlineBrandName('');
    setIsInlineBrandOpen(false);
  };

  const getUnitBadgeStyle = (unit: ProductUnit) => {
    if (unit === 'Kg') {
      return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    }
    if (unit === 'Litre') {
      return 'bg-sky-50 text-sky-800 border-sky-200';
    }
    return 'bg-indigo-50 text-indigo-800 border-indigo-200';
  };

  return (
    <div className="space-y-4">
      {/* Educational Callout on Supermarket Pricing & Units */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200">
            <Scale className="w-4 h-4" />
          </div>
          <div className="text-slate-600">
            <span className="font-bold text-slate-900">Unit &amp; Stock Architecture: </span>
            <span>
              Vegetables like <strong>Tomato, Onion, Potato</strong> use <strong className="text-emerald-700">Unit = Kg</strong> (supports decimal billing like <code className="font-mono bg-slate-100 px-1 rounded">0.5 Kg, 1.25 Kg, 2.5 Kg</code> &amp; auto-reduces Kg stock). Liquids use <strong className="text-sky-700">Litre</strong>, and packaged items (Soap, Biscuits) use <strong className="text-indigo-700">Piece</strong> (whole numbers).
            </span>
          </div>
        </div>
        {isAdmin ? (
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setActiveTab('billing')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-sm cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Go to POS Billing</span>
          </button>
        )}
      </div>

      {/* Feedback Banner */}
      {feedbackBanner && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between gap-3 text-xs text-emerald-900 shadow-xs">
          <div className="flex items-center gap-2 font-semibold">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedbackBanner}</span>
          </div>
          <button
            onClick={() => setFeedbackBanner(null)}
            className="text-emerald-700 hover:text-emerald-950 font-bold"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by product name (e.g. Tomato, Onion, Soap) or barcode..."
            className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg pl-9 pr-3 py-1.5 text-xs focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Unit:</span>
            <select
              value={unitFilter}
              onChange={(e) => setUnitFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-800 rounded px-2.5 py-1 text-xs outline-none focus:border-emerald-600 font-semibold"
            >
              <option value="all">All Units (Kg / Litre / Piece)</option>
              <option value="Kg">Kg (Vegetables / Loose)</option>
              <option value="Litre">Litre (Milk / Liquids)</option>
              <option value="Piece">Piece (Soap / Biscuits / Packets)</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-800 rounded px-2.5 py-1 text-xs outline-none focus:border-emerald-600"
            >
              <option value="all">All Categories ({categories.length})</option>
              {categories.map((c) => (
                <option key={c.category_id} value={c.category_id}>
                  {c.category_name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Brand:</span>
            <select
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-800 rounded px-2.5 py-1 text-xs outline-none focus:border-emerald-600"
            >
              <option value="all">All Brands ({brands.length})</option>
              {brands.map((b) => (
                <option key={b.brand_id} value={b.brand_id}>
                  {b.brand_name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-left border-b border-slate-200 font-semibold">
                <th className="py-3 px-3">ID</th>
                <th className="py-3 px-3">Product Name</th>
                <th className="py-3 px-2 text-center">Unit</th>
                <th className="py-3 px-2 font-mono">Barcode</th>
                <th className="py-3 px-2">Category</th>
                {isAdmin && <th className="py-3 px-2 text-right">Cost (₹)</th>}
                <th className="py-3 px-2 text-right">Regular (₹)</th>
                <th className="py-3 px-2 text-right">Selling Price</th>
                {!isAdmin && <th className="py-3 px-2 text-center">Active Offer</th>}
                {isAdmin && <th className="py-3 px-2 text-right">Price Suggestion</th>}
                <th className="py-3 px-2 text-center">Available Stock</th>
                <th className="py-3 px-2 text-center">Status</th>
                <th className="py-3 px-3 text-center">
                  {isAdmin ? 'Actions' : 'Billing'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((p) => {
                const cat = categories.find((c) => c.category_id === p.category_id);
                const brand = brands.find((b) => b.brand_id === p.brand_id);
                const prodUnit: ProductUnit = p.unit || 'Piece';
                const isLowStock = p.stock <= p.reorder_level;
                const soldQty = productSalesVolumeMap.get(p.product_id) || 0;
                const activeOffer = getActiveOfferForProduct(p.product_id);
                const suggestion = calculateRuleBasedPriceSuggestion(
                  p.cost_price,
                  p.stock,
                  p.reorder_level,
                  prodUnit,
                  soldQty
                );

                return (
                  <tr key={p.product_id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3 text-slate-400 font-mono">#{p.product_id}</td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{p.product_name}</div>
                      <div className="text-[10px] text-slate-500">{brand?.brand_name || '—'}</div>
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-md font-bold text-[11px] border inline-block ${getUnitBadgeStyle(
                          prodUnit
                        )}`}
                      >
                        {prodUnit}
                      </span>
                    </td>
                    <td className="py-3 px-2 font-mono text-slate-500 text-[11px]">{p.barcode}</td>
                    <td className="py-3 px-2 text-slate-600">{cat?.category_name || '—'}</td>
                    {isAdmin && (
                      <td className="py-3 px-2 text-right font-mono text-slate-600 font-medium">
                        ₹{p.cost_price.toFixed(2)}
                      </td>
                    )}
                    <td className="py-3 px-2 text-right font-mono text-slate-700 font-semibold">
                      ₹{p.regular_price.toFixed(2)}
                    </td>
                    <td className="py-3 px-2 text-right font-mono font-bold text-emerald-700">
                      ₹{p.selling_price.toFixed(2)}
                      <span className="text-[10px] font-normal text-slate-500">/{prodUnit}</span>
                    </td>
                    {!isAdmin && (
                      <td className="py-3 px-2 text-center">
                        {activeOffer ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-mono font-bold text-[11px]">
                            <Percent className="w-3 h-3 text-amber-600" />
                            <span>{activeOffer.discount_percentage}% OFF</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">—</span>
                        )}
                      </td>
                    )}
                    {isAdmin && (
                      <td className="py-3 px-2 text-right">
                        <div className="font-mono font-bold text-amber-800">
                          Suggested: ₹{suggestion.suggestedRegularPrice.toFixed(2)}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          Profit: ₹{suggestion.expectedProfitPerUnit.toFixed(2)}/{prodUnit} ({suggestion.profitMarginPercent}%)
                        </div>
                        {suggestion.isHighStockLowSales && suggestion.suggestedOfferPrice !== null && (
                          <div className="text-[10px] text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded inline-block mt-0.5 font-semibold">
                            Offer Suggest: ₹{suggestion.suggestedOfferPrice.toFixed(2)} (-10%)
                          </div>
                        )}
                      </td>
                    )}
                    <td className="py-3 px-2 text-center">
                      <span
                        className={`px-2 py-0.5 rounded font-mono font-bold text-[11px] ${
                          isLowStock
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                        title={
                          isLowStock
                            ? `Below reorder level (${p.reorder_level} ${prodUnit})`
                            : 'In Stock'
                        }
                      >
                        {p.stock} {prodUnit}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center">
                      {isAdmin ? (
                        <button
                          onClick={() => toggleProductStatus(p.product_id)}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                            p.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-slate-100 text-slate-500 border-slate-200'
                          }`}
                        >
                          {p.status}
                        </button>
                      ) : (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            p.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-slate-100 text-slate-500 border-slate-200'
                          }`}
                        >
                          {p.status}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {isAdmin ? (
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenSuggestionModal(p)}
                            className="px-2.5 py-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition-colors flex items-center gap-1 font-semibold shadow-2xs cursor-pointer"
                            title="View rule-based Price Suggestion & Expected Profit"
                          >
                            <Lightbulb className="w-3 h-3 text-amber-600" />
                            <span>Price Suggestion</span>
                          </button>
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-semibold text-xs transition-colors shadow-2xs cursor-pointer"
                            title="Edit Product Details, Price & Stock"
                          >
                            <span>✏️</span>
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold text-xs transition-colors shadow-2xs cursor-pointer"
                            title="Delete Product Safely"
                          >
                            <span>🗑️</span>
                            <span>Delete</span>
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          disabled={p.status !== 'active' || p.stock <= 0}
                          onClick={() => {
                            const res = addToCartByProductId(p.product_id, 1);
                            setFeedbackBanner(res.message);
                            setTimeout(() => setFeedbackBanner(null), 3500);
                          }}
                          className="px-2.5 py-1 rounded bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-800 border border-emerald-200 transition-colors inline-flex items-center gap-1 font-semibold shadow-2xs cursor-pointer disabled:opacity-40"
                          title="Add 1 unit to current billing cart"
                        >
                          <ShoppingBag className="w-3 h-3" />
                          <span>+ Add to Bill</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dedicated Price Suggestion Modal (Recommendation Only - Accept or Edit) */}
      {suggestionProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-xl p-5 w-full max-w-md shadow-2xl text-slate-800 my-auto space-y-4">
            {(() => {
              const prodUnit: ProductUnit = suggestionProduct.unit || 'Piece';
              const soldQty = productSalesVolumeMap.get(suggestionProduct.product_id) || 0;
              const suggestion = calculateRuleBasedPriceSuggestion(
                suggestionProduct.cost_price,
                suggestionProduct.stock,
                suggestionProduct.reorder_level,
                prodUnit,
                soldQty
              );
              const customExpectedProfit =
                Math.round(((Number(customRegularPriceInput) || 0) - suggestionProduct.cost_price) * 100) / 100;
              const customMarginPercent =
                Number(customRegularPriceInput) > 0
                  ? Math.round(((customExpectedProfit / Number(customRegularPriceInput)) * 100) * 10) / 10
                  : 0;

              return (
                <>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                        <Lightbulb className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">
                          Price Suggestion — {suggestionProduct.product_name}
                        </h3>
                        <p className="text-[11px] text-slate-500">
                          Rule-based recommendation (does not auto-change existing price)
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSuggestionProduct(null)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Exact Formatted Summary Block */}
                  <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-600 font-sans font-medium">Cost Price:</span>
                      <span className="font-bold text-slate-900">
                        ₹{suggestion.costPrice}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 font-sans font-medium">Stock:</span>
                      <span className="font-bold text-slate-900">
                        {suggestion.stock} {prodUnit}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 font-sans font-medium">Current Regular / Selling:</span>
                      <span className="text-slate-700">
                        ₹{suggestionProduct.regular_price} / ₹{suggestionProduct.selling_price}
                      </span>
                    </div>
                    <div className="border-t border-amber-200/80 pt-1.5 flex justify-between text-sm">
                      <span className="text-amber-950 font-sans font-bold">Suggested Regular Price:</span>
                      <span className="font-black text-emerald-700">
                        ₹{suggestion.suggestedRegularPrice}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-700 font-sans font-semibold">Expected Profit:</span>
                      <span className="font-bold text-emerald-700">
                        ₹{suggestion.expectedProfitPerUnit} per {prodUnit}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-700 font-sans font-semibold">Profit Margin:</span>
                      <span className="font-bold text-indigo-700">
                        {suggestion.profitMarginPercent}%
                      </span>
                    </div>
                  </div>

                  {/* High Stock & Low Sales Offer Suggestion */}
                  {suggestion.isHighStockLowSales && suggestion.suggestedOfferPrice !== null && (
                    <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-200 space-y-1.5 text-xs">
                      <div className="font-bold text-rose-900 flex items-center gap-1.5">
                        <Percent className="w-3.5 h-3.5 text-rose-600" />
                        <span>High Stock &amp; Low Sales — Wastage Reduction Offer</span>
                      </div>
                      <p className="text-[11px] text-rose-800">
                        This product has high stock ({suggestion.stock} {prodUnit}) and low sales ({suggestion.qtySold} {prodUnit} sold). Consider a promotional discount price to boost sales and prevent wastage:
                      </p>
                      <div className="flex items-center justify-between pt-1 font-mono text-xs">
                        <span className="font-sans font-semibold text-rose-900">
                          Suggested Offer / Discount Price (10% Off):
                        </span>
                        <span className="font-black text-rose-700">
                          ₹{suggestion.suggestedOfferPrice} / {prodUnit} (Profit: ₹{suggestion.offerProfitPerUnit}/{prodUnit})
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Manager Edit or Accept Controls */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                    <div className="font-bold text-slate-800">
                      Accept or Edit Suggested Price Before Applying:
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-slate-600 font-semibold mb-1">
                          Regular Price (₹/{prodUnit})
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={customRegularPriceInput}
                          onChange={(e) => setCustomRegularPriceInput(parseFloat(e.target.value) || 0)}
                          className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-mono font-bold text-slate-900 focus:border-emerald-600 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-600 font-semibold mb-1">
                          Expected Profit &amp; Margin
                        </label>
                        <div className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 font-mono text-xs text-emerald-700 font-bold">
                          ₹{customExpectedProfit} ({customMarginPercent}%)
                        </div>
                      </div>
                    </div>

                    {suggestion.isHighStockLowSales && (
                      <div>
                        <label className="block text-[11px] text-rose-800 font-semibold mb-1">
                          Optional Offer / Discount Selling Price (₹/{prodUnit})
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={customSellingPriceInput}
                          onChange={(e) => setCustomSellingPriceInput(parseFloat(e.target.value) || 0)}
                          className="w-full bg-white border border-rose-300 rounded-lg px-2.5 py-1.5 font-mono font-bold text-rose-800 focus:border-rose-600 outline-none"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-100 text-xs">
                    <button
                      type="button"
                      onClick={() => setSuggestionProduct(null)}
                      className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                    >
                      Keep Existing Price
                    </button>
                    {suggestion.isHighStockLowSales && (
                      <button
                        type="button"
                        onClick={() => handleAcceptSuggestionInModal(true)}
                        className="px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer shadow-xs"
                      >
                        Accept Regular + Offer Price
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleAcceptSuggestionInModal(false)}
                      className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer shadow-xs"
                    >
                      Accept Suggested Regular Price
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {(isAddModalOpen || editingProduct) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-xl p-5 w-full max-w-lg shadow-2xl text-slate-800 my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Package className="w-4 h-4 text-emerald-600" />
                <span>
                  {editingProduct ? 'Edit Product, Unit & Stock' : 'Add New Product'}
                </span>
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingProduct(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={editingProduct ? handleSubmitEdit : handleSubmitAdd}
              className="space-y-3 text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-8">
                  <label className="block text-slate-700 font-semibold mb-1">Product Name *</label>
                  <input
                    type="text"
                    value={formData.product_name}
                    onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                    placeholder="e.g. Tomato (Fresh Hybrid) or Dove Soap"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:border-emerald-600 outline-none"
                    required
                  />
                </div>
                <div className="sm:col-span-4">
                  <label className="block text-emerald-800 font-bold mb-1">Product Unit *</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => {
                      const nextUnit = e.target.value as ProductUnit;
                      setFormData({
                        ...formData,
                        unit: nextUnit,
                        stock:
                          nextUnit === 'Piece' ? Math.round(formData.stock) : formData.stock,
                      });
                    }}
                    className="w-full bg-emerald-50/70 border border-emerald-400 rounded-lg px-3 py-2 text-emerald-950 font-bold focus:border-emerald-600 outline-none"
                  >
                    <option value="Kg">Kg (Weight / Decimal)</option>
                    <option value="Litre">Litre (Volume / Decimal)</option>
                    <option value="Piece">Piece (Whole Number)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Barcode *</label>
                  <input
                    type="text"
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    placeholder="e.g. 8901234567890"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:border-emerald-600 outline-none"
                    required
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-700 font-semibold">Category *</label>
                    <button
                      type="button"
                      onClick={() => setIsInlineCatOpen(true)}
                      className="text-[10px] text-emerald-700 font-bold hover:underline"
                    >
                      + New
                    </button>
                  </div>
                  <select
                    value={formData.category_id}
                    onChange={(e) => {
                      const newCatId = parseInt(e.target.value);
                      const catObj = categories.find((c) => c.category_id === newCatId);
                      const isVegOrFruit =
                        catObj &&
                        (catObj.category_name.toLowerCase().includes('vegetable') ||
                          catObj.category_name.toLowerCase().includes('fruit'));
                      setFormData({
                        ...formData,
                        category_id: newCatId,
                        unit: isVegOrFruit ? 'Kg' : formData.unit,
                      });
                    }}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:border-emerald-600 outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.category_id} value={c.category_id}>
                        {c.category_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-700 font-semibold">Brand *</label>
                    <button
                      type="button"
                      onClick={() => setIsInlineBrandOpen(true)}
                      className="text-[10px] text-blue-700 font-bold hover:underline"
                    >
                      + New
                    </button>
                  </div>
                  <select
                    value={formData.brand_id}
                    onChange={(e) =>
                      setFormData({ ...formData, brand_id: parseInt(e.target.value) })
                    }
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:border-emerald-600 outline-none"
                  >
                    {brands.map((b) => (
                      <option key={b.brand_id} value={b.brand_id}>
                        {b.brand_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })
                    }
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:border-emerald-600 outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Price Triad: Cost, Regular, Selling per Unit */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Price Matrix (₹ per {formData.unit})
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-slate-600 text-[10px] mb-1 font-semibold">
                      Cost Price / {formData.unit}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.cost_price}
                      onChange={(e) =>
                        setFormData({ ...formData, cost_price: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-slate-900 font-mono focus:border-emerald-600 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 text-[10px] mb-1 font-semibold">
                      Regular (MRP) / {formData.unit}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.regular_price}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          regular_price: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-slate-900 font-mono focus:border-emerald-600 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-emerald-700 font-bold text-[10px] mb-1">
                      Selling Price / {formData.unit}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.selling_price}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          selling_price: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full bg-white border border-emerald-500 rounded px-2.5 py-1.5 text-emerald-800 font-mono font-bold focus:border-emerald-600 outline-none"
                      required
                    />
                  </div>
                </div>
                <div className="text-[10px] text-slate-500 pt-1 flex justify-between">
                  <span>
                    Profit per {formData.unit}:{' '}
                    <strong className="text-emerald-700">
                      ₹{(formData.selling_price - formData.cost_price).toFixed(2)}
                    </strong>
                  </span>
                  <span>
                    Customer Savings:{' '}
                    <strong className="text-blue-700">
                      ₹{(formData.regular_price - formData.selling_price).toFixed(2)}/{formData.unit}
                    </strong>
                  </span>
                </div>

                {/* Rule-Based Price Suggestion (Recommendation Only - Does Not Auto-Overwrite) */}
                <div className="mt-2.5 p-2.5 rounded-lg bg-amber-50/80 border border-amber-200 space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-amber-950 flex items-center gap-1">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                      <span>Price Suggestion (Recommendation Only):</span>
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          regular_price: formPriceSuggestion.suggestedRegularPrice,
                        })
                      }
                      className="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] transition-colors cursor-pointer shadow-2xs"
                      title="Click to accept suggested regular price (you can still edit it)"
                    >
                      Accept Suggested Regular (₹{formPriceSuggestion.suggestedRegularPrice})
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 pt-1 font-mono text-[10px] bg-white/90 p-2 rounded border border-amber-200/70">
                    <div>
                      <span className="text-slate-500 font-sans block">Cost Price:</span>
                      <span className="font-bold text-slate-900">₹{formPriceSuggestion.costPrice}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-sans block">Stock:</span>
                      <span className="font-bold text-slate-900">
                        {formPriceSuggestion.stock} {formData.unit}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-sans block">Suggested Regular:</span>
                      <span className="font-extrabold text-emerald-700">
                        ₹{formPriceSuggestion.suggestedRegularPrice}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-sans block">Expected Profit:</span>
                      <span className="font-bold text-emerald-700">
                        ₹{formPriceSuggestion.expectedProfitPerUnit} per {formData.unit}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-sans block">Profit Margin:</span>
                      <span className="font-bold text-indigo-700">
                        {formPriceSuggestion.profitMarginPercent}%
                      </span>
                    </div>
                  </div>

                  {formPriceSuggestion.isHighStockLowSales &&
                    formPriceSuggestion.suggestedOfferPrice !== null && (
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[10px] text-rose-800 border-t border-amber-200/60">
                        <span>
                          <strong>High Stock &amp; Low Sales:</strong> Suggested Offer/Discount Price:{' '}
                          <strong className="font-mono">
                            ₹{formPriceSuggestion.suggestedOfferPrice}/{formData.unit}
                          </strong>{' '}
                          (10% Off to reduce wastage)
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              regular_price: formPriceSuggestion.suggestedRegularPrice,
                              selling_price:
                                formPriceSuggestion.suggestedOfferPrice || formData.selling_price,
                            })
                          }
                          className="px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] transition-colors cursor-pointer"
                        >
                          Apply Offer Price (₹{formPriceSuggestion.suggestedOfferPrice})
                        </button>
                      </div>
                    )}
                </div>
              </div>

              {/* Stock & Reorder */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Current Stock ({formData.unit}) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step={formData.unit === 'Piece' ? '1' : '0.01'}
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        stock:
                          formData.unit === 'Piece'
                            ? parseInt(e.target.value) || 0
                            : parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:border-emerald-600 outline-none"
                    required
                  />
                  <span className="text-[10px] text-slate-500">
                    {formData.unit === 'Piece'
                      ? 'Whole numbers only (e.g. 50 Pieces)'
                      : `Supports decimals (e.g. 100 ${formData.unit}, 97.5 ${formData.unit})`}
                  </span>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Reorder Level Alert ({formData.unit}) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step={formData.unit === 'Piece' ? '1' : '0.5'}
                    value={formData.reorder_level}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        reorder_level: parseFloat(e.target.value) || 1,
                      })
                    }
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:border-emerald-600 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingProduct(null);
                  }}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                >
                  {editingProduct ? 'Save Price, Unit & Stock' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inline Quick Category Add Modal */}
      {isInlineCatOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 w-full max-w-xs shadow-2xl space-y-3">
            <h4 className="text-xs font-bold text-slate-900">Add Category</h4>
            <form onSubmit={handleCreateInlineCat} className="space-y-2 text-xs">
              <input
                type="text"
                value={inlineCatName}
                onChange={(e) => setInlineCatName(e.target.value)}
                placeholder="Category Name"
                className="w-full border border-slate-300 rounded px-2.5 py-1.5 outline-none"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsInlineCatOpen(false)}
                  className="w-1/2 py-1 bg-slate-100 rounded text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-1 bg-emerald-600 text-white font-bold rounded"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inline Quick Brand Add Modal */}
      {isInlineBrandOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 w-full max-w-xs shadow-2xl space-y-3">
            <h4 className="text-xs font-bold text-slate-900">Add Brand</h4>
            <form onSubmit={handleCreateInlineBrand} className="space-y-2 text-xs">
              <input
                type="text"
                value={inlineBrandName}
                onChange={(e) => setInlineBrandName(e.target.value)}
                placeholder="Brand Name"
                className="w-full border border-slate-300 rounded px-2.5 py-1.5 outline-none"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsInlineBrandOpen(false)}
                  className="w-1/2 py-1 bg-slate-100 rounded text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-1 bg-blue-600 text-white font-bold rounded"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
