import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Offer, Customer } from '../types';
import {
  Percent,
  Plus,
  Tag,
  Calendar,
  CheckCircle2,
  XCircle,
  X,
  MessageCircle,
  Users,
  Send,
  ShoppingBag,
  ExternalLink,
  History,
  Sparkles,
  Phone,
  Check,
  Clock,
  ArrowRight,
  Edit2,
  Trash2,
} from 'lucide-react';

export const OffersView: React.FC = () => {
  const {
    offers,
    products,
    customers,
    addOffer,
    updateOffer,
    toggleOfferStatus,
    deleteOffer,
    getTargetCustomersForOffer,
    setActiveTab,
    currentUser,
  } = useStore();

  const isAdmin = currentUser.role === 'admin';
  const visibleOffers = isAdmin ? offers : offers.filter((o) => o.status === 'active');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [formData, setFormData] = useState({
    offer_name: '',
    product_id: '' as string,
    discount_percentage: 15,
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    status: 'active' as 'active' | 'inactive',
    openWhatsAppAfterSave: true,
  });

  // WhatsApp Broadcast Modal State
  const [selectedOfferForWhatsApp, setSelectedOfferForWhatsApp] = useState<Offer | null>(null);
  const [targetAudienceFilter, setTargetAudienceFilter] = useState<'buyers' | 'all'>('buyers');
  const [sentCustomerIds, setSentCustomerIds] = useState<number[]>([]);
  const [customGreeting, setCustomGreeting] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleOpenCreateModal = () => {
    if (!isAdmin) return;
    setEditingOffer(null);
    setFormData({
      offer_name: '',
      product_id: '',
      discount_percentage: 15,
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      status: 'active',
      openWhatsAppAfterSave: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (offer: Offer) => {
    if (!isAdmin) return;
    setEditingOffer(offer);
    setFormData({
      offer_name: offer.offer_name,
      product_id: offer.product_id ? offer.product_id.toString() : '',
      discount_percentage: offer.discount_percentage,
      start_date: offer.start_date,
      end_date: offer.end_date,
      status: offer.status,
      openWhatsAppAfterSave: false,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    if (!formData.offer_name.trim()) return;

    if (editingOffer) {
      const updated: Offer = {
        offer_id: editingOffer.offer_id,
        offer_name: formData.offer_name.trim(),
        product_id: formData.product_id ? parseInt(formData.product_id) : null,
        discount_percentage: Number(formData.discount_percentage),
        start_date: formData.start_date,
        end_date: formData.end_date,
        status: formData.status,
      };
      updateOffer(updated);
      setIsModalOpen(false);
      setEditingOffer(null);
      showToast(`Offer "${updated.offer_name}" updated (${updated.discount_percentage}% OFF, ${updated.status.toUpperCase()})!`);

      if (formData.openWhatsAppAfterSave) {
        setSelectedOfferForWhatsApp(updated);
        setSentCustomerIds([]);
      }
      return;
    }

    const newOffer = addOffer({
      offer_name: formData.offer_name.trim(),
      product_id: formData.product_id ? parseInt(formData.product_id) : null,
      discount_percentage: Number(formData.discount_percentage),
      start_date: formData.start_date,
      end_date: formData.end_date,
      status: formData.status,
    });

    setIsModalOpen(false);
    showToast(`Offer "${newOffer.offer_name}" is LIVE and instantly active in POS Billing!`);

    if (formData.openWhatsAppAfterSave) {
      setSelectedOfferForWhatsApp(newOffer);
      setSentCustomerIds([]);
    }

    setFormData({
      offer_name: '',
      product_id: '',
      discount_percentage: 15,
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      status: 'active',
      openWhatsAppAfterSave: true,
    });
  };

  // Helper to generate customized WhatsApp message text
  const generateWhatsAppMessage = (offer: Offer, customerName: string) => {
    const prod = offer.product_id
      ? products.find((p) => p.product_id === offer.product_id)
      : null;

    let text = `🌟 *SPECIAL OFFER ALERT - SMART RETAIL SUPERMARKET* 🌟\n\n`;
    text += `Hello *${customerName}*,\n`;
    if (prod) {
      text += `Based on your previous purchase of *${prod.product_name}*, we have a special live offer exclusively for you!\n\n`;
    } else {
      text += `As one of our valued supermarket shoppers, we're excited to announce a store-wide live promotion!\n\n`;
    }

    text += `🏷️ *Offer:* ${offer.offer_name}\n`;
    text += `🔥 *Discount:* ${offer.discount_percentage}% OFF\n`;
    if (prod) {
      const discountedPrice = (prod.selling_price * (1 - offer.discount_percentage / 100)).toFixed(2);
      text += `💰 *Offer Price:* ₹${discountedPrice} (Regular: ₹${prod.selling_price})\n`;
    }
    text += `📅 *Valid Until:* ${offer.end_date}\n\n`;
    text += `Show this message at the billing counter or visit our store today to claim your discount!\n\n`;
    text += `_Smart Retail Supermarket - Freshness & Savings Every Day_`;

    return text;
  };

  // Build target customer list for the WhatsApp modal
  const getRecipientsForOffer = (offer: Offer) => {
    const pastBuyers = getTargetCustomersForOffer(offer);

    if (targetAudienceFilter === 'buyers' && pastBuyers.length > 0) {
      return pastBuyers;
    }

    // Otherwise show all customers, highlighting those who bought before
    return customers.map((c) => {
      const matched = pastBuyers.find((p) => p.customer.customer_id === c.customer_id);
      return {
        customer: c,
        purchaseCount: matched?.purchaseCount || 0,
        lastBought: matched?.lastBought,
      };
    });
  };

  // Open WhatsApp Web or wa.me link
  const handleSendWhatsApp = (offer: Offer, recipient: { customer: Customer; purchaseCount: number }) => {
    const rawMobile = recipient.customer.mobile.replace(/\D/g, '');
    const cleanMobile = rawMobile.length === 10 ? `91${rawMobile}` : rawMobile;
    const msg = generateWhatsAppMessage(offer, recipient.customer.name);
    const url = `https://wa.me/${cleanMobile}?text=${encodeURIComponent(msg)}`;

    window.open(url, '_blank', 'noopener,noreferrer');

    if (!sentCustomerIds.includes(recipient.customer.customer_id)) {
      setSentCustomerIds((prev) => [...prev, recipient.customer.customer_id]);
    }
    showToast(`WhatsApp notification triggered for ${recipient.customer.name}!`);
  };

  // Mark all as sent (simulated broadcast confirmation)
  const handleMarkAllSent = (recipientIds: number[]) => {
    setSentCustomerIds((prev) => Array.from(new Set([...prev, ...recipientIds])));
    showToast(`All ${recipientIds.length} customer WhatsApp notifications marked as sent!`);
  };

  const activeOffersCount = offers.filter((o) => o.status === 'active').length;

  return (
    <div className="space-y-5">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shadow-xs">
            <Percent className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">
                {isAdmin ? 'Promotions & Discounts Management' : 'Currently Active Offers & Discounts'}
              </h2>
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                Live in POS Billing
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {isAdmin
                ? 'Admin Only: Create and edit offers, set discount percentages, activate/deactivate offers, and send customer WhatsApp alerts.'
                : 'Sales Staff View: View currently active offers, discount percentages, and send WhatsApp messages related to active offers to customers.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setActiveTab('billing')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
            <span>Open POS Billing</span>
          </button>

          {isAdmin && (
            <button
              onClick={handleOpenCreateModal}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Create New Offer</span>
            </button>
          )}
        </div>
      </div>

      {/* Active Synchronization Info Box */}
      <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs text-emerald-900">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
            ✓
          </div>
          <div>
            {isAdmin ? (
              <>
                <span className="font-bold">Admin Offer Control:</span> Only Admin decides what offer to create, the discount percentage, applicable product, start/end dates, and active/inactive status.
              </>
            ) : (
              <>
                <span className="font-bold">Active Offer Communication:</span> Sales Staff can view all active offers below and send personalized WhatsApp messages to customers.
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-white border border-emerald-200 text-emerald-800 font-mono font-bold px-2 py-0.5 rounded text-[11px]">
            {activeOffersCount} Active Offers Live
          </span>
        </div>
      </div>

      {/* Offers Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            {isAdmin
              ? `All Promotional Offers (${visibleOffers.length})`
              : `Currently Active Offers (${visibleOffers.length})`}
          </h3>
          <span className="text-[11px] text-slate-500">
            Click &quot;WhatsApp Notify&quot; to send offer details to customers on WhatsApp
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50/70 text-slate-600 text-left border-b border-slate-200 font-semibold">
                <th className="py-3 px-3">Offer ID</th>
                <th className="py-3 px-3">Offer Title</th>
                <th className="py-3 px-3">Applicable Product &amp; Price</th>
                <th className="py-3 px-2 text-center">Discount %</th>
                <th className="py-3 px-3">Validity Period</th>
                <th className="py-3 px-2 text-center">Status</th>
                <th className="py-3 px-3 text-center">
                  {isAdmin ? 'Admin Controls & WhatsApp' : 'WhatsApp Communication'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleOffers.map((off) => {
                const prod = off.product_id
                  ? products.find((p) => p.product_id === off.product_id)
                  : null;
                const pastBuyers = getTargetCustomersForOffer(off);
                const discountedUnitPrice = prod
                  ? Math.round(prod.selling_price * (1 - off.discount_percentage / 100) * 100) / 100
                  : null;

                return (
                  <tr key={off.offer_id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3 font-mono text-slate-400 font-semibold">
                      #{off.offer_id}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{off.offer_name}</div>
                      <div className="text-[10px] text-emerald-700 flex items-center gap-1 font-medium">
                        <Sparkles className="w-3 h-3" /> Auto-applies in Billing Session
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {prod ? (
                        <div className="flex items-center gap-1.5">
                          <Tag className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <div>
                            <span className="font-bold text-slate-800 block">{prod.product_name}</span>
                            <span className="text-[10px] font-mono text-slate-500">
                              Selling: ₹{prod.selling_price}/{prod.unit || 'Piece'} &rarr;{' '}
                              <strong className="text-emerald-700">
                                Offer: ₹{discountedUnitPrice?.toFixed(2)}
                              </strong>
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block">
                          Store-Wide (All Products)
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span className="px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-800 font-extrabold border border-emerald-200 font-mono">
                        {off.discount_percentage}% OFF
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-500 text-[11px] font-mono">
                      <div>{off.start_date}</div>
                      <div className="text-[10px] text-slate-400">to {off.end_date}</div>
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          off.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}
                      >
                        {off.status === 'active' ? '● Active' : '○ Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5 flex-wrap">
                        {/* WhatsApp Notification Button (Available to both Admin and Sales Staff for active offers) */}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedOfferForWhatsApp(off);
                            setSentCustomerIds([]);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                          title="Send WhatsApp message related to this offer to customers"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp Notify</span>
                          {pastBuyers.length > 0 && (
                            <span className="ml-0.5 bg-emerald-800/80 text-[10px] px-1.5 py-0.2 rounded-full font-mono">
                              {pastBuyers.length}
                            </span>
                          )}
                        </button>

                        {/* Admin Only: Edit Offer & Activate/Deactivate Offer */}
                        {isAdmin && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(off)}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                              title="Admin Only: Edit offer details, product, dates, or discount percentage"
                            >
                              <Edit2 className="w-3 h-3 text-emerald-600" />
                              <span>Edit</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                toggleOfferStatus(off.offer_id);
                                showToast(
                                  `Offer #${off.offer_id} is now ${off.status === 'active' ? 'INACTIVE' : 'ACTIVE'} in POS!`
                                );
                              }}
                              className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                                off.status === 'active'
                                  ? 'bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-700 border-slate-200'
                                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                              }`}
                            >
                              {off.status === 'active' ? 'Deactivate' : 'Activate'}
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`Delete offer "${off.offer_name}"?`)) {
                                  deleteOffer(off.offer_id);
                                  showToast(`Offer "${off.offer_name}" deleted.`);
                                }
                              }}
                              className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors cursor-pointer"
                              title="Admin Only: Delete Offer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= CREATE / EDIT OFFER MODAL (ADMIN ONLY) ================= */}
      {isModalOpen && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 w-full max-w-md shadow-2xl text-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Percent className="w-4 h-4 text-emerald-600" />
                <span>{editingOffer ? `Edit Offer #${editingOffer.offer_id}` : 'Create Promotional Offer'}</span>
              </h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingOffer(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Offer Title *</label>
                <input
                  type="text"
                  value={formData.offer_name}
                  onChange={(e) => setFormData({ ...formData, offer_name: e.target.value })}
                  placeholder="e.g. Weekend Dairy Special, 15% Off Snacks"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:border-emerald-600 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Apply To Product</label>
                <select
                  value={formData.product_id}
                  onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:border-emerald-600 outline-none font-medium"
                >
                  <option value="">Store-wide (All Products)</option>
                  {products.map((p) => (
                    <option key={p.product_id} value={p.product_id}>
                      {p.product_name} (₹{p.selling_price})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-500 mt-1">
                  Selecting a specific product allows targeted WhatsApp notifications to past buyers!
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Discount % *</label>
                  <input
                    type="number"
                    min="1"
                    max="90"
                    value={formData.discount_percentage}
                    onChange={(e) =>
                      setFormData({ ...formData, discount_percentage: parseInt(e.target.value) || 0 })
                    }
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono font-bold focus:border-emerald-600 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })
                    }
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-semibold focus:border-emerald-600 outline-none"
                  >
                    <option value="active">🟢 Active in Billing</option>
                    <option value="inactive">⚪ Inactive</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Start Date</label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:border-emerald-600 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">End Date</label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:border-emerald-600 outline-none"
                    required
                  />
                </div>
              </div>

              {/* Checkbox for WhatsApp notification modal */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="whatsappCheck"
                  checked={formData.openWhatsAppAfterSave}
                  onChange={(e) =>
                    setFormData({ ...formData, openWhatsAppAfterSave: e.target.checked })
                  }
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="whatsappCheck" className="text-[11px] text-emerald-900 font-semibold cursor-pointer">
                  Send separate WhatsApp notification to past buyers of this item once created
                </label>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingOffer(null);
                  }}
                  className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs cursor-pointer"
                >
                  {editingOffer ? 'Update Offer' : 'Save & Apply to Billing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= WHATSAPP NOTIFICATION MODAL ================= */}
      {selectedOfferForWhatsApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl text-slate-800 overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 bg-emerald-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">
                    WhatsApp Customer Broadcast: &quot;{selectedOfferForWhatsApp.offer_name}&quot;
                  </h3>
                  <p className="text-[11px] text-emerald-100">
                    Notifying customers based on past purchase history that offer is now live
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedOfferForWhatsApp(null)}
                className="p-1 rounded text-white/80 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
              {/* Offer Summary Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">
                    Offer Scope
                  </span>
                  <span className="font-bold text-slate-900 text-sm">
                    {selectedOfferForWhatsApp.product_id
                      ? products.find((p) => p.product_id === selectedOfferForWhatsApp.product_id)?.product_name
                      : 'Store-Wide (All Products)'}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="bg-emerald-100 text-emerald-800 font-extrabold px-2.5 py-1 rounded-md text-xs font-mono">
                    {selectedOfferForWhatsApp.discount_percentage}% DISCOUNT
                  </span>
                  <span className="text-slate-500 text-[11px] font-mono">
                    Valid until {selectedOfferForWhatsApp.end_date}
                  </span>
                </div>
              </div>

              {/* Message Preview Box */}
              <div>
                <label className="block text-slate-700 font-bold mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>WhatsApp Message Preview (Sent to each customer):</span>
                </label>
                <div className="bg-emerald-50/50 border border-emerald-200 rounded-xl p-3 font-mono text-[11px] text-slate-800 whitespace-pre-line leading-relaxed shadow-2xs">
                  {generateWhatsAppMessage(selectedOfferForWhatsApp, 'Customer Name')}
                </div>
              </div>

              {/* Audience Filter Tabs & Stats */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                <div className="flex rounded-lg bg-slate-100 p-0.5 border border-slate-200 text-xs">
                  <button
                    type="button"
                    onClick={() => setTargetAudienceFilter('buyers')}
                    className={`px-3 py-1.5 rounded-md font-semibold transition-all flex items-center gap-1.5 ${
                      targetAudienceFilter === 'buyers'
                        ? 'bg-white text-emerald-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <History className="w-3.5 h-3.5" />
                    <span>Previous Buyers of this Item</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTargetAudienceFilter('all')}
                    className={`px-3 py-1.5 rounded-md font-semibold transition-all flex items-center gap-1.5 ${
                      targetAudienceFilter === 'all'
                        ? 'bg-white text-emerald-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>All Registered Customers ({customers.length})</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const list = getRecipientsForOffer(selectedOfferForWhatsApp);
                    handleMarkAllSent(list.map((l) => l.customer.customer_id));
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold text-xs flex items-center gap-1 transition-colors"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Mark All as Sent</span>
                </button>
              </div>

              {/* Recipient Customer Cards */}
              <div className="space-y-2">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Targeted Recipients ({getRecipientsForOffer(selectedOfferForWhatsApp).length})
                </div>

                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                  {getRecipientsForOffer(selectedOfferForWhatsApp).length === 0 ? (
                    <div className="p-6 text-center text-slate-400">
                      No purchase history found for this item yet. Switch to &quot;All Registered Customers&quot; above to broadcast.
                    </div>
                  ) : (
                    getRecipientsForOffer(selectedOfferForWhatsApp).map(({ customer, purchaseCount, lastBought }) => {
                      const isSent = sentCustomerIds.includes(customer.customer_id);

                      return (
                        <div
                          key={customer.customer_id}
                          className="p-3 bg-white hover:bg-slate-50 flex items-center justify-between gap-3 transition-colors"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-xs">
                                {customer.name}
                              </span>
                              {purchaseCount > 0 ? (
                                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded font-mono">
                                  Bought {purchaseCount}x previously
                                </span>
                              ) : (
                                <span className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded">
                                  Registered Shopper
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3 text-slate-400" />
                                {customer.mobile}
                              </span>
                              {lastBought && (
                                <span className="text-slate-400">
                                  • Last visit: {lastBought}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {isSent ? (
                              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1">
                                <Check className="w-3.5 h-3.5" /> Sent
                              </span>
                            ) : null}

                            <button
                              type="button"
                              onClick={() =>
                                handleSendWhatsApp(selectedOfferForWhatsApp, {
                                  customer,
                                  purchaseCount,
                                })
                              }
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                            >
                              <Send className="w-3 h-3" />
                              <span>{isSent ? 'Resend WhatsApp' : 'Send WhatsApp'}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">
                Sent: <strong className="text-slate-800">{sentCustomerIds.length}</strong> of{' '}
                {getRecipientsForOffer(selectedOfferForWhatsApp).length} targeted customers
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedOfferForWhatsApp(null)}
                  className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold transition-colors"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedOfferForWhatsApp(null);
                    setActiveTab('billing');
                  }}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <span>Go to POS Billing</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
