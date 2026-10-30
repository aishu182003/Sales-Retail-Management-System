import { User, Category, Brand, Product, Offer, Customer, Sale, SaleItem } from '../types';

export const INITIAL_USERS: User[] = [
  {
    user_id: 1,
    username: 'admin',
    role: 'admin',
    password: 'admin123',
    name: 'Suresh Patel',
    mobile: '9820011223',
    status: 'active',
    shift: 'General',
    counter_no: 'Admin Office',
    created_at: '2025-01-01',
  },
  {
    user_id: 2,
    username: 'sales',
    role: 'sales_person',
    password: 'sales123',
    name: 'Ramesh Sharma',
    mobile: '9845012345',
    status: 'active',
    shift: 'Morning',
    counter_no: 'Counter 1',
    created_at: '2025-01-15',
  },
  {
    user_id: 3,
    username: 'priya',
    role: 'sales_person',
    password: 'sales123',
    name: 'Priya Verma',
    mobile: '9876543211',
    status: 'active',
    shift: 'Evening',
    counter_no: 'Counter 2',
    created_at: '2025-02-01',
  },
  {
    user_id: 4,
    username: 'amit',
    role: 'sales_person',
    password: 'sales123',
    name: 'Amit Kumar',
    mobile: '9811223344',
    status: 'active',
    shift: 'General',
    counter_no: 'Express Counter',
    created_at: '2025-03-10',
  },
  {
    user_id: 5,
    username: 'sneha',
    role: 'sales_person',
    password: 'sales123',
    name: 'Sneha Nair',
    mobile: '9744556677',
    status: 'active',
    shift: 'Night',
    counter_no: 'Counter 3',
    created_at: '2025-04-05',
  },
];

export const INITIAL_CATEGORIES: Category[] = [
  { category_id: 1, category_name: 'Groceries & Staples', status: 'active' },
  { category_id: 2, category_name: 'Dairy & Eggs', status: 'active' },
  { category_id: 3, category_name: 'Beverages & Cold Drinks', status: 'active' },
  { category_id: 4, category_name: 'Snacks & Namkeen', status: 'active' },
  { category_id: 5, category_name: 'Chocolates & Confectionery', status: 'active' },
  { category_id: 6, category_name: 'Bakery & Fresh Breads', status: 'active' },
  { category_id: 7, category_name: 'Fresh Fruits', status: 'active' },
  { category_id: 8, category_name: 'Fresh Vegetables', status: 'active' },
  { category_id: 9, category_name: 'Personal Care & Hygiene', status: 'active' },
  { category_id: 10, category_name: 'Household & Cleaning', status: 'active' },
  { category_id: 11, category_name: 'Spices, Masalas & Seasonings', status: 'active' },
  { category_id: 12, category_name: 'Rice, Atta & Grains', status: 'active' },
  { category_id: 13, category_name: 'Edible Cooking Oils & Ghee', status: 'active' },
  { category_id: 14, category_name: 'Breakfast Cereals & Oats', status: 'active' },
  { category_id: 15, category_name: 'Tea & Coffee', status: 'active' },
  { category_id: 16, category_name: 'Sauces, Ketchup & Spreads', status: 'active' },
  { category_id: 17, category_name: 'Instant Noodles & Ready Foods', status: 'active' },
  { category_id: 18, category_name: 'Biscuits & Cookies', status: 'active' },
  { category_id: 19, category_name: 'Frozen Foods & Desserts', status: 'active' },
  { category_id: 20, category_name: 'Baby Care & Nutrition', status: 'active' },
];

export const INITIAL_BRANDS: Brand[] = [
  { brand_id: 1, brand_name: 'Cadbury', status: 'active' },
  { brand_id: 2, brand_name: 'Britannia', status: 'active' },
  { brand_id: 3, brand_name: 'Dove / HUL', status: 'active' },
  { brand_id: 4, brand_name: 'Colgate', status: 'active' },
  { brand_id: 5, brand_name: 'Nestle', status: 'active' },
  { brand_id: 6, brand_name: 'Pepsi', status: 'active' },
  { brand_id: 7, brand_name: 'Coca-Cola', status: 'active' },
  { brand_id: 8, brand_name: 'Amul', status: 'active' },
  { brand_id: 9, brand_name: 'Fortune', status: 'active' },
  { brand_id: 10, brand_name: 'Parle', status: 'active' },
  { brand_id: 11, brand_name: 'Sunfeast', status: 'active' },
  { brand_id: 12, brand_name: 'Tata Consumer', status: 'active' },
  { brand_id: 13, brand_name: 'Saffola', status: 'active' },
  { brand_id: 14, brand_name: 'Mother Dairy', status: 'active' },
  { brand_id: 15, brand_name: "Haldiram's", status: 'active' },
  { brand_id: 16, brand_name: "Kellogg's", status: 'active' },
  { brand_id: 17, brand_name: 'Dettol', status: 'active' },
  { brand_id: 18, brand_name: 'Godrej', status: 'active' },
  { brand_id: 19, brand_name: 'Kissan', status: 'active' },
  { brand_id: 20, brand_name: 'MDH', status: 'active' },
  { brand_id: 21, brand_name: 'Everest', status: 'active' },
  { brand_id: 22, brand_name: 'Aashirvaad', status: 'active' },
  { brand_id: 23, brand_name: 'Bikaji', status: 'active' },
  { brand_id: 24, brand_name: 'Himalaya', status: 'active' },
  { brand_id: 25, brand_name: 'Lays', status: 'active' },
  { brand_id: 26, brand_name: 'Fresh Farm Produce', status: 'active' },
  { brand_id: 27, brand_name: 'Dabur', status: 'active' },
  { brand_id: 28, brand_name: 'P&G', status: 'active' },
];

export const INITIAL_PRODUCTS: Product[] = [
  // --- Cadbury (Brand 1) ---
  {
    product_id: 1,
    product_name: 'Dairy Milk Silk 150g',
    barcode: '8901234567890',
    category_id: 5, // Chocolates & Confectionery
    brand_id: 1, // Cadbury
    unit: 'Piece',
    cost_price: 80,
    regular_price: 100,
    selling_price: 90,
    stock: 95,
    reorder_level: 20,
    status: 'active',
  },
  {
    product_id: 16,
    product_name: 'Cadbury 5 Star Chocolate Bar 40g',
    barcode: '8901234567816',
    category_id: 5, // Chocolates & Confectionery
    brand_id: 1, // Cadbury
    unit: 'Piece',
    cost_price: 15,
    regular_price: 25,
    selling_price: 20,
    stock: 120,
    reorder_level: 30,
    status: 'active',
  },
  {
    product_id: 17,
    product_name: 'Cadbury Perk Chocolate Wafer 28g',
    barcode: '8901234567817',
    category_id: 5, // Chocolates & Confectionery
    brand_id: 1, // Cadbury
    unit: 'Piece',
    cost_price: 8,
    regular_price: 12,
    selling_price: 10,
    stock: 150,
    reorder_level: 25,
    status: 'active',
  },
  {
    product_id: 18,
    product_name: 'Cadbury Gems Chocolate Pouch 23g',
    barcode: '8901234567818',
    category_id: 5, // Chocolates & Confectionery
    brand_id: 1, // Cadbury
    unit: 'Piece',
    cost_price: 7,
    regular_price: 12,
    selling_price: 10,
    stock: 130,
    reorder_level: 20,
    status: 'active',
  },
  {
    product_id: 19,
    product_name: 'Cadbury Bournvita Nutrition Drink 500g',
    barcode: '8901234567819',
    category_id: 15, // Tea & Coffee / Health Drinks
    brand_id: 1, // Cadbury
    unit: 'Piece',
    cost_price: 180,
    regular_price: 240,
    selling_price: 215,
    stock: 45,
    reorder_level: 15,
    status: 'active',
  },

  // --- Britannia (Brand 2) ---
  {
    product_id: 2,
    product_name: 'Good Day Butter Biscuits Packet',
    barcode: '8901234567891',
    category_id: 18, // Biscuits & Cookies
    brand_id: 2, // Britannia
    unit: 'Piece',
    cost_price: 25,
    regular_price: 35,
    selling_price: 30,
    stock: 120,
    reorder_level: 25,
    status: 'active',
  },
  {
    product_id: 12,
    product_name: 'Britannia 100% Whole Wheat Bread',
    barcode: '8901234567801',
    category_id: 6, // Bakery & Fresh Breads
    brand_id: 2, // Britannia
    unit: 'Piece',
    cost_price: 30,
    regular_price: 45,
    selling_price: 40,
    stock: 25,
    reorder_level: 10,
    status: 'active',
  },
  {
    product_id: 20,
    product_name: 'Britannia Bourbon Chocolate Cream Biscuits 150g',
    barcode: '8901234567820',
    category_id: 18, // Biscuits & Cookies
    brand_id: 2, // Britannia
    unit: 'Piece',
    cost_price: 28,
    regular_price: 40,
    selling_price: 35,
    stock: 90,
    reorder_level: 20,
    status: 'active',
  },
  {
    product_id: 21,
    product_name: 'Britannia Marie Gold Tea Biscuits 250g',
    barcode: '8901234567821',
    category_id: 18, // Biscuits & Cookies
    brand_id: 2, // Britannia
    unit: 'Piece',
    cost_price: 26,
    regular_price: 38,
    selling_price: 32,
    stock: 110,
    reorder_level: 25,
    status: 'active',
  },
  {
    product_id: 22,
    product_name: 'Britannia Little Hearts Classic Biscuits 75g',
    barcode: '8901234567822',
    category_id: 18, // Biscuits & Cookies
    brand_id: 2, // Britannia
    unit: 'Piece',
    cost_price: 15,
    regular_price: 22,
    selling_price: 20,
    stock: 80,
    reorder_level: 15,
    status: 'active',
  },

  // --- Dove / HUL (Brand 3) ---
  {
    product_id: 3,
    product_name: 'Dove Intense Repair Shampoo',
    barcode: '8901234567892',
    category_id: 9, // Personal Care & Hygiene
    brand_id: 3, // Dove / HUL
    unit: 'Piece',
    cost_price: 140,
    regular_price: 190,
    selling_price: 170,
    stock: 45,
    reorder_level: 15,
    status: 'active',
  },
  {
    product_id: 14,
    product_name: 'Dove Cream Beauty Bathing Soap',
    barcode: '8901234567803',
    category_id: 9, // Personal Care & Hygiene
    brand_id: 3, // Dove / HUL
    unit: 'Piece',
    cost_price: 45,
    regular_price: 65,
    selling_price: 55,
    stock: 85,
    reorder_level: 20,
    status: 'active',
  },
  {
    product_id: 23,
    product_name: 'Surf Excel Quick Wash Detergent Powder 1kg',
    barcode: '8901234567823',
    category_id: 10, // Household & Cleaning
    brand_id: 3, // HUL
    unit: 'Piece',
    cost_price: 115,
    regular_price: 155,
    selling_price: 140,
    stock: 65,
    reorder_level: 15,
    status: 'active',
  },
  {
    product_id: 24,
    product_name: 'Lifebuoy Total Germ Protection Handwash 200ml',
    barcode: '8901234567824',
    category_id: 9, // Personal Care & Hygiene
    brand_id: 3, // HUL
    unit: 'Piece',
    cost_price: 65,
    regular_price: 90,
    selling_price: 79,
    stock: 55,
    reorder_level: 15,
    status: 'active',
  },
  {
    product_id: 25,
    product_name: 'Vim Dishwash Liquid Lemon 500ml',
    barcode: '8901234567825',
    category_id: 10, // Household & Cleaning
    brand_id: 3, // HUL
    unit: 'Piece',
    cost_price: 85,
    regular_price: 115,
    selling_price: 102,
    stock: 70,
    reorder_level: 20,
    status: 'active',
  },

  // --- Colgate (Brand 4) ---
  {
    product_id: 4,
    product_name: 'Colgate MaxFresh Toothpaste',
    barcode: '8901234567893',
    category_id: 9, // Personal Care & Hygiene
    brand_id: 4, // Colgate
    unit: 'Piece',
    cost_price: 65,
    regular_price: 90,
    selling_price: 80,
    stock: 60,
    reorder_level: 15,
    status: 'active',
  },
  {
    product_id: 26,
    product_name: 'Colgate Strong Teeth Dental Cream 150g',
    barcode: '8901234567826',
    category_id: 9, // Personal Care & Hygiene
    brand_id: 4, // Colgate
    unit: 'Piece',
    cost_price: 55,
    regular_price: 78,
    selling_price: 70,
    stock: 80,
    reorder_level: 20,
    status: 'active',
  },
  {
    product_id: 27,
    product_name: 'Colgate Super Flexi Toothbrush (Pack of 3)',
    barcode: '8901234567827',
    category_id: 9, // Personal Care & Hygiene
    brand_id: 4, // Colgate
    unit: 'Piece',
    cost_price: 40,
    regular_price: 60,
    selling_price: 52,
    stock: 95,
    reorder_level: 20,
    status: 'active',
  },
  {
    product_id: 28,
    product_name: 'Colgate Plax Fresh Tea Mouthwash 250ml',
    barcode: '8901234567828',
    category_id: 9, // Personal Care & Hygiene
    brand_id: 4, // Colgate
    unit: 'Piece',
    cost_price: 110,
    regular_price: 150,
    selling_price: 135,
    stock: 35,
    reorder_level: 10,
    status: 'active',
  },

  // --- Nestle (Brand 5) ---
  {
    product_id: 11,
    product_name: 'Nestle Maggi 2-Minute Noodles Packet',
    barcode: '8901234567800',
    category_id: 17, // Instant Noodles & Ready Foods
    brand_id: 5, // Nestle
    unit: 'Piece',
    cost_price: 45,
    regular_price: 60,
    selling_price: 54,
    stock: 140,
    reorder_level: 30,
    status: 'active',
  },
  {
    product_id: 29,
    product_name: 'Nestle KitKat 4 Finger Chocolate 38g',
    barcode: '8901234567829',
    category_id: 5, // Chocolates & Confectionery
    brand_id: 5, // Nestle
    unit: 'Piece',
    cost_price: 20,
    regular_price: 30,
    selling_price: 25,
    stock: 125,
    reorder_level: 25,
    status: 'active',
  },
  {
    product_id: 30,
    product_name: 'Nestle Munch Crunchy Wafer Bar 25g',
    barcode: '8901234567830',
    category_id: 5, // Chocolates & Confectionery
    brand_id: 5, // Nestle
    unit: 'Piece',
    cost_price: 8,
    regular_price: 12,
    selling_price: 10,
    stock: 160,
    reorder_level: 30,
    status: 'active',
  },
  {
    product_id: 31,
    product_name: 'Nestle Nescafe Classic Instant Coffee 50g',
    barcode: '8901234567831',
    category_id: 15, // Tea & Coffee
    brand_id: 5, // Nestle
    unit: 'Piece',
    cost_price: 130,
    regular_price: 175,
    selling_price: 160,
    stock: 50,
    reorder_level: 15,
    status: 'active',
  },
  {
    product_id: 32,
    product_name: 'Nestle Everyday Dairy Whitener Milk Powder 400g',
    barcode: '8901234567832',
    category_id: 2, // Dairy & Eggs
    brand_id: 5, // Nestle
    unit: 'Piece',
    cost_price: 170,
    regular_price: 225,
    selling_price: 205,
    stock: 40,
    reorder_level: 12,
    status: 'active',
  },

  // --- Pepsi (Brand 6) ---
  {
    product_id: 9,
    product_name: 'Pepsi Soft Drink',
    barcode: '8901234567898',
    category_id: 3, // Beverages & Cold Drinks
    brand_id: 6, // Pepsi
    unit: 'Litre',
    cost_price: 42,
    regular_price: 60,
    selling_price: 50,
    stock: 55,
    reorder_level: 15,
    status: 'active',
  },
  {
    product_id: 33,
    product_name: '7UP Refreshing Lemon Soda 600ml',
    barcode: '8901234567833',
    category_id: 3, // Beverages & Cold Drinks
    brand_id: 6, // Pepsi
    unit: 'Piece',
    cost_price: 30,
    regular_price: 42,
    selling_price: 38,
    stock: 65,
    reorder_level: 15,
    status: 'active',
  },
  {
    product_id: 34,
    product_name: 'Mirinda Orange Fizzy Drink 600ml',
    barcode: '8901234567834',
    category_id: 3, // Beverages & Cold Drinks
    brand_id: 6, // Pepsi
    unit: 'Piece',
    cost_price: 30,
    regular_price: 42,
    selling_price: 38,
    stock: 60,
    reorder_level: 15,
    status: 'active',
  },

  // --- Coca-Cola (Brand 7) ---
  {
    product_id: 10,
    product_name: 'Coca-Cola Zero Sugar Bottle',
    barcode: '8901234567899',
    category_id: 3, // Beverages & Cold Drinks
    brand_id: 7, // Coca-Cola
    unit: 'Piece',
    cost_price: 35,
    regular_price: 48,
    selling_price: 42,
    stock: 12,
    reorder_level: 15,
    status: 'active',
  },
  {
    product_id: 35,
    product_name: 'Coca-Cola Original Taste Bottle 750ml',
    barcode: '8901234567835',
    category_id: 3, // Beverages & Cold Drinks
    brand_id: 7, // Coca-Cola
    unit: 'Piece',
    cost_price: 32,
    regular_price: 45,
    selling_price: 40,
    stock: 75,
    reorder_level: 20,
    status: 'active',
  },
  {
    product_id: 36,
    product_name: 'Thums Up Charged Soft Drink 600ml',
    barcode: '8901234567836',
    category_id: 3, // Beverages & Cold Drinks
    brand_id: 7, // Coca-Cola
    unit: 'Piece',
    cost_price: 32,
    regular_price: 45,
    selling_price: 40,
    stock: 80,
    reorder_level: 20,
    status: 'active',
  },
  {
    product_id: 37,
    product_name: 'Sprite Refreshing Lemon Soda 750ml',
    barcode: '8901234567837',
    category_id: 3, // Beverages & Cold Drinks
    brand_id: 7, // Coca-Cola
    unit: 'Piece',
    cost_price: 32,
    regular_price: 45,
    selling_price: 40,
    stock: 70,
    reorder_level: 20,
    status: 'active',
  },

  // --- Amul (Brand 8) ---
  {
    product_id: 5,
    product_name: 'Amul Taaza Homogenised Milk',
    barcode: '8901234567894',
    category_id: 2, // Dairy & Eggs
    brand_id: 8, // Amul
    unit: 'Litre',
    cost_price: 48,
    regular_price: 60,
    selling_price: 56,
    stock: 50,
    reorder_level: 20,
    status: 'active',
  },
  {
    product_id: 38,
    product_name: 'Amul Pasteurised Salted Butter 100g',
    barcode: '8901234567838',
    category_id: 2, // Dairy & Eggs
    brand_id: 8, // Amul
    unit: 'Piece',
    cost_price: 44,
    regular_price: 58,
    selling_price: 54,
    stock: 80,
    reorder_level: 20,
    status: 'active',
  },
  {
    product_id: 39,
    product_name: 'Amul Processed Cheese Slices 200g',
    barcode: '8901234567839',
    category_id: 2, // Dairy & Eggs
    brand_id: 8, // Amul
    unit: 'Piece',
    cost_price: 110,
    regular_price: 145,
    selling_price: 130,
    stock: 45,
    reorder_level: 15,
    status: 'active',
  },
  {
    product_id: 40,
    product_name: 'Amul Masti Dahi Fresh Curd 400g',
    barcode: '8901234567840',
    category_id: 2, // Dairy & Eggs
    brand_id: 8, // Amul
    unit: 'Piece',
    cost_price: 30,
    regular_price: 40,
    selling_price: 35,
    stock: 60,
    reorder_level: 20,
    status: 'active',
  },
  {
    product_id: 41,
    product_name: 'Amul Pure Cow Ghee Tin 1L',
    barcode: '8901234567841',
    category_id: 13, // Edible Cooking Oils & Ghee
    brand_id: 8, // Amul
    unit: 'Litre',
    cost_price: 480,
    regular_price: 620,
    selling_price: 575,
    stock: 35,
    reorder_level: 10,
    status: 'active',
  },

  // --- Fortune (Brand 9) ---
  {
    product_id: 8,
    product_name: 'Fortune Super Basmati Rice',
    barcode: '8901234567897',
    category_id: 12, // Rice, Atta & Grains
    brand_id: 9, // Fortune
    unit: 'Kg',
    cost_price: 76,
    regular_price: 100,
    selling_price: 90,
    stock: 150,
    reorder_level: 25,
    status: 'active',
  },
  {
    product_id: 15,
    product_name: 'Fortune Sunlite Refined Sunflower Oil',
    barcode: '8901234567804',
    category_id: 13, // Edible Cooking Oils & Ghee
    brand_id: 9, // Fortune
    unit: 'Litre',
    cost_price: 115,
    regular_price: 155,
    selling_price: 140,
    stock: 60,
    reorder_level: 15,
    status: 'active',
  },
  {
    product_id: 42,
    product_name: 'Fortune Kachi Ghani Pure Mustard Oil 1L',
    barcode: '8901234567842',
    category_id: 13, // Edible Cooking Oils & Ghee
    brand_id: 9, // Fortune
    unit: 'Litre',
    cost_price: 125,
    regular_price: 165,
    selling_price: 148,
    stock: 50,
    reorder_level: 15,
    status: 'active',
  },
  {
    product_id: 43,
    product_name: 'Fortune Chakki Fresh Whole Wheat Atta 5kg',
    barcode: '8901234567843',
    category_id: 12, // Rice, Atta & Grains
    brand_id: 9, // Fortune
    unit: 'Piece',
    cost_price: 175,
    regular_price: 230,
    selling_price: 210,
    stock: 40,
    reorder_level: 12,
    status: 'active',
  },

  // --- Parle (Brand 10) ---
  {
    product_id: 44,
    product_name: 'Parle-G Original Gluco Biscuits 250g',
    barcode: '8901234567844',
    category_id: 18, // Biscuits & Cookies
    brand_id: 10, // Parle
    unit: 'Piece',
    cost_price: 20,
    regular_price: 30,
    selling_price: 25,
    stock: 140,
    reorder_level: 30,
    status: 'active',
  },
  {
    product_id: 45,
    product_name: 'Parle Monaco Classic Salted Crackers 200g',
    barcode: '8901234567845',
    category_id: 18, // Biscuits & Cookies
    brand_id: 10, // Parle
    unit: 'Piece',
    cost_price: 24,
    regular_price: 35,
    selling_price: 30,
    stock: 100,
    reorder_level: 25,
    status: 'active',
  },
  {
    product_id: 46,
    product_name: 'Parle Krackjack Sweet & Salty Crackers 200g',
    barcode: '8901234567846',
    category_id: 18, // Biscuits & Cookies
    brand_id: 10, // Parle
    unit: 'Piece',
    cost_price: 24,
    regular_price: 35,
    selling_price: 30,
    stock: 95,
    reorder_level: 20,
    status: 'active',
  },
  {
    product_id: 47,
    product_name: 'Parle Hide & Seek Chocolate Chip Cookies 120g',
    barcode: '8901234567847',
    category_id: 18, // Biscuits & Cookies
    brand_id: 10, // Parle
    unit: 'Piece',
    cost_price: 35,
    regular_price: 50,
    selling_price: 45,
    stock: 85,
    reorder_level: 20,
    status: 'active',
  },

  // --- Sunfeast (Brand 11) ---
  {
    product_id: 48,
    product_name: 'Sunfeast Dark Fantasy Choco Fills 300g',
    barcode: '8901234567848',
    category_id: 18, // Biscuits & Cookies
    brand_id: 11, // Sunfeast
    unit: 'Piece',
    cost_price: 80,
    regular_price: 110,
    selling_price: 95,
    stock: 75,
    reorder_level: 18,
    status: 'active',
  },
  {
    product_id: 49,
    product_name: "Sunfeast Mom's Magic Cashew & Almond Cookies 200g",
    barcode: '8901234567849',
    category_id: 18, // Biscuits & Cookies
    brand_id: 11, // Sunfeast
    unit: 'Piece',
    cost_price: 28,
    regular_price: 40,
    selling_price: 35,
    stock: 90,
    reorder_level: 20,
    status: 'active',
  },
  {
    product_id: 50,
    product_name: 'Sunfeast Yippee! Magic Masala Noodles 260g',
    barcode: '8901234567850',
    category_id: 17, // Instant Noodles & Ready Foods
    brand_id: 11, // Sunfeast
    unit: 'Piece',
    cost_price: 38,
    regular_price: 50,
    selling_price: 45,
    stock: 110,
    reorder_level: 25,
    status: 'active',
  },

  // --- Tata Consumer (Brand 12) ---
  {
    product_id: 51,
    product_name: 'Tata Tea Premium Desh Ki Chai 500g',
    barcode: '8901234567851',
    category_id: 15, // Tea & Coffee
    brand_id: 12, // Tata Consumer
    unit: 'Piece',
    cost_price: 190,
    regular_price: 260,
    selling_price: 235,
    stock: 55,
    reorder_level: 15,
    status: 'active',
  },
  {
    product_id: 52,
    product_name: 'Tata Salt Vacuum Evaporated Iodised Salt 1kg',
    barcode: '8901234567852',
    category_id: 11, // Spices, Masalas & Seasonings
    brand_id: 12, // Tata Consumer
    unit: 'Piece',
    cost_price: 20,
    regular_price: 28,
    selling_price: 25,
    stock: 150,
    reorder_level: 30,
    status: 'active',
  },
  {
    product_id: 53,
    product_name: 'Tata Sampann Unpolished Toor Dal 1kg',
    barcode: '8901234567853',
    category_id: 1, // Groceries & Staples
    brand_id: 12, // Tata Consumer
    unit: 'Kg',
    cost_price: 130,
    regular_price: 175,
    selling_price: 158,
    stock: 65,
    reorder_level: 15,
    status: 'active',
  },
  {
    product_id: 54,
    product_name: 'Tata Sampann Moong Dal Yellow 1kg',
    barcode: '8901234567854',
    category_id: 1, // Groceries & Staples
    brand_id: 12, // Tata Consumer
    unit: 'Kg',
    cost_price: 115,
    regular_price: 155,
    selling_price: 139,
    stock: 60,
    reorder_level: 15,
    status: 'active',
  },

  // --- Saffola (Brand 13) ---
  {
    product_id: 55,
    product_name: 'Saffola Gold Pro Healthy Lifestyle Oil 1L',
    barcode: '8901234567855',
    category_id: 13, // Edible Cooking Oils & Ghee
    brand_id: 13, // Saffola
    unit: 'Litre',
    cost_price: 145,
    regular_price: 195,
    selling_price: 175,
    stock: 55,
    reorder_level: 15,
    status: 'active',
  },
  {
    product_id: 56,
    product_name: 'Saffola Masala Oats Classic Masala 500g',
    barcode: '8901234567856',
    category_id: 14, // Breakfast Cereals & Oats
    brand_id: 13, // Saffola
    unit: 'Piece',
    cost_price: 135,
    regular_price: 180,
    selling_price: 160,
    stock: 45,
    reorder_level: 12,
    status: 'active',
  },
  {
    product_id: 57,
    product_name: 'Parachute 100% Pure Coconut Oil 250ml',
    barcode: '8901234567857',
    category_id: 9, // Personal Care & Hygiene
    brand_id: 13, // Saffola / Marico
    unit: 'Piece',
    cost_price: 85,
    regular_price: 115,
    selling_price: 102,
    stock: 75,
    reorder_level: 20,
    status: 'active',
  },

  // --- Mother Dairy (Brand 14) ---
  {
    product_id: 58,
    product_name: 'Mother Dairy Full Cream Fresh Milk 1L',
    barcode: '8901234567858',
    category_id: 2, // Dairy & Eggs
    brand_id: 14, // Mother Dairy
    unit: 'Litre',
    cost_price: 52,
    regular_price: 66,
    selling_price: 62,
    stock: 45,
    reorder_level: 15,
    status: 'active',
  },
  {
    product_id: 59,
    product_name: 'Mother Dairy Classic Dahi Fresh Curd 400g',
    barcode: '8901234567859',
    category_id: 2, // Dairy & Eggs
    brand_id: 14, // Mother Dairy
    unit: 'Piece',
    cost_price: 28,
    regular_price: 38,
    selling_price: 34,
    stock: 50,
    reorder_level: 15,
    status: 'active',
  },
  {
    product_id: 60,
    product_name: 'Mother Dairy Pure Cow Ghee 500ml',
    barcode: '8901234567860',
    category_id: 13, // Edible Cooking Oils & Ghee
    brand_id: 14, // Mother Dairy
    unit: 'Piece',
    cost_price: 275,
    regular_price: 360,
    selling_price: 325,
    stock: 30,
    reorder_level: 10,
    status: 'active',
  },

  // --- Haldiram's (Brand 15) ---
  {
    product_id: 61,
    product_name: "Haldiram's Nagpur Aloo Bhujia 200g",
    barcode: '8901234567861',
    category_id: 4, // Snacks & Namkeen
    brand_id: 15, // Haldiram's
    unit: 'Piece',
    cost_price: 42,
    regular_price: 60,
    selling_price: 52,
    stock: 100,
    reorder_level: 25,
    status: 'active',
  },
  {
    product_id: 62,
    product_name: "Haldiram's Soan Papdi Sweet Box 500g",
    barcode: '8901234567862',
    category_id: 5, // Chocolates & Confectionery
    brand_id: 15, // Haldiram's
    unit: 'Piece',
    cost_price: 95,
    regular_price: 135,
    selling_price: 120,
    stock: 60,
    reorder_level: 15,
    status: 'active',
  },
  {
    product_id: 63,
    product_name: "Haldiram's Khatta Meetha Namkeen 200g",
    barcode: '8901234567863',
    category_id: 4, // Snacks & Namkeen
    brand_id: 15, // Haldiram's
    unit: 'Piece',
    cost_price: 42,
    regular_price: 60,
    selling_price: 52,
    stock: 85,
    reorder_level: 20,
    status: 'active',
  },

  // --- Kellogg's (Brand 16) ---
  {
    product_id: 64,
    product_name: "Kellogg's Corn Flakes Original 500g",
    barcode: '8901234567864',
    category_id: 14, // Breakfast Cereals & Oats
    brand_id: 16, // Kellogg's
    unit: 'Piece',
    cost_price: 155,
    regular_price: 210,
    selling_price: 188,
    stock: 45,
    reorder_level: 12,
    status: 'active',
  },
  {
    product_id: 65,
    product_name: "Kellogg's Chocos Crunchy Chocolate Bites 375g",
    barcode: '8901234567865',
    category_id: 14, // Breakfast Cereals & Oats
    brand_id: 16, // Kellogg's
    unit: 'Piece',
    cost_price: 145,
    regular_price: 195,
    selling_price: 175,
    stock: 50,
    reorder_level: 15,
    status: 'active',
  },
  {
    product_id: 66,
    product_name: "Kellogg's Muesli Fruit Nut & Seeds 450g",
    barcode: '8901234567866',
    category_id: 14, // Breakfast Cereals & Oats
    brand_id: 16, // Kellogg's
    unit: 'Piece',
    cost_price: 220,
    regular_price: 295,
    selling_price: 265,
    stock: 35,
    reorder_level: 10,
    status: 'active',
  },

  // --- Dettol (Brand 17) ---
  {
    product_id: 67,
    product_name: 'Dettol Antiseptic Disinfectant Liquid 250ml',
    barcode: '8901234567867',
    category_id: 9, // Personal Care & Hygiene
    brand_id: 17, // Dettol
    unit: 'Piece',
    cost_price: 115,
    regular_price: 155,
    selling_price: 138,
    stock: 65,
    reorder_level: 15,
    status: 'active',
  },
  {
    product_id: 68,
    product_name: 'Dettol Original Bathing Soap (Pack of 3)',
    barcode: '8901234567868',
    category_id: 9, // Personal Care & Hygiene
    brand_id: 17, // Dettol
    unit: 'Piece',
    cost_price: 98,
    regular_price: 135,
    selling_price: 120,
    stock: 80,
    reorder_level: 20,
    status: 'active',
  },
  {
    product_id: 69,
    product_name: 'Dettol Instant Hand Sanitizer 50ml',
    barcode: '8901234567869',
    category_id: 9, // Personal Care & Hygiene
    brand_id: 17, // Dettol
    unit: 'Piece',
    cost_price: 22,
    regular_price: 30,
    selling_price: 25,
    stock: 100,
    reorder_level: 25,
    status: 'active',
  },

  // --- Godrej (Brand 18) ---
  {
    product_id: 70,
    product_name: 'Goodknight Gold Flash Mosquito Repellent Refill',
    barcode: '8901234567870',
    category_id: 10, // Household & Cleaning
    brand_id: 18, // Godrej
    unit: 'Piece',
    cost_price: 62,
    regular_price: 85,
    selling_price: 75,
    stock: 90,
    reorder_level: 20,
    status: 'active',
  },
  {
    product_id: 71,
    product_name: 'Godrej No.1 Sandal & Turmeric Soap 100g',
    barcode: '8901234567871',
    category_id: 9, // Personal Care & Hygiene
    brand_id: 18, // Godrej
    unit: 'Piece',
    cost_price: 24,
    regular_price: 35,
    selling_price: 30,
    stock: 120,
    reorder_level: 25,
    status: 'active',
  },
  {
    product_id: 72,
    product_name: 'Godrej Aer Pocket Bathroom Fragrance 10g',
    barcode: '8901234567872',
    category_id: 10, // Household & Cleaning
    brand_id: 18, // Godrej
    unit: 'Piece',
    cost_price: 48,
    regular_price: 65,
    selling_price: 58,
    stock: 85,
    reorder_level: 20,
    status: 'active',
  },

  // --- Kissan (Brand 19) ---
  {
    product_id: 73,
    product_name: 'Kissan Fresh Tomato Ketchup Bottle 500g',
    barcode: '8901234567873',
    category_id: 16, // Sauces, Ketchup & Spreads
    brand_id: 19, // Kissan
    unit: 'Piece',
    cost_price: 88,
    regular_price: 120,
    selling_price: 105,
    stock: 75,
    reorder_level: 18,
    status: 'active',
  },
  {
    product_id: 74,
    product_name: 'Kissan Mixed Fruit Jam Jar 500g',
    barcode: '8901234567874',
    category_id: 16, // Sauces, Ketchup & Spreads
    brand_id: 19, // Kissan
    unit: 'Piece',
    cost_price: 115,
    regular_price: 155,
    selling_price: 138,
    stock: 55,
    reorder_level: 15,
    status: 'active',
  },

  // --- MDH (Brand 20) ---
  {
    product_id: 75,
    product_name: 'MDH Deggi Mirch Red Chilli Powder 100g',
    barcode: '8901234567875',
    category_id: 11, // Spices, Masalas & Seasonings
    brand_id: 20, // MDH
    unit: 'Piece',
    cost_price: 68,
    regular_price: 92,
    selling_price: 82,
    stock: 80,
    reorder_level: 20,
    status: 'active',
  },
  {
    product_id: 76,
    product_name: 'MDH Kitchen King Mixed Masala 100g',
    barcode: '8901234567876',
    category_id: 11, // Spices, Masalas & Seasonings
    brand_id: 20, // MDH
    unit: 'Piece',
    cost_price: 62,
    regular_price: 85,
    selling_price: 76,
    stock: 85,
    reorder_level: 20,
    status: 'active',
  },
  {
    product_id: 77,
    product_name: 'MDH Chana Masala Powder 100g',
    barcode: '8901234567877',
    category_id: 11, // Spices, Masalas & Seasonings
    brand_id: 20, // MDH
    unit: 'Piece',
    cost_price: 58,
    regular_price: 80,
    selling_price: 72,
    stock: 70,
    reorder_level: 18,
    status: 'active',
  },

  // --- Everest (Brand 21) ---
  {
    product_id: 78,
    product_name: 'Everest Garam Masala Powder 100g',
    barcode: '8901234567878',
    category_id: 11, // Spices, Masalas & Seasonings
    brand_id: 21, // Everest
    unit: 'Piece',
    cost_price: 64,
    regular_price: 88,
    selling_price: 78,
    stock: 85,
    reorder_level: 20,
    status: 'active',
  },
  {
    product_id: 79,
    product_name: 'Everest Turmeric Haldi Powder 200g',
    barcode: '8901234567879',
    category_id: 11, // Spices, Masalas & Seasonings
    brand_id: 21, // Everest
    unit: 'Piece',
    cost_price: 48,
    regular_price: 66,
    selling_price: 58,
    stock: 90,
    reorder_level: 20,
    status: 'active',
  },
  {
    product_id: 80,
    product_name: 'Everest Coriander Dhaniya Powder 200g',
    barcode: '8901234567880',
    category_id: 11, // Spices, Masalas & Seasonings
    brand_id: 21, // Everest
    unit: 'Piece',
    cost_price: 46,
    regular_price: 64,
    selling_price: 56,
    stock: 90,
    reorder_level: 20,
    status: 'active',
  },

  // --- Aashirvaad (Brand 22) ---
  {
    product_id: 81,
    product_name: 'Aashirvaad Shudh Chakki Wheat Atta 5kg',
    barcode: '8901234567881',
    category_id: 12, // Rice, Atta & Grains
    brand_id: 22, // Aashirvaad
    unit: 'Piece',
    cost_price: 185,
    regular_price: 245,
    selling_price: 225,
    stock: 65,
    reorder_level: 15,
    status: 'active',
  },
  {
    product_id: 82,
    product_name: 'Aashirvaad Select 100% Sharbati Atta 5kg',
    barcode: '8901234567882',
    category_id: 12, // Rice, Atta & Grains
    brand_id: 22, // Aashirvaad
    unit: 'Piece',
    cost_price: 220,
    regular_price: 290,
    selling_price: 268,
    stock: 45,
    reorder_level: 12,
    status: 'active',
  },
  {
    product_id: 83,
    product_name: 'Aashirvaad Svasti Pure Cow Ghee 500ml',
    barcode: '8901234567883',
    category_id: 13, // Edible Cooking Oils & Ghee
    brand_id: 22, // Aashirvaad
    unit: 'Piece',
    cost_price: 285,
    regular_price: 375,
    selling_price: 340,
    stock: 35,
    reorder_level: 10,
    status: 'active',
  },

  // --- Bikaji (Brand 23) ---
  {
    product_id: 84,
    product_name: 'Bikaji Bikaneri Bhujia Namkeen 200g',
    barcode: '8901234567884',
    category_id: 4, // Snacks & Namkeen
    brand_id: 23, // Bikaji
    unit: 'Piece',
    cost_price: 42,
    regular_price: 60,
    selling_price: 52,
    stock: 80,
    reorder_level: 20,
    status: 'active',
  },
  {
    product_id: 85,
    product_name: 'Bikaji Rasgulla Sweet Tin 1kg',
    barcode: '8901234567885',
    category_id: 5, // Chocolates & Confectionery
    brand_id: 23, // Bikaji
    unit: 'Piece',
    cost_price: 160,
    regular_price: 220,
    selling_price: 195,
    stock: 40,
    reorder_level: 10,
    status: 'active',
  },

  // --- Himalaya (Brand 24) ---
  {
    product_id: 86,
    product_name: 'Himalaya Purifying Neem Face Wash 150ml',
    barcode: '8901234567886',
    category_id: 9, // Personal Care & Hygiene
    brand_id: 24, // Himalaya
    unit: 'Piece',
    cost_price: 120,
    regular_price: 165,
    selling_price: 148,
    stock: 55,
    reorder_level: 15,
    status: 'active',
  },
  {
    product_id: 87,
    product_name: 'Himalaya Anti-Hair Fall Shampoo 180ml',
    barcode: '8901234567887',
    category_id: 9, // Personal Care & Hygiene
    brand_id: 24, // Himalaya
    unit: 'Piece',
    cost_price: 105,
    regular_price: 145,
    selling_price: 130,
    stock: 50,
    reorder_level: 15,
    status: 'active',
  },

  // --- Lays (Brand 25) ---
  {
    product_id: 88,
    product_name: "Lay's India's Magic Masala Chips 50g",
    barcode: '8901234567888',
    category_id: 4, // Snacks & Namkeen
    brand_id: 25, // Lays
    unit: 'Piece',
    cost_price: 14,
    regular_price: 20,
    selling_price: 18,
    stock: 120,
    reorder_level: 30,
    status: 'active',
  },
  {
    product_id: 89,
    product_name: "Lay's American Style Cream & Onion Chips 50g",
    barcode: '8901234567889',
    category_id: 4, // Snacks & Namkeen
    brand_id: 25, // Lays
    unit: 'Piece',
    cost_price: 14,
    regular_price: 20,
    selling_price: 18,
    stock: 110,
    reorder_level: 30,
    status: 'active',
  },
  {
    product_id: 90,
    product_name: "Lay's Classic Salted Potato Chips 50g",
    barcode: '8901234567890B',
    category_id: 4, // Snacks & Namkeen
    brand_id: 25, // Lays
    unit: 'Piece',
    cost_price: 14,
    regular_price: 20,
    selling_price: 18,
    stock: 100,
    reorder_level: 25,
    status: 'active',
  },

  // --- Fresh Farm Produce (Brand 26) ---
  {
    product_id: 6,
    product_name: 'Onion (Fresh Farm Red)',
    barcode: '8901234567895',
    category_id: 8, // Fresh Vegetables
    brand_id: 26, // Fresh Farm Produce
    unit: 'Kg',
    cost_price: 38,
    regular_price: 55,
    selling_price: 50,
    stock: 100,
    reorder_level: 20,
    status: 'active',
  },
  {
    product_id: 7,
    product_name: 'Tomato (Fresh Hybrid)',
    barcode: '8901234567896',
    category_id: 8, // Fresh Vegetables
    brand_id: 26, // Fresh Farm Produce
    unit: 'Kg',
    cost_price: 28,
    regular_price: 45,
    selling_price: 40,
    stock: 100,
    reorder_level: 15,
    status: 'active',
  },
  {
    product_id: 13,
    product_name: 'Potato (Fresh Farm)',
    barcode: '8901234567802',
    category_id: 8, // Fresh Vegetables
    brand_id: 26, // Fresh Farm Produce
    unit: 'Kg',
    cost_price: 20,
    regular_price: 35,
    selling_price: 30,
    stock: 120,
    reorder_level: 25,
    status: 'active',
  },
  {
    product_id: 91,
    product_name: 'Fresh Washington Apple (Seb)',
    barcode: '8901234567891B',
    category_id: 7, // Fresh Fruits
    brand_id: 26, // Fresh Farm Produce
    unit: 'Kg',
    cost_price: 140,
    regular_price: 190,
    selling_price: 170,
    stock: 80,
    reorder_level: 20,
    status: 'active',
  },
  {
    product_id: 92,
    product_name: 'Fresh Cavendish Banana (Kela)',
    barcode: '8901234567892B',
    category_id: 7, // Fresh Fruits
    brand_id: 26, // Fresh Farm Produce
    unit: 'Kg',
    cost_price: 35,
    regular_price: 55,
    selling_price: 48,
    stock: 90,
    reorder_level: 20,
    status: 'active',
  },

  // --- Dabur (Brand 27) ---
  {
    product_id: 93,
    product_name: 'Dabur 100% Pure Squeezy Honey 500g',
    barcode: '8901234567893B',
    category_id: 16, // Sauces, Ketchup & Spreads
    brand_id: 27, // Dabur
    unit: 'Piece',
    cost_price: 165,
    regular_price: 225,
    selling_price: 199,
    stock: 50,
    reorder_level: 15,
    status: 'active',
  },
  {
    product_id: 94,
    product_name: 'Dabur Red Ayurvedic Toothpaste 200g',
    barcode: '8901234567894B',
    category_id: 9, // Personal Care & Hygiene
    brand_id: 27, // Dabur
    unit: 'Piece',
    cost_price: 85,
    regular_price: 115,
    selling_price: 102,
    stock: 65,
    reorder_level: 18,
    status: 'active',
  },
  {
    product_id: 95,
    product_name: 'Dabur Chyawanprash Immunity Booster 500g',
    barcode: '8901234567895B',
    category_id: 1, // Groceries & Staples
    brand_id: 27, // Dabur
    unit: 'Piece',
    cost_price: 185,
    regular_price: 250,
    selling_price: 225,
    stock: 40,
    reorder_level: 12,
    status: 'active',
  },
  {
    product_id: 96,
    product_name: 'Real Fruit Power Mixed Fruit Juice 1L',
    barcode: '8901234567896B',
    category_id: 3, // Beverages & Cold Drinks
    brand_id: 27, // Dabur
    unit: 'Piece',
    cost_price: 85,
    regular_price: 120,
    selling_price: 105,
    stock: 60,
    reorder_level: 15,
    status: 'active',
  },

  // --- P&G (Brand 28) ---
  {
    product_id: 97,
    product_name: 'Ariel Matic Front Load Detergent Powder 1kg',
    barcode: '8901234567897B',
    category_id: 10, // Household & Cleaning
    brand_id: 28, // P&G
    unit: 'Piece',
    cost_price: 185,
    regular_price: 245,
    selling_price: 220,
    stock: 50,
    reorder_level: 15,
    status: 'active',
  },
  {
    product_id: 98,
    product_name: 'Head & Shoulders Anti-Dandruff Shampoo 180ml',
    barcode: '8901234567898B',
    category_id: 9, // Personal Care & Hygiene
    brand_id: 28, // P&G
    unit: 'Piece',
    cost_price: 135,
    regular_price: 185,
    selling_price: 165,
    stock: 45,
    reorder_level: 12,
    status: 'active',
  },
  {
    product_id: 99,
    product_name: 'Pantene Advanced Hairfall Control Shampoo 180ml',
    barcode: '8901234567899B',
    category_id: 9, // Personal Care & Hygiene
    brand_id: 28, // P&G
    unit: 'Piece',
    cost_price: 125,
    regular_price: 175,
    selling_price: 155,
    stock: 45,
    reorder_level: 12,
    status: 'active',
  },
];

export const INITIAL_OFFERS: Offer[] = [
  {
    offer_id: 1,
    product_id: 1, // Dairy Milk
    offer_name: 'Festival Sweet Bonanza - 10% Off',
    discount_percentage: 10,
    start_date: '2025-01-01',
    end_date: '2026-12-31',
    status: 'active',
  },
  {
    offer_id: 2,
    product_id: 3, // Dove Shampoo
    offer_name: 'Personal Care 15% Off',
    discount_percentage: 15,
    start_date: '2025-01-01',
    end_date: '2026-12-31',
    status: 'active',
  },
  {
    offer_id: 3,
    product_id: 8, // Basmati Rice
    offer_name: 'Pantry Staple 10% Off',
    discount_percentage: 10,
    start_date: '2025-01-01',
    end_date: '2026-12-31',
    status: 'active',
  },
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    customer_id: 1,
    name: 'Pooja Verma',
    mobile: '9876543210',
    loyalty_points: 150,
    created_at: '2026-04-12 10:15:00',
  },
  {
    customer_id: 2,
    name: 'Anand Kumar',
    mobile: '9845123456',
    loyalty_points: 85,
    created_at: '2026-05-03 14:20:00',
  },
  {
    customer_id: 3,
    name: 'Meenakshi Iyer',
    mobile: '9988776655',
    loyalty_points: 240,
    created_at: '2026-06-18 16:45:00',
  },
  {
    customer_id: 4,
    name: 'Rajesh Nair',
    mobile: '9123456780',
    loyalty_points: 40,
    created_at: '2026-07-22 11:30:00',
  },
  {
    customer_id: 5,
    name: 'Sunita Reddy',
    mobile: '9765432109',
    loyalty_points: 195,
    created_at: '2026-08-05 18:00:00',
  },
];

export const INITIAL_SALES: Sale[] = [
  {
    sale_id: 1001,
    customer_id: 1,
    user_id: 2, // Ramesh Sharma
    sale_date: '2026-05-10 11:24:00',
    subtotal: 540,
    discount: 10,
    gst_rate: 5,
    gst_amount: 27,
    total_amount: 557,
    payment_method: 'UPI',
  },
  {
    sale_id: 1002,
    customer_id: 2,
    user_id: 3, // Priya Verma
    sale_date: '2026-05-24 17:40:00',
    subtotal: 450,
    discount: 30,
    gst_rate: 5,
    gst_amount: 22.5,
    total_amount: 442.5,
    payment_method: 'Cash',
  },
  {
    sale_id: 1003,
    customer_id: 3,
    user_id: 4, // Amit Kumar
    sale_date: '2026-06-12 12:15:00',
    subtotal: 310,
    discount: 9,
    gst_rate: 5,
    gst_amount: 15.5,
    total_amount: 316.5,
    payment_method: 'Card',
  },
  {
    sale_id: 1004,
    customer_id: 1,
    user_id: 2, // Ramesh Sharma
    sale_date: '2026-06-28 19:10:00',
    subtotal: 620,
    discount: 15,
    gst_rate: 5,
    gst_amount: 31,
    total_amount: 636,
    payment_method: 'UPI',
  },
  {
    sale_id: 1005,
    customer_id: 4,
    user_id: 5, // Sneha Nair
    sale_date: '2026-07-15 14:05:00',
    subtotal: 490,
    discount: 0,
    gst_rate: 5,
    gst_amount: 24.5,
    total_amount: 514.5,
    payment_method: 'Cash',
  },
  {
    sale_id: 1006,
    customer_id: 5,
    user_id: 3, // Priya Verma
    sale_date: '2026-08-11 16:30:00',
    subtotal: 750,
    discount: 30,
    gst_rate: 5,
    gst_amount: 37.5,
    total_amount: 757.5,
    payment_method: 'UPI',
  },
  {
    sale_id: 1007,
    customer_id: 2,
    user_id: 2, // Ramesh Sharma
    sale_date: '2026-08-25 18:45:00',
    subtotal: 380,
    discount: 18,
    gst_rate: 5,
    gst_amount: 19,
    total_amount: 381,
    payment_method: 'Card',
  },
  {
    sale_id: 1008,
    customer_id: 1,
    user_id: 4, // Amit Kumar
    sale_date: '2026-09-05 10:50:00',
    subtotal: 580,
    discount: 18,
    gst_rate: 5,
    gst_amount: 29,
    total_amount: 591,
    payment_method: 'UPI',
  },
  {
    sale_id: 1009,
    customer_id: 3,
    user_id: 5, // Sneha Nair
    sale_date: '2026-09-15 15:20:00',
    subtotal: 440,
    discount: 0,
    gst_rate: 5,
    gst_amount: 22,
    total_amount: 462,
    payment_method: 'Cash',
  },
  {
    sale_id: 1010,
    customer_id: 5,
    user_id: 1, // Suresh Patel (Store Admin)
    sale_date: '2026-09-20 19:15:00',
    subtotal: 920,
    discount: 45,
    gst_rate: 5,
    gst_amount: 46,
    total_amount: 921,
    payment_method: 'UPI',
  },
];

export const INITIAL_SALE_ITEMS: SaleItem[] = [
  // Sale 1001 (Customer 1)
  {
    sale_item_id: 1,
    sale_id: 1001,
    product_id: 1, // Dairy Milk
    quantity: 2,
    cost_price: 80,
    regular_price: 100,
    selling_price: 90,
    discount: 10,
    amount: 170,
    profit: (85 - 80) * 2, // 10
  },
  {
    sale_item_id: 2,
    sale_id: 1001,
    product_id: 2, // Good Day
    quantity: 4,
    cost_price: 25,
    regular_price: 35,
    selling_price: 30,
    discount: 0,
    amount: 120,
    profit: (30 - 25) * 4, // 20
  },
  {
    sale_item_id: 3,
    sale_id: 1001,
    product_id: 3, // Dove
    quantity: 1,
    cost_price: 140,
    regular_price: 190,
    selling_price: 170,
    discount: 0,
    amount: 170,
    profit: (170 - 140) * 1, // 30
  },
  {
    sale_item_id: 4,
    sale_id: 1001,
    product_id: 9, // Pepsi
    quantity: 2,
    cost_price: 32,
    regular_price: 45,
    selling_price: 40,
    discount: 0,
    amount: 80,
    profit: (40 - 32) * 2, // 16
  },

  // Sale 1002 (Customer 2)
  {
    sale_item_id: 5,
    sale_id: 1002,
    product_id: 8, // Rice
    quantity: 1,
    cost_price: 380,
    regular_price: 500,
    selling_price: 450,
    discount: 30,
    amount: 420,
    profit: (420 - 380) * 1, // 40
  },

  // Sale 1003 (Customer 3)
  {
    sale_item_id: 6,
    sale_id: 1003,
    product_id: 1, // Dairy Milk
    quantity: 1,
    cost_price: 80,
    regular_price: 100,
    selling_price: 90,
    discount: 9,
    amount: 81,
    profit: 81 - 80, // 1
  },
  {
    sale_item_id: 7,
    sale_id: 1003,
    product_id: 4, // Toothpaste
    quantity: 2,
    cost_price: 65,
    regular_price: 90,
    selling_price: 80,
    discount: 0,
    amount: 160,
    profit: (80 - 65) * 2, // 30
  },
  {
    sale_item_id: 8,
    sale_id: 1003,
    product_id: 2, // Good Day
    quantity: 2,
    cost_price: 25,
    regular_price: 35,
    selling_price: 30,
    discount: 0,
    amount: 60,
    profit: (30 - 25) * 2, // 10
  },

  // Sale 1004 (Customer 1)
  {
    sale_item_id: 9,
    sale_id: 1004,
    product_id: 3, // Dove
    quantity: 2,
    cost_price: 140,
    regular_price: 190,
    selling_price: 170,
    discount: 15,
    amount: 325,
    profit: 325 - (140 * 2), // 45
  },
  {
    sale_item_id: 10,
    sale_id: 1004,
    product_id: 1, // Dairy Milk
    quantity: 3,
    cost_price: 80,
    regular_price: 100,
    selling_price: 90,
    discount: 0,
    amount: 270,
    profit: (90 - 80) * 3, // 30
  },

  // Sale 1005 (Customer 4)
  {
    sale_item_id: 11,
    sale_id: 1005,
    product_id: 6, // Onion 1kg
    quantity: 3,
    cost_price: 42,
    regular_price: 60,
    selling_price: 50,
    discount: 0,
    amount: 150,
    profit: (50 - 42) * 3, // 24
  },
  {
    sale_item_id: 12,
    sale_id: 1005,
    product_id: 7, // Tomato 1kg
    quantity: 4,
    cost_price: 28,
    regular_price: 40,
    selling_price: 35,
    discount: 0,
    amount: 140,
    profit: (35 - 28) * 4, // 28
  },
  {
    sale_item_id: 13,
    sale_id: 1005,
    product_id: 11, // Maggi
    quantity: 3,
    cost_price: 45,
    regular_price: 60,
    selling_price: 54,
    discount: 0,
    amount: 162,
    profit: (54 - 45) * 3, // 27
  },
  {
    sale_item_id: 14,
    sale_id: 1005,
    product_id: 12, // Bread
    quantity: 1,
    cost_price: 30,
    regular_price: 45,
    selling_price: 40,
    discount: 0,
    amount: 40,
    profit: (40 - 30) * 1, // 10
  },

  // Sale 1006 (Customer 5)
  {
    sale_item_id: 15,
    sale_id: 1006,
    product_id: 8, // Rice
    quantity: 1,
    cost_price: 380,
    regular_price: 500,
    selling_price: 450,
    discount: 30,
    amount: 420,
    profit: (420 - 380) * 1, // 40
  },
  {
    sale_item_id: 16,
    sale_id: 1006,
    product_id: 3, // Dove
    quantity: 1,
    cost_price: 140,
    regular_price: 190,
    selling_price: 170,
    discount: 0,
    amount: 170,
    profit: (170 - 140) * 1, // 30
  },
  {
    sale_item_id: 17,
    sale_id: 1006,
    product_id: 4, // Toothpaste
    quantity: 1,
    cost_price: 65,
    regular_price: 90,
    selling_price: 80,
    discount: 0,
    amount: 80,
    profit: (80 - 65) * 1, // 15
  },
  {
    sale_item_id: 18,
    sale_id: 1006,
    product_id: 5, // Milk
    quantity: 2,
    cost_price: 24,
    regular_price: 30,
    selling_price: 28,
    discount: 0,
    amount: 56,
    profit: (28 - 24) * 2, // 8
  },

  // Sale 1007 (Customer 2)
  {
    sale_item_id: 19,
    sale_id: 1007,
    product_id: 1, // Dairy Milk
    quantity: 2,
    cost_price: 80,
    regular_price: 100,
    selling_price: 90,
    discount: 18,
    amount: 162,
    profit: 162 - 160, // 2
  },
  {
    sale_item_id: 20,
    sale_id: 1007,
    product_id: 9, // Pepsi
    quantity: 5,
    cost_price: 32,
    regular_price: 45,
    selling_price: 40,
    discount: 0,
    amount: 200,
    profit: (40 - 32) * 5, // 40
  },

  // Sale 1008 (Customer 1)
  {
    sale_item_id: 21,
    sale_id: 1008,
    product_id: 1, // Dairy Milk
    quantity: 2,
    cost_price: 80,
    regular_price: 100,
    selling_price: 90,
    discount: 18,
    amount: 162,
    profit: 162 - 160, // 2
  },
  {
    sale_item_id: 22,
    sale_id: 1008,
    product_id: 3, // Dove
    quantity: 2,
    cost_price: 140,
    regular_price: 190,
    selling_price: 170,
    discount: 0,
    amount: 340,
    profit: (170 - 140) * 2, // 60
  },
  {
    sale_item_id: 23,
    sale_id: 1008,
    product_id: 2, // Good Day
    quantity: 2,
    cost_price: 25,
    regular_price: 35,
    selling_price: 30,
    discount: 0,
    amount: 60,
    profit: (30 - 25) * 2, // 10
  },

  // Sale 1009 (Customer 3)
  {
    sale_item_id: 24,
    sale_id: 1009,
    product_id: 8, // Rice
    quantity: 1,
    cost_price: 380,
    regular_price: 500,
    selling_price: 450,
    discount: 0,
    amount: 450,
    profit: (450 - 380) * 1, // 70
  },

  // Sale 1010 (Customer 5)
  {
    sale_item_id: 25,
    sale_id: 1010,
    product_id: 8, // Rice
    quantity: 1,
    cost_price: 380,
    regular_price: 500,
    selling_price: 450,
    discount: 30,
    amount: 420,
    profit: 40,
  },
  {
    sale_item_id: 26,
    sale_id: 1010,
    product_id: 3, // Dove
    quantity: 2,
    cost_price: 140,
    regular_price: 190,
    selling_price: 170,
    discount: 15,
    amount: 325,
    profit: 45,
  },
  {
    sale_item_id: 27,
    sale_id: 1010,
    product_id: 1, // Dairy Milk
    quantity: 1,
    cost_price: 80,
    regular_price: 100,
    selling_price: 90,
    discount: 0,
    amount: 90,
    profit: 10,
  },
  {
    sale_item_id: 28,
    sale_id: 1010,
    product_id: 10, // Coke Zero
    quantity: 1,
    cost_price: 35,
    regular_price: 48,
    selling_price: 42,
    discount: 0,
    amount: 42,
    profit: 7,
  },
];
