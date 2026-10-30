export type UserRole = 'admin' | 'sales_person' | 'owner';

export interface User {
  user_id: number;
  username: string;
  password?: string;
  role: UserRole;
  name: string;
  mobile?: string;
  status?: 'active' | 'inactive';
  shift?: 'Morning' | 'Evening' | 'General' | 'Night';
  counter_no?: string;
  created_at?: string;
}

export interface Customer {
  customer_id: number;
  name: string;
  mobile: string;
  email?: string;
  address?: string;
  loyalty_points?: number;
  created_at: string;
}

export interface Category {
  category_id: number;
  category_name: string;
  status: 'active' | 'inactive';
}

export interface Brand {
  brand_id: number;
  brand_name: string;
  status: 'active' | 'inactive';
}

export type ProductUnit = 'Kg' | 'Litre' | 'Piece';

export interface Product {
  product_id: number;
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
}

export interface Offer {
  offer_id: number;
  product_id: number | null;
  offer_name: string;
  discount_percentage: number;
  start_date: string;
  end_date: string;
  status: 'active' | 'inactive';
}

export interface Sale {
  sale_id: number;
  customer_id: number;
  user_id: number;
  sale_date: string;
  subtotal: number;
  discount: number;
  gst_rate?: number;
  gst_amount?: number;
  total_amount: number;
  payment_method: 'Cash' | 'UPI' | 'Card';
}

export interface SaleItem {
  sale_item_id: number;
  sale_id: number;
  product_id: number;
  quantity: number;
  cost_price: number;
  regular_price: number;
  selling_price: number;
  discount: number;
  amount: number;
  profit: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  unit_cost: number;
  unit_regular: number;
  unit_selling: number;
  discount_per_unit: number;
  applied_offer?: Offer;
  total_amount: number;
  total_profit: number;
}

export type ActiveTab =
  | 'dashboard'
  | 'billing'
  | 'customers'
  | 'products'
  | 'categories'
  | 'brands'
  | 'offers'
  | 'staff'
  | 'sales'
  | 'reports'
  | 'powerbi'
  | 'php_source';
