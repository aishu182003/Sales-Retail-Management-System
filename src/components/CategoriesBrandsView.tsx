import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Category, Brand } from '../types';
import {
  Tags,
  Layers,
  Plus,
  Package,
  Search,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  Power,
  AlertCircle,
  X,
} from 'lucide-react';

export const CategoriesBrandsView: React.FC = () => {
  const {
    categories,
    brands,
    products,
    addCategory,
    updateCategory,
    toggleCategoryStatus,
    activateAllCategories,
    deleteCategory,
    addBrand,
    updateBrand,
    toggleBrandStatus,
    activateAllBrands,
    deleteBrand,
    currentUser,
  } = useStore();

  // Category State
  const [newCatName, setNewCatName] = useState('');
  const [newCatStatus, setNewCatStatus] = useState<'active' | 'inactive'>('active');
  const [searchCat, setSearchCat] = useState('');
  const [catFilter, setCatFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Brand State
  const [newBrandName, setNewBrandName] = useState('');
  const [newBrandStatus, setNewBrandStatus] = useState<'active' | 'inactive'>('active');
  const [searchBrand, setSearchBrand] = useState('');
  const [brandFilter, setBrandFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Edit Modals
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Add Category Handler with Smart Duplicate Activation
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = newCatName.trim();
    if (!cleanName) {
      showToast('Please enter a valid category name', 'error');
      return;
    }

    // Check if category already exists
    const existing = categories.find(
      (c) => c.category_name.toLowerCase() === cleanName.toLowerCase()
    );
    if (existing) {
      if (existing.status !== 'active') {
        updateCategory({ ...existing, status: 'active' });
        showToast(`Category "${existing.category_name}" already exists and has now been ACTIVATED!`, 'success');
      } else {
        showToast(`Category "${existing.category_name}" is already ACTIVE in your catalog.`, 'error');
      }
      setNewCatName('');
      setCatFilter('all');
      setSearchCat('');
      return;
    }

    const created = addCategory(cleanName, newCatStatus);
    setNewCatName('');
    setNewCatStatus('active');
    setCatFilter('all');
    setSearchCat('');
    showToast(`Category "${created.category_name}" created successfully as ACTIVE!`);
  };

  // Add Brand Handler with Smart Duplicate Activation
  const handleAddBrand = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = newBrandName.trim();
    if (!cleanName) {
      showToast('Please enter a valid brand name', 'error');
      return;
    }

    // Check if brand already exists
    const existing = brands.find(
      (b) => b.brand_name.toLowerCase() === cleanName.toLowerCase()
    );
    if (existing) {
      if (existing.status !== 'active') {
        updateBrand({ ...existing, status: 'active' });
        showToast(`Brand "${existing.brand_name}" already exists and has now been ACTIVATED!`, 'success');
      } else {
        showToast(`Brand "${existing.brand_name}" is already ACTIVE in your catalog.`, 'error');
      }
      setNewBrandName('');
      setBrandFilter('all');
      setSearchBrand('');
      return;
    }

    const created = addBrand(cleanName, newBrandStatus);
    setNewBrandName('');
    setNewBrandStatus('active');
    setBrandFilter('all');
    setSearchBrand('');
    showToast(`Brand "${created.brand_name}" created successfully as ACTIVE!`);
  };

  // Handle Edit Category Save
  const handleSaveEditCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !editingCategory.category_name.trim()) return;
    updateCategory({
      ...editingCategory,
      category_name: editingCategory.category_name.trim(),
    });
    showToast(`Category updated to "${editingCategory.category_name}" (${editingCategory.status})!`);
    setEditingCategory(null);
  };

  // Handle Edit Brand Save
  const handleSaveEditBrand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBrand || !editingBrand.brand_name.trim()) return;
    updateBrand({
      ...editingBrand,
      brand_name: editingBrand.brand_name.trim(),
    });
    showToast(`Brand updated to "${editingBrand.brand_name}" (${editingBrand.status})!`);
    setEditingBrand(null);
  };

  // Handle Delete Category safely
  const handleDeleteCategory = (cat: Category) => {
    const attachedProds = products.filter((p) => p.category_id === cat.category_id);
    if (attachedProds.length > 0) {
      const confirmDeactivate = window.confirm(
        `⚠️ Category "${cat.category_name}" is currently used by ${attachedProds.length} product(s) (e.g. "${attachedProds[0].product_name}").\n\nTo prevent breaking product references and billing consistency, records in use cannot be permanently deleted.\n\nWould you like to safely set this category to INACTIVE instead?`
      );
      if (confirmDeactivate) {
        updateCategory({ ...cat, status: 'inactive' });
        showToast(`Category "${cat.category_name}" has been safely set to Inactive.`);
      }
      return;
    }

    if (window.confirm(`Are you sure you want to permanently delete category "${cat.category_name}"?`)) {
      const res = deleteCategory(cat.category_id);
      if (res.success) {
        showToast(res.message, 'success');
      } else {
        showToast(res.message, 'error');
      }
    }
  };

  // Handle Delete Brand safely
  const handleDeleteBrand = (brand: Brand) => {
    const attachedProds = products.filter((p) => p.brand_id === brand.brand_id);
    if (attachedProds.length > 0) {
      const confirmDeactivate = window.confirm(
        `⚠️ Brand "${brand.brand_name}" is currently assigned to ${attachedProds.length} product(s) (e.g. "${attachedProds[0].product_name}").\n\nTo prevent breaking product references, it cannot be permanently deleted while products belong to it.\n\nWould you like to safely set this brand to INACTIVE instead?`
      );
      if (confirmDeactivate) {
        updateBrand({ ...brand, status: 'inactive' });
        showToast(`Brand "${brand.brand_name}" has been safely set to Inactive.`);
      }
      return;
    }

    if (window.confirm(`Are you sure you want to permanently delete brand "${brand.brand_name}"?`)) {
      const res = deleteBrand(brand.brand_id);
      if (res.success) {
        showToast(res.message, 'success');
      } else {
        showToast(res.message, 'error');
      }
    }
  };

  // Filter Categories
  const filteredCategories = categories.filter((c) => {
    const matchesSearch = c.category_name.toLowerCase().includes(searchCat.toLowerCase());
    const matchesStatus =
      catFilter === 'all' ||
      (catFilter === 'active' && (c.status === 'active' || !c.status)) ||
      (catFilter === 'inactive' && c.status === 'inactive');
    return matchesSearch && matchesStatus;
  });

  // Filter Brands
  const filteredBrands = brands.filter((b) => {
    const matchesSearch = b.brand_name.toLowerCase().includes(searchBrand.toLowerCase());
    const matchesStatus =
      brandFilter === 'all' ||
      (brandFilter === 'active' && (b.status === 'active' || !b.status)) ||
      (brandFilter === 'inactive' && b.status === 'inactive');
    return matchesSearch && matchesStatus;
  });

  const activeCategoriesCount = categories.filter((c) => c.status === 'active' || !c.status).length;
  const activeBrandsCount = brands.filter((b) => b.status === 'active' || !b.status).length;

  return (
    <div className="space-y-5">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-between shadow-sm transition-all animate-fade-in ${
            toastMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Banner & Stats Overview */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Tags className="w-5 h-5 text-emerald-600" />
            <span>Categories &amp; Brands Master Catalog</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage product classifications, departmental hierarchy, and toggle items to Active for POS and catalog use.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-1.5 text-center">
            <span className="text-[10px] text-emerald-700 font-semibold uppercase tracking-wider block">
              Active Categories
            </span>
            <span className="text-sm font-extrabold text-emerald-800 font-mono">
              {activeCategoriesCount} / {categories.length}
            </span>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5 text-center">
            <span className="text-[10px] text-blue-700 font-semibold uppercase tracking-wider block">
              Active Brands
            </span>
            <span className="text-sm font-extrabold text-blue-800 font-mono">
              {activeBrandsCount} / {brands.length}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ================= CATEGORY MANAGEMENT ================= */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-xs">
                  <Tags className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Categories Management</h3>
                  <p className="text-[11px] text-slate-500">Departments &amp; classification</p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full font-mono">
                {activeCategoriesCount} Active
              </span>
            </div>

            {/* Add Category Form with Status Selector */}
            <form onSubmit={handleAddCategory} className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5 text-emerald-600" /> + Add New Category
                </span>
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                  Defaults to Active
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="Category Name (e.g. Frozen Foods, Spices)"
                    className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg px-3 py-2 text-xs focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none"
                    required
                  />
                </div>

                <div>
                  <select
                    value={newCatStatus}
                    onChange={(e) => setNewCatStatus(e.target.value as 'active' | 'inactive')}
                    className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg px-2.5 py-2 text-xs font-semibold focus:border-emerald-600 outline-none"
                  >
                    <option value="active">🟢 Active</option>
                    <option value="inactive">⚪ Inactive</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Save &amp; Activate Category</span>
              </button>
            </form>

            {/* Filter Tabs & Search */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex rounded-lg bg-slate-100 p-0.5 border border-slate-200 text-xs">
                  <button
                    type="button"
                    onClick={() => setCatFilter('all')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                      catFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    All ({categories.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setCatFilter('active')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                      catFilter === 'active' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Active ({activeCategoriesCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setCatFilter('inactive')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                      catFilter === 'inactive' ? 'bg-white text-slate-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Inactive ({categories.length - activeCategoriesCount})
                  </button>
                </div>

                <div className="flex items-center gap-2 flex-1 justify-end min-w-[200px]">
                  <button
                    type="button"
                    onClick={() => {
                      activateAllCategories();
                      showToast('All categories have been activated!');
                    }}
                    className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                    title="Make all categories active immediately"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Activate All</span>
                  </button>

                  <div className="relative flex-1 max-w-[160px]">
                    <input
                      type="text"
                      value={searchCat}
                      onChange={(e) => setSearchCat(e.target.value)}
                      placeholder="Search category..."
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg pl-7 pr-2.5 py-1 text-xs focus:bg-white focus:border-emerald-500 outline-none"
                    />
                    <Search className="w-3 h-3 text-slate-400 absolute left-2 top-2" />
                  </div>
                </div>
              </div>
            </div>

            {/* Category List */}
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden max-h-[380px] overflow-y-auto">
              {filteredCategories.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs">
                  No categories found matching your criteria.
                </div>
              ) : (
                filteredCategories.map((cat) => {
                  const count = products.filter((p) => p.category_id === cat.category_id).length;
                  const isActive = cat.status === 'active' || !cat.status;

                  return (
                    <div
                      key={cat.category_id}
                      className={`p-3 flex items-center justify-between text-xs transition-colors ${
                        isActive ? 'bg-white hover:bg-slate-50' : 'bg-slate-50/70 opacity-80 hover:opacity-100'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="font-mono text-slate-400 text-[11px] font-semibold shrink-0">
                          #{cat.category_id}
                        </span>
                        <div className="truncate">
                          <span className="font-bold text-slate-900 block truncate">
                            {cat.category_name}
                          </span>
                          <span className="text-[11px] text-slate-500 flex items-center gap-1">
                            <Package className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{count} products</span>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* Status Badge */}
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-slate-100 text-slate-500 border-slate-200'
                          }`}
                        >
                          {isActive ? '● Active' : '○ Inactive'}
                        </span>

                        {/* Direct "Make Active / Toggle" Button */}
                        <button
                          type="button"
                          onClick={() => {
                            toggleCategoryStatus(cat.category_id);
                            showToast(
                              `Category "${cat.category_name}" is now ${isActive ? 'INACTIVE' : 'ACTIVE'}!`
                            );
                          }}
                          className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                            isActive
                              ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 shadow-xs'
                          }`}
                          title={isActive ? 'Deactivate category' : 'Make this category active'}
                        >
                          {isActive ? 'Deactivate' : 'Make Active'}
                        </button>

                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => setEditingCategory(cat)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-[11px] transition-colors border border-slate-300 cursor-pointer shadow-2xs"
                          title="Edit Category Name & Status"
                        >
                          <span>✏️</span>
                          <span>Edit</span>
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => handleDeleteCategory(cat)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-[11px] transition-colors border border-rose-200 cursor-pointer shadow-2xs"
                          title="Delete Category Safely"
                        >
                          <span>🗑️</span>
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* ================= BRAND MANAGEMENT ================= */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 shadow-xs">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Brands Management</h3>
                  <p className="text-[11px] text-slate-500">Manufacturer &amp; FMCG vendors</p>
                </div>
              </div>
              <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full font-mono">
                {activeBrandsCount} Active
              </span>
            </div>

            {/* Add Brand Form with Status Selector */}
            <form onSubmit={handleAddBrand} className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5 text-blue-600" /> + Add New Brand
                </span>
                <span className="text-[10px] font-semibold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-md">
                  Defaults to Active
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    value={newBrandName}
                    onChange={(e) => setNewBrandName(e.target.value)}
                    placeholder="Brand Name (e.g. Haldiram's, Tata Tea)"
                    className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg px-3 py-2 text-xs focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
                    required
                  />
                </div>

                <div>
                  <select
                    value={newBrandStatus}
                    onChange={(e) => setNewBrandStatus(e.target.value as 'active' | 'inactive')}
                    className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg px-2.5 py-2 text-xs font-semibold focus:border-blue-600 outline-none"
                  >
                    <option value="active">🟢 Active</option>
                    <option value="inactive">⚪ Inactive</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Save &amp; Activate Brand</span>
              </button>
            </form>

            {/* Filter Tabs & Search */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex rounded-lg bg-slate-100 p-0.5 border border-slate-200 text-xs">
                  <button
                    type="button"
                    onClick={() => setBrandFilter('all')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                      brandFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    All ({brands.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setBrandFilter('active')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                      brandFilter === 'active' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Active ({activeBrandsCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setBrandFilter('inactive')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                      brandFilter === 'inactive' ? 'bg-white text-slate-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Inactive ({brands.length - activeBrandsCount})
                  </button>
                </div>

                <div className="flex items-center gap-2 flex-1 justify-end min-w-[200px]">
                  <button
                    type="button"
                    onClick={() => {
                      activateAllBrands();
                      showToast('All brands have been activated!');
                    }}
                    className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                    title="Make all brands active immediately"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>Activate All</span>
                  </button>

                  <div className="relative flex-1 max-w-[160px]">
                    <input
                      type="text"
                      value={searchBrand}
                      onChange={(e) => setSearchBrand(e.target.value)}
                      placeholder="Search brand..."
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg pl-7 pr-2.5 py-1 text-xs focus:bg-white focus:border-blue-500 outline-none"
                    />
                    <Search className="w-3 h-3 text-slate-400 absolute left-2 top-2" />
                  </div>
                </div>
              </div>
            </div>

            {/* Brand List */}
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden max-h-[380px] overflow-y-auto">
              {filteredBrands.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs">
                  No brands found matching your criteria.
                </div>
              ) : (
                filteredBrands.map((b) => {
                  const count = products.filter((p) => p.brand_id === b.brand_id).length;
                  const isActive = b.status === 'active' || !b.status;

                  return (
                    <div
                      key={b.brand_id}
                      className={`p-3 flex items-center justify-between text-xs transition-colors ${
                        isActive ? 'bg-white hover:bg-slate-50' : 'bg-slate-50/70 opacity-80 hover:opacity-100'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="font-mono text-slate-400 text-[11px] font-semibold shrink-0">
                          #{b.brand_id}
                        </span>
                        <div className="truncate">
                          <span className="font-bold text-slate-900 block truncate">
                            {b.brand_name}
                          </span>
                          <span className="text-[11px] text-slate-500 flex items-center gap-1">
                            <Package className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{count} products</span>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* Status Badge */}
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            isActive
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-slate-100 text-slate-500 border-slate-200'
                          }`}
                        >
                          {isActive ? '● Active' : '○ Inactive'}
                        </span>

                        {/* Direct "Make Active / Toggle" Button */}
                        <button
                          type="button"
                          onClick={() => {
                            toggleBrandStatus(b.brand_id);
                            showToast(
                              `Brand "${b.brand_name}" is now ${isActive ? 'INACTIVE' : 'ACTIVE'}!`
                            );
                          }}
                          className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                            isActive
                              ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                              : 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600 shadow-xs'
                          }`}
                          title={isActive ? 'Deactivate brand' : 'Make this brand active'}
                        >
                          {isActive ? 'Deactivate' : 'Make Active'}
                        </button>

                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => setEditingBrand(b)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-[11px] transition-colors border border-slate-300 cursor-pointer shadow-2xs"
                          title="Edit Brand Name & Status"
                        >
                          <span>✏️</span>
                          <span>Edit</span>
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => handleDeleteBrand(b)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-[11px] transition-colors border border-rose-200 cursor-pointer shadow-2xs"
                          title="Delete Brand Safely"
                        >
                          <span>🗑️</span>
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ================= EDIT CATEGORY MODAL ================= */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 w-full max-w-sm shadow-2xl text-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Edit2 className="w-4 h-4 text-emerald-600" />
                <span>Edit Category #{editingCategory.category_id}</span>
              </h3>
              <button
                onClick={() => setEditingCategory(null)}
                className="p-1 rounded text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditCategory} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Category Name</label>
                <input
                  type="text"
                  value={editingCategory.category_name}
                  onChange={(e) =>
                    setEditingCategory({ ...editingCategory, category_name: e.target.value })
                  }
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:border-emerald-600 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Status</label>
                <select
                  value={editingCategory.status}
                  onChange={(e) =>
                    setEditingCategory({
                      ...editingCategory,
                      status: e.target.value as 'active' | 'inactive',
                    })
                  }
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-semibold focus:border-emerald-600 outline-none"
                >
                  <option value="active">🟢 Active (Available for products &amp; POS)</option>
                  <option value="inactive">⚪ Inactive (Hidden from active catalog)</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="flex-1 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= EDIT BRAND MODAL ================= */}
      {editingBrand && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 w-full max-w-sm shadow-2xl text-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Edit2 className="w-4 h-4 text-blue-600" />
                <span>Edit Brand #{editingBrand.brand_id}</span>
              </h3>
              <button
                onClick={() => setEditingBrand(null)}
                className="p-1 rounded text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditBrand} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Brand Name</label>
                <input
                  type="text"
                  value={editingBrand.brand_name}
                  onChange={(e) => setEditingBrand({ ...editingBrand, brand_name: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:border-blue-600 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Status</label>
                <select
                  value={editingBrand.status}
                  onChange={(e) =>
                    setEditingBrand({
                      ...editingBrand,
                      status: e.target.value as 'active' | 'inactive',
                    })
                  }
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-semibold focus:border-blue-600 outline-none"
                >
                  <option value="active">🟢 Active (Available for products &amp; POS)</option>
                  <option value="inactive">⚪ Inactive (Hidden from active catalog)</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingBrand(null)}
                  className="flex-1 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
