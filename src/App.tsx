import React from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { ShieldAlert } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { BillingView } from './components/BillingView';
import { CustomersView } from './components/CustomersView';
import { ProductsView } from './components/ProductsView';
import { CategoriesBrandsView } from './components/CategoriesBrandsView';
import { OffersView } from './components/OffersView';
import { StaffView } from './components/StaffView';
import { SalesView } from './components/SalesView';
import { ReportsView } from './components/ReportsView';
import { PowerBiView } from './components/PowerBiView';
import { PhpCodeViewer } from './components/PhpCodeViewer';
import { InvoiceModal } from './components/InvoiceModal';
import { LoginModal } from './components/LoginModal';
import { LoginPage } from './components/LoginPage';

const MainContent: React.FC = () => {
  const { activeTab, currentUser, isAuthenticated } = useStore();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const isAdmin = currentUser.role === 'admin';
  const adminOnlyTabs = [
    'dashboard',
    'categories',
    'brands',
    'staff',
    'sales',
    'reports',
    'powerbi',
    'php_source',
  ];

  // If Staff is on an Admin-only tab, default them to Billing
  const effectiveTab =
    !isAdmin && adminOnlyTabs.includes(activeTab) ? 'billing' : activeTab;

  const getPageMeta = () => {
    switch (effectiveTab) {
      case 'dashboard':
        return {
          title: 'Executive Sales & BI Dashboard',
          subtitle: 'Real-time sales KPI tracking, profit margins, and inventory alerts',
        };
      case 'billing':
        return {
          title: 'Barcode Point of Sale (POS)',
          subtitle: 'Fast barcode scanning, customer auto-lookup, and tax invoice generation',
        };
      case 'customers':
        return {
          title: isAdmin
            ? 'Customer Relationship & Purchase History'
            : 'Customer Service & Loyalty Lookup',
          subtitle: 'Shopper records, loyalty points, and customer WhatsApp communication',
        };
      case 'products':
        return {
          title: isAdmin
            ? 'Product Catalog & Inventory Management'
            : 'Product Details & Billing Lookup (Sales Staff)',
          subtitle: isAdmin
            ? 'Cost price, MRP, selling price adjustments, and low-stock reorder alerts'
            : 'View product details, barcode, selling price, and active discounts for billing',
        };
      case 'categories':
        return {
          title: 'Department Categories & Brand Catalog',
          subtitle: 'Supermarket classification hierarchy for Star Schema analytics',
        };
      case 'offers':
        return {
          title: isAdmin
            ? 'Promotional Discounts & Special Schemes'
            : 'Active Offers & WhatsApp Broadcast (Sales Staff)',
          subtitle: isAdmin
            ? 'Create, edit, and activate product-specific offers and discount percentages'
            : 'View currently active offers, discount percentages, and send WhatsApp messages to customers',
        };
      case 'staff':
        return {
          title: 'Sales Persons & Staff Team',
          subtitle: 'Manage supermarket cashiers, shift timings, assigned billing counters, and sales performance',
        };
      case 'sales':
        return {
          title: 'Sales Transactions & Invoice Ledger',
          subtitle: 'Customer invoice history and receipt reprinting',
        };
      case 'reports':
        return {
          title: 'Business Intelligence & Profit Reports',
          subtitle: 'Printable daily/monthly summaries, product profitability, and stock reorders',
        };
      case 'powerbi':
        return {
          title: 'Power BI Integration & Dimensional Analytics',
          subtitle: 'Interactive 3-page BI simulator, Star Schema architecture, and production DAX measures',
        };
      case 'php_source':
        return {
          title: 'XAMPP Source Code & 1-Click ZIP Deployment',
          subtitle: 'Complete runnable PHP/MySQL files formatted for C:\\xampp\\htdocs\\smart_retail',
        };
      default:
        return { title: 'Smart Retail Supermarket', subtitle: 'POS & Analytics System' };
    }
  };

  const meta = getPageMeta();

  return (
    <div className="flex h-screen bg-slate-100 text-slate-900 overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Dynamic Header */}
        <Header title={meta.title} subtitle={meta.subtitle} />

        {/* Scrollable View Area */}
        <main className="flex-1 overflow-y-auto p-5 md:p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {effectiveTab === 'dashboard' && isAdmin && <DashboardView />}
            {effectiveTab === 'billing' && <BillingView />}
            {effectiveTab === 'customers' && <CustomersView />}
            {effectiveTab === 'products' && <ProductsView />}
            {effectiveTab === 'categories' && isAdmin && <CategoriesBrandsView />}
            {effectiveTab === 'offers' && <OffersView />}
            {effectiveTab === 'staff' && isAdmin && <StaffView />}
            {effectiveTab === 'sales' && isAdmin && <SalesView />}
            {effectiveTab === 'reports' && isAdmin && <ReportsView />}
            {effectiveTab === 'powerbi' && isAdmin && <PowerBiView />}
            {effectiveTab === 'php_source' && isAdmin && <PhpCodeViewer />}
          </div>
        </main>
      </div>

      {/* Global Modals */}
      <InvoiceModal />
      <LoginModal />
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <MainContent />
    </StoreProvider>
  );
}
