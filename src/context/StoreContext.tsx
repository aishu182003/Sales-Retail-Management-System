import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  Customer,
  Category,
  Brand,
  Product,
  Offer,
  Sale,
  SaleItem,
  CartItem,
  ActiveTab,
  UserRole,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_CATEGORIES,
  INITIAL_BRANDS,
  INITIAL_PRODUCTS,
  INITIAL_OFFERS,
  INITIAL_CUSTOMERS,
  INITIAL_SALES,
  INITIAL_SALE_ITEMS,
} from '../data/initialData';

interface StoreContextType {
  currentUser: User;
  users: User[];
  categories: Category[];
  brands: Brand[];
  products: Product[];
  offers: Offer[];
  customers: Customer[];
  sales: Sale[];
  saleItems: SaleItem[];
  activeTab: ActiveTab;
  cart: CartItem[];
  activeCustomer: Customer | null;
  gstRate: number;
  updateGstRate: (newRate: number) => { success: boolean; message: string };
  lastGeneratedSale: {
    sale: Sale;
    items: SaleItem[];
    customer: Customer;
    user: User;
  } | null;

  isLoginOpen: boolean;
  setLoginOpen: (open: boolean) => void;
  isAuthenticated: boolean;
  loginPortalType: 'admin' | 'sales_person';
  setLoginPortalType: (type: 'admin' | 'sales_person') => void;

  // Actions
  setActiveTab: (tab: ActiveTab) => void;
  switchRole: (role: UserRole) => void;
  loginUser: (username: string, password?: string) => boolean;
  loginAsAdmin: (username: string, password?: string) => { success: boolean; message: string };
  loginAsSalesPerson: (
    username: string,
    password?: string,
    counterNo?: string
  ) => { success: boolean; message: string };
  logoutUser: () => void;

  // Cart / POS
  addToCartByBarcode: (barcode: string, qty?: number) => { success: boolean; message: string };
  addToCartByProductId: (productId: number, qty?: number) => { success: boolean; message: string };
  updateCartQuantity: (productId: number, qty: number) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
  setActiveCustomer: (customer: Customer | null) => void;
  lookupOrCreateCustomer: (mobile: string, name?: string) => Customer;
  addNewCustomer: (customerData: {
    name: string;
    mobile: string;
    email?: string;
    address?: string;
    loyalty_points?: number;
  }) => Customer;
  completeSale: (
    paymentMethod: 'Cash' | 'UPI' | 'Card',
    loyaltyPointsRedeemed?: number,
    loyaltyDiscountAmount?: number
  ) => { success: boolean; saleId?: number; message?: string };
  dismissInvoice: () => void;
  reprintSale: (saleId: number) => void;
  removeSaleItem: (saleId: number, saleItemId: number) => { success: boolean; message: string };
  voidSale: (saleId: number) => { success: boolean; message: string };

  // Product CRUD
  addProduct: (prod: Omit<Product, 'product_id'>) => void;
  updateProduct: (prod: Product) => void;
  updateProductPrice: (productId: number, cost: number, regular: number, selling: number) => void;
  updateProductStock: (productId: number, newStock: number) => void;
  toggleProductStatus: (productId: number) => void;
  deleteProduct: (productId: number) => { success: boolean; message: string };

  // Category & Brand CRUD
  addCategory: (name: string, status?: 'active' | 'inactive') => Category;
  updateCategory: (cat: Category) => void;
  toggleCategoryStatus: (categoryId: number) => void;
  activateAllCategories: () => void;
  deleteCategory: (categoryId: number) => { success: boolean; message: string };
  addBrand: (name: string, status?: 'active' | 'inactive') => Brand;
  updateBrand: (b: Brand) => void;
  toggleBrandStatus: (brandId: number) => void;
  activateAllBrands: () => void;
  deleteBrand: (brandId: number) => { success: boolean; message: string };

  // Offers
  addOffer: (offer: Omit<Offer, 'offer_id'>) => Offer;
  updateOffer: (offer: Offer) => void;
  toggleOfferStatus: (offerId: number) => void;
  deleteOffer: (offerId: number) => void;
  getActiveOfferForProduct: (productId: number) => Offer | undefined;
  getTargetCustomersForOffer: (offer: Offer) => { customer: Customer; purchaseCount: number; lastBought?: string }[];

  // Staff & Sales Persons CRUD
  addUser: (userData: Omit<User, 'user_id'>) => User;
  updateUser: (userId: number, userData: Partial<User>) => void;
  toggleUserStatus: (userId: number) => void;
  deleteUser: (userId: number) => { success: boolean; message: string };
  switchUser: (userId: number) => void;

  // Reset & Export
  resetToSampleData: () => void;
  exportDatabaseSql: () => void;
  exportPowerBiCsvs: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'smart_retail_data_v1';

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load state or defaults
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_users`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        return INITIAL_USERS;
      }
    }
    return INITIAL_USERS;
  });
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_users`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed[0];
        }
      } catch (e) {
        return INITIAL_USERS[0];
      }
    }
    return INITIAL_USERS[0]; // Admin (Store Owner) by default
  });
  const [isLoginOpen, setLoginOpen] = useState(false);
  // Default to false so that whenever the project runs, the Login Page is always shown first
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const [loginPortalType, setLoginPortalType] = useState<'admin' | 'sales_person'>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_portal`);
    return saved === 'sales_person' ? 'sales_person' : 'admin';
  });

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_portal`, loginPortalType);
  }, [loginPortalType]);

  useEffect(() => {
    // Clear any previous persistent auth flag so running the app always presents the Login Page first
    try {
      localStorage.removeItem(`${LOCAL_STORAGE_KEY}_auth`);
    } catch (e) {
      // Ignore
    }
  }, []);

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_categories`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 15) {
          return parsed.map((c: any) => ({ ...c, status: c.status || 'active' }));
        }
      } catch (e) {
        return INITIAL_CATEGORIES;
      }
    }
    return INITIAL_CATEGORIES;
  });

  const [brands, setBrands] = useState<Brand[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_brands`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 20) {
          return parsed.map((b: any) => ({ ...b, status: b.status || 'active' }));
        }
      } catch (e) {
        return INITIAL_BRANDS;
      }
    }
    return INITIAL_BRANDS;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_products`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 25) {
          return parsed;
        }
      } catch (e) {
        return INITIAL_PRODUCTS;
      }
    }
    return INITIAL_PRODUCTS;
  });

  const [offers, setOffers] = useState<Offer[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_offers`);
    return saved ? JSON.parse(saved) : INITIAL_OFFERS;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_customers`);
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  const [sales, setSales] = useState<Sale[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_sales`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((s: any) => {
            if (s.gst_rate === undefined || s.gst_amount === undefined) {
              const rate = 5;
              const gstAmt = Math.round(((s.subtotal || 0) * rate) / 100 * 100) / 100;
              return {
                ...s,
                gst_rate: rate,
                gst_amount: gstAmt,
                total_amount: Math.round(((s.subtotal || 0) - (s.discount || 0) + gstAmt) * 100) / 100,
              };
            }
            return s;
          });
        }
      } catch (e) {
        return INITIAL_SALES;
      }
    }
    return INITIAL_SALES;
  });

  const [saleItems, setSaleItems] = useState<SaleItem[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_sale_items`);
    return saved ? JSON.parse(saved) : INITIAL_SALE_ITEMS;
  });

  const [gstRate, setGstRate] = useState<number>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_gst_rate`);
    if (saved !== null) {
      const parsed = parseFloat(saved);
      if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) {
        return parsed;
      }
    }
    return 5; // Default 5% GST
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeCustomer, setActiveCustomer] = useState<Customer | null>(null);
  const [lastGeneratedSale, setLastGeneratedSale] = useState<{
    sale: Sale;
    items: SaleItem[];
    customer: Customer;
    user: User;
  } | null>(null);

  const updateGstRate = (newRate: number): { success: boolean; message: string } => {
    if (currentUser.role !== 'admin') {
      return {
        success: false,
        message: 'Access Denied: Only Admin can modify the store GST percentage.',
      };
    }
    const cleanRate = Math.max(0, Math.min(100, Math.round(newRate * 100) / 100));
    setGstRate(cleanRate);
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_gst_rate`, cleanRate.toString());
    return {
      success: true,
      message: `GST rate updated to ${cleanRate}%.`,
    };
  };

  // Persistence to localStorage
  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_gst_rate`, gstRate.toString());
  }, [gstRate]);
  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_categories`, JSON.stringify(categories));
  }, [categories]);
  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_brands`, JSON.stringify(brands));
  }, [brands]);
  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_products`, JSON.stringify(products));
  }, [products]);
  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_offers`, JSON.stringify(offers));
  }, [offers]);
  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_customers`, JSON.stringify(customers));
  }, [customers]);
  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_sales`, JSON.stringify(sales));
  }, [sales]);
  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_sale_items`, JSON.stringify(saleItems));
  }, [saleItems]);
  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_users`, JSON.stringify(users));
  }, [users]);

  // User & Staff Management (Admin Only Access)
  const addUser = (userData: Omit<User, 'user_id'>): User => {
    if (currentUser.role !== 'admin') {
      throw new Error('Access Denied: Only Administrator login has access to add sales persons.');
    }
    const newId = users.length > 0 ? Math.max(...users.map((u) => u.user_id)) + 1 : 1;
    const newUser: User = {
      ...userData,
      user_id: newId,
      status: userData.status || 'active',
      role: userData.role || 'sales_person',
      shift: userData.shift || 'General',
      counter_no: userData.counter_no || `Counter ${newId}`,
      created_at: new Date().toISOString().split('T')[0],
    };
    setUsers((prev) => [...prev, newUser]);
    return newUser;
  };

  const updateUser = (userId: number, userData: Partial<User>) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.user_id === userId) {
          const updated = { ...u, ...userData };
          if (currentUser.user_id === userId) {
            setCurrentUser(updated);
          }
          return updated;
        }
        return u;
      })
    );
  };

  const toggleUserStatus = (userId: number) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.user_id === userId) {
          const nextStatus = u.status === 'active' ? 'inactive' : 'active';
          const updated = { ...u, status: nextStatus as 'active' | 'inactive' };
          if (currentUser.user_id === userId) {
            setCurrentUser(updated);
          }
          return updated;
        }
        return u;
      })
    );
  };

  const deleteUser = (userId: number): { success: boolean; message: string } => {
    const targetUser = users.find((u) => u.user_id === userId);
    if (!targetUser) {
      return { success: false, message: 'User not found in system.' };
    }

    if (users.length <= 1) {
      return { success: false, message: 'Cannot delete the only remaining staff account in the system.' };
    }

    // If deleting the currently logged-in user, switch session to another active user first
    if (userId === currentUser.user_id) {
      const nextUser =
        users.find((u) => u.user_id !== userId && u.status !== 'inactive') ||
        users.find((u) => u.user_id !== userId);
      if (nextUser) {
        setCurrentUser(nextUser);
      }
    }

    // Reassign existing invoices to the store admin or surviving account to keep financial totals intact
    const fallbackUser =
      users.find((u) => u.user_id !== userId && (u.role === 'admin' || u.role === 'owner')) ||
      users.find((u) => u.user_id !== userId);

    if (fallbackUser) {
      setSales((prev) =>
        prev.map((s) => (s.user_id === userId ? { ...s, user_id: fallbackUser.user_id } : s))
      );
    }

    setUsers((prev) => prev.filter((u) => u.user_id !== userId));
    return {
      success: true,
      message: `${targetUser.role === 'admin' ? 'Administrator' : 'Sales Person'} "${targetUser.name}" was successfully deleted.`,
    };
  };

  const switchUser = (userId: number) => {
    // Staff users must NOT be allowed to switch between Staff and Admin accounts
    if (currentUser.role !== 'admin') {
      return;
    }
    const user = users.find((u) => u.user_id === userId);
    if (user) {
      setCurrentUser(user);
      setIsAuthenticated(true);
      if (user.role === 'sales_person') {
        setActiveTab('billing');
      }
    }
  };

  const switchRole = (role: UserRole) => {
    // Staff must NOT be able to switch their role to Admin
    if (currentUser.role !== 'admin') {
      return;
    }
    const targetRole = role === 'owner' ? 'admin' : role;
    const user =
      users.find((u) => (u.role === targetRole || u.role === role) && u.status !== 'inactive') ||
      users[0];
    setCurrentUser(user);
    setIsAuthenticated(true);
    if (targetRole === 'sales_person') {
      setActiveTab('billing');
    }
  };

  const loginAsAdmin = (username: string, password?: string): { success: boolean; message: string } => {
    const cleanUsername = username.toLowerCase().trim();
    if (!cleanUsername) {
      return { success: false, message: 'Please enter your administrator username.' };
    }

    let user = users.find((u) => u.username.toLowerCase() === cleanUsername);

    if (!user) {
      if (cleanUsername === 'admin' || cleanUsername === 'owner') {
        user = users.find((u) => u.role === 'admin' && u.status !== 'inactive');
      }
    }

    if (!user) {
      return { success: false, message: `Administrator username "${username}" not found in system.` };
    }

    if (user.status === 'inactive') {
      return { success: false, message: 'This administrator account is deactivated. Contact store owner.' };
    }

    if (user.role !== 'admin') {
      return {
        success: false,
        message: `Access Denied: "${user.name}" is registered as a Sales Person. Please use the dedicated Sales Person Login Page.`,
      };
    }

    if (password && user.password && user.password !== password) {
      return { success: false, message: 'Incorrect administrator password.' };
    }

    setCurrentUser(user);
    setIsAuthenticated(true);
    setLoginPortalType('admin');
    setLoginOpen(false);
    setActiveTab('dashboard');
    return { success: true, message: `Welcome, ${user.name}! Administrator session started.` };
  };

  const loginAsSalesPerson = (
    username: string,
    password?: string,
    counterNo?: string
  ): { success: boolean; message: string } => {
    const cleanUsername = username.toLowerCase().trim();
    if (!cleanUsername) {
      return { success: false, message: 'Please enter your sales person username or select a cashier.' };
    }

    let user = users.find((u) => u.username.toLowerCase() === cleanUsername);

    if (!user) {
      if (cleanUsername === 'sales' || cleanUsername === 'cashier' || cleanUsername === 'salesperson') {
        user = users.find((u) => u.role === 'sales_person' && u.status !== 'inactive');
      }
    }

    if (!user) {
      return { success: false, message: `Sales person account "${username}" not found in staff roster.` };
    }

    if (user.status === 'inactive') {
      return {
        success: false,
        message: `Account "${user.name}" is deactivated. Please contact the Store Administrator to reactivate.`,
      };
    }

    if (user.role === 'admin') {
      return {
        success: false,
        message: `Notice: "${user.name}" is a Store Administrator. Please sign in via the dedicated Admin Login Page.`,
      };
    }

    if (password && user.password && user.password !== password) {
      return { success: false, message: 'Incorrect PIN / password for this sales person.' };
    }

    const assignedCounter = counterNo || user.counter_no || 'Counter 1';
    const updatedUser: User = { ...user, counter_no: assignedCounter };

    if (counterNo && user.counter_no !== counterNo) {
      setUsers((prev) => prev.map((u) => (u.user_id === user!.user_id ? updatedUser : u)));
    }

    setCurrentUser(updatedUser);
    setIsAuthenticated(true);
    setLoginPortalType('sales_person');
    setLoginOpen(false);
    setActiveTab('billing'); // Redirect directly to POS Billing counter!
    return {
      success: true,
      message: `Welcome, ${user.name}! POS Billing Terminal ready at ${assignedCounter}.`,
    };
  };

  const loginUser = (username: string, password?: string): boolean => {
    const resAdmin = loginAsAdmin(username, password);
    if (resAdmin.success) return true;
    const resSales = loginAsSalesPerson(username, password);
    return resSales.success;
  };

  const logoutUser = () => {
    setIsAuthenticated(false);
    try {
      localStorage.removeItem(`${LOCAL_STORAGE_KEY}_auth`);
    } catch (e) {
      // Ignore
    }
    setLoginOpen(false);
  };

  // Check offer for a product: returns the best active offer (product-specific first, then store-wide)
  const getActiveOfferForProduct = (productId: number): Offer | undefined => {
    const today = new Date().toISOString().split('T')[0];

    // 1. Check for product-specific active offer
    const productOffer = offers.find(
      (o) =>
        o.product_id === productId &&
        o.status === 'active' &&
        (!o.start_date || o.start_date <= today) &&
        (!o.end_date || o.end_date >= today)
    );
    if (productOffer) return productOffer;

    // 2. Check for store-wide active offer (product_id is null or undefined)
    const storeWideOffer = offers.find(
      (o) =>
        (o.product_id === null || o.product_id === undefined) &&
        o.status === 'active' &&
        (!o.start_date || o.start_date <= today) &&
        (!o.end_date || o.end_date >= today)
    );
    return storeWideOffer;
  };

  // Automatically recalculate cart discounts and totals whenever offers change so ANY new offer is IMMEDIATELY applicable in active billing sessions!
  useEffect(() => {
    if (cart.length === 0) return;
    setCart((prevCart) =>
      prevCart.map((item) => {
        const offer = getActiveOfferForProduct(item.product.product_id);
        const discountPerUnit = offer
          ? (item.product.selling_price * offer.discount_percentage) / 100
          : 0;
        const totalAmount = (item.unit_selling - discountPerUnit) * item.quantity;
        const totalProfit =
          (item.unit_selling - discountPerUnit - item.unit_cost) * item.quantity;
        return {
          ...item,
          applied_offer: offer,
          discount_per_unit: discountPerUnit,
          total_amount: totalAmount,
          total_profit: totalProfit,
        };
      })
    );
  }, [offers]);

  // Find customers based on purchase history for targeted WhatsApp offer notifications
  const getTargetCustomersForOffer = (
    offer: Offer
  ): { customer: Customer; purchaseCount: number; lastBought?: string }[] => {
    const results: { customer: Customer; purchaseCount: number; lastBought?: string }[] = [];

    customers.forEach((c) => {
      const custSales = sales.filter((s) => s.customer_id === c.customer_id);
      const custSaleIds = new Set(custSales.map((s) => s.sale_id));

      if (offer.product_id) {
        // Find customers who purchased this specific product
        const matchedItems = saleItems.filter(
          (si) => custSaleIds.has(si.sale_id) && si.product_id === offer.product_id
        );
        if (matchedItems.length > 0) {
          const totalQty = matchedItems.reduce((acc, it) => acc + it.quantity, 0);
          const lastSale = custSales.sort((a, b) => b.sale_id - a.sale_id)[0];
          results.push({
            customer: c,
            purchaseCount: totalQty,
            lastBought: lastSale?.sale_date,
          });
        }
      } else {
        // Store-wide offer: target customers with previous purchase history
        const totalPurchases = custSales.length;
        if (totalPurchases > 0) {
          const lastSale = custSales.sort((a, b) => b.sale_id - a.sale_id)[0];
          results.push({
            customer: c,
            purchaseCount: totalPurchases,
            lastBought: lastSale?.sale_date,
          });
        }
      }
    });

    return results;
  };

  // Cart actions
  const addToCartByBarcode = (barcode: string, qty = 1): { success: boolean; message: string } => {
    const cleanBarcode = barcode.trim();
    if (!cleanBarcode) {
      return { success: false, message: 'Please enter or scan a barcode.' };
    }

    const prod = products.find(
      (p) => p.barcode === cleanBarcode && p.status === 'active'
    );

    if (!prod) {
      return { success: false, message: `No active product found with barcode "${cleanBarcode}".` };
    }

    const unit = prod.unit || 'Piece';
    const normalizedQty =
      unit === 'Piece'
        ? Math.max(1, Math.round(qty))
        : Math.max(0.01, Math.round(qty * 1000) / 1000);

    const existingCartItem = cart.find((item) => item.product.product_id === prod.product_id);
    const totalRequestedQty = Math.round(((existingCartItem?.quantity || 0) + normalizedQty) * 1000) / 1000;

    if (prod.stock < totalRequestedQty) {
      return {
        success: false,
        message: `Insufficient stock for "${prod.product_name}". Available stock: ${prod.stock} ${unit} (Requested: ${totalRequestedQty} ${unit})`,
      };
    }

    const offer = getActiveOfferForProduct(prod.product_id);
    let discountPerUnit = 0;
    if (offer) {
      discountPerUnit = (prod.selling_price * offer.discount_percentage) / 100;
    }

    setCart((prevCart) => {
      const existingIdx = prevCart.findIndex((item) => item.product.product_id === prod.product_id);
      if (existingIdx > -1) {
        const item = prevCart[existingIdx];
        const newQty =
          unit === 'Piece'
            ? Math.round(item.quantity + normalizedQty)
            : Math.round((item.quantity + normalizedQty) * 1000) / 1000;
        const totalAmount = Math.round((item.unit_selling - item.discount_per_unit) * newQty * 100) / 100;
        const totalProfit = Math.round((item.unit_selling - item.discount_per_unit - item.unit_cost) * newQty * 100) / 100;

        const updated = [...prevCart];
        updated[existingIdx] = {
          ...item,
          product: prod,
          quantity: newQty,
          total_amount: totalAmount,
          total_profit: totalProfit,
        };
        return updated;
      } else {
        const totalAmount = Math.round((prod.selling_price - discountPerUnit) * normalizedQty * 100) / 100;
        const totalProfit = Math.round((prod.selling_price - discountPerUnit - prod.cost_price) * normalizedQty * 100) / 100;
        return [
          ...prevCart,
          {
            product: prod,
            quantity: normalizedQty,
            unit_cost: prod.cost_price,
            unit_regular: prod.regular_price,
            unit_selling: prod.selling_price,
            discount_per_unit: discountPerUnit,
            applied_offer: offer,
            total_amount: totalAmount,
            total_profit: totalProfit,
          },
        ];
      }
    });

    const addedCost = Math.round((prod.selling_price - discountPerUnit) * normalizedQty * 100) / 100;
    return {
      success: true,
      message: `Added ${normalizedQty} ${unit} of "${prod.product_name}" (₹${prod.selling_price}/${unit} = ₹${addedCost.toFixed(2)}) to bill.`,
    };
  };

  const addToCartByProductId = (productId: number, qty: number = 1): { success: boolean; message: string } => {
    const prod = products.find((p) => p.product_id === productId);
    if (!prod) {
      return { success: false, message: 'Product not found in catalog.' };
    }
    return addToCartByBarcode(prod.barcode, qty);
  };

  const updateCartQuantity = (productId: number, qty: number) => {
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }

    const currentProd = products.find((p) => p.product_id === productId);
    const unit = currentProd?.unit || 'Piece';
    const maxStock = currentProd ? currentProd.stock : Infinity;

    let normalizedQty =
      unit === 'Piece'
        ? Math.max(1, Math.round(qty))
        : Math.max(0.01, Math.round(qty * 1000) / 1000);

    if (normalizedQty > maxStock) {
      normalizedQty = maxStock;
    }

    if (normalizedQty <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart((prev) =>
      prev.map((item) => {
        if (item.product.product_id === productId) {
          const totalAmount = Math.round((item.unit_selling - item.discount_per_unit) * normalizedQty * 100) / 100;
          const totalProfit = Math.round((item.unit_selling - item.discount_per_unit - item.unit_cost) * normalizedQty * 100) / 100;
          return {
            ...item,
            product: currentProd || item.product,
            quantity: normalizedQty,
            total_amount: totalAmount,
            total_profit: totalProfit,
          };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId: number) => {
    setCart((prev) => prev.filter((item) => item.product.product_id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const lookupOrCreateCustomer = (mobile: string, name?: string): Customer => {
    const trimmedMobile = mobile.trim();
    const existing = customers.find((c) => c.mobile === trimmedMobile);
    if (existing) {
      if (name && name.trim() && existing.name !== name.trim()) {
        // optionally update name
        const updated = { ...existing, name: name.trim() };
        setCustomers((prev) => prev.map((c) => (c.customer_id === existing.customer_id ? updated : c)));
        return updated;
      }
      return existing;
    }

    const newCustomer: Customer = {
      customer_id: customers.length > 0 ? Math.max(...customers.map((c) => c.customer_id)) + 1 : 1,
      name: name && name.trim() ? name.trim() : 'Walk-in Shopper',
      mobile: trimmedMobile,
      loyalty_points: 20, // Welcome points
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    setCustomers((prev) => [...prev, newCustomer]);
    return newCustomer;
  };

  const addNewCustomer = (customerData: {
    name: string;
    mobile: string;
    email?: string;
    address?: string;
    loyalty_points?: number;
  }): Customer => {
    const trimmedMobile = customerData.mobile.trim();
    const existing = customers.find((c) => c.mobile === trimmedMobile);
    if (existing) {
      const updated: Customer = {
        ...existing,
        name: customerData.name.trim() || existing.name,
        email: customerData.email?.trim() || existing.email,
        address: customerData.address?.trim() || existing.address,
        loyalty_points: customerData.loyalty_points !== undefined ? customerData.loyalty_points : (existing.loyalty_points || 0),
      };
      setCustomers((prev) => prev.map((c) => (c.customer_id === existing.customer_id ? updated : c)));
      setActiveCustomer(updated);
      return updated;
    }

    const newId = customers.length > 0 ? Math.max(...customers.map((c) => c.customer_id)) + 1 : 1;
    const newCust: Customer = {
      customer_id: newId,
      name: customerData.name.trim() || 'Valued Customer',
      mobile: trimmedMobile,
      email: customerData.email?.trim(),
      address: customerData.address?.trim(),
      loyalty_points: customerData.loyalty_points !== undefined ? customerData.loyalty_points : 50, // 50 Welcome bonus points
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    setCustomers((prev) => [...prev, newCust]);
    setActiveCustomer(newCust);
    return newCust;
  };

  const completeSale = (
    paymentMethod: 'Cash' | 'UPI' | 'Card',
    loyaltyPointsRedeemed: number = 0,
    loyaltyDiscountAmount: number = 0
  ): { success: boolean; saleId?: number; message?: string } => {
    if (cart.length === 0) {
      return { success: false, message: 'Cart is empty. Please scan items before billing.' };
    }

    if (!activeCustomer) {
      return { success: false, message: 'Customer mobile number is required.' };
    }

    // Check stock availability
    for (const item of cart) {
      const currentProd = products.find((p) => p.product_id === item.product.product_id);
      const unit = currentProd?.unit || 'Piece';
      if (!currentProd || currentProd.stock < item.quantity) {
        return {
          success: false,
          message: `Stock error: Insufficient stock for ${item.product.product_name}. Available: ${currentProd?.stock || 0} ${unit}`,
        };
      }
    }

    // 1. Calculate financial aggregates
    let subtotal = 0;
    let totalDiscount = 0;
    let totalAmount = 0;

    cart.forEach((item) => {
      subtotal += item.unit_selling * item.quantity;
      totalDiscount += item.discount_per_unit * item.quantity;
      totalAmount += item.total_amount;
    });

    // Apply loyalty discount if any
    if (loyaltyDiscountAmount > 0) {
      totalDiscount += loyaltyDiscountAmount;
      totalAmount = Math.max(0, totalAmount - loyaltyDiscountAmount);
    }

    // Automatically calculate GST amount from the subtotal
    const gstAmount = Math.round(((subtotal * gstRate) / 100) * 100) / 100;
    const grandTotal = Math.max(0, Math.round((totalAmount + gstAmount) * 100) / 100);

    const newSaleId = sales.length > 0 ? Math.max(...sales.map((s) => s.sale_id)) + 1 : 1001;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const newSale: Sale = {
      sale_id: newSaleId,
      customer_id: activeCustomer.customer_id,
      user_id: currentUser.user_id,
      sale_date: now,
      subtotal: Math.round(subtotal * 100) / 100,
      discount: Math.round(totalDiscount * 100) / 100,
      gst_rate: gstRate,
      gst_amount: gstAmount,
      total_amount: grandTotal,
      payment_method: paymentMethod,
    };

    // 2. Generate line items with locked cost and selling prices
    let startItemId = saleItems.length > 0 ? Math.max(...saleItems.map((si) => si.sale_item_id)) + 1 : 1;
    const newItems: SaleItem[] = cart.map((item) => {
      const itemRecord: SaleItem = {
        sale_item_id: startItemId++,
        sale_id: newSaleId,
        product_id: item.product.product_id,
        quantity: item.quantity,
        cost_price: item.unit_cost,
        regular_price: item.unit_regular,
        selling_price: item.unit_selling,
        discount: item.discount_per_unit,
        amount: Math.round(item.total_amount * 100) / 100,
        profit: Math.round(item.total_profit * 100) / 100,
      };
      return itemRecord;
    });

    // 3. Atomically update inventory (handles decimal quantities for Kg/Litre and whole numbers for Piece)
    setProducts((prev) =>
      prev.map((p) => {
        const cartMatch = cart.find((item) => item.product.product_id === p.product_id);
        if (cartMatch) {
          const remainingStock = Math.max(0, Math.round((p.stock - cartMatch.quantity) * 1000) / 1000);
          return { ...p, stock: remainingStock };
        }
        return p;
      })
    );

    // 4. Save sale and items
    setSales((prev) => [newSale, ...prev]);
    setSaleItems((prev) => [...prev, ...newItems]);

    // 5. Update customer loyalty points (1 point per ₹100 spent)
    const earnedPoints = Math.max(1, Math.floor(grandTotal / 100));
    const currentCustomer = activeCustomer;
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.customer_id === currentCustomer.customer_id) {
          const currentPts = c.loyalty_points || 0;
          const updatedPts = Math.max(0, currentPts + earnedPoints - (loyaltyPointsRedeemed || 0));
          return { ...c, loyalty_points: updatedPts };
        }
        return c;
      })
    );

    // 6. Set printable invoice
    setLastGeneratedSale({
      sale: newSale,
      items: newItems,
      customer: {
        ...activeCustomer,
        loyalty_points: Math.max(
          0,
          (activeCustomer.loyalty_points || 0) + earnedPoints - (loyaltyPointsRedeemed || 0)
        ),
      },
      user: currentUser,
    });

    // Clear cart
    setCart([]);

    return { success: true, saleId: newSaleId };
  };

  const dismissInvoice = () => {
    setLastGeneratedSale(null);
  };

  const reprintSale = (saleId: number) => {
    const sale = sales.find((s) => s.sale_id === saleId);
    if (!sale) return;
    const items = saleItems.filter((si) => si.sale_id === saleId);
    const customer = customers.find((c) => c.customer_id === sale.customer_id) || {
      customer_id: sale.customer_id,
      name: 'Customer',
      mobile: 'N/A',
      created_at: '',
    };
    const user = users.find((u) => u.user_id === sale.user_id) || currentUser;

    setLastGeneratedSale({
      sale,
      items,
      customer,
      user,
    });
  };

  const removeSaleItem = (saleId: number, saleItemId: number): { success: boolean; message: string } => {
    const itemToRemove = saleItems.find((si) => si.sale_id === saleId && si.sale_item_id === saleItemId);
    if (!itemToRemove) {
      return { success: false, message: 'Item not found in this bill.' };
    }

    const prod = products.find((p) => p.product_id === itemToRemove.product_id);
    const prodName = prod?.product_name || `Product #${itemToRemove.product_id}`;
    const prodUnit = prod?.unit || 'Piece';

    // 1. Restore product inventory stock (+quantity)
    setProducts((prev) =>
      prev.map((p) =>
        p.product_id === itemToRemove.product_id
          ? { ...p, stock: Math.round((p.stock + itemToRemove.quantity) * 1000) / 1000 }
          : p
      )
    );

    // 2. Filter out item
    const remainingItemsForSale = saleItems.filter(
      (si) => si.sale_id === saleId && si.sale_item_id !== saleItemId
    );
    setSaleItems((prev) => prev.filter((si) => si.sale_item_id !== saleItemId));

    // 3. If no items left in this sale, delete the entire bill
    if (remainingItemsForSale.length === 0) {
      setSales((prev) => prev.filter((s) => s.sale_id !== saleId));
      return {
        success: true,
        message: `Removed last item "${prodName}". Bill #${saleId} has been voided and ${itemToRemove.quantity} ${prodUnit} returned to inventory.`,
      };
    }

    // 4. Recalculate sale subtotal, discount, GST, and total_amount
    let newSubtotal = 0;
    let newDiscount = 0;
    let newNetBeforeTax = 0;
    remainingItemsForSale.forEach((si) => {
      newSubtotal += si.selling_price * si.quantity;
      newDiscount += si.discount * si.quantity;
      newNetBeforeTax += si.amount;
    });

    const targetSale = sales.find((s) => s.sale_id === saleId);
    const saleGstRate = targetSale?.gst_rate ?? gstRate;
    const newGstAmount = Math.round(((newSubtotal * saleGstRate) / 100) * 100) / 100;
    const newTotal = Math.max(0, Math.round((newNetBeforeTax + newGstAmount) * 100) / 100);

    setSales((prev) =>
      prev.map((s) => {
        if (s.sale_id === saleId) {
          return {
            ...s,
            subtotal: Math.round(newSubtotal * 100) / 100,
            discount: Math.round(newDiscount * 100) / 100,
            gst_rate: saleGstRate,
            gst_amount: newGstAmount,
            total_amount: newTotal,
          };
        }
        return s;
      })
    );

    return {
      success: true,
      message: `Item "${prodName}" removed from Bill #${saleId}. Updated total: ₹${newTotal.toFixed(2)} (Stock +${itemToRemove.quantity} ${prodUnit} restored).`,
    };
  };

  const voidSale = (saleId: number): { success: boolean; message: string } => {
    const itemsForSale = saleItems.filter((si) => si.sale_id === saleId);
    itemsForSale.forEach((si) => {
      setProducts((prev) =>
        prev.map((p) =>
          p.product_id === si.product_id
            ? { ...p, stock: Math.round((p.stock + si.quantity) * 1000) / 1000 }
            : p
        )
      );
    });
    setSaleItems((prev) => prev.filter((si) => si.sale_id !== saleId));
    setSales((prev) => prev.filter((s) => s.sale_id !== saleId));
    return { success: true, message: `Bill #${saleId} cancelled and all items restored to stock.` };
  };

  // Product CRUD (Admin Only)
  const addProduct = (prod: Omit<Product, 'product_id'>) => {
    if (currentUser.role !== 'admin') return;
    const newId = products.length > 0 ? Math.max(...products.map((p) => p.product_id)) + 1 : 1;
    const unit = prod.unit || 'Piece';
    const normalizedStock =
      unit === 'Piece' ? Math.max(0, Math.round(prod.stock)) : Math.max(0, Math.round(prod.stock * 1000) / 1000);
    const newProd: Product = { ...prod, unit, stock: normalizedStock, product_id: newId };
    setProducts((prev) => [newProd, ...prev]);
  };

  const updateProduct = (prod: Product) => {
    if (currentUser.role !== 'admin') return;
    const unit = prod.unit || 'Piece';
    const normalizedStock =
      unit === 'Piece' ? Math.max(0, Math.round(prod.stock)) : Math.max(0, Math.round(prod.stock * 1000) / 1000);
    const updatedProd: Product = { ...prod, unit, stock: normalizedStock };
    setProducts((prev) => prev.map((p) => (p.product_id === prod.product_id ? updatedProd : p)));
  };

  const updateProductPrice = (productId: number, cost: number, regular: number, selling: number) => {
    if (currentUser.role !== 'admin') return;
    setProducts((prev) =>
      prev.map((p) =>
        p.product_id === productId
          ? { ...p, cost_price: cost, regular_price: regular, selling_price: selling }
          : p
      )
    );
  };

  const updateProductStock = (productId: number, newStock: number) => {
    if (currentUser.role !== 'admin') return;
    setProducts((prev) =>
      prev.map((p) => (p.product_id === productId ? { ...p, stock: Math.max(0, newStock) } : p))
    );
  };

  const toggleProductStatus = (productId: number) => {
    if (currentUser.role !== 'admin') return;
    setProducts((prev) =>
      prev.map((p) =>
        p.product_id === productId
          ? { ...p, status: p.status === 'active' ? 'inactive' : 'active' }
          : p
      )
    );
  };

  const deleteProduct = (productId: number): { success: boolean; message: string } => {
    if (currentUser.role !== 'admin') {
      return { success: false, message: 'Access Denied: Only Admin can delete products.' };
    }
    const target = products.find((p) => p.product_id === productId);
    if (!target) {
      return { success: false, message: 'Product not found.' };
    }
    const salesCount = saleItems.filter((si) => si.product_id === productId).length;
    if (salesCount > 0) {
      // Product has historical sales - safely deactivate instead of hard delete to preserve sales history & accounting integrity
      setProducts((prev) =>
        prev.map((p) => (p.product_id === productId ? { ...p, status: 'inactive' } : p))
      );
      setCart((prev) => prev.filter((item) => item.product.product_id !== productId));
      return {
        success: true,
        message: `Product "${target.product_name}" is recorded in ${salesCount} completed sales transaction(s). To protect sales history, it has been safely marked as Inactive.`,
      };
    }
    setProducts((prev) => prev.filter((p) => p.product_id !== productId));
    setCart((prev) => prev.filter((item) => item.product.product_id !== productId));
    setOffers((prev) => prev.filter((o) => o.product_id !== productId));
    return {
      success: true,
      message: `Product "${target.product_name}" removed from catalog.`,
    };
  };

  // Category & Brand CRUD (Admin Only)
  const addCategory = (name: string, status: 'active' | 'inactive' = 'active'): Category => {
    const newId = categories.length > 0 ? Math.max(...categories.map((c) => c.category_id)) + 1 : 1;
    const newCat: Category = {
      category_id: newId,
      category_name: name.trim(),
      status,
    };
    if (currentUser.role === 'admin') {
      setCategories((prev) => [...prev, newCat]);
    }
    return newCat;
  };

  const updateCategory = (cat: Category) => {
    if (currentUser.role !== 'admin') return;
    setCategories((prev) => prev.map((c) => (c.category_id === cat.category_id ? cat : c)));
  };

  const toggleCategoryStatus = (categoryId: number) => {
    if (currentUser.role !== 'admin') return;
    setCategories((prev) =>
      prev.map((c) =>
        c.category_id === categoryId
          ? { ...c, status: c.status === 'active' ? 'inactive' : 'active' }
          : c
      )
    );
  };

  const activateAllCategories = () => {
    if (currentUser.role !== 'admin') return;
    setCategories((prev) => prev.map((c) => ({ ...c, status: 'active' })));
  };

  const deleteCategory = (categoryId: number): { success: boolean; message: string } => {
    if (currentUser.role !== 'admin') {
      return { success: false, message: 'Access Denied: Only Admin can delete categories.' };
    }
    const attachedProds = products.filter((p) => p.category_id === categoryId);
    if (attachedProds.length > 0) {
      return {
        success: false,
        message: `Cannot delete "${categories.find((c) => c.category_id === categoryId)?.category_name}": ${attachedProds.length} product(s) are categorized under it. Please toggle its status to Inactive instead to maintain billing and historical integrity.`,
      };
    }
    setCategories((prev) => prev.filter((c) => c.category_id !== categoryId));
    return { success: true, message: 'Category removed successfully.' };
  };

  const addBrand = (name: string, status: 'active' | 'inactive' = 'active'): Brand => {
    const newId = brands.length > 0 ? Math.max(...brands.map((b) => b.brand_id)) + 1 : 1;
    const newB: Brand = {
      brand_id: newId,
      brand_name: name.trim(),
      status,
    };
    if (currentUser.role === 'admin') {
      setBrands((prev) => [...prev, newB]);
    }
    return newB;
  };

  const updateBrand = (b: Brand) => {
    if (currentUser.role !== 'admin') return;
    setBrands((prev) => prev.map((item) => (item.brand_id === b.brand_id ? b : item)));
  };

  const toggleBrandStatus = (brandId: number) => {
    if (currentUser.role !== 'admin') return;
    setBrands((prev) =>
      prev.map((b) =>
        b.brand_id === brandId
          ? { ...b, status: b.status === 'active' ? 'inactive' : 'active' }
          : b
      )
    );
  };

  const activateAllBrands = () => {
    if (currentUser.role !== 'admin') return;
    setBrands((prev) => prev.map((b) => ({ ...b, status: 'active' })));
  };

  const deleteBrand = (brandId: number): { success: boolean; message: string } => {
    if (currentUser.role !== 'admin') {
      return { success: false, message: 'Access Denied: Only Admin can delete brands.' };
    }
    const attachedProds = products.filter((p) => p.brand_id === brandId);
    if (attachedProds.length > 0) {
      return {
        success: false,
        message: `Cannot delete "${brands.find((b) => b.brand_id === brandId)?.brand_name}": ${attachedProds.length} product(s) are assigned to this brand. Please toggle its status to Inactive instead.`,
      };
    }
    setBrands((prev) => prev.filter((b) => b.brand_id !== brandId));
    return { success: true, message: 'Brand removed successfully.' };
  };

  // Offers (Admin Only)
  const addOffer = (offer: Omit<Offer, 'offer_id'>): Offer => {
    const newId = offers.length > 0 ? Math.max(...offers.map((o) => o.offer_id)) + 1 : 1;
    const newOffer: Offer = {
      ...offer,
      offer_id: newId,
      status: offer.status || 'active',
      start_date: offer.start_date || new Date().toISOString().split('T')[0],
      end_date: offer.end_date || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    };
    if (currentUser.role === 'admin') {
      setOffers((prev) => [newOffer, ...prev]);
    }
    return newOffer;
  };

  const updateOffer = (updatedOffer: Offer) => {
    if (currentUser.role !== 'admin') return;
    setOffers((prev) =>
      prev.map((o) => (o.offer_id === updatedOffer.offer_id ? updatedOffer : o))
    );
  };

  const toggleOfferStatus = (offerId: number) => {
    if (currentUser.role !== 'admin') return;
    setOffers((prev) =>
      prev.map((o) =>
        o.offer_id === offerId ? { ...o, status: o.status === 'active' ? 'inactive' : 'active' } : o
      )
    );
  };

  const deleteOffer = (offerId: number) => {
    if (currentUser.role !== 'admin') return;
    setOffers((prev) => prev.filter((o) => o.offer_id !== offerId));
  };

  // Reset to default
  const resetToSampleData = () => {
    if (window.confirm('Reset supermarket database back to original sample data? Any new bills will be cleared.')) {
      setUsers(INITIAL_USERS);
      setCurrentUser(INITIAL_USERS[0]);
      setCategories(INITIAL_CATEGORIES);
      setBrands(INITIAL_BRANDS);
      setProducts(INITIAL_PRODUCTS);
      setOffers(INITIAL_OFFERS);
      setCustomers(INITIAL_CUSTOMERS);
      setSales(INITIAL_SALES);
      setSaleItems(INITIAL_SALE_ITEMS);
      setGstRate(5);
      setCart([]);
      setActiveCustomer(null);
      setLastGeneratedSale(null);
      localStorage.clear();
    }
  };

  // SQL Exporter
  const exportDatabaseSql = () => {
    let sql = `-- Smart Retail Database Export (MySQL Dump)\n-- Generated at: ${new Date().toISOString()}\n\n`;
    sql += `CREATE DATABASE IF NOT EXISTS \`smart_retail\`;\nUSE \`smart_retail\`;\n\n`;

    // Dump Users / Staff
    sql += `-- Staff & Sales Personnel\n`;
    sql += `INSERT INTO \`users\` (\`user_id\`, \`username\`, \`role\`, \`name\`, \`mobile\`, \`status\`, \`shift\`, \`counter_no\`) VALUES\n`;
    sql += users
      .map(
        (u) =>
          `(${u.user_id}, '${u.username}', '${u.role}', '${u.name.replace(/'/g, "\\'")}', '${u.mobile || ''}', '${u.status || 'active'}', '${u.shift || 'General'}', '${u.counter_no || ''}')`
      )
      .join(',\n') + ';\n\n';

    // Dump Categories
    sql += `-- Categories\n`;
    sql += `INSERT INTO \`categories\` (\`category_id\`, \`category_name\`, \`status\`) VALUES\n`;
    sql += categories
      .map((c) => `(${c.category_id}, '${c.category_name.replace(/'/g, "\\'")}', '${c.status}')`)
      .join(',\n') + ';\n\n';

    // Dump Brands
    sql += `-- Brands\n`;
    sql += `INSERT INTO \`brands\` (\`brand_id\`, \`brand_name\`, \`status\`) VALUES\n`;
    sql += brands
      .map((b) => `(${b.brand_id}, '${b.brand_name.replace(/'/g, "\\'")}', '${b.status}')`)
      .join(',\n') + ';\n\n';

    // Dump Customers
    sql += `-- Customers\n`;
    sql += `INSERT INTO \`customers\` (\`customer_id\`, \`name\`, \`mobile\`, \`created_at\`) VALUES\n`;
    sql += customers
      .map(
        (c) =>
          `(${c.customer_id}, '${c.name.replace(/'/g, "\\'")}', '${c.mobile}', '${c.created_at}')`
      )
      .join(',\n') + ';\n\n';

    // Dump Products
    sql += `-- Products\n`;
    sql += `INSERT INTO \`products\` (\`product_id\`, \`product_name\`, \`barcode\`, \`category_id\`, \`brand_id\`, \`unit\`, \`cost_price\`, \`regular_price\`, \`selling_price\`, \`stock\`, \`reorder_level\`, \`status\`) VALUES\n`;
    sql += products
      .map(
        (p) =>
          `(${p.product_id}, '${p.product_name.replace(/'/g, "\\'")}', '${p.barcode}', ${p.category_id}, ${p.brand_id}, '${p.unit || 'Piece'}', ${p.cost_price.toFixed(2)}, ${p.regular_price.toFixed(2)}, ${p.selling_price.toFixed(2)}, ${p.stock}, ${p.reorder_level}, '${p.status}')`
      )
      .join(',\n') + ';\n\n';

    // Dump Sales
    sql += `-- Sales\n`;
    sql += `INSERT INTO \`sales\` (\`sale_id\`, \`customer_id\`, \`user_id\`, \`sale_date\`, \`subtotal\`, \`discount\`, \`gst_rate\`, \`gst_amount\`, \`total_amount\`, \`payment_method\`) VALUES\n`;
    sql += sales
      .map(
        (s) =>
          `(${s.sale_id}, ${s.customer_id}, ${s.user_id}, '${s.sale_date}', ${s.subtotal.toFixed(2)}, ${s.discount.toFixed(2)}, ${(s.gst_rate ?? 5).toFixed(2)}, ${(s.gst_amount ?? 0).toFixed(2)}, ${s.total_amount.toFixed(2)}, '${s.payment_method}')`
      )
      .join(',\n') + ';\n\n';

    // Dump Sale Items
    sql += `-- Sale Items\n`;
    sql += `INSERT INTO \`sale_items\` (\`sale_item_id\`, \`sale_id\`, \`product_id\`, \`quantity\`, \`cost_price\`, \`regular_price\`, \`selling_price\`, \`discount\`, \`amount\`, \`profit\`) VALUES\n`;
    sql += saleItems
      .map(
        (si) =>
          `(${si.sale_item_id}, ${si.sale_id}, ${si.product_id}, ${si.quantity}, ${si.cost_price.toFixed(2)}, ${si.regular_price.toFixed(2)}, ${si.selling_price.toFixed(2)}, ${si.discount.toFixed(2)}, ${si.amount.toFixed(2)}, ${si.profit.toFixed(2)})`
      )
      .join(',\n') + ';\n';

    const blob = new Blob([sql], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'smart_retail_export.sql';
    a.click();
    URL.revokeObjectURL(url);
  };

  // CSV Exporter for Power BI
  const exportPowerBiCsvs = () => {
    // 1. Fact_Sales.csv
    let factSalesCsv = 'sale_item_id,sale_id,sale_date,product_id,customer_id,user_id,quantity,cost_price,regular_price,selling_price,discount,amount,profit\n';
    saleItems.forEach((si) => {
      const sale = sales.find((s) => s.sale_id === si.sale_id);
      const date = sale ? sale.sale_date : '';
      const custId = sale ? sale.customer_id : '';
      const userId = sale ? sale.user_id : '';
      factSalesCsv += `${si.sale_item_id},${si.sale_id},"${date}",${si.product_id},${custId},${userId},${si.quantity},${si.cost_price},${si.regular_price},${si.selling_price},${si.discount},${si.amount},${si.profit}\n`;
    });

    const blob = new Blob([factSalesCsv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Fact_Sales.csv';
    a.click();
    URL.revokeObjectURL(url);

    // 2. Dim_Users.csv
    let dimUsersCsv = 'user_id,username,role,name,mobile,status,shift,counter_no\n';
    users.forEach((u) => {
      dimUsersCsv += `${u.user_id},"${u.username}","${u.role}","${u.name}","${u.mobile || ''}","${u.status || 'active'}","${u.shift || 'General'}","${u.counter_no || ''}"\n`;
    });
    const blobUsers = new Blob([dimUsersCsv], { type: 'text/csv' });
    const urlUsers = URL.createObjectURL(blobUsers);
    const aUsers = document.createElement('a');
    aUsers.href = urlUsers;
    aUsers.download = 'Dim_Users.csv';
    aUsers.click();
    URL.revokeObjectURL(urlUsers);
  };

  return (
    <StoreContext.Provider
      value={{
        currentUser,
        users,
        categories,
        brands,
        products,
        offers,
        customers,
        sales,
        saleItems,
        activeTab,
        cart,
        activeCustomer,
        gstRate,
        updateGstRate,
        lastGeneratedSale,
        isLoginOpen,
        setLoginOpen,
        isAuthenticated,
        loginPortalType,
        setLoginPortalType,
        setActiveTab,
        switchRole,
        loginUser,
        loginAsAdmin,
        loginAsSalesPerson,
        logoutUser,
        addUser,
        updateUser,
        toggleUserStatus,
        deleteUser,
        switchUser,
        addToCartByBarcode,
        addToCartByProductId,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        setActiveCustomer,
        lookupOrCreateCustomer,
        addNewCustomer,
        completeSale,
        dismissInvoice,
        reprintSale,
        removeSaleItem,
        voidSale,
        addProduct,
        updateProduct,
        updateProductPrice,
        updateProductStock,
        toggleProductStatus,
        deleteProduct,
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
        addOffer,
        updateOffer,
        toggleOfferStatus,
        deleteOffer,
        getActiveOfferForProduct,
        getTargetCustomersForOffer,
        resetToSampleData,
        exportDatabaseSql,
        exportPowerBiCsvs,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within StoreProvider');
  }
  return context;
};
