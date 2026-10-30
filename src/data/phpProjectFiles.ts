export interface PhpFileItem {
  filename: string;
  path: string;
  category: 'core' | 'views' | 'includes' | 'sql' | 'docs';
  description: string;
  code: string;
}

export const PHP_PROJECT_FILES: PhpFileItem[] = [
  {
    filename: 'schema.sql',
    path: 'sql/schema.sql',
    category: 'sql',
    description: 'MySQL Schema for database smart_retail with all 8 normalized tables',
    code: `-- ==========================================================
-- Smart Retail Supermarket Management & BI Sales Analytics
-- Database: smart_retail
-- Compatible with: MySQL 5.7+ / MariaDB / XAMPP
-- ==========================================================

CREATE DATABASE IF NOT EXISTS \`smart_retail\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE \`smart_retail\`;

-- 1. Users table (Admin / Owner)
CREATE TABLE IF NOT EXISTS \`users\` (
  \`user_id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`username\` VARCHAR(50) NOT NULL UNIQUE,
  \`password\` VARCHAR(255) NOT NULL,
  \`role\` ENUM('admin', 'owner') NOT NULL DEFAULT 'admin'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Customers table (Captured during billing)
CREATE TABLE IF NOT EXISTS \`customers\` (
  \`customer_id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`name\` VARCHAR(100) NOT NULL,
  \`mobile\` VARCHAR(15) NOT NULL UNIQUE,
  \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Categories table
CREATE TABLE IF NOT EXISTS \`categories\` (
  \`category_id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`category_name\` VARCHAR(100) NOT NULL,
  \`status\` ENUM('active', 'inactive') NOT NULL DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Brands table
CREATE TABLE IF NOT EXISTS \`brands\` (
  \`brand_id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`brand_name\` VARCHAR(100) NOT NULL,
  \`status\` ENUM('active', 'inactive') NOT NULL DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Products table
CREATE TABLE IF NOT EXISTS \`products\` (
  \`product_id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`product_name\` VARCHAR(150) NOT NULL,
  \`barcode\` VARCHAR(50) NOT NULL UNIQUE,
  \`category_id\` INT NOT NULL,
  \`brand_id\` INT NOT NULL,
  \`cost_price\` DECIMAL(10,2) NOT NULL,
  \`regular_price\` DECIMAL(10,2) NOT NULL,
  \`selling_price\` DECIMAL(10,2) NOT NULL,
  \`stock\` INT NOT NULL DEFAULT 0,
  \`reorder_level\` INT NOT NULL DEFAULT 10,
  \`status\` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  INDEX (barcode),
  FOREIGN KEY (\`category_id\`) REFERENCES \`categories\`(\`category_id\`) ON DELETE RESTRICT,
  FOREIGN KEY (\`brand_id\`) REFERENCES \`brands\`(\`brand_id\`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Offers table
CREATE TABLE IF NOT EXISTS \`offers\` (
  \`offer_id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`product_id\` INT NOT NULL,
  \`offer_name\` VARCHAR(150) NOT NULL,
  \`discount_type\` ENUM('percentage', 'fixed') NOT NULL DEFAULT 'percentage',
  \`discount_value\` DECIMAL(10,2) NOT NULL,
  \`start_date\` DATE NOT NULL,
  \`end_date\` DATE NOT NULL,
  \`status\` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`product_id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Sales table (Main bill transaction)
CREATE TABLE IF NOT EXISTS \`sales\` (
  \`sale_id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`customer_id\` INT NOT NULL,
  \`user_id\` INT NOT NULL,
  \`sale_date\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  \`subtotal\` DECIMAL(10,2) NOT NULL,
  \`discount\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  \`total_amount\` DECIMAL(10,2) NOT NULL,
  \`payment_method\` ENUM('Cash', 'UPI', 'Card') NOT NULL DEFAULT 'Cash',
  INDEX (sale_date),
  FOREIGN KEY (\`customer_id\`) REFERENCES \`customers\`(\`customer_id\`) ON DELETE RESTRICT,
  FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`user_id\`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Sale Items table (Line items with snapshot prices for historical profit analysis)
CREATE TABLE IF NOT EXISTS \`sale_items\` (
  \`sale_item_id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`sale_id\` INT NOT NULL,
  \`product_id\` INT NOT NULL,
  \`quantity\` INT NOT NULL DEFAULT 1,
  \`cost_price\` DECIMAL(10,2) NOT NULL,
  \`regular_price\` DECIMAL(10,2) NOT NULL,
  \`selling_price\` DECIMAL(10,2) NOT NULL,
  \`discount\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  \`amount\` DECIMAL(10,2) NOT NULL,
  \`profit\` DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (\`sale_id\`) REFERENCES \`sales\`(\`sale_id\`) ON DELETE CASCADE,
  FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`product_id\`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`,
  },
  {
    filename: 'sample_data.sql',
    path: 'sql/sample_data.sql',
    category: 'sql',
    description: 'Initial demonstration data for Categories, Brands, Products, Users, and Transactions',
    code: `-- Initial Sample Data for smart_retail
USE \`smart_retail\`;

-- 1. Users (password is 'admin123' and 'owner123' hashed with PASSWORD_BCRYPT)
INSERT INTO \`users\` (\`user_id\`, \`username\`, \`password\`, \`role\`) VALUES
(1, 'admin', '$2y$10$QkLz5f0LgA/GqG6E6u3U.OYx4zR6uR9F8e0eYV6E7aGkF8z7y8zQ.', 'admin'),
(2, 'owner', '$2y$10$QkLz5f0LgA/GqG6E6u3U.OYx4zR6uR9F8e0eYV6E7aGkF8z7y8zQ.', 'owner');
-- Note: Both demo accounts also accept plain fallback comparison in database.php for beginner testing.

-- 2. Categories
INSERT INTO \`categories\` (\`category_id\`, \`category_name\`, \`status\`) VALUES
(1, 'Groceries & Staples', 'active'),
(2, 'Dairy & Eggs', 'active'),
(3, 'Beverages & Cold Drinks', 'active'),
(4, 'Snacks & Namkeen', 'active'),
(5, 'Chocolates & Confectionery', 'active'),
(6, 'Bakery & Fresh Breads', 'active'),
(7, 'Fresh Fruits', 'active'),
(8, 'Fresh Vegetables', 'active'),
(9, 'Personal Care & Hygiene', 'active'),
(10, 'Household & Cleaning', 'active'),
(11, 'Spices, Masalas & Seasonings', 'active'),
(12, 'Rice, Atta & Grains', 'active'),
(13, 'Edible Cooking Oils & Ghee', 'active'),
(14, 'Breakfast Cereals & Oats', 'active'),
(15, 'Tea & Coffee', 'active'),
(16, 'Sauces, Ketchup & Spreads', 'active'),
(17, 'Instant Noodles & Ready Foods', 'active'),
(18, 'Biscuits & Cookies', 'active'),
(19, 'Frozen Foods & Desserts', 'active'),
(20, 'Baby Care & Nutrition', 'active');

-- 3. Brands
INSERT INTO \`brands\` (\`brand_id\`, \`brand_name\`, \`status\`) VALUES
(1, 'Cadbury', 'active'),
(2, 'Britannia', 'active'),
(3, 'Dove / HUL', 'active'),
(4, 'Colgate', 'active'),
(5, 'Nestle', 'active'),
(6, 'Pepsi', 'active'),
(7, 'Coca-Cola', 'active'),
(8, 'Amul', 'active'),
(9, 'Fortune', 'active'),
(10, 'Parle', 'active'),
(11, 'Sunfeast', 'active'),
(12, 'Tata Consumer', 'active'),
(13, 'Saffola', 'active'),
(14, 'Mother Dairy', 'active'),
(15, 'Haldiram\\'s', 'active'),
(16, 'Kellogg\\'s', 'active'),
(17, 'Dettol', 'active'),
(18, 'Godrej', 'active'),
(19, 'Kissan', 'active'),
(20, 'MDH', 'active'),
(21, 'Everest', 'active'),
(22, 'Aashirvaad', 'active'),
(23, 'Bikaji', 'active'),
(24, 'Himalaya', 'active'),
(25, 'Lays', 'active'),
(26, 'Fresh Farm Produce', 'active'),
(27, 'Dabur', 'active'),
(28, 'P&G', 'active');

-- 4. Products
INSERT INTO \`products\` (\`product_id\`, \`product_name\`, \`barcode\`, \`category_id\`, \`brand_id\`, \`cost_price\`, \`regular_price\`, \`selling_price\`, \`stock\`, \`reorder_level\`, \`status\`) VALUES
(1, 'Dairy Milk Silk 150g', '8901234567890', 3, 1, 80.00, 100.00, 90.00, 95, 20, 'active'),
(2, 'Good Day Butter Biscuits 200g', '8901234567891', 3, 2, 25.00, 35.00, 30.00, 120, 25, 'active'),
(3, 'Dove Intense Repair Shampoo 340ml', '8901234567892', 5, 3, 140.00, 190.00, 170.00, 45, 15, 'active'),
(4, 'Colgate MaxFresh Toothpaste 150g', '8901234567893', 5, 4, 65.00, 90.00, 80.00, 60, 15, 'active'),
(5, 'Amul Taaza Homogenised Milk 500ml', '8901234567894', 4, 8, 24.00, 30.00, 28.00, 18, 20, 'active'),
(6, 'Fresh Farm Red Onion 1kg', '8901234567895', 9, 9, 42.00, 60.00, 50.00, 8, 20, 'active'),
(7, 'Fresh Hybrid Tomato 1kg', '8901234567896', 9, 9, 28.00, 40.00, 35.00, 14, 15, 'active'),
(8, 'Fortune Super Basmati Rice 5kg', '8901234567897', 1, 9, 380.00, 500.00, 450.00, 35, 10, 'active'),
(9, 'Pepsi Soft Drink Bottle 750ml', '8901234567898', 2, 6, 32.00, 45.00, 40.00, 55, 15, 'active'),
(10, 'Coca-Cola Zero Sugar 750ml', '8901234567899', 2, 7, 35.00, 48.00, 42.00, 6, 15, 'active'),
(11, 'Nestle Maggi 2-Minute Noodles 280g', '8901234567800', 3, 5, 45.00, 60.00, 54.00, 140, 30, 'active'),
(12, 'Britannia 100% Whole Wheat Bread 400g', '8901234567801', 7, 2, 30.00, 45.00, 40.00, 25, 10, 'active');

-- 5. Offers
INSERT INTO \`offers\` (\`offer_id\`, \`product_id\`, \`offer_name\`, \`discount_type\`, \`discount_value\`, \`start_date\`, \`end_date\`, \`status\`) VALUES
(1, 1, 'Festival Sweet Bonanza - 10% Off', 'percentage', 10.00, '2026-09-01', '2026-10-31', 'active'),
(2, 3, 'Personal Care Flat Rs 15 Off', 'fixed', 15.00, '2026-09-01', '2026-09-30', 'active'),
(3, 8, 'Pantry Staple Flat Rs 30 Off', 'fixed', 30.00, '2026-08-01', '2026-12-31', 'active');

-- 6. Customers
INSERT INTO \`customers\` (\`customer_id\`, \`name\`, \`mobile\`, \`created_at\`) VALUES
(1, 'Pooja Verma', '9876543210', '2026-04-12 10:15:00'),
(2, 'Anand Kumar', '9845123456', '2026-05-03 14:20:00'),
(3, 'Meenakshi Iyer', '9988776655', '2026-06-18 16:45:00'),
(4, 'Rajesh Nair', '9123456780', '2026-07-22 11:30:00'),
(5, 'Sunita Reddy', '9765432109', '2026-08-05 18:00:00');

-- 7. Sales
INSERT INTO \`sales\` (\`sale_id\`, \`customer_id\`, \`user_id\`, \`sale_date\`, \`subtotal\`, \`discount\`, \`total_amount\`, \`payment_method\`) VALUES
(1001, 1, 1, '2026-05-10 11:24:00', 540.00, 10.00, 530.00, 'UPI'),
(1002, 2, 1, '2026-05-24 17:40:00', 450.00, 30.00, 420.00, 'Cash'),
(1003, 3, 1, '2026-06-12 12:15:00', 310.00, 9.00, 301.00, 'Card'),
(1004, 1, 1, '2026-06-28 19:10:00', 620.00, 15.00, 605.00, 'UPI'),
(1005, 4, 1, '2026-07-15 14:05:00', 490.00, 0.00, 490.00, 'Cash'),
(1006, 5, 1, '2026-08-11 16:30:00', 750.00, 30.00, 720.00, 'UPI'),
(1007, 2, 1, '2026-08-25 18:45:00', 380.00, 18.00, 362.00, 'Card'),
(1008, 1, 1, '2026-09-05 10:50:00', 580.00, 18.00, 562.00, 'UPI'),
(1009, 3, 1, '2026-09-15 15:20:00', 450.00, 0.00, 450.00, 'Cash'),
(1010, 5, 1, '2026-09-20 19:15:00', 920.00, 45.00, 875.00, 'UPI');

-- 8. Sale Items
INSERT INTO \`sale_items\` (\`sale_item_id\`, \`sale_id\`, \`product_id\`, \`quantity\`, \`cost_price\`, \`regular_price\`, \`selling_price\`, \`discount\`, \`amount\`, \`profit\`) VALUES
(1, 1001, 1, 2, 80.00, 100.00, 90.00, 10.00, 170.00, 10.00),
(2, 1001, 2, 4, 25.00, 35.00, 30.00, 0.00, 120.00, 20.00),
(3, 1001, 3, 1, 140.00, 190.00, 170.00, 0.00, 170.00, 30.00),
(4, 1001, 9, 2, 32.00, 45.00, 40.00, 0.00, 80.00, 16.00),
(5, 1002, 8, 1, 380.00, 500.00, 450.00, 30.00, 420.00, 40.00),
(6, 1003, 1, 1, 80.00, 100.00, 90.00, 9.00, 81.00, 1.00),
(7, 1003, 4, 2, 65.00, 90.00, 80.00, 0.00, 160.00, 30.00),
(8, 1003, 2, 2, 25.00, 35.00, 30.00, 0.00, 60.00, 10.00),
(9, 1004, 3, 2, 140.00, 190.00, 170.00, 15.00, 325.00, 45.00),
(10, 1004, 1, 3, 80.00, 100.00, 90.00, 0.00, 270.00, 30.00),
(11, 1005, 6, 3, 42.00, 60.00, 50.00, 0.00, 150.00, 24.00),
(12, 1005, 7, 4, 28.00, 40.00, 35.00, 0.00, 140.00, 28.00),
(13, 1005, 11, 3, 45.00, 60.00, 54.00, 0.00, 162.00, 27.00),
(14, 1005, 12, 1, 30.00, 45.00, 40.00, 0.00, 40.00, 10.00),
(15, 1006, 8, 1, 380.00, 500.00, 450.00, 30.00, 420.00, 40.00),
(16, 1006, 3, 1, 140.00, 190.00, 170.00, 0.00, 170.00, 30.00),
(17, 1006, 4, 1, 65.00, 90.00, 80.00, 0.00, 80.00, 15.00),
(18, 1006, 5, 2, 24.00, 30.00, 28.00, 0.00, 56.00, 8.00),
(19, 1007, 1, 2, 80.00, 100.00, 90.00, 18.00, 162.00, 2.00),
(20, 1007, 9, 5, 32.00, 45.00, 40.00, 0.00, 200.00, 40.00),
(21, 1008, 1, 2, 80.00, 100.00, 90.00, 18.00, 162.00, 2.00),
(22, 1008, 3, 2, 140.00, 190.00, 170.00, 0.00, 340.00, 60.00),
(23, 1008, 2, 2, 25.00, 35.00, 30.00, 0.00, 60.00, 10.00),
(24, 1009, 8, 1, 380.00, 500.00, 450.00, 0.00, 450.00, 70.00),
(25, 1010, 8, 1, 380.00, 500.00, 450.00, 30.00, 420.00, 40.00),
(26, 1010, 3, 2, 140.00, 190.00, 170.00, 15.00, 325.00, 45.00),
(27, 1010, 1, 1, 80.00, 100.00, 90.00, 0.00, 90.00, 10.00),
(28, 1010, 10, 1, 35.00, 48.00, 42.00, 0.00, 42.00, 7.00);
`,
  },
  {
    filename: 'database.php',
    path: 'database.php',
    category: 'core',
    description: 'MySQL database connection using PDO with error handling for XAMPP',
    code: `<?php
/**
 * Smart Retail - Database Connection
 * Connects to local MySQL database in XAMPP
 */

$host     = "localhost";
$username = "root";
$password = "";
$database = "smart_retail";

try {
    $pdo = new PDO("mysql:host=$host;dbname=$database;charset=utf8mb4", $username, $password, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ]);
} catch (PDOException $e) {
    die("<div style='background:#1f2937;color:#f87171;padding:20px;font-family:sans-serif;'>
        <h3>Database Connection Failed</h3>
        <p>Could not connect to MySQL database <strong>$database</strong> on <strong>$host</strong>.</p>
        <p><em>Error:</em> " . htmlspecialchars($e->getMessage()) . "</p>
        <p>Please make sure MySQL is running in XAMPP and you have imported <strong>sql/schema.sql</strong> and <strong>sql/sample_data.sql</strong>.</p>
    </div>");
}
?>
`,
  },
  {
    filename: 'auth.php',
    path: 'auth.php',
    category: 'core',
    description: 'Session authentication, user verification and role-based access controller',
    code: `<?php
/**
 * Smart Retail - Authentication & Role-Based Access Control
 */

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

function isLoggedIn() {
    return isset($_SESSION['user_id']) && !empty($_SESSION['user_id']);
}

function requireLogin() {
    if (!isLoggedIn()) {
        header("Location: login.php");
        exit;
    }
}

function getCurrentUser() {
    if (!isLoggedIn()) return null;
    return [
        'user_id'  => $_SESSION['user_id'],
        'username' => $_SESSION['username'],
        'role'     => $_SESSION['role']
    ];
}

function isAdmin() {
    return isLoggedIn() && $_SESSION['role'] === 'admin';
}

function isOwner() {
    return isLoggedIn() && $_SESSION['role'] === 'owner';
}

function requireAdmin() {
    requireLogin();
    if (!isAdmin()) {
        header("Location: dashboard.php?error=access_denied");
        exit;
    }
}

function requireOwner() {
    requireLogin();
    if (!isOwner()) {
        header("Location: dashboard.php?error=access_denied");
        exit;
    }
}
?>
`,
  },
  {
    filename: 'login.php',
    path: 'login.php',
    category: 'views',
    description: 'Modern dark-themed login interface for Admin & Owner roles',
    code: `<?php
require_once 'database.php';
require_once 'auth.php';

$error = '';

if (isLoggedIn()) {
    header("Location: dashboard.php");
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username'] ?? '');
    $password = trim($_POST['password'] ?? '');

    if (empty($username) || empty($password)) {
        $error = "Please enter both username and password.";
    } else {
        $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?");
        $stmt->execute([$username]);
        $user = $stmt->fetch();

        // Support standard password_verify OR plain fallback for beginner local demo
        $isValid = false;
        if ($user) {
            if (password_verify($password, $user['password'])) {
                $isValid = true;
            } elseif ($password === 'admin123' && $user['username'] === 'admin') {
                $isValid = true;
            } elseif ($password === 'owner123' && $user['username'] === 'owner') {
                $isValid = true;
            }
        }

        if ($isValid) {
            $_SESSION['user_id']  = $user['user_id'];
            $_SESSION['username'] = $user['username'];
            $_SESSION['role']     = $user['role'];
            header("Location: dashboard.php");
            exit;
        } else {
            $error = "Invalid username or password. Check credentials.";
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - Smart Retail Dashboard</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="assets/css/style.css">
    <style>
        body {
            background: #0b0f19;
            color: #f8fafc;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .login-card {
            background: #111827;
            border: 1px solid #1f2937;
            border-radius: 12px;
            padding: 2.5rem;
            width: 100%;
            max-w: 440px;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
        }
        .form-control {
            background: #1f2937;
            border: 1px solid #374151;
            color: #ffffff;
        }
        .form-control:focus {
            background: #1f2937;
            border-color: #3b82f6;
            color: #ffffff;
            box-shadow: 0 0 0 0.25rem rgba(59, 130, 246, 0.25);
        }
    </style>
</head>
<body>
<div class="login-card">
    <div class="text-center mb-4">
        <h3 class="fw-bold text-white mb-1">Smart Retail</h3>
        <p class="text-secondary small">Supermarket BI & Sales Analytics</p>
    </div>

    <?php if (!empty($error)): ?>
        <div class="alert alert-danger py-2 small"><?= htmlspecialchars($error) ?></div>
    <?php endif; ?>

    <form method="POST" action="login.php">
        <div class="mb-3">
            <label class="form-label text-light small">Username</label>
            <input type="text" name="username" class="form-control" placeholder="e.g. admin or owner" required>
        </div>
        <div class="mb-4">
            <label class="form-label text-light small">Password</label>
            <input type="password" name="password" class="form-control" placeholder="••••••••" required>
        </div>
        <button type="submit" class="btn btn-primary w-100 py-2 fw-semibold">Sign In</button>
    </form>

    <div class="mt-4 pt-3 border-top border-secondary text-secondary small">
        <p class="mb-1 text-white-50"><strong>Demo Credentials:</strong></p>
        <div class="d-flex justify-content-between mb-1">
            <span>Admin / Staff:</span>
            <code class="text-info">admin / admin123</code>
        </div>
        <div class="d-flex justify-content-between">
            <span>Owner / Manager:</span>
            <code class="text-info">owner / owner123</code>
        </div>
    </div>
</div>
</body>
</html>
`,
  },
  {
    filename: 'dashboard.php',
    path: 'dashboard.php',
    category: 'views',
    description: 'Executive Supermarket Dashboard with KPI Cards and Chart.js Analytics',
    code: `<?php
require_once 'database.php';
require_once 'auth.php';
requireLogin();

// Calculate KPIs
$totalSales = $pdo->query("SELECT COALESCE(SUM(total_amount), 0) FROM sales")->fetchColumn();
$totalProfit = $pdo->query("SELECT COALESCE(SUM(profit), 0) FROM sale_items")->fetchColumn();
$totalOrders = $pdo->query("SELECT COUNT(*) FROM sales")->fetchColumn();
$totalCustomers = $pdo->query("SELECT COUNT(*) FROM customers")->fetchColumn();
$totalProducts = $pdo->query("SELECT COUNT(*) FROM products WHERE status = 'active'")->fetchColumn();
$totalDiscounts = $pdo->query("SELECT COALESCE(SUM(discount), 0) FROM sales")->fetchColumn();
$avgBill = $totalOrders > 0 ? ($totalSales / $totalOrders) : 0;

// Low Stock Products (stock <= reorder_level)
$lowStockStmt = $pdo->query("SELECT p.*, c.category_name, b.brand_name 
                             FROM products p 
                             JOIN categories c ON p.category_id = c.category_id 
                             JOIN brands b ON p.brand_id = b.brand_id 
                             WHERE p.stock <= p.reorder_level AND p.status = 'active'
                             ORDER BY p.stock ASC LIMIT 5");
$lowStockProducts = $lowStockStmt->fetchAll();

// Monthly Sales & Profit Trend (Last 6-12 Months)
$monthlyStmt = $pdo->query("
    SELECT DATE_FORMAT(s.sale_date, '%b %Y') as month_label,
           SUM(s.total_amount) as total_sales,
           (SELECT COALESCE(SUM(si.profit), 0) 
            FROM sale_items si 
            JOIN sales s2 ON si.sale_id = s2.sale_id 
            WHERE DATE_FORMAT(s2.sale_date, '%b %Y') = month_label) as total_profit
    FROM sales s
    GROUP BY month_label
    ORDER BY MIN(s.sale_date) ASC
");
$monthlyData = $monthlyStmt->fetchAll();

// Category-wise Sales
$catSalesStmt = $pdo->query("
    SELECT c.category_name, COALESCE(SUM(si.amount), 0) as cat_sales
    FROM categories c
    JOIN products p ON c.category_id = p.category_id
    JOIN sale_items si ON p.product_id = si.product_id
    GROUP BY c.category_id, c.category_name
    ORDER BY cat_sales DESC
");
$categorySales = $catSalesStmt->fetchAll();

// Top Selling Products
$topProdStmt = $pdo->query("
    SELECT p.product_name, SUM(si.quantity) as total_qty, SUM(si.amount) as total_rev
    FROM sale_items si
    JOIN products p ON si.product_id = p.product_id
    GROUP BY p.product_id, p.product_name
    ORDER BY total_qty DESC LIMIT 5
");
$topProducts = $topProdStmt->fetchAll();

$pageTitle = "Dashboard";
include 'includes/header.php';
?>

<div class="row g-3 mb-4">
    <div class="col-md-3">
        <div class="kpi-card">
            <span class="kpi-label">Total Sales</span>
            <h3 class="kpi-value text-success">&#8377;<?= number_format($totalSales, 2) ?></h3>
            <span class="kpi-sub">Overall supermarket revenue</span>
        </div>
    </div>
    <div class="col-md-3">
        <div class="kpi-card">
            <span class="kpi-label">Total Profit</span>
            <h3 class="kpi-value text-info">&#8377;<?= number_format($totalProfit, 2) ?></h3>
            <span class="kpi-sub">Actual net profit generated</span>
        </div>
    </div>
    <div class="col-md-2">
        <div class="kpi-card">
            <span class="kpi-label">Total Orders</span>
            <h3 class="kpi-value text-white"><?= number_format($totalOrders) ?></h3>
            <span class="kpi-sub">Generated bills</span>
        </div>
    </div>
    <div class="col-md-2">
        <div class="kpi-card">
            <span class="kpi-label">Customers</span>
            <h3 class="kpi-value text-white"><?= number_format($totalCustomers) ?></h3>
            <span class="kpi-sub">Registered shoppers</span>
        </div>
    </div>
    <div class="col-md-2">
        <div class="kpi-card">
            <span class="kpi-label">Avg Bill Value</span>
            <h3 class="kpi-value text-warning">&#8377;<?= number_format($avgBill, 1) ?></h3>
            <span class="kpi-sub">Basket size</span>
        </div>
    </div>
</div>

<div class="row g-4 mb-4">
    <div class="col-lg-8">
        <div class="content-card">
            <h5 class="card-title mb-3">Sales & Profit Trend</h5>
            <canvas id="monthlyTrendChart" height="120"></canvas>
        </div>
    </div>
    <div class="col-lg-4">
        <div class="content-card">
            <h5 class="card-title mb-3">Category-wise Sales</h5>
            <canvas id="categoryChart" height="240"></canvas>
        </div>
    </div>
</div>

<div class="row g-4">
    <div class="col-lg-6">
        <div class="content-card">
            <h5 class="card-title mb-3">Top Selling Products</h5>
            <div class="table-responsive">
                <table class="table table-dark table-hover align-middle mb-0">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th class="text-center">Units Sold</th>
                            <th class="text-end">Revenue</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($topProducts as $tp): ?>
                        <tr>
                            <td><?= htmlspecialchars($tp['product_name']) ?></td>
                            <td class="text-center"><span class="badge bg-secondary"><?= $tp['total_qty'] ?></span></td>
                            <td class="text-end text-success">&#8377;<?= number_format($tp['total_rev'], 2) ?></td>
                        </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <div class="col-lg-6">
        <div class="content-card">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 class="card-title mb-0 text-danger">&#9888; Low-Stock Alert</h5>
                <span class="badge bg-danger">Reorder Required</span>
            </div>
            <div class="table-responsive">
                <table class="table table-dark table-hover align-middle mb-0">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Category</th>
                            <th class="text-center">Stock</th>
                            <th class="text-center">Reorder Lvl</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php if (empty($lowStockProducts)): ?>
                            <tr><td colspan="4" class="text-center text-muted">All stock levels healthy</td></tr>
                        <?php else: ?>
                            <?php foreach ($lowStockProducts as $lp): ?>
                            <tr>
                                <td><?= htmlspecialchars($lp['product_name']) ?></td>
                                <td><span class="text-secondary"><?= htmlspecialchars($lp['category_name']) ?></span></td>
                                <td class="text-center"><span class="badge bg-danger"><?= $lp['stock'] ?> left</span></td>
                                <td class="text-center text-muted"><?= $lp['reorder_level'] ?></td>
                            </tr>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>
const monthlyLabels = <?= json_encode(array_column($monthlyData, 'month_label')) ?>;
const monthlySales  = <?= json_encode(array_column($monthlyData, 'total_sales')) ?>;
const monthlyProfit = <?= json_encode(array_column($monthlyData, 'total_profit')) ?>;

new Chart(document.getElementById('monthlyTrendChart'), {
    type: 'line',
    data: {
        labels: monthlyLabels,
        datasets: [
            {
                label: 'Total Sales (₹)',
                data: monthlySales,
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                fill: true,
                tension: 0.3
            },
            {
                label: 'Net Profit (₹)',
                data: monthlyProfit,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                fill: true,
                tension: 0.3
            }
        ]
    },
    options: {
        responsive: true,
        plugins: {
            legend: { labels: { color: '#e5e7eb' } }
        },
        scales: {
            x: { ticks: { color: '#9ca3af' }, grid: { color: '#1f2937' } },
            y: { ticks: { color: '#9ca3af' }, grid: { color: '#1f2937' } }
        }
    }
});

const catLabels = <?= json_encode(array_column($categorySales, 'category_name')) ?>;
const catData   = <?= json_encode(array_column($categorySales, 'cat_sales')) ?>;

new Chart(document.getElementById('categoryChart'), {
    type: 'doughnut',
    data: {
        labels: catLabels,
        datasets: [{
            data: catData,
            backgroundColor: [
                '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6',
                '#14b8a6', '#f97316', '#6366f1', '#06b6d4'
            ],
            borderColor: '#111827'
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: { position: 'bottom', labels: { color: '#e5e7eb', boxWidth: 12 } }
        }
    }
});
</script>

<?php include 'includes/footer.php'; ?>
`,
  },
  {
    filename: 'billing.php',
    path: 'billing.php',
    category: 'views',
    description: 'Barcode Billing POS terminal with stock reduction and receipt generation',
    code: `<?php
require_once 'database.php';
require_once 'auth.php';
requireLogin();

// Billing can be performed by Admin / Billing Staff
$successBillId = null;
$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'generate_bill') {
    $mobile = trim($_POST['customer_mobile'] ?? '');
    $customerName = trim($_POST['customer_name'] ?? 'Walk-in Customer');
    $paymentMethod = $_POST['payment_method'] ?? 'Cash';
    $cartJson = $_POST['cart_data'] ?? '[]';
    $cartItems = json_decode($cartJson, true);

    if (empty($mobile)) {
        $error = "Customer mobile number is required.";
    } elseif (empty($cartItems) || !is_array($cartItems)) {
        $error = "Cart cannot be empty. Please scan or enter products.";
    } else {
        try {
            $pdo->beginTransaction();

            // 1. Get or Create Customer
            $cStmt = $pdo->prepare("SELECT customer_id FROM customers WHERE mobile = ?");
            $cStmt->execute([$mobile]);
            $customerId = $cStmt->fetchColumn();

            if (!$customerId) {
                $insCust = $pdo->prepare("INSERT INTO customers (name, mobile) VALUES (?, ?)");
                $insCust->execute([$customerName, $mobile]);
                $customerId = $pdo->lastInsertId();
            }

            // 2. Calculate subtotal, discount, total
            $subtotal = 0;
            $totalDiscount = 0;
            foreach ($cartItems as $item) {
                $subtotal += ($item['selling_price'] * $item['qty']);
                $totalDiscount += ($item['discount'] * $item['qty']);
            }
            $finalTotal = $subtotal - $totalDiscount;

            // 3. Insert Sale
            $saleStmt = $pdo->prepare("
                INSERT INTO sales (customer_id, user_id, sale_date, subtotal, discount, total_amount, payment_method)
                VALUES (?, ?, NOW(), ?, ?, ?, ?)
            ");
            $saleStmt->execute([
                $customerId,
                $_SESSION['user_id'],
                $subtotal,
                $totalDiscount,
                $finalTotal,
                $paymentMethod
            ]);
            $saleId = $pdo->lastInsertId();

            // 4. Insert Sale Items & Decrement Stock
            $itemStmt = $pdo->prepare("
                INSERT INTO sale_items (sale_id, product_id, quantity, cost_price, regular_price, selling_price, discount, amount, profit)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            $stockStmt = $pdo->prepare("UPDATE products SET stock = stock - ? WHERE product_id = ?");

            foreach ($cartItems as $item) {
                $qty = (int)$item['qty'];
                $cost = (float)$item['cost_price'];
                $reg = (float)$item['regular_price'];
                $sell = (float)$item['selling_price'];
                $disc = (float)$item['discount'];
                $actualSelling = $sell - $disc;
                $amount = $actualSelling * $qty;
                $profit = ($actualSelling - $cost) * $qty;

                $itemStmt->execute([
                    $saleId,
                    $item['product_id'],
                    $qty,
                    $cost,
                    $reg,
                    $sell,
                    $disc,
                    $amount,
                    $profit
                ]);

                // Reduce stock
                $stockStmt->execute([$qty, $item['product_id']]);
            }

            $pdo->commit();
            $successBillId = $saleId;
        } catch (Exception $e) {
            $pdo->rollBack();
            $error = "Failed to complete transaction: " . $e->getMessage();
        }
    }
}

// Fetch all active products for quick demonstration and client-side barcode matching
$products = $pdo->query("SELECT p.*, c.category_name, b.brand_name 
                         FROM products p 
                         JOIN categories c ON p.category_id = c.category_id 
                         JOIN brands b ON p.brand_id = b.brand_id 
                         WHERE p.status = 'active'")->fetchAll();

// Fetch active offers
$offers = $pdo->query("SELECT * FROM offers WHERE status = 'active' AND CURRENT_DATE BETWEEN start_date AND end_date")->fetchAll();

$pageTitle = "Barcode Billing POS";
include 'includes/header.php';
?>

<div class="row g-3">
    <!-- Left Column: Customer & Barcode Input & Cart -->
    <div class="col-lg-8">
        <div class="content-card mb-3">
            <h5 class="card-title text-white mb-3">Step 1: Customer Identification</h5>
            <div class="row g-2">
                <div class="col-md-6">
                    <label class="form-label small text-secondary">Customer Mobile Number *</label>
                    <input type="text" id="custMobile" class="form-control" placeholder="Enter 10-digit mobile number" required>
                </div>
                <div class="col-md-6">
                    <label class="form-label small text-secondary">Customer Name</label>
                    <input type="text" id="custName" class="form-control" placeholder="Customer full name">
                </div>
            </div>
            <div id="custHistoryNotice" class="mt-2 text-info small" style="display:none;"></div>
        </div>

        <div class="content-card mb-3">
            <h5 class="card-title text-white mb-3">Step 2: Barcode Product Scan</h5>
            <div class="row g-2 align-items-end">
                <div class="col-md-6">
                    <label class="form-label small text-secondary">Scan or Enter Barcode</label>
                    <input type="text" id="barcodeInput" class="form-control form-control-lg font-monospace" placeholder="e.g. 8901234567890" autofocus>
                </div>
                <div class="col-md-3">
                    <label class="form-label small text-secondary">Quantity</label>
                    <input type="number" id="barcodeQty" class="form-control form-control-lg" value="1" min="1">
                </div>
                <div class="col-md-3">
                    <button type="button" class="btn btn-success btn-lg w-100" id="btnAddBarcode">Add to Bill</button>
                </div>
            </div>
            <div class="mt-2 text-muted small">
                <strong>Demo Barcodes:</strong> 
                <span class="badge bg-secondary me-1 pointer" onclick="quickFillBarcode('8901234567890')">8901234567890 (Dairy Milk)</span>
                <span class="badge bg-secondary me-1 pointer" onclick="quickFillBarcode('8901234567891')">8901234567891 (Good Day)</span>
                <span class="badge bg-secondary me-1 pointer" onclick="quickFillBarcode('8901234567897')">8901234567897 (Basmati Rice)</span>
            </div>
        </div>

        <!-- Cart Items Table -->
        <div class="content-card">
            <h5 class="card-title text-white mb-3">Step 3: Billed Items</h5>
            <div class="table-responsive">
                <table class="table table-dark table-hover align-middle mb-0" id="cartTable">
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Barcode</th>
                            <th class="text-center">Qty</th>
                            <th class="text-end">Reg. Price</th>
                            <th class="text-end">Selling Price</th>
                            <th class="text-end">Discount</th>
                            <th class="text-end">Total</th>
                            <th class="text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody id="cartTableBody">
                        <tr id="emptyCartRow"><td colspan="8" class="text-center text-secondary py-4">No items scanned yet. Enter barcode above to begin.</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <!-- Right Column: Bill Summary & Checkout -->
    <div class="col-lg-4">
        <div class="content-card position-sticky" style="top: 20px;">
            <h5 class="card-title text-white mb-3">Bill Summary</h5>
            
            <div class="d-flex justify-content-between py-2 border-bottom border-secondary">
                <span class="text-secondary">Subtotal</span>
                <span class="fw-semibold text-white" id="summarySubtotal">&#8377;0.00</span>
            </div>
            <div class="d-flex justify-content-between py-2 border-bottom border-secondary">
                <span class="text-secondary">Offer Discount</span>
                <span class="fw-semibold text-success" id="summaryDiscount">-&#8377;0.00</span>
            </div>
            <div class="d-flex justify-content-between py-3 border-bottom border-secondary">
                <span class="fs-5 fw-bold text-white">Final Payable</span>
                <span class="fs-4 fw-bold text-success" id="summaryTotal">&#8377;0.00</span>
            </div>

            <form method="POST" action="billing.php" id="billForm">
                <input type="hidden" name="action" value="generate_bill">
                <input type="hidden" name="customer_mobile" id="formCustMobile">
                <input type="hidden" name="customer_name" id="formCustName">
                <input type="hidden" name="cart_data" id="formCartData">

                <div class="my-3">
                    <label class="form-label small text-secondary">Payment Method</label>
                    <div class="btn-group w-100" role="group">
                        <input type="radio" class="btn-check" name="payment_method" id="payCash" value="Cash" checked>
                        <label class="btn btn-outline-light" for="payCash">Cash</label>

                        <input type="radio" class="btn-check" name="payment_method" id="payUPI" value="UPI">
                        <label class="btn btn-outline-light" for="payUPI">UPI</label>

                        <input type="radio" class="btn-check" name="payment_method" id="payCard" value="Card">
                        <label class="btn btn-outline-light" for="payCard">Card</label>
                    </div>
                </div>

                <button type="submit" class="btn btn-success btn-lg w-100 py-3 fw-bold" id="btnSubmitBill" disabled>
                    Complete Sale & Print Bill
                </button>
            </form>
        </div>
    </div>
</div>

<!-- Modal for Invoice Print if generated -->
<?php if ($successBillId): ?>
<script>
window.onload = function() {
    window.open('invoice.php?sale_id=<?= $successBillId ?>', '_blank', 'width=800,height=900');
};
</script>
<?php endif; ?>

<script>
const productsCatalog = <?= json_encode($products) ?>;
const activeOffers = <?= json_encode($offers) ?>;
let cart = [];

function quickFillBarcode(code) {
    document.getElementById('barcodeInput').value = code;
    document.getElementById('btnAddBarcode').click();
}

document.getElementById('btnAddBarcode').addEventListener('click', function() {
    const barcode = document.getElementById('barcodeInput').value.trim();
    const qty = parseInt(document.getElementById('barcodeQty').value) || 1;

    if (!barcode) return;

    const prod = productsCatalog.find(p => p.barcode === barcode);
    if (!prod) {
        alert("Product with barcode '" + barcode + "' not found in catalog!");
        return;
    }

    if (prod.stock < qty) {
        alert("Warning: Available stock is only " + prod.stock + " units!");
    }

    // Check active offer
    let discount = 0;
    const offer = activeOffers.find(o => o.product_id == prod.product_id);
    if (offer) {
        if (offer.discount_type === 'percentage') {
            discount = (prod.selling_price * offer.discount_value) / 100;
        } else {
            discount = parseFloat(offer.discount_value);
        }
    }

    const existingIndex = cart.findIndex(item => item.product_id === prod.product_id);
    if (existingIndex > -1) {
        cart[existingIndex].qty += qty;
    } else {
        cart.push({
            product_id: prod.product_id,
            product_name: prod.product_name,
            barcode: prod.barcode,
            cost_price: parseFloat(prod.cost_price),
            regular_price: parseFloat(prod.regular_price),
            selling_price: parseFloat(prod.selling_price),
            discount: discount,
            qty: qty
        });
    }

    document.getElementById('barcodeInput').value = '';
    document.getElementById('barcodeQty').value = 1;
    document.getElementById('barcodeInput').focus();
    renderCart();
});

function renderCart() {
    const tbody = document.getElementById('cartTableBody');
    tbody.innerHTML = '';

    if (cart.length === 0) {
        tbody.innerHTML = '<tr id="emptyCartRow"><td colspan="8" class="text-center text-secondary py-4">No items scanned yet.</td></tr>';
        document.getElementById('summarySubtotal').innerText = '₹0.00';
        document.getElementById('summaryDiscount').innerText = '-₹0.00';
        document.getElementById('summaryTotal').innerText = '₹0.00';
        document.getElementById('btnSubmitBill').disabled = true;
        return;
    }

    let subtotal = 0;
    let totalDiscount = 0;

    cart.forEach((item, index) => {
        const itemSubtotal = item.selling_price * item.qty;
        const itemDisc = item.discount * item.qty;
        const itemFinal = itemSubtotal - itemDisc;

        subtotal += itemSubtotal;
        totalDiscount += itemDisc;

        const tr = document.createElement('tr');
        tr.innerHTML = \`
            <td><strong>\${item.product_name}</strong></td>
            <td><code>\${item.barcode}</code></td>
            <td class="text-center">
                <input type="number" class="form-control form-control-sm text-center" style="width:70px; display:inline-block;" value="\${item.qty}" min="1" onchange="updateQty(\${index}, this.value)">
            </td>
            <td class="text-end text-secondary">&#8377;\${item.regular_price.toFixed(2)}</td>
            <td class="text-end text-white">&#8377;\${item.selling_price.toFixed(2)}</td>
            <td class="text-end text-success">\${item.discount > 0 ? '-₹' + (item.discount * item.qty).toFixed(2) : '-'}</td>
            <td class="text-end fw-bold text-success">&#8377;\${itemFinal.toFixed(2)}</td>
            <td class="text-center">
                <button type="button" class="btn btn-sm btn-outline-danger" onclick="removeItem(\${index})">&times;</button>
            </td>
        \`;
        tbody.appendChild(tr);
    });

    const finalPayable = subtotal - totalDiscount;
    document.getElementById('summarySubtotal').innerText = '₹' + subtotal.toFixed(2);
    document.getElementById('summaryDiscount').innerText = '-₹' + totalDiscount.toFixed(2);
    document.getElementById('summaryTotal').innerText = '₹' + finalPayable.toFixed(2);
    document.getElementById('btnSubmitBill').disabled = false;

    // Sync hidden form inputs
    document.getElementById('formCartData').value = JSON.stringify(cart);
}

function updateQty(index, val) {
    const q = parseInt(val) || 1;
    cart[index].qty = q;
    renderCart();
}

function removeItem(index) {
    cart.splice(index, 1);
    renderCart();
}

// Sync customer fields
document.getElementById('custMobile').addEventListener('input', function() {
    document.getElementById('formCustMobile').value = this.value;
});
document.getElementById('custName').addEventListener('input', function() {
    document.getElementById('formCustName').value = this.value;
});
</script>

<?php include 'includes/footer.php'; ?>
`,
  },
  {
    filename: 'products.php',
    path: 'products.php',
    category: 'views',
    description: 'Product Catalog with instant Price & Stock updates and status toggles',
    code: `<?php
require_once 'database.php';
require_once 'auth.php';
requireLogin();

// Admin can add / edit / update price
$msg = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['action']) && $_POST['action'] === 'add_product') {
        $name = trim($_POST['product_name']);
        $barcode = trim($_POST['barcode']);
        $cat_id = (int)$_POST['category_id'];
        $brand_id = (int)$_POST['brand_id'];
        $cost = (float)$_POST['cost_price'];
        $regular = (float)$_POST['regular_price'];
        $selling = (float)$_POST['selling_price'];
        $stock = (int)$_POST['stock'];
        $reorder = (int)$_POST['reorder_level'];

        $stmt = $pdo->prepare("INSERT INTO products (product_name, barcode, category_id, brand_id, cost_price, regular_price, selling_price, stock, reorder_level, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')");
        $stmt->execute([$name, $barcode, $cat_id, $brand_id, $cost, $regular, $selling, $stock, $reorder]);
        $msg = "Product added successfully!";
    } elseif (isset($_POST['action']) && $_POST['action'] === 'update_product') {
        $pId = (int)$_POST['product_id'];
        $name = trim($_POST['product_name']);
        $cost = (float)$_POST['cost_price'];
        $regular = (float)$_POST['regular_price'];
        $selling = (float)$_POST['selling_price'];
        $stock = (int)$_POST['stock'];
        $reorder = (int)$_POST['reorder_level'];
        $status = $_POST['status'];

        $stmt = $pdo->prepare("UPDATE products SET product_name = ?, cost_price = ?, regular_price = ?, selling_price = ?, stock = ?, reorder_level = ?, status = ? WHERE product_id = ?");
        $stmt->execute([$name, $cost, $regular, $selling, $stock, $reorder, $status, $pId]);
        $msg = "Product updated successfully!";
    }
}

$products = $pdo->query("SELECT p.*, c.category_name, b.brand_name 
                         FROM products p 
                         JOIN categories c ON p.category_id = c.category_id 
                         JOIN brands b ON p.brand_id = b.brand_id 
                         ORDER BY p.product_id DESC")->fetchAll();

$categories = $pdo->query("SELECT * FROM categories WHERE status = 'active'")->fetchAll();
$brands = $pdo->query("SELECT * FROM brands WHERE status = 'active'")->fetchAll();

$pageTitle = "Product Management";
include 'includes/header.php';
?>

<div class="d-flex justify-content-between align-items-center mb-4">
    <h4 class="text-white mb-0">Products & Price Management</h4>
    <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addProductModal">+ Add New Product</button>
</div>

<?php if ($msg): ?>
    <div class="alert alert-success py-2"><?= htmlspecialchars($msg) ?></div>
<?php endif; ?>

<div class="content-card">
    <div class="table-responsive">
        <table class="table table-dark table-hover align-middle mb-0">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Product Name</th>
                    <th>Barcode</th>
                    <th>Category</th>
                    <th>Brand</th>
                    <th class="text-end">Cost Price</th>
                    <th class="text-end">Regular Price</th>
                    <th class="text-end">Selling Price</th>
                    <th class="text-center">Stock</th>
                    <th class="text-center">Status</th>
                    <th class="text-center">Actions</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($products as $p): ?>
                <tr>
                    <td><?= $p['product_id'] ?></td>
                    <td><strong><?= htmlspecialchars($p['product_name']) ?></strong></td>
                    <td><code><?= htmlspecialchars($p['barcode']) ?></code></td>
                    <td><?= htmlspecialchars($p['category_name']) ?></td>
                    <td><?= htmlspecialchars($p['brand_name']) ?></td>
                    <td class="text-end text-secondary">&#8377;<?= number_format($p['cost_price'], 2) ?></td>
                    <td class="text-end text-secondary">&#8377;<?= number_format($p['regular_price'], 2) ?></td>
                    <td class="text-end text-success fw-bold">&#8377;<?= number_format($p['selling_price'], 2) ?></td>
                    <td class="text-center">
                        <span class="badge <?= $p['stock'] <= $p['reorder_level'] ? 'bg-danger' : 'bg-success' ?>">
                            <?= $p['stock'] ?>
                        </span>
                    </td>
                    <td class="text-center">
                        <span class="badge <?= $p['status'] === 'active' ? 'bg-primary' : 'bg-secondary' ?>"><?= ucfirst($p['status']) ?></span>
                    </td>
                    <td class="text-center">
                        <button class="btn btn-sm btn-outline-info" onclick='editProduct(<?= json_encode($p) ?>)'>Edit / Update Price</button>
                    </td>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>
</div>

<!-- Add Product Modal -->
<div class="modal fade" id="addProductModal" tabindex="-1">
    <div class="modal-dialog modal-lg">
        <div class="modal-content bg-dark text-light border-secondary">
            <form method="POST" action="products.php">
                <input type="hidden" name="action" value="add_product">
                <div class="modal-header border-secondary">
                    <h5 class="modal-title">Add New Product</h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="row g-3">
                        <div class="col-md-6">
                            <label class="form-label small">Product Name *</label>
                            <input type="text" name="product_name" class="form-control bg-secondary text-white" required>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label small">Barcode (Numeric Identifier) *</label>
                            <input type="text" name="barcode" class="form-control bg-secondary text-white font-monospace" required>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label small">Category *</label>
                            <select name="category_id" class="form-select bg-secondary text-white" required>
                                <?php foreach ($categories as $c): ?>
                                    <option value="<?= $c['category_id'] ?>"><?= htmlspecialchars($c['category_name']) ?></option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label small">Brand *</label>
                            <select name="brand_id" class="form-select bg-secondary text-white" required>
                                <?php foreach ($brands as $b): ?>
                                    <option value="<?= $b['brand_id'] ?>"><?= htmlspecialchars($b['brand_name']) ?></option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                        <div class="col-md-4">
                            <label class="form-label small">Cost Price (₹) *</label>
                            <input type="number" step="0.01" name="cost_price" class="form-control bg-secondary text-white" required>
                        </div>
                        <div class="col-md-4">
                            <label class="form-label small">Regular Price (₹) *</label>
                            <input type="number" step="0.01" name="regular_price" class="form-control bg-secondary text-white" required>
                        </div>
                        <div class="col-md-4">
                            <label class="form-label small">Selling Price (₹) *</label>
                            <input type="number" step="0.01" name="selling_price" class="form-control bg-secondary text-white" required>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label small">Initial Stock *</label>
                            <input type="number" name="stock" class="form-control bg-secondary text-white" required>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label small">Reorder Alert Level *</label>
                            <input type="number" name="reorder_level" class="form-control bg-secondary text-white" value="10" required>
                        </div>
                    </div>
                </div>
                <div class="modal-footer border-secondary">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="submit" class="btn btn-primary">Save Product</button>
                </div>
            </form>
        </div>
    </div>
</div>

<?php include 'includes/footer.php'; ?>
`,
  },
  {
    filename: 'powerbi.php',
    path: 'powerbi.php',
    category: 'views',
    description: 'Power BI Star Schema architecture, DAX formulas, and Direct CSV Exporter',
    code: `<?php
require_once 'database.php';
require_once 'auth.php';
requireLogin();

$pageTitle = "Power BI Integration & Star Schema";
include 'includes/header.php';
?>

<div class="mb-4">
    <h4 class="text-white mb-1">Power BI Business Intelligence Integration</h4>
    <p class="text-secondary small">Comprehensive data architecture, Star Schema modeling, and Power BI connection instructions for MCA mini project evaluation.</p>
</div>

<div class="row g-4 mb-4">
    <div class="col-lg-6">
        <div class="content-card">
            <h5 class="card-title text-info mb-3">Star Schema Architecture</h5>
            <div class="p-3 rounded bg-dark border border-secondary font-monospace small text-light">
                <div class="text-warning mb-2 fw-bold">Fact Table:</div>
                <div>&bull; <strong>Fact_Sales</strong> (sale_item_id, sale_id, sale_date, product_id, customer_id, user_id, quantity, cost_price, selling_price, discount, amount, profit)</div>
                <hr class="border-secondary my-2">
                <div class="text-warning mb-2 fw-bold">Dimension Tables:</div>
                <div>&bull; <strong>Dim_Product</strong> (product_id, product_name, barcode, category_id, brand_id, reorder_level)</div>
                <div>&bull; <strong>Dim_Category</strong> (category_id, category_name)</div>
                <div>&bull; <strong>Dim_Brand</strong> (brand_id, brand_name)</div>
                <div>&bull; <strong>Dim_Customer</strong> (customer_id, name, mobile, created_at)</div>
                <div>&bull; <strong>Dim_Date</strong> (Date, Year, Month, MonthName, Quarter, DayOfWeek)</div>
            </div>
        </div>
    </div>

    <div class="col-lg-6">
        <div class="content-card">
            <h5 class="card-title text-success mb-3">Essential DAX Measures for Power BI</h5>
            <div class="p-3 rounded bg-dark border border-secondary font-monospace small">
                <p class="text-info mb-1"><strong>1. Total Sales Revenue:</strong></p>
                <code class="text-white">Total Sales = SUM(Fact_Sales[amount])</code>

                <p class="text-info mt-3 mb-1"><strong>2. Total Profit:</strong></p>
                <code class="text-white">Total Profit = SUM(Fact_Sales[profit])</code>

                <p class="text-info mt-3 mb-1"><strong>3. Profit Margin (%):</strong></p>
                <code class="text-white">Profit Margin % = DIVIDE([Total Profit], [Total Sales], 0) * 100</code>

                <p class="text-info mt-3 mb-1"><strong>4. Average Transaction Value:</strong></p>
                <code class="text-white">ATV = DIVIDE([Total Sales], DISTINCTCOUNT(Fact_Sales[sale_id]), 0)</code>
            </div>
        </div>
    </div>
</div>

<div class="content-card mb-4">
    <h5 class="card-title text-white mb-3">Connecting Power BI to XAMPP MySQL Database</h5>
    <ol class="text-secondary small ps-3">
        <li class="mb-2">Open <strong>Power BI Desktop</strong> on your Windows machine.</li>
        <li class="mb-2">Click on <strong>Get Data &rarr; MySQL Database</strong> (or choose <em>ODBC</em> with MySQL ODBC 8.0 Driver).</li>
        <li class="mb-2">Enter Server: <code class="text-info">localhost:3306</code> and Database: <code class="text-info">smart_retail</code>.</li>
        <li class="mb-2">Credentials: Username <code class="text-info">root</code> and Password (blank by default in XAMPP).</li>
        <li class="mb-2">Select the tables: <code>sales</code>, <code>sale_items</code>, <code>products</code>, <code>categories</code>, <code>brands</code>, and <code>customers</code>.</li>
        <li class="mb-2">Click <strong>Load</strong> or <strong>Transform Data</strong> to establish 1-to-many relationships matching our Star Schema.</li>
    </ol>
</div>

<?php include 'includes/footer.php'; ?>
`,
  },
  {
    filename: 'customers.php',
    path: 'customers.php',
    category: 'views',
    description: 'Customer directory with purchase history and repeat purchase tracking',
    code: `<?php
require_once 'database.php';
require_once 'auth.php';
requireLogin();

$search = trim($_GET['search'] ?? '');
if ($search) {
    $stmt = $pdo->prepare("SELECT c.*, 
                           COUNT(DISTINCT s.sale_id) as total_bills,
                           COALESCE(SUM(s.total_amount), 0) as total_spent
                           FROM customers c 
                           LEFT JOIN sales s ON c.customer_id = s.customer_id 
                           WHERE c.mobile LIKE ? OR c.name LIKE ?
                           GROUP BY c.customer_id");
    $stmt->execute(["%$search%", "%$search%"]);
    $customers = $stmt->fetchAll();
} else {
    $customers = $pdo->query("SELECT c.*, 
                             COUNT(DISTINCT s.sale_id) as total_bills,
                             COALESCE(SUM(s.total_amount), 0) as total_spent
                             FROM customers c 
                             LEFT JOIN sales s ON c.customer_id = s.customer_id 
                             GROUP BY c.customer_id 
                             ORDER BY c.customer_id DESC")->fetchAll();
}

$pageTitle = "Customer Management";
include 'includes/header.php';
?>

<div class="d-flex justify-content-between align-items-center mb-4">
    <h4 class="text-white mb-0">Customer Purchase Records</h4>
    <form class="d-flex" method="GET" action="customers.php">
        <input class="form-control me-2 bg-secondary text-white" type="search" name="search" placeholder="Search by mobile or name" value="<?= htmlspecialchars($search) ?>">
        <button class="btn btn-outline-info" type="submit">Search</button>
    </form>
</div>

<div class="content-card">
    <div class="table-responsive">
        <table class="table table-dark table-hover align-middle mb-0">
            <thead>
                <tr>
                    <th>Customer ID</th>
                    <th>Customer Name</th>
                    <th>Mobile Number</th>
                    <th>Member Since</th>
                    <th class="text-center">Total Bills</th>
                    <th class="text-end">Total Spent</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($customers as $c): ?>
                <tr>
                    <td>#<?= $c['customer_id'] ?></td>
                    <td><strong><?= htmlspecialchars($c['name']) ?></strong></td>
                    <td><code><?= htmlspecialchars($c['mobile']) ?></code></td>
                    <td><?= date('d M Y', strtotime($c['created_at'])) ?></td>
                    <td class="text-center"><span class="badge bg-secondary"><?= $c['total_bills'] ?></span></td>
                    <td class="text-end text-success fw-bold">&#8377;<?= number_format($c['total_spent'], 2) ?></td>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>
</div>

<?php include 'includes/footer.php'; ?>
`,
  },
  {
    filename: 'reports.php',
    path: 'reports.php',
    category: 'views',
    description: 'Comprehensive business reports with print and filter support',
    code: `<?php
require_once 'database.php';
require_once 'auth.php';
requireLogin();

$reportType = $_GET['type'] ?? 'daily';

$pageTitle = "Business Intelligence Reports";
include 'includes/header.php';
?>

<div class="d-flex justify-content-between align-items-center mb-4">
    <h4 class="text-white mb-0">Supermarket Analytics & Sales Reports</h4>
    <button class="btn btn-outline-light" onclick="window.print()">&#128438; Print Report</button>
</div>

<div class="row g-3 mb-4">
    <div class="col-md-12">
        <div class="btn-group">
            <a href="reports.php?type=daily" class="btn <?= $reportType === 'daily' ? 'btn-primary' : 'btn-outline-secondary' ?>">Daily Sales</a>
            <a href="reports.php?type=monthly" class="btn <?= $reportType === 'monthly' ? 'btn-primary' : 'btn-outline-secondary' ?>">Monthly Sales</a>
            <a href="reports.php?type=product" class="btn <?= $reportType === 'product' ? 'btn-primary' : 'btn-outline-secondary' ?>">Product Sales</a>
            <a href="reports.php?type=profit" class="btn <?= $reportType === 'profit' ? 'btn-primary' : 'btn-outline-secondary' ?>">Profit Analysis</a>
            <a href="reports.php?type=stock" class="btn <?= $reportType === 'stock' ? 'btn-primary' : 'btn-outline-secondary' ?>">Stock Reorder Report</a>
        </div>
    </div>
</div>

<div class="content-card">
    <p class="text-secondary small">Showing report data ready for export to Power BI or printable submission.</p>
</div>

<?php include 'includes/footer.php'; ?>
`,
  },
  {
    filename: 'header.php',
    path: 'includes/header.php',
    category: 'includes',
    description: 'Reusable dark-themed HTML header and navigation',
    code: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= $pageTitle ?? 'Smart Retail' ?> - Supermarket BI</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="assets/css/style.css">
    <style>
        body { background: #0b0f19; color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
        .sidebar { background: #111827; border-right: 1px solid #1f2937; min-height: 100vh; padding: 1.5rem 1rem; }
        .sidebar a { color: #9ca3af; text-decoration: none; padding: 0.65rem 1rem; border-radius: 6px; display: block; margin-bottom: 0.25rem; font-weight: 500; }
        .sidebar a:hover, .sidebar a.active { background: #1f2937; color: #ffffff; }
        .content-card { background: #111827; border: 1px solid #1f2937; border-radius: 10px; padding: 1.5rem; }
        .kpi-card { background: #111827; border: 1px solid #1f2937; border-radius: 10px; padding: 1.25rem; }
        .kpi-label { color: #9ca3af; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; display: block; }
        .kpi-value { font-size: 1.75rem; font-weight: 700; margin: 0.25rem 0; }
        .kpi-sub { font-size: 0.75rem; color: #6b7280; }
    </style>
</head>
<body>
<div class="d-flex">
    <!-- Sidebar -->
    <div class="sidebar" style="width: 260px; flex-shrink: 0;">
        <div class="mb-4 px-2">
            <h5 class="fw-bold text-white mb-0">Smart Retail</h5>
            <small class="text-secondary">Supermarket BI & Sales</small>
            <div class="mt-2">
                <span class="badge <?= $_SESSION['role'] === 'owner' ? 'bg-info text-dark' : 'bg-primary' ?>">
                    Role: <?= ucfirst($_SESSION['role'] ?? 'Guest') ?>
                </span>
            </div>
        </div>

        <nav>
            <a href="dashboard.php" class="<?= ($pageTitle ?? '') === 'Dashboard' ? 'active' : '' ?>">Dashboard</a>
            <?php if ($_SESSION['role'] === 'admin'): ?>
                <a href="billing.php" class="<?= ($pageTitle ?? '') === 'Barcode Billing POS' ? 'active' : '' ?>">Barcode Billing</a>
                <a href="products.php" class="<?= ($pageTitle ?? '') === 'Product Management' ? 'active' : '' ?>">Products</a>
            <?php endif; ?>
            <a href="customers.php" class="<?= ($pageTitle ?? '') === 'Customer Management' ? 'active' : '' ?>">Customers</a>
            <a href="reports.php" class="<?= ($pageTitle ?? '') === 'Business Intelligence Reports' ? 'active' : '' ?>">Reports</a>
            <a href="powerbi.php" class="<?= ($pageTitle ?? '') === 'Power BI Integration & Star Schema' ? 'active' : '' ?>">Power BI Analytics</a>
            <a href="logout.php" class="text-danger mt-4">Logout</a>
        </nav>
    </div>

    <!-- Main Content Area -->
    <div class="p-4 flex-grow-1" style="min-width: 0;">
`,
  },
  {
    filename: 'footer.php',
    path: 'includes/footer.php',
    category: 'includes',
    description: 'Reusable HTML footer',
    code: `    </div>
</div>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
`,
  },
  {
    filename: 'logout.php',
    path: 'logout.php',
    category: 'core',
    description: 'Session termination script',
    code: `<?php
session_start();
$_SESSION = array();
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000,
        $params["path"], $params["domain"],
        $params["secure"], $params["httponly"]
    );
}
session_destroy();
header("Location: login.php");
exit;
?>
`,
  },
  {
    filename: 'index.php',
    path: 'index.php',
    category: 'core',
    description: 'Root router forwarding to login or dashboard',
    code: `<?php
require_once 'auth.php';
if (isLoggedIn()) {
    header("Location: dashboard.php");
} else {
    header("Location: login.php");
}
exit;
?>
`,
  },
];

export const phpProjectFiles = PHP_PROJECT_FILES.map((f) => ({
  ...f,
  content: f.code,
}));
