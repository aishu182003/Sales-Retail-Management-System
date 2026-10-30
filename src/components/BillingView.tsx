import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { Product, ProductUnit } from '../types';
import {
  ScanLine,
  UserCheck,
  UserPlus,
  Plus,
  Minus,
  Trash2,
  Receipt,
  CreditCard,
  Banknote,
  Smartphone,
  Sparkles,
  ShoppingBag,
  Search,
  CheckCircle,
  AlertCircle,
  Filter,
  Layers,
  Tags,
  MessageCircle,
  Star,
  Gift,
  X,
  PlusCircle,
  Share2,
  Percent,
  Store,
  Clock,
  Scale,
} from 'lucide-react';

export const BillingView: React.FC = () => {
  const {
    currentUser,
    users,
    switchUser,
    products,
    categories,
    brands,
    offers,
    addOffer,
    setActiveTab,
    customers,
    cart,
    activeCustomer,
    setActiveCustomer,
    lookupOrCreateCustomer,
    addNewCustomer,
    addToCartByBarcode,
    addToCartByProductId,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    completeSale,
    addCategory,
    addBrand,
    addProduct,
    gstRate,
    updateGstRate,
  } = useStore();

  const canEditGst = currentUser.role === 'admin' || currentUser.role === 'owner';

  // --- Customer (Loyalty & WhatsApp) State ---
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
  const [sendWhatsApp, setSendWhatsApp] = useState(true);
  const [redeemPoints, setRedeemPoints] = useState(false);

  // New Customer Modal Form
  const [newCustName, setNewCustName] = useState('');
  const [newCustMobile, setNewCustMobile] = useState('');
  const [newCustEmail, setNewCustEmail] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');

  // --- Product Adding Modes: Scanner vs Manual Category & Brand ---
  const [addMode, setAddMode] = useState<'scanner' | 'manual'>('manual'); // Default to manual/all-options so users without scanner see it instantly!
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [manualProductSearch, setManualProductSearch] = useState('');
  const [selectedManualProductId, setSelectedManualProductId] = useState<number | ''>('');
  const [manualQty, setManualQty] = useState(1);

  // Barcode input
  const [barcodeInput, setBarcodeInput] = useState('');
  const [qtyInput, setQtyInput] = useState(1);
  const [scanMessage, setScanMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Quick on-the-fly Category / Brand / Product creation modals
  const [isQuickCatModalOpen, setIsQuickCatModalOpen] = useState(false);
  const [quickCatName, setQuickCatName] = useState('');
  const [isQuickBrandModalOpen, setIsQuickBrandModalOpen] = useState(false);
  const [quickBrandName, setQuickBrandName] = useState('');
  const [isQuickProductModalOpen, setIsQuickProductModalOpen] = useState(false);
  const [quickProdName, setQuickProdName] = useState('');
  const [quickProdBarcode, setQuickProdBarcode] = useState('');
  const [quickProdCatId, setQuickProdCatId] = useState<number>(categories[0]?.category_id || 1);
  const [quickProdBrandId, setQuickProdBrandId] = useState<number>(brands[0]?.brand_id || 1);
  const [quickProdUnit, setQuickProdUnit] = useState<ProductUnit>('Piece');
  const [quickProdCost, setQuickProdCost] = useState<number>(0);
  const [quickProdRegular, setQuickProdRegular] = useState<number>(0);
  const [quickProdSelling, setQuickProdSelling] = useState<number>(0);
  const [quickProdStock, setQuickProdStock] = useState<number>(50);

  // Selected product helper for manual entry
  const selectedManualProduct = useMemo(() => {
    if (selectedManualProductId === '') return null;
    return products.find((p) => p.product_id === Number(selectedManualProductId)) || null;
  }, [products, selectedManualProductId]);

  const selectedManualUnit: ProductUnit = selectedManualProduct?.unit || 'Piece';

  // Quick Offer Modal
  const [isQuickOfferModalOpen, setIsQuickOfferModalOpen] = useState(false);
  const [quickOfferName, setQuickOfferName] = useState('');
  const [quickOfferProdId, setQuickOfferProdId] = useState<string>('');
  const [quickOfferDiscount, setQuickOfferDiscount] = useState<number>(10);

  const handleQuickCreateOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickOfferName.trim()) return;
    const today = new Date().toISOString().split('T')[0];
    const nextMonth = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
    addOffer({
      offer_name: quickOfferName.trim(),
      product_id: quickOfferProdId ? parseInt(quickOfferProdId) : null,
      discount_percentage: Number(quickOfferDiscount),
      status: 'active',
      start_date: today,
      end_date: nextMonth,
    });
    setQuickOfferName('');
    setQuickOfferProdId('');
    setQuickOfferDiscount(10);
    setIsQuickOfferModalOpen(false);
    setScanMessage({
      type: 'success',
      text: 'Instant offer activated and applied to billing items!',
    });
  };

  // Payment method & checkout
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'UPI' | 'Card'>('Cash');
  const [isProcessing, setIsProcessing] = useState(false);

  // Filter products for manual category & brand selection
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (p.status !== 'active') return false;
      const catMatch = selectedCategory === 'all' || p.category_id.toString() === selectedCategory;
      const brandMatch = selectedBrand === 'all' || p.brand_id.toString() === selectedBrand;
      const searchMatch =
        !manualProductSearch.trim() ||
        p.product_name.toLowerCase().includes(manualProductSearch.toLowerCase()) ||
        p.barcode.includes(manualProductSearch);
      return catMatch && brandMatch && searchMatch;
    });
  }, [products, selectedCategory, selectedBrand, manualProductSearch]);

  // Customer search suggestions (Search by name, mobile, or ID)
  const filteredCustomers = useMemo(() => {
    const q = customerSearchQuery.trim().toLowerCase();
    if (!q) return [];
    return customers.filter((c) => {
      const matchName = c.name.toLowerCase().includes(q);
      const matchMobile = c.mobile.includes(q);
      const matchId = `cust-${c.customer_id}`.includes(q) || c.customer_id.toString() === q;
      return matchName || matchMobile || matchId;
    });
  }, [customers, customerSearchQuery]);

  // Handle selecting a customer from search
  const handleSelectCustomer = (cust: typeof customers[0]) => {
    setActiveCustomer(cust);
    setCustomerSearchQuery('');
    setShowCustomerDropdown(false);
    setRedeemPoints(false);
  };

  // Handle Quick Customer Registration
  const handleAddCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustMobile.trim() || newCustMobile.trim().length < 10) {
      alert('Please enter a valid 10-digit mobile number.');
      return;
    }
    const created = addNewCustomer({
      name: newCustName.trim() || 'Valued Customer',
      mobile: newCustMobile.trim(),
      email: newCustEmail.trim() || undefined,
      address: newCustAddress.trim() || undefined,
      loyalty_points: 50, // Welcome bonus
    });
    setActiveCustomer(created);
    setIsAddCustomerModalOpen(false);
    setNewCustName('');
    setNewCustMobile('');
    setNewCustEmail('');
    setNewCustAddress('');
    setScanMessage({ type: 'success', text: `Customer "${created.name}" registered with 50 Loyalty Points!` });
    setTimeout(() => setScanMessage(null), 3000);
  };

  // Handle Barcode Scan / Add
  const handleScanOrAdd = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!barcodeInput.trim()) return;
    const res = addToCartByBarcode(barcodeInput, qtyInput);
    if (res.success) {
      setScanMessage({ type: 'success', text: res.message });
      setBarcodeInput('');
      setQtyInput(1);
    } else {
      setScanMessage({ type: 'error', text: res.message });
    }
    setTimeout(() => setScanMessage(null), 3000);
  };

  // Track recently removed item to allow 1-click Undo
  const [lastRemovedItem, setLastRemovedItem] = useState<{
    productId: number;
    name: string;
    quantity: number;
  } | null>(null);

  const handleRemoveItemFromCart = (productId: number, productName: string, qty: number) => {
    removeFromCart(productId);
    setLastRemovedItem({ productId, name: productName, quantity: qty });
    setScanMessage({
      type: 'success',
      text: `Removed "${productName}" (${qty} item${qty > 1 ? 's' : ''}) from the bill.`,
    });
    setTimeout(() => {
      setScanMessage((current) => (current?.text.includes(`Removed "${productName}"`) ? null : current));
    }, 6000);
  };

  const handleUndoRemove = () => {
    if (!lastRemovedItem) return;
    addToCartByProductId(lastRemovedItem.productId, lastRemovedItem.quantity);
    setScanMessage({
      type: 'success',
      text: `Restored "${lastRemovedItem.name}" (${lastRemovedItem.quantity} unit${lastRemovedItem.quantity > 1 ? 's' : ''}) back to the bill!`,
    });
    setLastRemovedItem(null);
    setTimeout(() => setScanMessage(null), 3000);
  };

  // Handle Manual Product Add (Without Scanner)
  const handleManualAdd = (prodId?: number, quantity?: number) => {
    const idToAdd = prodId || (selectedManualProductId !== '' ? Number(selectedManualProductId) : null);
    if (!idToAdd) {
      setScanMessage({ type: 'error', text: 'Please select a product to add.' });
      setTimeout(() => setScanMessage(null), 3000);
      return;
    }
    const q = quantity || manualQty;
    const res = addToCartByProductId(idToAdd, q);
    if (res.success) {
      setScanMessage({ type: 'success', text: res.message });
      setManualQty(1);
      setSelectedManualProductId('');
    } else {
      setScanMessage({ type: 'error', text: res.message });
    }
    setTimeout(() => setScanMessage(null), 3000);
  };

  // Handle Quick Creation of Category
  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickCatName.trim()) return;
    const newCat = addCategory(quickCatName.trim(), 'active');
    setSelectedCategory(newCat.category_id.toString());
    setQuickProdCatId(newCat.category_id);
    setQuickCatName('');
    setIsQuickCatModalOpen(false);
    setScanMessage({ type: 'success', text: `Category "${newCat.category_name}" added and activated!` });
    setTimeout(() => setScanMessage(null), 3000);
  };

  // Handle Quick Creation of Brand
  const handleCreateBrand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickBrandName.trim()) return;
    const newBrand = addBrand(quickBrandName.trim(), 'active');
    setSelectedBrand(newBrand.brand_id.toString());
    setQuickProdBrandId(newBrand.brand_id);
    setQuickBrandName('');
    setIsQuickBrandModalOpen(false);
    setScanMessage({ type: 'success', text: `Brand "${newBrand.brand_name}" added and activated!` });
    setTimeout(() => setScanMessage(null), 3000);
  };

  // Handle Quick Creation of Product
  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickProdName.trim() || !quickProdBarcode.trim()) {
      alert('Product Name and Barcode are required.');
      return;
    }
    const autoSelling = quickProdSelling || quickProdRegular || 10;
    const autoCost = quickProdCost || Math.round(autoSelling * 0.8);
    const autoRegular = quickProdRegular || autoSelling;

    addProduct({
      product_name: quickProdName.trim(),
      barcode: quickProdBarcode.trim(),
      category_id: Number(quickProdCatId),
      brand_id: Number(quickProdBrandId),
      unit: quickProdUnit,
      cost_price: Number(autoCost),
      regular_price: Number(autoRegular),
      selling_price: Number(autoSelling),
      stock:
        quickProdUnit === 'Piece'
          ? Math.max(0, Math.round(Number(quickProdStock) || 50))
          : Math.max(0, Math.round((Number(quickProdStock) || 50) * 1000) / 1000),
      reorder_level: 10,
      status: 'active',
    });

    setIsQuickProductModalOpen(false);
    setScanMessage({
      type: 'success',
      text: `Product "${quickProdName}" (Unit: ${quickProdUnit}) added to catalog!`,
    });
    // Reset
    setQuickProdName('');
    setQuickProdBarcode('');
    setQuickProdUnit('Piece');
    setQuickProdCost(0);
    setQuickProdRegular(0);
    setQuickProdSelling(0);
    setTimeout(() => setScanMessage(null), 3000);
  };

  // Financial calculations
  const subtotal = cart.reduce((acc, item) => acc + item.unit_selling * item.quantity, 0);
  const totalDiscount = cart.reduce((acc, item) => acc + item.discount_per_unit * item.quantity, 0);
  const rawTotal = subtotal - totalDiscount;

  // Loyalty calculations: 10 points = ₹1.00 discount
  const availablePoints = activeCustomer?.loyalty_points || 0;
  const maxRedeemablePoints = Math.min(availablePoints, Math.floor(rawTotal * 10)); // Cannot exceed bill
  const loyaltyDiscountAmount = redeemPoints ? Math.floor(maxRedeemablePoints / 10) : 0;
  const pointsRedeemedCount = redeemPoints ? loyaltyDiscountAmount * 10 : 0;
  const netBeforeGst = Math.max(0, rawTotal - loyaltyDiscountAmount);

  // Automatically calculate GST amount from the subtotal
  const gstAmount = Math.round(((subtotal * gstRate) / 100) * 100) / 100;
  const finalTotal = Math.max(0, Math.round((netBeforeGst + gstAmount) * 100) / 100);
  const pointsToEarn = Math.max(1, Math.floor(finalTotal / 100));

  // WhatsApp bill text generator
  const generateWhatsAppInvoiceText = (customerName: string, customerMobile: string, saleId: number) => {
    let itemsText = cart
      .map(
        (i) =>
          `• ${i.product.product_name} (${i.quantity} ${i.product.unit || 'Piece'} × ₹${i.unit_selling}/${i.product.unit || 'Piece'}) = ₹${(
            (i.unit_selling - i.discount_per_unit) *
            i.quantity
          ).toFixed(2)}`
      )
      .join('\n');

    return encodeURIComponent(
      `🧾 *SMART RETAIL SUPERMARKET - TAX INVOICE*\n` +
        `Invoice No: #INV-${saleId}\n` +
        `Customer: ${customerName} (${customerMobile})\n` +
        `Date: ${new Date().toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })}\n` +
        `------------------------------------\n` +
        `${itemsText}\n` +
        `------------------------------------\n` +
        `Subtotal: ₹${subtotal.toFixed(2)}\n` +
        (totalDiscount + loyaltyDiscountAmount > 0
          ? `Discounts: -₹${(totalDiscount + loyaltyDiscountAmount).toFixed(2)}\n`
          : '') +
        `GST: ${gstRate}%\n` +
        `GST Amount: ₹${gstAmount.toFixed(2)}\n` +
        `*Grand Total: ₹${finalTotal.toFixed(2)} (${paymentMethod})*\n` +
        `Loyalty Points Earned: +${pointsToEarn} pts\n` +
        `------------------------------------\n` +
        `Thank you for shopping with us! Visit again.`
    );
  };

  const handleCheckout = () => {
    let finalCustomer = activeCustomer;
    if (!finalCustomer) {
      if (customerSearchQuery.trim() && /^\d{10}$/.test(customerSearchQuery.trim())) {
        finalCustomer = lookupOrCreateCustomer(customerSearchQuery.trim(), 'Walk-in Shopper');
        setActiveCustomer(finalCustomer);
      } else {
        alert('Please search or add a customer (with mobile number) before checkout.');
        return;
      }
    }

    if (cart.length === 0) {
      alert('Cart is empty. Please add items to the bill.');
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      const res = completeSale(paymentMethod, pointsRedeemedCount, loyaltyDiscountAmount);
      setIsProcessing(false);

      if (!res.success) {
        alert(res.message);
      } else {
        // If WhatsApp option was checked, launch WhatsApp web/API with invoice
        if (sendWhatsApp && finalCustomer?.mobile) {
          const text = generateWhatsAppInvoiceText(
            finalCustomer.name,
            finalCustomer.mobile,
            res.saleId || 1000
          );
          const waUrl = `https://api.whatsapp.com/send?phone=91${finalCustomer.mobile}&text=${text}`;
          window.open(waUrl, '_blank');
        }

        // Reset customer query and states
        setCustomerSearchQuery('');
        setRedeemPoints(false);
      }
    }, 200);
  };

  return (
    <div className="space-y-4">
      {/* Active Cashier & Counter Register Banner */}
      <div className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 font-bold text-slate-800">
            <UserCheck className="w-4 h-4 text-emerald-600" />
            <span>Active Cashier:</span>
            <span className="text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded font-bold border border-emerald-200">
              {currentUser.name}
            </span>
          </div>
          <div className="text-slate-600 flex items-center gap-1">
            <Store className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-slate-700">{currentUser.counter_no || 'Counter 1'}</span>
          </div>
          <div className="hidden sm:flex text-slate-500 items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Shift: {currentUser.shift || 'General'}</span>
          </div>
        </div>

        {/* Admin Only: Quick Switch Cashier Dropdown; Staff Only: Active Offers & WhatsApp */}
        {currentUser.role === 'admin' ? (
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium text-[11px]">Billing As:</span>
            <select
              value={currentUser.user_id}
              onChange={(e) => switchUser(Number(e.target.value))}
              className="bg-slate-50 border border-slate-200 text-slate-800 rounded px-2.5 py-1 text-xs font-semibold outline-none focus:border-emerald-600 cursor-pointer shadow-2xs"
              title="Switch cashier for this register"
            >
              {users
                .filter((u) => u.status !== 'inactive')
                .map((u) => (
                  <option key={u.user_id} value={u.user_id}>
                    {u.name} ({u.role === 'admin' ? 'Admin' : u.counter_no || 'Cashier'})
                  </option>
                ))}
            </select>
            <button
              type="button"
              onClick={() => setActiveTab('staff')}
              className="text-[11px] text-emerald-600 hover:text-emerald-700 font-semibold underline underline-offset-2 ml-1 cursor-pointer flex items-center gap-1"
              title="Manage Staff, Edit details or Delete accounts"
            >
              Manage Staff (Edit/Delete)
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('offers')}
              className="px-3 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
              title="View currently active offers and send WhatsApp messages to customers"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>Active Offers &amp; WhatsApp</span>
            </button>
          </div>
        )}
      </div>

      {/* 2-Column POS Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left 7-8 Columns: Product Entry (With/Without Scanner) + Line Items Cart */}
        <div className="lg:col-span-8 space-y-4">
          {/* Main Product Adding Card (Supports BOTH Scanner & Manual Category/Brand) */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            {/* Header with Mode Switcher & Quick Add Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Add Products to Bill</h2>
                  <p className="text-[11px] text-slate-500">
                    Add via Barcode Scanner or browse by Category &amp; Brand
                  </p>
                </div>
              </div>

              {/* Mode Switcher Tabs */}
              <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
                <button
                  type="button"
                  onClick={() => setAddMode('manual')}
                  className={`px-3 py-1.5 rounded-md font-semibold transition-all flex items-center gap-1.5 ${
                    addMode === 'manual'
                      ? 'bg-white text-emerald-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Category &amp; Brands (No Scanner)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAddMode('scanner')}
                  className={`px-3 py-1.5 rounded-md font-semibold transition-all flex items-center gap-1.5 ${
                    addMode === 'scanner'
                      ? 'bg-white text-emerald-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ScanLine className="w-3.5 h-3.5" />
                  <span>Barcode Scanner</span>
                </button>
              </div>
            </div>

            {/* Admin Only: Quick Create Buttons */}
            {currentUser.role === 'admin' && (
              <div className="flex flex-wrap items-center gap-2 pt-3 text-xs">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Admin Quick Setup:
                </span>
                <button
                  type="button"
                  onClick={() => setIsQuickCatModalOpen(true)}
                  className="px-2.5 py-1 rounded-md bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3 h-3 text-emerald-600" />
                  <span>+ Category</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsQuickBrandModalOpen(true)}
                  className="px-2.5 py-1 rounded-md bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3 h-3 text-emerald-600" />
                  <span>+ Brand</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsQuickProductModalOpen(true)}
                  className="px-2.5 py-1 rounded-md bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3 h-3 text-emerald-600" />
                  <span>+ Product</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsQuickOfferModalOpen(true)}
                  className="px-2.5 py-1 rounded-md bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 font-bold transition-colors flex items-center gap-1 shadow-2xs"
                  title="Create a discount offer that immediately applies in this billing session"
                >
                  <Percent className="w-3 h-3 text-amber-600" />
                  <span>+ Instant Offer</span>
                </button>
              </div>
            )}

            {/* Active Live Offers Banner */}
            {offers.filter((o) => o.status === 'active').length > 0 && (
              <div className="mt-3 bg-amber-50/70 border border-amber-200 rounded-lg p-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-amber-900 flex items-center gap-1">
                    <Percent className="w-3.5 h-3.5 text-amber-600" />
                    <span>Live Promotional Offers (Auto-applied in cart):</span>
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {offers
                      .filter((o) => o.status === 'active')
                      .slice(0, 3)
                      .map((off) => {
                        const prod = off.product_id
                          ? products.find((p) => p.product_id === off.product_id)
                          : null;
                        return (
                          <span
                            key={off.offer_id}
                            className="bg-white border border-amber-200 text-amber-900 font-medium px-2 py-0.5 rounded text-[11px] flex items-center gap-1 shadow-2xs"
                          >
                            <span className="font-bold text-amber-800 font-mono">
                              {off.discount_percentage}% OFF
                            </span>{' '}
                            - {prod ? prod.product_name : 'Store-wide'}
                          </span>
                        );
                      })}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('offers')}
                  className="text-[11px] font-bold text-amber-800 hover:text-amber-950 underline cursor-pointer"
                >
                  {currentUser.role === 'admin'
                    ? 'Manage & WhatsApp Notify →'
                    : 'View Active Offers & Send WhatsApp →'}
                </button>
              </div>
            )}

            {/* MODE 1: Manual Category & Brand Selection (Without Scanner) */}
            {addMode === 'manual' && (
              <div className="mt-4 space-y-4 pt-3 border-t border-slate-100">
                {/* 3-Step Selection Row */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                  {/* Category Selector */}
                  <div className="sm:col-span-4">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      1. Select Category ({categories.length})
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => {
                        setSelectedCategory(e.target.value);
                        setSelectedManualProductId('');
                      }}
                      className="w-full bg-white border border-slate-300 text-slate-800 rounded-lg px-3 py-2 text-xs focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none"
                    >
                      <option value="all">All Categories ({products.length} items)</option>
                      {categories.map((c) => (
                        <option key={c.category_id} value={c.category_id.toString()}>
                          {c.category_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Brand Selector */}
                  <div className="sm:col-span-4">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      2. Select Brand ({brands.length})
                    </label>
                    <select
                      value={selectedBrand}
                      onChange={(e) => {
                        setSelectedBrand(e.target.value);
                        setSelectedManualProductId('');
                      }}
                      className="w-full bg-white border border-slate-300 text-slate-800 rounded-lg px-3 py-2 text-xs focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none"
                    >
                      <option value="all">All Brands</option>
                      {brands.map((b) => (
                        <option key={b.brand_id} value={b.brand_id.toString()}>
                          {b.brand_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Product Search or Dropdown */}
                  <div className="sm:col-span-4">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      3. Filter / Search Product
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={manualProductSearch}
                        onChange={(e) => setManualProductSearch(e.target.value)}
                        placeholder="Search by product name..."
                        className="w-full bg-white border border-slate-300 text-slate-800 rounded-lg pl-8 pr-3 py-2 text-xs focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none"
                      />
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    </div>
                  </div>
                </div>

                {/* Direct Dropdown & Quantity & Add Button */}
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2.5">
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                    <div className="sm:col-span-6">
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Choose Product from Filtered List ({filteredProducts.length} available)
                      </label>
                      <select
                        value={selectedManualProductId}
                        onChange={(e) => {
                          const nextId = e.target.value ? Number(e.target.value) : '';
                          setSelectedManualProductId(nextId);
                          setManualQty(1);
                        }}
                        className="w-full bg-white border border-slate-300 text-slate-800 rounded-lg px-3 py-2 text-xs focus:border-emerald-600 outline-none font-medium"
                      >
                        <option value="">-- Choose Product to Add --</option>
                        {filteredProducts.map((p) => {
                          const u = p.unit || 'Piece';
                          return (
                            <option key={p.product_id} value={p.product_id}>
                              {p.product_name} — ₹{p.selling_price}/{u} (Stock: {p.stock} {u})
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Quantity ({selectedManualProduct ? selectedManualUnit : 'Kg / Litre / Piece'})
                      </label>
                      <div className="relative flex items-center">
                        <input
                          type="number"
                          min={selectedManualUnit === 'Piece' ? '1' : '0.05'}
                          step={selectedManualUnit === 'Piece' ? '1' : 'any'}
                          value={manualQty}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            if (isNaN(val)) {
                              setManualQty(0);
                              return;
                            }
                            if (selectedManualUnit === 'Piece') {
                              setManualQty(Math.max(1, Math.round(val)));
                            } else {
                              setManualQty(Math.max(0.01, val));
                            }
                          }}
                          className="w-full bg-white border border-slate-300 text-slate-800 rounded-lg pl-2.5 pr-12 py-2 text-xs font-bold font-mono focus:border-emerald-600 outline-none"
                        />
                        <span className="absolute right-2.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {selectedManualUnit}
                        </span>
                      </div>
                    </div>

                    <div className="sm:col-span-3">
                      {selectedManualProductId && cart.some((i) => i.product.product_id === Number(selectedManualProductId)) ? (
                        <div className="flex gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleManualAdd()}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-lg text-xs shadow-sm transition-all flex items-center justify-center gap-1 cursor-pointer"
                            title="Add more quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>+ Add</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const p = products.find((prod) => prod.product_id === Number(selectedManualProductId));
                              const inC = cart.find((i) => i.product.product_id === Number(selectedManualProductId));
                              if (p && inC) {
                                handleRemoveItemFromCart(p.product_id, p.product_name, inC.quantity);
                              }
                            }}
                            className="px-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold py-2 rounded-lg text-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                            title="Remove item from bill"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleManualAdd()}
                          disabled={!selectedManualProductId}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-2 rounded-lg text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add to Bill</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Quick Decimal / Whole Quantity Presets & Live Calculation Preview */}
                  {selectedManualProduct && (
                    <div className="pt-2 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                          <Scale className="w-3.5 h-3.5 text-emerald-600" />
                          <span>
                            Quick {selectedManualUnit} Presets
                            {selectedManualUnit === 'Piece' ? ' (Whole Numbers):' : ' (Decimals Allowed):'}
                          </span>
                        </span>
                        {(selectedManualUnit === 'Piece'
                          ? [1, 2, 3, 5, 10]
                          : [0.25, 0.5, 1, 1.25, 1.5, 2.5, 5]
                        ).map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => setManualQty(preset)}
                            className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold border transition-colors cursor-pointer ${
                              manualQty === preset
                                ? 'bg-emerald-600 text-white border-emerald-600'
                                : 'bg-white hover:bg-emerald-50 text-slate-700 border-slate-300'
                            }`}
                          >
                            {preset} {selectedManualUnit}
                          </button>
                        ))}
                      </div>

                      <div className="bg-white border border-emerald-200 rounded-md px-2.5 py-1 text-[11px] flex flex-wrap items-center gap-2 font-mono">
                        <span className="text-slate-600">
                          {manualQty || 0} {selectedManualUnit} &times; ₹{selectedManualProduct.selling_price}/{selectedManualUnit} ={' '}
                          <strong className="text-emerald-700 font-extrabold">
                            ₹{((manualQty || 0) * selectedManualProduct.selling_price).toFixed(2)}
                          </strong>
                        </span>
                        <span className="text-slate-300">|</span>
                        <span className="text-slate-600">
                          Rem. Stock:{' '}
                          <strong className="text-slate-900">
                            {Math.max(
                              0,
                              Math.round((selectedManualProduct.stock - (manualQty || 0)) * 1000) / 1000
                            )}{' '}
                            {selectedManualUnit}
                          </strong>
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick-Click Product Cards Grid */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <Tags className="w-3.5 h-3.5 text-emerald-600" />
                      <span>One-Click Quick Pick Products (Vegetables in Kg, Liquids in Litre, Packets in Piece):</span>
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      Showing {Math.min(filteredProducts.length, 8)} of {filteredProducts.length}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[...filteredProducts]
                      .sort((a, b) => {
                        // Surface vegetables (Kg) and popular items first so Tomato, Onion, Potato are immediately accessible
                        const aIsVeg = a.unit === 'Kg' ? 0 : 1;
                        const bIsVeg = b.unit === 'Kg' ? 0 : 1;
                        return aIsVeg - bIsVeg;
                      })
                      .slice(0, 8)
                      .map((p) => {
                        const cat = categories.find((c) => c.category_id === p.category_id);
                        const br = brands.find((b) => b.brand_id === p.brand_id);
                        const pUnit: ProductUnit = p.unit || 'Piece';
                        const inCart = cart.find((item) => item.product.product_id === p.product_id);
                        return (
                          <div
                            key={p.product_id}
                            className={`p-2.5 rounded-lg border text-left transition-all shadow-xs flex flex-col justify-between ${
                              inCart
                                ? 'bg-emerald-50/50 border-emerald-300'
                                : 'bg-white hover:bg-emerald-50/30 border-slate-200'
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between gap-1 mb-0.5">
                                <span className="text-[10px] text-slate-500 truncate">
                                  {cat?.category_name} • {br?.brand_name}
                                </span>
                                <span
                                  className={`text-[9px] font-bold px-1.5 py-0.2 rounded border shrink-0 ${
                                    pUnit === 'Kg'
                                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                      : pUnit === 'Litre'
                                      ? 'bg-sky-50 text-sky-800 border-sky-200'
                                      : 'bg-indigo-50 text-indigo-800 border-indigo-200'
                                  }`}
                                >
                                  {pUnit}
                                </span>
                              </div>
                              <div className="text-xs font-bold text-slate-900 truncate">
                                {p.product_name}
                              </div>
                              <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                                Stock: <strong className="text-slate-700">{p.stock} {pUnit}</strong>
                              </div>
                            </div>

                            <div className="mt-2 space-y-1.5">
                              <div className="flex items-center justify-between gap-1">
                                <span className="text-xs font-extrabold text-emerald-600 font-mono">
                                  ₹{p.selling_price}
                                  <span className="text-[10px] font-normal text-slate-500">/{pUnit}</span>
                                </span>
                                {inCart ? (
                                  <div className="flex items-center gap-1">
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold border border-emerald-200 font-mono">
                                      {inCart.quantity} {pUnit}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleRemoveItemFromCart(
                                          p.product_id,
                                          p.product_name,
                                          inCart.quantity
                                        )
                                      }
                                      className="p-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[10px] transition-colors cursor-pointer"
                                      title={`Remove "${p.product_name}" from bill`}
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleManualAdd(p.product_id, 1)}
                                    className="text-[10px] px-2 py-0.5 rounded bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-700 font-semibold transition-colors cursor-pointer"
                                  >
                                    + 1 {pUnit}
                                  </button>
                                )}
                              </div>

                              {/* Quick Decimal Add Buttons for Kg / Litre items */}
                              {pUnit !== 'Piece' && (
                                <div className="flex items-center gap-1 pt-1 border-t border-slate-100">
                                  {[0.5, 1.25, 2.5].map((qVal) => (
                                    <button
                                      key={qVal}
                                      type="button"
                                      onClick={() => handleManualAdd(p.product_id, qVal)}
                                      className="flex-1 text-[10px] py-0.5 rounded bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-800 border border-emerald-200 font-mono font-bold transition-colors cursor-pointer text-center"
                                      title={`Add ${qVal} ${pUnit} of ${p.product_name}`}
                                    >
                                      +{qVal}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            )}

            {/* MODE 2: Barcode Scanner Input */}
            {addMode === 'scanner' && (
              <div className="mt-4 space-y-3 pt-3 border-t border-slate-100">
                <form onSubmit={handleScanOrAdd} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                  <div className="sm:col-span-7">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Scan or Type Barcode Number
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={barcodeInput}
                        onChange={(e) => setBarcodeInput(e.target.value)}
                        placeholder="Scan barcode with scanner device or enter digits..."
                        className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg px-3 py-2.5 text-xs font-mono focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none"
                        autoFocus
                      />
                      <ScanLine className="w-4 h-4 text-emerald-600 absolute right-3 top-2.5" />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Qty (Kg/L/Pc)
                    </label>
                    <input
                      type="number"
                      min="0.05"
                      step="any"
                      value={qtyInput}
                      onChange={(e) => setQtyInput(Math.max(0.05, parseFloat(e.target.value) || 1))}
                      className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg px-2.5 py-2.5 text-xs font-mono text-center font-bold focus:border-emerald-600 outline-none"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <button
                      type="submit"
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-lg text-xs shadow-sm transition-all flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add to Bill</span>
                    </button>
                  </div>
                </form>

                {/* Quick-test barcodes */}
                <div className="pt-2">
                  <div className="text-[11px] text-slate-500 mb-1.5 flex items-center gap-1 font-medium">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>Quick Barcode Clicks (Simulate Scanner):</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {products.slice(0, 6).map((p) => (
                      <button
                        key={p.product_id}
                        type="button"
                        onClick={() => addToCartByBarcode(p.barcode, 1)}
                        className="text-[10px] px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-mono transition-colors flex items-center gap-1"
                      >
                        <span className="font-bold text-slate-900">{p.barcode.slice(-4)}</span>
                        <span className="text-emerald-700 font-medium">({p.product_name.split(' ')[0]} - ₹{p.selling_price})</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Notification alert */}
            {scanMessage && (
              <div
                className={`mt-3 p-2.5 rounded-lg text-xs flex items-center justify-between gap-2 shadow-xs animate-in fade-in ${
                  scanMessage.type === 'success'
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border border-rose-200 text-rose-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  {scanMessage.type === 'success' ? (
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span className="font-semibold">{scanMessage.text}</span>
                </div>
                {lastRemovedItem && scanMessage.text.includes('Removed') && (
                  <button
                    type="button"
                    onClick={handleUndoRemove}
                    className="px-2.5 py-1 rounded-md bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] transition-colors cursor-pointer shadow-2xs shrink-0"
                  >
                    Undo Remove
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Cart Table (White on Board Design) */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="p-3.5 bg-slate-50/70 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">Cart Line Items ({cart.length})</h3>
                <span className="text-[11px] text-slate-500 hidden sm:inline">
                  • Click <strong>Remove</strong> or <Trash2 className="w-3 h-3 inline text-rose-600" /> to remove an item
                </span>
              </div>
              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-xs text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear All Items
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 text-left border-b border-slate-200 font-semibold">
                    <th className="py-2.5 px-3">Item Description</th>
                    <th className="py-2.5 px-2 font-mono">Barcode</th>
                    <th className="py-2.5 px-2 text-center">Qty</th>
                    <th className="py-2.5 px-2 text-right">Reg. Price</th>
                    <th className="py-2.5 px-2 text-right">Selling Price</th>
                    <th className="py-2.5 px-2 text-right">Offer Disc.</th>
                    <th className="py-2.5 px-3 text-right">Total</th>
                    <th className="py-2.5 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {cart.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-slate-400">
                        <ShoppingBag className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="font-medium text-slate-600">No items added to the bill yet.</p>
                        <p className="text-[11px] text-slate-400">
                          Select a Category/Brand above or scan a barcode to add products.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    cart.map((item) => {
                      const unit: ProductUnit = item.product.unit || 'Piece';
                      const stepVal = unit === 'Piece' ? 1 : 0.25;
                      const currentProd = products.find((p) => p.product_id === item.product.product_id) || item.product;
                      const remainingStockAfterSale = Math.max(
                        0,
                        Math.round((currentProd.stock - item.quantity) * 1000) / 1000
                      );

                      return (
                        <tr key={item.product.product_id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-slate-900">{item.product.product_name}</span>
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                                  unit === 'Kg'
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                    : unit === 'Litre'
                                    ? 'bg-sky-50 text-sky-800 border-sky-200'
                                    : 'bg-indigo-50 text-indigo-800 border-indigo-200'
                                }`}
                              >
                                Unit: {unit}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                              Stock: {currentProd.stock} {unit} &rarr;{' '}
                              <span className="text-emerald-700 font-semibold">
                                Remaining: {remainingStockAfterSale} {unit}
                              </span>
                            </div>
                            {item.applied_offer && (
                              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-medium inline-block mt-0.5">
                                🏷️ {item.applied_offer.offer_name}
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-2 font-mono text-slate-500 text-[11px]">
                            {item.product.barcode}
                          </td>
                          <td className="py-2.5 px-2">
                            <div className="flex flex-col items-center gap-1">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const nextQty = Math.round((item.quantity - stepVal) * 1000) / 1000;
                                    if (nextQty <= 0) {
                                      handleRemoveItemFromCart(
                                        item.product.product_id,
                                        item.product.product_name,
                                        item.quantity
                                      );
                                    } else {
                                      updateCartQuantity(item.product.product_id, nextQty);
                                    }
                                  }}
                                  className={`w-6 h-6 rounded flex items-center justify-center transition-colors cursor-pointer ${
                                    item.quantity <= stepVal
                                      ? 'bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200'
                                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                  }`}
                                  title={
                                    item.quantity <= stepVal
                                      ? `Remove "${item.product.product_name}" from bill`
                                      : `Decrease by ${stepVal} ${unit}`
                                  }
                                >
                                  {item.quantity <= stepVal ? (
                                    <Trash2 className="w-3 h-3 text-rose-600" />
                                  ) : (
                                    <Minus className="w-3 h-3" />
                                  )}
                                </button>
                                <input
                                  type="number"
                                  min={unit === 'Piece' ? '1' : '0.05'}
                                  step={unit === 'Piece' ? '1' : 'any'}
                                  value={item.quantity}
                                  onChange={(e) => {
                                    const val = parseFloat(e.target.value);
                                    if (!isNaN(val) && val > 0) {
                                      updateCartQuantity(item.product.product_id, val);
                                    }
                                  }}
                                  className="w-16 text-center font-mono font-bold text-slate-900 bg-white border border-slate-300 rounded py-0.5 px-1 text-xs focus:border-emerald-600 outline-none"
                                  title={
                                    unit === 'Piece'
                                      ? 'Enter whole number quantity (Pieces)'
                                      : `Enter decimal quantity in ${unit} (e.g. 0.5, 1.25, 2.5)`
                                  }
                                />
                                <span className="text-[10px] font-bold text-slate-600 font-mono">
                                  {unit}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateCartQuantity(
                                      item.product.product_id,
                                      Math.round((item.quantity + stepVal) * 1000) / 1000
                                    )
                                  }
                                  className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                                  title={`Increase by ${stepVal} ${unit}`}
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                              {unit !== 'Piece' && (
                                <div className="flex items-center gap-1">
                                  {[0.5, 1.25, 2.5].map((preset) => (
                                    <button
                                      key={preset}
                                      type="button"
                                      onClick={() =>
                                        updateCartQuantity(item.product.product_id, preset)
                                      }
                                      className={`px-1.5 py-0.2 rounded text-[9px] font-mono border transition-colors cursor-pointer ${
                                        item.quantity === preset
                                          ? 'bg-emerald-600 text-white border-emerald-600 font-bold'
                                          : 'bg-slate-50 hover:bg-emerald-50 text-slate-600 border-slate-200'
                                      }`}
                                    >
                                      {preset} {unit}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-2.5 px-2 text-right text-slate-400 font-mono">
                            ₹{item.unit_regular.toFixed(2)}/{unit}
                          </td>
                          <td className="py-2.5 px-2 text-right font-bold text-slate-900 font-mono">
                            ₹{item.unit_selling.toFixed(2)}/{unit}
                          </td>
                          <td className="py-2.5 px-2 text-right text-emerald-600 font-medium font-mono">
                            {item.discount_per_unit > 0
                              ? `-₹${(item.discount_per_unit * item.quantity).toFixed(2)}`
                              : '—'}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono">
                            <div className="font-extrabold text-emerald-700">
                              ₹{item.total_amount.toFixed(2)}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {item.quantity} {unit} &times; ₹{(item.unit_selling - item.discount_per_unit).toFixed(2)}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveItemFromCart(
                                  item.product.product_id,
                                  item.product.product_name,
                                  item.quantity
                                )
                              }
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 active:bg-rose-200 text-rose-700 border border-rose-200 text-xs font-bold transition-all cursor-pointer shadow-2xs group hover:scale-[1.02]"
                              title={`Remove "${item.product.product_name}" from bill`}
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-600 group-hover:scale-110 transition-transform" />
                              <span>Remove</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right 4-5 Columns: EXACT REQUEST: Customer (Loyalty & WhatsApp) ABOVE Bill Summary */}
        <div className="lg:col-span-4 space-y-4">
          {/* SECTION: Customer (Loyalty & WhatsApp) */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <h2 className="text-sm font-bold text-slate-900">Customer (Loyalty &amp; WhatsApp)</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsAddCustomerModalOpen(true)}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-md transition-colors flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>+ Add New Customer</span>
              </button>
            </div>

            {/* Search customer by name, mobile, or ID... */}
            <div className="relative">
              <input
                type="text"
                value={customerSearchQuery}
                onFocus={() => setShowCustomerDropdown(true)}
                onChange={(e) => {
                  setCustomerSearchQuery(e.target.value);
                  setShowCustomerDropdown(true);
                }}
                placeholder="Search customer by name, mobile, or ID..."
                className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg pl-8 pr-3 py-2 text-xs focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              {customerSearchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setCustomerSearchQuery('');
                    setShowCustomerDropdown(false);
                  }}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}

              {/* Autocomplete Dropdown */}
              {showCustomerDropdown && customerSearchQuery.trim() && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-48 overflow-y-auto z-20 divide-y divide-slate-100">
                  {filteredCustomers.length > 0 ? (
                    filteredCustomers.map((c) => (
                      <button
                        key={c.customer_id}
                        type="button"
                        onClick={() => handleSelectCustomer(c)}
                        className="w-full text-left p-2 hover:bg-emerald-50 transition-colors flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-slate-900">{c.name}</div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {c.mobile} • ID: #{c.customer_id}
                          </div>
                        </div>
                        <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          ⭐ {c.loyalty_points || 0} pts
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="p-3 text-center text-xs text-slate-500">
                      No registered customer found for "{customerSearchQuery}".
                      <button
                        type="button"
                        onClick={() => {
                          setNewCustMobile(customerSearchQuery.replace(/\D/g, '').slice(0, 10));
                          setNewCustName('Customer ' + customerSearchQuery);
                          setIsAddCustomerModalOpen(true);
                          setShowCustomerDropdown(false);
                        }}
                        className="block mx-auto mt-1.5 text-emerald-700 font-bold hover:underline"
                      >
                        + Create Customer with this info
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Currently Active Customer Card */}
            {activeCustomer ? (
              <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-200 space-y-2.5 text-xs">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900 text-sm">{activeCustomer.name}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono">
                        CUST-{activeCustomer.customer_id}
                      </span>
                    </div>
                    <div className="text-slate-600 font-mono text-xs">{activeCustomer.mobile}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveCustomer(null)}
                    className="text-[11px] text-slate-400 hover:text-rose-600 font-medium"
                    title="Change / Unlink Customer"
                  >
                    Change
                  </button>
                </div>

                {/* Loyalty Points Breakdown */}
                <div className="pt-2 border-t border-emerald-200/70 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-700 font-semibold">
                    <Gift className="w-3.5 h-3.5" />
                    <span>Loyalty Points:</span>
                    <span className="font-extrabold font-mono text-slate-900">
                      {activeCustomer.loyalty_points || 0}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      (₹{((activeCustomer.loyalty_points || 0) / 10).toFixed(2)} value)
                    </span>
                  </div>

                  {availablePoints >= 10 && rawTotal > 0 && (
                    <label className="flex items-center gap-1.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={redeemPoints}
                        onChange={(e) => setRedeemPoints(e.target.checked)}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                      />
                      <span className="text-[11px] font-bold text-emerald-800">
                        Redeem ₹{Math.floor(maxRedeemablePoints / 10)}
                      </span>
                    </label>
                  )}
                </div>

                {/* Points Earn Notification */}
                <div className="text-[11px] text-emerald-700 bg-white/80 px-2 py-1 rounded border border-emerald-200/80 flex items-center justify-between">
                  <span>Points to earn on this bill:</span>
                  <span className="font-bold font-mono">+{pointsToEarn} Points</span>
                </div>

                {/* WhatsApp Digital Receipt Option */}
                <div className="pt-2 border-t border-emerald-200/70 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-medium">
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>WhatsApp Invoice</span>
                  </div>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sendWhatsApp}
                      onChange={(e) => setSendWhatsApp(e.target.checked)}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                    />
                    <span className="text-[11px] text-slate-600 font-medium">Auto-Send</span>
                  </label>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-500 text-center">
                <span className="block font-medium text-slate-700">No customer selected</span>
                <span className="text-[11px]">
                  Search an existing customer above or click <strong>+ Add New Customer</strong> to register loyalty points.
                </span>
              </div>
            )}
          </div>

          {/* SECTION: Bill Summary */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-600" />
                <span>Bill Summary</span>
              </h2>
              <p className="text-[11px] text-slate-500">Review totals and select payment mode</p>
            </div>

            {/* Financial Breakdown */}
            <div className="bg-slate-50 rounded-lg p-3 space-y-2.5 text-xs border border-slate-200">
              <div className="flex justify-between text-slate-700">
                <span className="font-semibold">Subtotal:</span>
                <span className="font-mono font-bold text-slate-900">
                  ₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              {totalDiscount > 0 && (
                <div className="flex justify-between text-slate-700">
                  <span>Offer Discounts:</span>
                  <span className="font-mono text-emerald-600 font-bold">
                    -₹{totalDiscount.toFixed(2)}
                  </span>
                </div>
              )}

              {loyaltyDiscountAmount > 0 && (
                <div className="flex justify-between text-amber-800 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                  <span className="flex items-center gap-1 font-semibold">
                    <Star className="w-3 h-3 text-amber-600" />
                    Loyalty Points ({pointsRedeemedCount} pts):
                  </span>
                  <span className="font-mono font-bold">-₹{loyaltyDiscountAmount.toFixed(2)}</span>
                </div>
              )}

              {/* GST Rate & Editable Tax Configuration for Authorized User */}
              <div className="pt-2 border-t border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-700">GST:</span>
                    <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                      {gstRate}%
                    </span>
                  </div>

                  {canEditGst && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-emerald-700 font-semibold">Edit GST %:</span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.5"
                        value={gstRate}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          updateGstRate(isNaN(val) ? 0 : val);
                        }}
                        className="w-16 text-right font-mono font-bold text-slate-900 bg-white border border-indigo-300 rounded px-1.5 py-0.5 text-xs focus:border-indigo-600 outline-none"
                        title="Authorized User: Edit GST Percentage"
                      />
                      <span className="text-xs font-bold text-slate-600">%</span>
                    </div>
                  )}
                </div>

                {canEditGst && (
                  <div className="flex items-center justify-between gap-1 bg-white p-1.5 rounded border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-medium">Quick Slabs:</span>
                    <div className="flex items-center gap-1">
                      {[0, 5, 12, 18, 28].map((slab) => (
                        <button
                          key={slab}
                          type="button"
                          onClick={() => updateGstRate(slab)}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                            gstRate === slab
                              ? 'bg-indigo-600 text-white font-bold'
                              : 'bg-slate-100 hover:bg-indigo-50 text-slate-700'
                          }`}
                        >
                          {slab}%
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-between text-slate-700">
                  <span className="font-semibold">GST Amount ({gstRate}% of Subtotal):</span>
                  <span className="font-mono font-bold text-indigo-700">
                    ₹{gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="pt-2.5 border-t border-slate-300 flex justify-between items-baseline">
                <div>
                  <span className="text-sm font-extrabold text-slate-900 block">Grand Total:</span>
                  <span className="text-[10px] text-slate-500">Final Payable (Incl. {gstRate}% GST)</span>
                </div>
                <span className="text-2xl font-black text-emerald-700 font-mono">
                  ₹{finalTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">
                Select Payment Mode
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('Cash')}
                  className={`p-2.5 rounded-lg border text-center transition-all ${
                    paymentMethod === 'Cash'
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-800 shadow-xs font-bold'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Banknote className="w-4 h-4 mx-auto mb-1 text-emerald-600" />
                  <span className="text-xs block">Cash</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('UPI')}
                  className={`p-2.5 rounded-lg border text-center transition-all ${
                    paymentMethod === 'UPI'
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-800 shadow-xs font-bold'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Smartphone className="w-4 h-4 mx-auto mb-1 text-emerald-600" />
                  <span className="text-xs block">UPI</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('Card')}
                  className={`p-2.5 rounded-lg border text-center transition-all ${
                    paymentMethod === 'Card'
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-800 shadow-xs font-bold'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <CreditCard className="w-4 h-4 mx-auto mb-1 text-emerald-600" />
                  <span className="text-xs block">Card</span>
                </button>
              </div>
            </div>

            {/* Complete Sale Button */}
            <button
              type="button"
              onClick={handleCheckout}
              disabled={cart.length === 0 || isProcessing}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Receipt className="w-4 h-4" />
              <span>{isProcessing ? 'Generating Invoice...' : 'Generate Bill & Print Receipt'}</span>
            </button>

            <div className="text-[10px] text-center text-slate-400">
              Tax invoice auto-calculates GST, decrements MySQL inventory, and awards loyalty points.
            </div>
          </div>
        </div>
      </div>

      {/* --- MODALS --- */}

      {/* 1. Modal: Add New Customer */}
      {isAddCustomerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Add New Customer</h3>
                  <p className="text-[11px] text-slate-500">
                    Registers profile with 50 Welcome Loyalty Points
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddCustomerModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCustomerSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Mobile Number (10 Digits) *
                </label>
                <input
                  type="tel"
                  value={newCustMobile}
                  onChange={(e) => setNewCustMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="e.g. 9876543210"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono text-sm focus:border-emerald-600 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Customer Full Name *</label>
                <input
                  type="text"
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:border-emerald-600 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Email Address (Optional)</label>
                <input
                  type="email"
                  value={newCustEmail}
                  onChange={(e) => setNewCustEmail(e.target.value)}
                  placeholder="e.g. priya@example.com"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:border-emerald-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Address / Landmark (Optional)</label>
                <input
                  type="text"
                  value={newCustAddress}
                  onChange={(e) => setNewCustAddress(e.target.value)}
                  placeholder="e.g. Flat 302, Sector 4"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:border-emerald-600 outline-none"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddCustomerModalOpen(false)}
                  className="w-1/2 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors"
                >
                  Save &amp; Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Modal: Quick Add Category */}
      {isQuickCatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-white border border-slate-200 rounded-xl p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Add New Category</h3>
              <button
                type="button"
                onClick={() => setIsQuickCatModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateCategory} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Category Name *</label>
                <input
                  type="text"
                  value={quickCatName}
                  onChange={(e) => setQuickCatName(e.target.value)}
                  placeholder="e.g. Organic & Spices"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:border-emerald-600 outline-none"
                  required
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsQuickCatModalOpen(false)}
                  className="w-1/2 py-2 rounded-lg bg-slate-100 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700"
                >
                  Add Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Modal: Quick Add Brand */}
      {isQuickBrandModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-white border border-slate-200 rounded-xl p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Add New Brand</h3>
              <button
                type="button"
                onClick={() => setIsQuickBrandModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateBrand} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Brand Name *</label>
                <input
                  type="text"
                  value={quickBrandName}
                  onChange={(e) => setQuickBrandName(e.target.value)}
                  placeholder="e.g. Haldiram's"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:border-emerald-600 outline-none"
                  required
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsQuickBrandModalOpen(false)}
                  className="w-1/2 py-2 rounded-lg bg-slate-100 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700"
                >
                  Add Brand
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Modal: Quick Add Product */}
      {isQuickProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Add New Product to Catalog</h3>
              <button
                type="button"
                onClick={() => setIsQuickProductModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-5">
                  <label className="block text-slate-700 font-semibold mb-1">Product Name *</label>
                  <input
                    type="text"
                    value={quickProdName}
                    onChange={(e) => setQuickProdName(e.target.value)}
                    placeholder="e.g. Tomato or Soap"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:border-emerald-600 outline-none"
                    required
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-emerald-800 font-bold mb-1">Unit *</label>
                  <select
                    value={quickProdUnit}
                    onChange={(e) => setQuickProdUnit(e.target.value as ProductUnit)}
                    className="w-full bg-emerald-50 border border-emerald-400 rounded-lg px-2.5 py-2 text-emerald-950 font-bold focus:border-emerald-600 outline-none"
                  >
                    <option value="Kg">Kg</option>
                    <option value="Litre">Litre</option>
                    <option value="Piece">Piece</option>
                  </select>
                </div>
                <div className="sm:col-span-4">
                  <label className="block text-slate-700 font-semibold mb-1">Barcode Digits *</label>
                  <input
                    type="text"
                    value={quickProdBarcode}
                    onChange={(e) => setQuickProdBarcode(e.target.value)}
                    placeholder="e.g. 8901234500011"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:border-emerald-600 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Category *</label>
                  <select
                    value={quickProdCatId}
                    onChange={(e) => {
                      const nextCat = Number(e.target.value);
                      setQuickProdCatId(nextCat);
                      const catObj = categories.find((c) => c.category_id === nextCat);
                      if (
                        catObj &&
                        (catObj.category_name.toLowerCase().includes('vegetable') ||
                          catObj.category_name.toLowerCase().includes('fruit'))
                      ) {
                        setQuickProdUnit('Kg');
                      }
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
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Brand *</label>
                  <select
                    value={quickProdBrandId}
                    onChange={(e) => setQuickProdBrandId(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:border-emerald-600 outline-none"
                  >
                    {brands.map((b) => (
                      <option key={b.brand_id} value={b.brand_id}>
                        {b.brand_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Cost / {quickProdUnit} (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={quickProdCost || ''}
                    onChange={(e) => setQuickProdCost(parseFloat(e.target.value) || 0)}
                    placeholder="e.g. 28"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:border-emerald-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Regular / {quickProdUnit} (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={quickProdRegular || ''}
                    onChange={(e) => setQuickProdRegular(parseFloat(e.target.value) || 0)}
                    placeholder="e.g. 45"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:border-emerald-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Selling / {quickProdUnit} (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={quickProdSelling || ''}
                    onChange={(e) => setQuickProdSelling(parseFloat(e.target.value) || 0)}
                    placeholder="e.g. 40"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono font-bold text-emerald-700 focus:border-emerald-600 outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Initial Stock ({quickProdUnit})
                </label>
                <input
                  type="number"
                  step={quickProdUnit === 'Piece' ? '1' : '0.01'}
                  value={quickProdStock}
                  onChange={(e) =>
                    setQuickProdStock(
                      quickProdUnit === 'Piece'
                        ? parseInt(e.target.value) || 0
                        : parseFloat(e.target.value) || 0
                    )
                  }
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:border-emerald-600 outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsQuickProductModalOpen(false)}
                  className="w-1/2 py-2 rounded-lg bg-slate-100 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700"
                >
                  Save to Inventory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK INSTANT OFFER CREATION MODAL */}
      {isQuickOfferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-white border border-slate-200 rounded-xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Percent className="w-4 h-4 text-amber-600" />
                <span>Create Instant Billing Offer</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsQuickOfferModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleQuickCreateOffer} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Offer Title *</label>
                <input
                  type="text"
                  value={quickOfferName}
                  onChange={(e) => setQuickOfferName(e.target.value)}
                  placeholder="e.g. Counter Special 10% Off"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:border-amber-600 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Apply To Product</label>
                <select
                  value={quickOfferProdId}
                  onChange={(e) => setQuickOfferProdId(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:border-amber-600 outline-none"
                >
                  <option value="">Store-wide (All Cart Products)</option>
                  {products.map((p) => (
                    <option key={p.product_id} value={p.product_id}>
                      {p.product_name} (₹{p.selling_price})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Discount % *</label>
                <input
                  type="number"
                  min="1"
                  max="90"
                  value={quickOfferDiscount}
                  onChange={(e) =>
                    setQuickOfferDiscount(Math.max(1, Math.min(90, parseInt(e.target.value) || 1)))
                  }
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono font-bold focus:border-amber-600 outline-none"
                  required
                />
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-[11px] text-amber-900">
                ⚡ <strong>Instant POS Effect:</strong> This discount will apply immediately to items in your cart and any newly added items!
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsQuickOfferModalOpen(false)}
                  className="w-1/2 py-2 rounded-lg bg-slate-100 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold transition-colors shadow-xs"
                >
                  Activate in Cart
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
