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

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 16) {
  console.error("FATAL: JWT_SECRET missing ya kamzor hai (minimum 16 chars).");
  process.exit(1);
}
if (!process.env.MONGODB_URI) {
  console.error("FATAL: MONGODB_URI missing hai.");
  process.exit(1);
}

const JWT_SECRET = process.env.JWT_SECRET;

app.use(cors());
app.use(express.json({ limit: "4mb" }));

const staticDir = fs.existsSync(path.join(__dirname, "public"))
  ? path.join(__dirname, "public")
  : __dirname;

function getFilePath(filename) {
  const inPublic = path.join(__dirname, "public", filename);
  if (fs.existsSync(inPublic)) return inPublic;
  return path.join(__dirname, filename);
}

app.get("/", (req, res) => {
  res.sendFile(getFilePath("index.html"));
});

app.get("/index.html", (req, res) => {
  res.sendFile(getFilePath("index.html"));
});

app.get("/admin.html", (req, res) => {
  res.sendFile(getFilePath("admin.html"));
});

app.use(express.static(staticDir));

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Bohot zyada attempts. 15 minute baad koshish karein." }
});

const trackLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Requests limit cross hui. Kripya 1 minute baad try karein." }
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

const VALID_STATUSES = [
  "Order Placed",
  "Pending",
  "Accepted",
  "Preparing",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
  "Rejected"
];

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
  status: { type: String, enum: VALID_STATUSES, default: "Order Placed" },
  rejectionReason: { type: String, default: "", trim: true },
  statusHistory: [{
    status: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    note: { type: String, default: "" }
  }],
  createdAt: { type: Date, default: Date.now }
});

const SettingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true },
  updatedBy: { type: String, default: "System" },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model("User", UserSchema);
const Product = mongoose.model("Product", ProductSchema);
const Category = mongoose.model("Category", CategorySchema);
const Order = mongoose.model("Order", OrderSchema);
const Setting = mongoose.model("Setting", SettingSchema);

/* ==================== MIDDLEWARE ==================== */

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
      return res.status(403).json({ success: false, message: "Account disabled." });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Session expire ho gaya hai." });
  }
};

const requirePermission = (permissionKey) => {
  return (req, res, next) => {
    if (req.user.role === "owner") return next();
    if (req.user.permissions && req.user.permissions[permissionKey]) return next();
    return res.status(403).json({ success: false, message: "Permission denied." });
  };
};

/* ==================== PUBLIC APIS ==================== */

app.get("/api/delivery-charge", async (req, res) => {
  try {
    const setting = await Setting.findOne({ key: "udanDeliveryChargePerKm" });
    res.json({ success: true, rate: setting ? Number(setting.value) : 10 });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error" });
  }
});

app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find().sort({ updatedAt: -1 });
    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error" });
  }
});

app.get("/api/categories", async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json({ success: true, categories });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error" });
  }
});

app.post("/api/orders", async (req, res) => {
  try {
    const { customerName, phone, address, items, paymentMethod } = req.body;
    if (!customerName || !phone || !address || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "Details incomplete hain." });
    }

    let calculatedSubtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const pId = item.id || item._id || item.productId;
      const dbProduct = await Product.findById(pId);
      if (!dbProduct || !dbProduct.isAvailable || dbProduct.stock <= 0) {
        return res.status(400).json({ success: false, message: `${item.name || 'Product'} unavailable hai.` });
      }

      const qty = Math.max(1, parseInt(item.qty, 10) || 1);
      calculatedSubtotal += dbProduct.price * qty;

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
      status: "Order Placed",
      statusHistory: [{ status: "Order Placed", timestamp: new Date(), note: "Order placed." }]
    });

    res.json({ success: true, order: newOrder });
  } catch (err) {
    res.status(500).json({ success: false, message: "Order save error." });
  }
});

app.post("/api/orders/track", trackLimiter, async (req, res) => {
  try {
    const { orderId, phone } = req.body;
    const order = await Order.findOne({ orderId: String(orderId || "").trim() });
    if (!order) return res.status(404).json({ success: false, message: "Order nahi mila." });
    if (order.phone !== String(phone || "").trim()) {
      return res.status(401).json({ success: false, message: "Mobile number match nahi hua." });
    }
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: "Tracking error." });
  }
});

app.post("/api/auth/login", loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: String(email || "").toLowerCase().trim() });
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: "Galat email ya password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Galat email ya password." });
    }

    const token = jwt.sign({ id: user._id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: "12h" });
    res.json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, role: user.role, permissions: user.permissions } });
  } catch (err) {
    res.status(500).json({ success: false, message: "Login error." });
  }
});

app.get("/api/auth/me", authenticate, (req, res) => {
  res.json({ success: true, user: req.user });
});

/* ==================== PROTECTED ADMIN APIS ==================== */

app.post("/api/admin/delivery-charge", authenticate, requirePermission("manageDeliveryCharge"), async (req, res) => {
  try {
    const rate = Number(req.body.rate);
    if (!Number.isFinite(rate) || rate < 0) return res.status(400).json({ success: false, message: "Invalid rate." });
    await Setting.findOneAndUpdate({ key: "udanDeliveryChargePerKm" }, { value: rate, updatedBy: req.user.email, updatedAt: new Date() }, { upsert: true });
    res.json({ success: true, rate });
  } catch (err) {
    res.status(500).json({ success: false, message: "Update error." });
  }
});

app.post("/api/admin/products", authenticate, requirePermission("manageProducts"), async (req, res) => {
  try {
    const { name, price, stock, isAvailable, category, emoji, photo } = req.body;
    const product = await Product.create({
      name: String(name || "").trim(),
      price: Number(price),
      stock: Number(stock) || 0,
      isAvailable: isAvailable !== false,
      category: category || "Other",
      emoji: emoji || "🛍️",
      photo: photo || ""
    });
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: "Create error." });
  }
});

app.put("/api/admin/products/:id", authenticate, requirePermission("manageProducts"), async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { ...req.body, updatedAt: new Date() }, { new: true });
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: "Update error." });
  }
});

app.delete("/api/admin/products/:id", authenticate, requirePermission("manageProducts"), async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Delete error." });
  }
});

app.get("/api/admin/orders", authenticate, requirePermission("manageOrders"), async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: "Fetch error." });
  }
});

app.put("/api/admin/orders/:id/status", authenticate, requirePermission("manageOrders"), async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Order nahi mila." });

    order.status = status;
    if (status === "Rejected" && rejectionReason) order.rejectionReason = rejectionReason;
    order.statusHistory.push({ status, timestamp: new Date(), note: rejectionReason || `Status: ${status}` });
    await order.save();
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: "Update error." });
  }
});

app.get("*", (req, res) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ success: false, message: "API endpoint nahi mila." });
  }
  if (req.path.includes(".")) {
    return res.status(404).send("File not found");
  }
  res.sendFile(getFilePath("index.html"));
});

/* ==================== SEED & START ==================== */

async function seedDatabase() {
  const delivery = await Setting.findOne({ key: "udanDeliveryChargePerKm" });
  if (!delivery) await Setting.create({ key: "udanDeliveryChargePerKm", value: 10 });

  const ownerCount = await User.countDocuments({ role: "owner" });
  if (ownerCount === 0) {
    const email = (process.env.INITIAL_OWNER_EMAIL || "owner@udanmart.com").toLowerCase().trim();
    const pass = await bcrypt.hash(process.env.INITIAL_OWNER_PASSWORD || "ChangeMe123!", 12);
    await User.create({
      name: process.env.INITIAL_OWNER_NAME || "Main Owner",
      email,
      password: pass,
      role: "owner",
      isActive: true,
      permissions: { manageProducts: true, manageCategories: true, manageOrders: true, manageDeliveryCharge: true, manageAdmins: true }
    });
  }
}

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log("MongoDB connected.");
    await seedDatabase();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  });