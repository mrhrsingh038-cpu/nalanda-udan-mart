require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");

const app = express();
const PORT = process.env.PORT || 5000;

// Strict Environment Verification
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 16) {
  console.error("FATAL: JWT_SECRET environment variable missing ya kamzor hai (minimum 16 chars). Server start nahi ho sakta.");
  process.exit(1);
}
if (!process.env.MONGODB_URI) {
  console.error("FATAL: MONGODB_URI environment variable missing hai. Database connection zaroori hai.");
  process.exit(1);
}

const JWT_SECRET = process.env.JWT_SECRET;

app.use(cors());
app.use(express.json({ limit: "4mb" }));

// Dynamic Public Static Directory Fallback
const publicDir = fs.existsSync(path.join(__dirname, "public"))
  ? path.join(__dirname, "public")
  : __dirname;

app.use(express.static(publicDir));

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Bohot zyada attempts. Kripya 15 minute baad dobara koshish karein." }
});

/* ==================== MONGODB SCHEMAS ==================== */

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["owner", "admin"], default: "admin" },
  isActive: { type: Boolean, default: true },
  permissions: {
    manageProducts: { type: Boolean, default: false },
    manageCategories: { type: Boolean, default: false },
    manageOrders: { type: Boolean, default: false },
    manageDeliveryCharge: { type: Boolean, default: false },
    manageAdmins: { type: Boolean, default: false }
  },
  createdAt: { type: Date, default: Date.now }
});

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0.01 },
  stock: { type: Number, default: 100, min: 0 },
  isAvailable: { type: Boolean, default: true },
  category: { type: String, default: "Other", trim: true },
  emoji: { type: String, default: "🛍️", trim: true },
  photo: { type: String, default: "" },
  description: { type: String, default: "", trim: true },
  updatedAt: { type: Date, default: Date.now }
});

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  emoji: { type: String, default: "🛍️", trim: true }
});

const OrderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  customerName: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  address: { type: String, required: true, trim: true },
  paymentMethod: { type: String, default: "Cash on Delivery" },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    qty: { type: Number, required: true, min: 1 }
  }],
  subtotal: { type: Number, required: true, min: 0 },
  total: { type: Number, required: true, min: 0 },
  deliveryRateAtOrder: { type: Number, default: 10 },
  status: { type: String, enum: ["Pending", "Accepted", "Delivered", "Cancelled"], default: "Pending" },
  createdAt: { type: Date, default: Date.now }
});

const SettingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true },
  updatedBy: { type: String, default: "System" },
  updatedAt: { type: Date, default: Date.now }
});

const AuditLogSchema = new mongoose.Schema({
  action: { type: String, required: true },
  performedBy: { type: String, required: true },
  target: { type: String, default: "" },
  details: { type: mongoose.Schema.Types.Mixed },
  timestamp: { type: Date, default: Date.now }
});

const User = mongoose.model("User", UserSchema);
const Product = mongoose.model("Product", ProductSchema);
const Category = mongoose.model("Category", CategorySchema);
const Order = mongoose.model("Order", OrderSchema);
const Setting = mongoose.model("Setting", SettingSchema);
const AuditLog = mongoose.model("AuditLog", AuditLogSchema);

async function createAuditLog(action, performedBy, target = "", details = {}) {
  try {
    await AuditLog.create({ action, performedBy, target, details });
  } catch (err) {
    console.error("Audit log error:", err.message);
  }
}

/* ==================== AUTH MIDDLEWARE ==================== */

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Token missing. Login karein." });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user || !user.isActive) {
      return res.status(403).json({ success: false, message: "Account disabled ya invalid token." });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Session expire ho gaya hai. Dobara login karein." });
  }
};

const requirePermission = (permissionKey) => {
  return (req, res, next) => {
    if (req.user.role === "owner") return next();
    if (req.user.permissions && req.user.permissions[permissionKey]) return next();
    return res.status(403).json({ success: false, message: `Access Denied: '${permissionKey}' ki permission nahi hai.` });
  };
};

const requireOwner = (req, res, next) => {
  if (req.user.role === "owner") return next();
  return res.status(403).json({ success: false, message: "Access Denied: Sirf Owner hi yeh action le sakte hain." });
};

/* ==================== INITIAL DATABASE SEED ==================== */

const starterCategories = [
  { name: "Grocery", emoji: "🌾" },
  { name: "Vegetables", emoji: "🥦" },
  { name: "Fruits", emoji: "🍎" },
  { name: "Dairy", emoji: "🥛" },
  { name: "Snacks", emoji: "🍪" },
  { name: "Personal Care", emoji: "🧴" },
  { name: "Household", emoji: "🧼" },
  { name: "Stationery", emoji: "✏️" },
  { name: "Other", emoji: "🛍️" }
];

const starterProducts = [
  { name: "Chawal (1 kg)", price: 55, stock: 100, isAvailable: true, emoji: "🍚", category: "Grocery" },
  { name: "Aata (1 kg)", price: 40, stock: 100, isAvailable: true, emoji: "🌾", category: "Grocery" },
  { name: "Aaloo (1 kg)", price: 30, stock: 100, isAvailable: true, emoji: "🥔", category: "Vegetables" },
  { name: "Pyaaz (1 kg)", price: 35, stock: 100, isAvailable: true, emoji: "🧅", category: "Vegetables" },
  { name: "Tamatar (1 kg)", price: 40, stock: 100, isAvailable: true, emoji: "🍅", category: "Vegetables" },
  { name: "Daal (1 kg)", price: 100, stock: 100, isAvailable: true, emoji: "🫘", category: "Grocery" },
  { name: "Cooking Oil (1 L)", price: 140, stock: 100, isAvailable: true, emoji: "🫗", category: "Grocery" },
  { name: "Cheeni (1 kg)", price: 45, stock: 100, isAvailable: true, emoji: "🧂", category: "Grocery" },
  { name: "Biscuit", price: 10, stock: 100, isAvailable: true, emoji: "🍪", category: "Snacks" },
  { name: "Sabun", price: 35, stock: 100, isAvailable: true, emoji: "🧼", category: "Personal Care" },
  { name: "Doodh (500 ml)", price: 30, stock: 100, isAvailable: true, emoji: "🥛", category: "Dairy" },
  { name: "Toothpaste", price: 55, stock: 100, isAvailable: true, emoji: "🪥", category: "Personal Care" }
];

async function seedDatabase() {
  const deliverySetting = await Setting.findOne({ key: "udanDeliveryChargePerKm" });
  if (!deliverySetting) {
    await Setting.create({ key: "udanDeliveryChargePerKm", value: 10, updatedBy: "System" });
  }

  const catCount = await Category.countDocuments();
  if (catCount === 0) {
    await Category.insertMany(starterCategories);
  }

  const prodCount = await Product.countDocuments();
  if (prodCount === 0) {
    await Product.insertMany(starterProducts);
  }

  const ownerCount = await User.countDocuments({ role: "owner" });
  if (ownerCount === 0) {
    const email = (process.env.INITIAL_OWNER_EMAIL || "owner@udanmart.com").toLowerCase().trim();
    const rawPass = process.env.INITIAL_OWNER_PASSWORD || "ChangeMeImmediately123!";
    const hashedPassword = await bcrypt.hash(rawPass, 12);

    await User.create({
      name: process.env.INITIAL_OWNER_NAME || "Main Owner",
      email,
      password: hashedPassword,
      role: "owner",
      isActive: true,
      permissions: {
        manageProducts: true,
        manageCategories: true,
        manageOrders: true,
        manageDeliveryCharge: true,
        manageAdmins: true
      }
    });
    console.log(`[AUTH] Default Owner account created: ${email}`);
  }
}

/* ==================== PUBLIC CUSTOMER APIS ==================== */

// GET /api/delivery-charge
app.get("/api/delivery-charge", async (req, res) => {
  try {
    const setting = await Setting.findOne({ key: "udanDeliveryChargePerKm" });
    const rate = setting ? Number(setting.value) : 10;
    res.json({ success: true, rate, source: "database" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Delivery charge fetch error" });
  }
});

// GET /api/products
app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find().sort({ updatedAt: -1 });
    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, message: "Products fetch error" });
  }
});

// GET /api/categories
app.get("/api/categories", async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json({ success: true, categories });
  } catch (err) {
    res.status(500).json({ success: false, message: "Categories fetch error" });
  }
});

// POST /api/orders (Customer Order Placed & Database Verified)
app.post("/api/orders", async (req, res) => {
  try {
    const { customerName, phone, address, items, paymentMethod } = req.body;

    if (!customerName || !customerName.trim() || !phone || !phone.trim() || !address || !address.trim()) {
      return res.status(400).json({ success: false, message: "Naam, mobile number aur address zaroori hain." });
    }
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone.trim())) {
      return res.status(400).json({ success: false, message: "Kripya sahi 10-digit mobile number enter karein." });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart khali hai." });
    }

    let calculatedSubtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const pId = item.id || item._id || item.productId;
      if (!pId || !mongoose.Types.ObjectId.isValid(pId)) {
        return res.status(400).json({ success: false, message: `Invalid product ID mila.` });
      }

      const dbProduct = await Product.findById(pId);
      if (!dbProduct) {
        return res.status(400).json({ success: false, message: `Product '${item.name || pId}' ab uplabdh nahi hai.` });
      }
      if (!dbProduct.isAvailable || dbProduct.stock <= 0) {
        return res.status(400).json({ success: false, message: `'${dbProduct.name}' out of stock ho chuka hai.` });
      }

      const qty = Math.max(1, parseInt(item.qty, 10) || 1);
      const itemSub = dbProduct.price * qty;
      calculatedSubtotal += itemSub;

      validatedItems.push({
        productId: dbProduct._id,
        name: dbProduct.name,
        price: dbProduct.price,
        qty
      });
    }

    const deliverySetting = await Setting.findOne({ key: "udanDeliveryChargePerKm" });
    const currentRate = deliverySetting ? Number(deliverySetting.value) : 10;

    const orderId = "UM" + Date.now();
    const finalAmount = Math.round(calculatedSubtotal * 100) / 100;

    const newOrder = await Order.create({
      orderId,
      customerName: customerName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      paymentMethod: paymentMethod || "Cash on Delivery",
      items: validatedItems,
      subtotal: finalAmount,
      total: finalAmount,
      deliveryRateAtOrder: currentRate,
      status: "Pending"
    });

    res.json({
      success: true,
      order: {
        orderId: newOrder.orderId,
        customerName: newOrder.customerName,
        subtotal: newOrder.subtotal,
        total: newOrder.total,
        deliveryRateAtOrder: newOrder.deliveryRateAtOrder,
        createdAt: newOrder.createdAt
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Order save nahi ho saka. Kripya check karein." });
  }
});

/* ==================== AUTHENTICATION APIS ==================== */

app.post("/api/auth/login", loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email aur password dono bhariye." });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ success: false, message: "Email ya password galat hai." });
    }
    if (!user.isActive) {
      return res.status(403).json({ success: false, message: "Aapka account deactivate kar diya gaya hai. Owner se contact karein." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Email ya password galat hai." });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: "12h" }
    );

    await createAuditLog("ADMIN_LOGIN", user.email, "Session", { ip: req.ip });

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error during login." });
  }
});

app.get("/api/auth/me", authenticate, (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      permissions: req.user.permissions
    }
  });
});

/* ==================== PROTECTED ADMIN APIS ==================== */

// Delivery Charge Setting
app.post("/api/admin/delivery-charge", authenticate, requirePermission("manageDeliveryCharge"), async (req, res) => {
  try {
    const rate = Number(req.body.rate);
    if (!Number.isFinite(rate) || rate < 0) {
      return res.status(400).json({ success: false, message: "Sahi positive rate enter karein." });
    }

    const previous = await Setting.findOne({ key: "udanDeliveryChargePerKm" });
    await Setting.findOneAndUpdate(
      { key: "udanDeliveryChargePerKm" },
      { value: rate, updatedBy: req.user.email, updatedAt: new Date() },
      { upsert: true }
    );

    await createAuditLog("UPDATE_DELIVERY_CHARGE", req.user.email, "Settings", {
      oldRate: previous ? previous.value : 10,
      newRate: rate
    });

    res.json({ success: true, rate });
  } catch (err) {
    res.status(500).json({ success: false, message: "Delivery charge update nahi ho saka." });
  }
});

// Products: Add
app.post("/api/admin/products", authenticate, requirePermission("manageProducts"), async (req, res) => {
  try {
    const { name, price, stock, isAvailable, category, emoji, photo, description } = req.body;
    if (!name || !name.trim() || Number(price) <= 0) {
      return res.status(400).json({ success: false, message: "Product naam aur sahi price zaroori hain." });
    }

    const product = await Product.create({
      name: name.trim(),
      price: Number(price),
      stock: Number.isFinite(Number(stock)) ? Math.max(0, Number(stock)) : 0,
      isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
      category: category ? category.trim() : "Other",
      emoji: emoji ? emoji.trim() : "🛍️",
      photo: photo || "",
      description: description ? description.trim() : ""
    });

    await createAuditLog("CREATE_PRODUCT", req.user.email, product.name, { productId: product._id, price: product.price });
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: "Product create error." });
  }
});

// Products: Update
app.put("/api/admin/products/:id", authenticate, requirePermission("manageProducts"), async (req, res) => {
  try {
    const { name, price, stock, isAvailable, category, emoji, photo, description } = req.body;
    const updateData = { updatedAt: new Date() };

    if (name !== undefined) updateData.name = name.trim();
    if (price !== undefined) {
      const p = Number(price);
      if (p <= 0) return res.status(400).json({ success: false, message: "Price 0 se zyada honi chahiye." });
      updateData.price = p;
    }
    if (stock !== undefined) updateData.stock = Math.max(0, Number(stock) || 0);
    if (isAvailable !== undefined) updateData.isAvailable = Boolean(isAvailable);
    if (category !== undefined) updateData.category = category.trim();
    if (emoji !== undefined) updateData.emoji = emoji.trim();
    if (photo !== undefined) updateData.photo = photo;
    if (description !== undefined) updateData.description = description.trim();

    const product = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!product) return res.status(404).json({ success: false, message: "Product nahi mila." });

    await createAuditLog("UPDATE_PRODUCT", req.user.email, product.name, { productId: product._id, changes: updateData });
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: "Product update error." });
  }
});

// Products: Delete
app.delete("/api/admin/products/:id", authenticate, requirePermission("manageProducts"), async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product nahi mila." });

    await createAuditLog("DELETE_PRODUCT", req.user.email, product.name, { productId: product._id });
    res.json({ success: true, message: "Product delete ho gaya." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Product delete error." });
  }
});

// Categories: Add
app.post("/api/admin/categories", authenticate, requirePermission("manageCategories"), async (req, res) => {
  try {
    const { name, emoji } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ success: false, message: "Category naam bhariye." });

    const exists = await Category.findOne({ name: name.trim() });
    if (exists) return res.status(400).json({ success: false, message: "Category pehle se maujood hai." });

    const cat = await Category.create({ name: name.trim(), emoji: emoji ? emoji.trim() : "🛍️" });
    await createAuditLog("CREATE_CATEGORY", req.user.email, cat.name);
    res.json({ success: true, category: cat });
  } catch (err) {
    res.status(500).json({ success: false, message: "Category create error." });
  }
});

// Categories: Delete
app.delete("/api/admin/categories/:id", authenticate, requirePermission("manageCategories"), async (req, res) => {
  try {
    const cat = await Category.findById(req.params.id);
    if (!cat) return res.status(404).json({ success: false, message: "Category nahi mili." });

    const fallbackCat = await Category.findOne({ _id: { $ne: cat._id } });
    if (!fallbackCat) return res.status(400).json({ success: false, message: "Kam se kam ek category rehna zaroori hai." });

    await Product.updateMany({ category: cat.name }, { category: fallbackCat.name });
    await Category.findByIdAndDelete(req.params.id);

    await createAuditLog("DELETE_CATEGORY", req.user.email, cat.name, { shiftedTo: fallbackCat.name });
    res.json({ success: true, message: "Category delete ho gayi aur products shift ho gaye." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Category delete error." });
  }
});

// Orders: Get All
app.get("/api/admin/orders", authenticate, requirePermission("manageOrders"), async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: "Orders fetch error." });
  }
});

// Orders: Update Status
app.put("/api/admin/orders/:id/status", authenticate, requirePermission("manageOrders"), async (req, res) => {
  try {
    const { status } = req.body;
    if (!["Pending", "Accepted", "Delivered", "Cancelled"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value." });
    }
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) return res.status(404).json({ success: false, message: "Order nahi mila." });

    await createAuditLog("UPDATE_ORDER_STATUS", req.user.email, order.orderId, { newStatus: status });
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: "Order update error." });
  }
});

// Data Migration API (LocalStorage -> DB)
app.post("/api/admin/migrate-local-data", authenticate, requirePermission("manageProducts"), async (req, res) => {
  try {
    const { products: localProducts, categories: localCategories } = req.body;
    let addedCats = 0;
    let addedProds = 0;

    if (Array.isArray(localCategories)) {
      for (const c of localCategories) {
        if (c && c.name) {
          const exists = await Category.findOne({ name: c.name.trim() });
          if (!exists) {
            await Category.create({ name: c.name.trim(), emoji: c.emoji || "🛍️" });
            addedCats++;
          }
        }
      }
    }

    if (Array.isArray(localProducts)) {
      for (const p of localProducts) {
        if (p && p.name && Number(p.price) > 0) {
          const exists = await Product.findOne({ name: p.name.trim() });
          if (!exists) {
            await Product.create({
              name: p.name.trim(),
              price: Number(p.price),
              category: p.category || "Other",
              emoji: p.emoji || "🛍️",
              photo: p.photo || "",
              stock: 100,
              isAvailable: true
            });
            addedProds++;
          }
        }
      }
    }

    await createAuditLog("MIGRATE_LOCAL_DATA", req.user.email, "Migration", { addedCats, addedProds });
    res.json({ success: true, message: `Migration safal: ${addedCats} categories aur ${addedProds} products DB mein jud gaye.` });
  } catch (err) {
    res.status(500).json({ success: false, message: "Data migration error." });
  }
});

/* ==================== OWNER-ONLY APIS ==================== */

app.get("/api/owner/admins", authenticate, requireOwner, async (req, res) => {
  try {
    const admins = await User.find({ role: "admin" }).select("-password").sort({ createdAt: -1 });
    res.json({ success: true, admins });
  } catch (err) {
    res.status(500).json({ success: false, message: "Admins list fetch error." });
  }
});

app.post("/api/owner/admins", authenticate, requireOwner, async (req, res) => {
  try {
    const { name, email, password, permissions } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Name, email aur temporary password zaroori hain." });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: "Password kam se kam 6 characters ka hona chahiye." });
    }

    const exists = await User.findOne({ email: email.toLowerCase().trim() });
    if (exists) return res.status(400).json({ success: false, message: "Is email par account pehle se maujood hai." });

    const hashedPassword = await bcrypt.hash(password, 12);
    const newAdmin = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: "admin",
      isActive: true,
      permissions: {
        manageProducts: Boolean(permissions?.manageProducts),
        manageCategories: Boolean(permissions?.manageCategories),
        manageOrders: Boolean(permissions?.manageOrders),
        manageDeliveryCharge: Boolean(permissions?.manageDeliveryCharge),
        manageAdmins: false
      }
    });

    await createAuditLog("CREATE_ADMIN", req.user.email, newAdmin.email);
    res.json({ success: true, admin: newAdmin });
  } catch (err) {
    res.status(500).json({ success: false, message: "Admin create error." });
  }
});

app.put("/api/owner/admins/:id", authenticate, requireOwner, async (req, res) => {
  try {
    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ success: false, message: "Admin nahi mila." });
    if (target.role === "owner") return res.status(403).json({ success: false, message: "Owner profile yahan se modify nahi ho sakti." });

    const { name, isActive, permissions, newPassword } = req.body;
    if (name !== undefined) target.name = name.trim();
    if (isActive !== undefined) target.isActive = Boolean(isActive);

    if (permissions) {
      target.permissions = {
        manageProducts: Boolean(permissions.manageProducts),
        manageCategories: Boolean(permissions.manageCategories),
        manageOrders: Boolean(permissions.manageOrders),
        manageDeliveryCharge: Boolean(permissions.manageDeliveryCharge),
        manageAdmins: false
      };
    }
    if (newPassword && newPassword.trim().length >= 6) {
      target.password = await bcrypt.hash(newPassword.trim(), 12);
    }

    await target.save();
    await createAuditLog("UPDATE_ADMIN", req.user.email, target.email, { isActive: target.isActive });
    res.json({ success: true, message: "Admin update ho gaya." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Admin update error." });
  }
});

app.delete("/api/owner/admins/:id", authenticate, requireOwner, async (req, res) => {
  try {
    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ success: false, message: "Admin nahi mila." });
    if (target.role === "owner") return res.status(403).json({ success: false, message: "Owner account delete nahi kiya ja sakta." });

    await User.findByIdAndDelete(req.params.id);
    await createAuditLog("DELETE_ADMIN", req.user.email, target.email);
    res.json({ success: true, message: "Admin delete ho gaya." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Admin delete error." });
  }
});

app.get("/api/owner/audit-logs", authenticate, requireOwner, async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ timestamp: -1 }).limit(100);
    res.json({ success: true, logs });
  } catch (err) {
    res.status(500).json({ success: false, message: "Audit logs fetch error." });
  }
});

/* ==================== STATIC FILE & FALLBACK ROUTING ==================== */

// Prevent API requests or direct file extensions (.xml, .json, .ico) from hitting HTML fallback
app.get("*", (req, res) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ success: false, message: "API endpoint nahi mila." });
  }
  if (req.path.includes(".")) {
    return res.status(404).send("File not found");
  }
  const indexPath = fs.existsSync(path.join(publicDir, "index.html"))
    ? path.join(publicDir, "index.html")
    : path.join(__dirname, "index.html");

  res.sendFile(indexPath);
});

/* ==================== SERVER START ==================== */

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log("✅ MongoDB connected successfully.");
    await seedDatabase();
    app.listen(PORT, () => {
      console.log(`🚀 Nalanda Udan Mart server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ FATAL: Database connection failed. Server stopped.", err.message);
    process.exit(1);
  });