<!DOCTYPE html>
<html lang="hi">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>NALANDA UDAN MART | Online Shopping</title>
<meta name="description" content="Nalanda Udan Mart - Parbalpur, Nalanda, Bihar mein grocery aur daily essentials ki online shopping.">
<style>
*{box-sizing:border-box}
body{margin:0;font-family:Arial,sans-serif;background:#f5f7f2;color:#222}
header{background:#137a3d;color:white;padding:20px 5%}
.brand-row{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px}
.brand{font-size:28px;font-weight:bold}
.nav-actions{display:flex;gap:10px;align-items:center}
.admin-link,.track-nav-btn{color:#ffca28;text-decoration:none;font-weight:bold;font-size:14px;border:1px solid #ffca28;padding:6px 12px;border-radius:6px;transition:0.2s;background:transparent;cursor:pointer}
.admin-link:hover,.track-nav-btn:hover{background:#ffca28;color:#222}
.search{display:flex;gap:8px;margin-top:18px}
input,textarea,select{min-width:0;padding:13px;border:1px solid #ddd;border-radius:8px;font-size:15px;font-family:inherit}
button{border:0;border-radius:8px;padding:12px 16px;cursor:pointer;font-weight:bold}
.search input{flex:1}
.search button{background:#ffca28;color:#222}

.delivery-rate-bar{background:#2e7d32;color:#fff;padding:11px 5%;display:flex;align-items:center;justify-content:space-between;font-weight:bold;font-size:15px;box-shadow:0 2px 4px rgba(0,0,0,0.1)}
.delivery-rate-bar span.rate-tag{background:#ffca28;color:#111;padding:3px 10px;border-radius:20px;font-size:14px}
.rate-error{background:#c62828;}

.hero{background:#e0f4df;margin:20px auto;padding:28px 20px;width:92%;border-radius:15px}
.hero h1{color:#137a3d;margin-top:0}
main{padding:0 4% 30px}
.categories,.products{display:grid;grid-template-columns:repeat(auto-fit,minmax(145px,1fr));gap:14px}
.category,.product,#cart,#checkoutForm,#trackingSection{background:white;border-radius:12px;padding:16px;box-shadow:0 2px 8px rgba(0,0,0,0.05)}
.category{text-align:center;font-weight:bold;cursor:pointer;border:2px solid transparent}
.category:hover,.category.active{background:#e0f4df;border-color:#137a3d}
.emoji{font-size:36px}
.product h3{margin:10px 0}
.product-photo{width:100%;height:145px;object-fit:contain;border-radius:8px}
.product-category{color:#666;font-size:13px}
.price{color:#137a3d;font-weight:bold;font-size:19px;margin:8px 0}
.product button{width:100%;background:#137a3d;color:white;margin-top:8px}
.product button:disabled{background:#999;cursor:not-allowed}
#cart{margin:22px 0}
.cart-row{display:flex;justify-content:space-between;align-items:center;gap:10px;border-bottom:1px solid #eee;padding:12px 0;flex-wrap:wrap}
.cart-actions{display:flex;align-items:center;gap:6px}
.cart-actions button{background:#eee;padding:7px 11px}
.order-btn{background:#ffca28;color:#222;margin-top:8px}
#checkoutForm{margin:22px 0;display:none}
#orderForm label{display:block;font-weight:bold;margin-top:14px}
#orderForm input,#orderForm textarea{width:100%;margin-top:7px}

.delivery-notice-box{background:#fff8e1;border-left:4px solid #ffb300;padding:12px 14px;margin:14px 0;border-radius:6px;font-size:14px;line-height:1.5;color:#664d03}

.confirm-btn{background:#137a3d;color:white;margin-top:16px}
.cancel-btn{background:#eee;color:#222;margin-top:16px}

/* Tracking Timeline Styles */
#trackingSection{margin:22px 0;display:none;border-left:5px solid #137a3d}
.track-input-group{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px;margin-bottom:12px}
.timeline{margin:20px 0;padding:0;list-style:none;position:relative}
.timeline::before{content:'';position:absolute;top:0;bottom:0;left:18px;width:3px;background:#e0e0e0}
.timeline-item{position:relative;margin-bottom:20px;padding-left:46px}
.timeline-icon{position:absolute;left:8px;top:0;width:22px;height:22px;border-radius:50%;background:#bdbdbd;border:3px solid white;box-shadow:0 0 0 2px #bdbdbd}
.timeline-item.active .timeline-icon{background:#137a3d;box-shadow:0 0 0 2px #137a3d}
.timeline-item.completed .timeline-icon{background:#2e7d32;box-shadow:0 0 0 2px #2e7d32}
.timeline-item.rejected .timeline-icon{background:#c62828;box-shadow:0 0 0 2px #c62828}
.timeline-content h4{margin:0 0 4px 0;font-size:15px}
.timeline-content p{margin:0;font-size:13px;color:#666}
.status-pill{display:inline-block;padding:6px 14px;border-radius:20px;font-weight:bold;font-size:14px;margin-top:6px}
.status-placed{background:#e3f2fd;color:#1565c0}
.status-pending{background:#fff9c4;color:#f57f17}
.status-accepted{background:#e8f5e9;color:#2e7d32}
.status-preparing{background:#ede7f6;color:#512da8}
.status-out{background:#fff3e0;color:#e65100}
.status-delivered{background:#c8e6c9;color:#1b5e20}
.status-cancelled,.status-rejected{background:#ffebee;color:#c62828}

footer{background:#174c2d;color:white;padding:22px;text-align:center}
@media(max-width:480px){
  .brand{font-size:23px}
  .hero h1{font-size:25px}
  .delivery-rate-bar{font-size:13px;flex-direction:column;gap:6px;align-items:flex-start}
}
</style>
</head>
<body>
<header>
  <div class="brand-row">
    <div class="brand">🛒 NALANDA UDAN MART</div>
    <div class="nav-actions">
      <button type="button" class="track-nav-btn" onclick="scrollToTracking()">📦 Track Order</button>
      <a href="admin.html" class="admin-link">⚙️ Admin Panel</a>
    </div>
  </div>
  <p>Har Zaroorat, Aapke Darwaze Par!</p>
  <p>📍 Parbalpur, Nalanda, Bihar</p>
  <div class="search">
    <input id="search" type="search" placeholder="Product khojein...">
    <button type="button" onclick="showProducts()">Search</button>
  </div>
</header>

<div class="delivery-rate-bar" id="deliveryRateBar">
  <span id="deliveryRateText">🚚 Delivery Charge: <span id="deliveryRateDisplay">Loading...</span> per KM</span>
  <span class="rate-tag">Distance hisaab se</span>
</div>

<section class="hero">
  <h1>Ghar Baithe Shopping Karo!</h1>
  <p>Grocery, fruits, vegetables aur daily essentials ek hi jagah.</p>
  <b>Apne local dukandaar se kharidein.</b>
</section>

<main>

  <!-- CUSTOMER ORDER LIVE TRACKING SECTION -->
  <section id="trackingSection">
    <h2>📦 Customer Live Order Tracking</h2>
    <p style="color:#555;font-size:14px;">Apni Order ID aur wahi Mobile Number daalein jisse order place kiya tha.</p>
    
    <form id="trackingForm">
      <div class="track-input-group">
        <div>
          <label for="trackOrderId" style="font-weight:bold;font-size:13px;">Order ID</label>
          <input type="text" id="trackOrderId" placeholder="Jaise UM1729123456" required>
        </div>
        <div>
          <label for="trackPhone" style="font-weight:bold;font-size:13px;">Registered Mobile Number</label>
          <input type="tel" id="trackPhone" pattern="[6-9][0-9]{9}" maxlength="10" placeholder="10-digit number" required>
        </div>
      </div>
      <button type="submit" id="trackBtn" style="background:#137a3d;color:white;">Track Status</button>
      <button type="button" class="secondary" style="background:#eee;color:#333;" onclick="closeTracking()">Band Karein</button>
    </form>

    <div id="trackingResult" style="margin-top:20px;display:none;"></div>
  </section>

  <h2>🛍️ Categories</h2>
  <div class="categories" id="categories"></div>
  
  <h2>⭐ Products</h2>
  <p>Admin panel se update kiye gaye live products aur prices.</p>
  <div class="products" id="products"></div>

  <section id="cart">
    <h2>🛒 Aapka Cart</h2>
    <div id="cartItems">Abhi cart khaali hai.</div>
    <h3 id="total">Subtotal: ₹0</h3>
    <div style="font-size:13px;color:#555;margin-bottom:10px;">
      ℹ️ Delivery charges (<span id="cartRateNote">₹10/km</span>) order ke address aur distance ke hisaab se alag se bataye jayenge.
    </div>
    <button type="button" class="order-btn" onclick="checkout()">Order Karein</button>
  </section>

  <section id="checkoutForm">
    <h2>📦 Customer Details</h2>
    <p>Apna sahi naam, mobile number aur delivery address bhariye.</p>
    
    <div class="delivery-notice-box">
      🚚 <b>Delivery Charge: <span id="checkoutRateNote">₹10</span> per KM</b><br>
      Delivery charges order ke address aur distance ke hisaab se alag se bataye jayenge. Subtotal mein delivery charge shamil nahi hai; dukandaar distance hisaab se final bill ke sath aapko batayenge.
    </div>

    <form id="orderForm">
      <label for="customerName">Poora naam</label>
      <input id="customerName" type="text" placeholder="Apna naam likhein" autocomplete="name" required>
      
      <label for="customerPhone">Mobile number</label>
      <input id="customerPhone" type="tel" inputmode="numeric" pattern="[6-9][0-9]{9}" maxlength="10" placeholder="10 digit mobile number" autocomplete="tel" required>
      
      <label for="customerAddress">Delivery address</label>
      <textarea id="customerAddress" rows="4" placeholder="Gaon, mohalla, ghar ka pata" autocomplete="street-address" required></textarea>
      
      <label>Payment method</label>
      <p>💵 Cash on Delivery (delivery ke samay payment)</p>
      
      <h3 id="checkoutTotal">Items Subtotal: ₹0</h3>
      <p style="font-size:13px;color:#666;margin-top:-6px;">* Delivery charge distance hisaab se bill me judega.</p>

      <button class="confirm-btn" type="submit" id="confirmOrderBtn">Order Confirm Karein</button>
      <button class="cancel-btn" type="button" onclick="closeCheckout()">Cancel</button>
    </form>
  </section>
</main>

<footer>
  <h3>NALANDA UDAN MART</h3>
  <p>Parbalpur, Nalanda, Bihar</p>
  <p>Local shopping, aapke apne bazaar se.</p>
</footer>

<script>
let selectedCategory = "";
let cart = [];
let products = [];
let categories = [];
let currentRate = 10;
let liveTrackingInterval = null;

function escapeHTML(v) {
  return String(v ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

function money(v) {
  const n = Number(v || 0);
  if (!Number.isFinite(n)) return "₹0";
  return "₹" + n.toFixed(2).replace(/\.00$/, "").replace(/(\.\d)0$/, "$1");
}

/* ==================== TRACKING LOGIC ==================== */

function scrollToTracking(){
  const sec = document.getElementById("trackingSection");
  sec.style.display = "block";
  sec.scrollIntoView({ behavior: "smooth", block: "start" });
}

function closeTracking(){
  document.getElementById("trackingSection").style.display = "none";
  if(liveTrackingInterval) clearInterval(liveTrackingInterval);
}

document.getElementById("trackingForm").addEventListener("submit", async function(e){
  e.preventDefault();
  const orderId = document.getElementById("trackOrderId").value.trim();
  const phone = document.getElementById("trackPhone").value.trim();
  fetchAndRenderOrderTracking(orderId, phone);
  
  if(liveTrackingInterval) clearInterval(liveTrackingInterval);
  liveTrackingInterval = setInterval(() => {
    fetchAndRenderOrderTracking(orderId, phone, true);
  }, 15000);
});

async function fetchAndRenderOrderTracking(orderId, phone, isAutoRefresh = false){
  const btn = document.getElementById("trackBtn");
  const resultDiv = document.getElementById("trackingResult");
  if(!isAutoRefresh){
    btn.disabled = true;
    btn.textContent = "Verifying...";
  }

  try {
    const res = await fetch("/api/orders/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, phone })
    });
    const data = await res.json();
    if(data.success && data.order){
      renderTrackingDetails(data.order);
      resultDiv.style.display = "block";
    } else {
      if(!isAutoRefresh) alert(data.message || "Tracking error");
      if(liveTrackingInterval) clearInterval(liveTrackingInterval);
    }
  } catch(err){
    if(!isAutoRefresh) alert("Server connect nahi hua.");
  } finally {
    if(!isAutoRefresh){
      btn.disabled = false;
      btn.textContent = "Track Status";
    }
  }
}

function getStatusBadgeClass(status){
  switch(status){
    case "Order Placed": return "status-placed";
    case "Pending": return "status-pending";
    case "Accepted": return "status-accepted";
    case "Preparing": return "status-preparing";
    case "Out for Delivery": return "status-out";
    case "Delivered": return "status-delivered";
    case "Cancelled": return "status-cancelled";
    case "Rejected": return "status-rejected";
    default: return "status-pending";
  }
}

function renderTrackingDetails(order){
  const res = document.getElementById("trackingResult");
  const currentStatus = order.status || "Pending";
  const isTerminalNegative = currentStatus === "Cancelled" || currentStatus === "Rejected";

  const standardSteps = [
    { key: "Order Placed", label: "Order Placed", desc: "Aapka order system mein darj ho gaya hai." },
    { key: "Accepted", label: "Accepted", desc: "Dukandaar ne order confirm kar liya hai." },
    { key: "Preparing", label: "Preparing", desc: "Aapka saamaan pack kiya ja raha hai." },
    { key: "Out for Delivery", label: "Out for Delivery", desc: "Delivery boy raste mein hai." },
    { key: "Delivered", label: "Delivered", desc: "Order safalta-purvak deliver ho gaya hai." }
  ];

  const statusPriority = {
    "Order Placed": 1,
    "Pending": 1,
    "Accepted": 2,
    "Preparing": 3,
    "Out for Delivery": 4,
    "Delivered": 5
  };

  const currentLevel = statusPriority[currentStatus] || 1;

  let timelineHtml = '<ul class="timeline">';

  if(!isTerminalNegative){
    standardSteps.forEach((step, idx) => {
      const stepLevel = idx + 1;
      let stateClass = "";
      if(stepLevel < currentLevel){
        stateClass = "completed";
      } else if(stepLevel === currentLevel){
        stateClass = "active";
      }
      timelineHtml += `
        <li class="timeline-item ${stateClass}">
          <div class="timeline-icon"></div>
          <div class="timeline-content">
            <h4>${step.label}</h4>
            <p>${step.desc}</p>
          </div>
        </li>
      `;
    });
  } else {
    timelineHtml += `
      <li class="timeline-item rejected">
        <div class="timeline-icon"></div>
        <div class="timeline-content">
          <h4 style="color:#c62828;">${escapeHTML(currentStatus)}</h4>
          <p>${currentStatus === 'Rejected' ? 'Reason: ' + escapeHTML(order.rejectionReason || 'Dukandaar dwara cancel kiya gaya') : 'Yeh order cancel kar diya gaya hai.'}</p>
        </div>
      </li>
    `;
  }
  timelineHtml += '</ul>';

  const itemsHtml = (order.items || []).map(i => `
    <li style="margin-bottom:4px;">${escapeHTML(i.name)} × ${i.qty} = <b>${money(i.price * i.qty)}</b></li>
  `).join("");

  res.innerHTML = `
    <div style="background:#fafafa;padding:16px;border-radius:10px;border:1px solid #eee;">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
        <h3 style="margin:0;">Order ID: ${escapeHTML(order.orderId)}</h3>
        <span class="status-pill ${getStatusBadgeClass(currentStatus)}">${escapeHTML(currentStatus)}</span>
      </div>
      <p style="font-size:13px;color:#777;margin:6px 0;">Order Date: ${new Date(order.createdAt).toLocaleString("en-IN")}</p>
      
      ${timelineHtml}

      <div style="background:white;padding:12px;border-radius:8px;border:1px solid #ddd;margin-top:14px;">
        <h4 style="margin:0 0 8px 0;">Order Items</h4>
        <ul style="padding-left:20px;margin:0 0 10px 0;">${itemsHtml}</ul>
        <p style="margin:4px 0;"><b>Items Subtotal:</b> ${money(order.subtotal || order.total)}</p>
        <p style="margin:4px 0;font-size:13px;color:#555;">Delivery Rate: ₹${order.deliveryRateAtOrder || 10}/km (Distance ke mutabik bill mein jodein)</p>
        <p style="margin:4px 0;"><b>Delivery Address:</b> ${escapeHTML(order.address)}</p>
      </div>
    </div>
  `;
}

/* ==================== API SYNC ==================== */

async function fetchDeliveryRate(){
  try {
    const res = await fetch("/api/delivery-charge");
    const data = await res.json();
    if(data.success && Number.isFinite(data.rate)){
      currentRate = data.rate;
      document.getElementById("deliveryRateBar").classList.remove("rate-error");
      document.getElementById("deliveryRateDisplay").textContent = "₹" + currentRate;
      document.getElementById("cartRateNote").textContent = "₹" + currentRate + "/km";
      document.getElementById("checkoutRateNote").textContent = "₹" + currentRate;
    } else {
      throw new Error();
    }
  } catch(e){
    document.getElementById("deliveryRateBar").classList.add("rate-error");
    document.getElementById("deliveryRateDisplay").textContent = "₹10 (Offline)";
    document.getElementById("cartRateNote").textContent = "₹10/km";
    document.getElementById("checkoutRateNote").textContent = "₹10";
  }
}

async function fetchCategories(){
  try {
    const res = await fetch("/api/categories");
    const data = await res.json();
    if(data.success && Array.isArray(data.categories)){
      categories = data.categories;
    }
  } catch(e){
    console.error("Categories fetch failed:", e);
  }
  renderCategories();
}

async function fetchProducts(){
  try {
    const res = await fetch("/api/products");
    const data = await res.json();
    if(data.success && Array.isArray(data.products)){
      products = data.products;
      syncCartPricesWithDatabase();
    }
  } catch(e){
    console.error("Products fetch failed:", e);
  }
  showProducts();
}

function syncCartPricesWithDatabase(){
  if(!cart.length || !products.length) return;
  cart.forEach(item => {
    const fresh = products.find(p => String(p._id || p.id) === String(item.id));
    if(fresh){
      item.price = Number(fresh.price);
      item.name = fresh.name;
    }
  });
  showCart();
}

function renderCategories() {
  const box = document.getElementById("categories");
  if (!box) return;

  let html = `<div class="category ${selectedCategory === "" ? "active" : ""}" onclick="selectCategory('')"><div class="emoji">🛍️</div>All Products</div>`;
  html += categories.map(c => {
    const escapedName = escapeHTML(c.name);
    const escapedEmoji = escapeHTML(c.emoji);
    const jsonParam = JSON.stringify(c.name).replace(/"/g, '&quot;');
    return `<div class="category ${selectedCategory.toLowerCase() === c.name.toLowerCase() ? "active" : ""}" onclick="selectCategory(${jsonParam})"><div class="emoji">${escapedEmoji}</div>${escapedName}</div>`;
  }).join("");

  box.innerHTML = html;
}

function showProducts() {
  const searchInput = document.getElementById("search");
  const term = searchInput ? searchInput.value.trim().toLowerCase() : "";
  const box = document.getElementById("products");
  if (!box) return;

  const filtered = products.filter(p => {
    const matchCat = !selectedCategory || (p.category && p.category.toLowerCase() === selectedCategory.toLowerCase());
    const matchSearch = !term || (p.name && p.name.toLowerCase().includes(term));
    return matchCat && matchSearch;
  });

  if (!filtered.length) {
    box.innerHTML = "<p>Koi product nahi mila.</p>";
  } else {
    box.innerHTML = filtered.map(p => {
      const isAvailable = p.isAvailable !== false && (p.stock === undefined || p.stock > 0);
      const photoHtml = p.photo && (p.photo.startsWith("data:image/") || p.photo.startsWith("http"))
        ? `<img class="product-photo" src="${escapeHTML(p.photo)}" alt="${escapeHTML(p.name)}">`
        : `<div class="emoji">${escapeHTML(p.emoji || "🛍️")}</div>`;
      
      const jsonId = JSON.stringify(p._id || p.id).replace(/"/g, '&quot;');

      return `<div class="product">
        ${photoHtml}
        <h3>${escapeHTML(p.name)}</h3>
        <div class="product-category">${escapeHTML(p.category)}</div>
        <div class="price">${money(p.price)}</div>
        ${isAvailable 
          ? `<button type="button" onclick="addToCart(${jsonId})">+ Cart Mein Jodein</button>`
          : `<button type="button" disabled style="background:#999;cursor:not-allowed;">Out of Stock</button>`}
      </div>`;
    }).join("");
  }
}

function selectCategory(name) {
  selectedCategory = name ? String(name) : "";
  renderCategories();
  showProducts();
}

function addToCart(id) {
  const p = products.find(x => String(x._id || x.id) === String(id));
  if (!p) {
    alert("Product uplabdh nahi hai.");
    return;
  }
  const existing = cart.find(x => String(x.id) === String(p._id || p.id));
  if (existing) {
    existing.qty++;
  } else {
    cart.push({
      id: String(p._id || p.id),
      name: p.name,
      price: Number(p.price),
      qty: 1
    });
  }
  showCart();
}

function totalAmount() {
  return cart.reduce((sum, p) => sum + (Number(p.price) || 0) * (Number(p.qty) || 0), 0);
}

function showCart() {
  const box = document.getElementById("cartItems");
  const totalEl = document.getElementById("total");
  const checkoutTotalEl = document.getElementById("checkoutTotal");
  if (!box) return;

  if (!cart.length) {
    box.textContent = "Abhi cart khaali hai.";
  } else {
    box.innerHTML = cart.map((p, i) => `
      <div class="cart-row">
        <span>${escapeHTML(p.name)} × ${p.qty} = ${money(p.price * p.qty)}</span>
        <div class="cart-actions">
          <button type="button" onclick="changeQty(${i}, -1)">−</button>
          <b>${p.qty}</b>
          <button type="button" onclick="changeQty(${i}, 1)">+</button>
          <button type="button" onclick="removeItem(${i})">Hatao</button>
        </div>
      </div>
    `).join("");
  }

  const amt = money(totalAmount());
  if (totalEl) totalEl.textContent = "Subtotal: " + amt;
  if (checkoutTotalEl) checkoutTotalEl.textContent = "Items Subtotal: " + amt;
}

function changeQty(index, delta) {
  if (!cart[index]) return;
  cart[index].qty += delta;
  if (cart[index].qty <= 0) cart.splice(index, 1);
  showCart();
}

function removeItem(index) {
  if (!cart[index]) return;
  cart.splice(index, 1);
  showCart();
}

function checkout() {
  if (!cart.length) {
    alert("Pehle cart mein product jodiye.");
    return;
  }
  const formSection = document.getElementById("checkoutForm");
  if (formSection) {
    formSection.style.display = "block";
    showCart();
    formSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function closeCheckout() {
  const formSection = document.getElementById("checkoutForm");
  if (formSection) formSection.style.display = "none";
}

document.getElementById("orderForm").addEventListener("submit", async function(event) {
  event.preventDefault();
  if (!cart.length) {
    alert("Cart khaali hai.");
    closeCheckout();
    return;
  }

  const btn = document.getElementById("confirmOrderBtn");
  btn.disabled = true;
  btn.textContent = "Order Verify Ho Raha Hai...";

  const customerName = document.getElementById("customerName").value.trim();
  const phone = document.getElementById("customerPhone").value.trim();
  const address = document.getElementById("customerAddress").value.trim();

  const phoneRegex = /^[6-9]\d{9}$/;
  if (!customerName || !phoneRegex.test(phone) || !address) {
    alert("Kripya sahi 10-digit mobile number aur poora address bhariye.");
    btn.disabled = false;
    btn.textContent = "Order Confirm Karein";
    return;
  }

  const orderPayload = {
    customerName,
    phone,
    address,
    paymentMethod: "Cash on Delivery",
    items: cart.map(i => ({
      id: i.id,
      name: i.name,
      qty: i.qty
    }))
  };

  try {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderPayload)
    });
    const data = await res.json();
    if(data.success && data.order){
      alert(`Order Safalta-purvak Place Ho Gaya!\n\nOrder ID: ${data.order.orderId}\n\nAb aap live tracking section se apna order status dekh sakte hain.`);
      
      document.getElementById("trackOrderId").value = data.order.orderId;
      document.getElementById("trackPhone").value = data.order.phone;
      
      cart = [];
      showCart();
      document.getElementById("orderForm").reset();
      closeCheckout();

      scrollToTracking();
      fetchAndRenderOrderTracking(data.order.orderId, data.order.phone);
    } else {
      alert("Order Error: " + (data.message || "Order place nahi ho saka."));
    }
  } catch(err){
    alert("Server connect nahi hua. Kripya connection check karein.");
  } finally {
    btn.disabled = false;
    btn.textContent = "Order Confirm Karein";
  }
});

document.getElementById("search").addEventListener("input", showProducts);

fetchDeliveryRate();
fetchCategories();
fetchProducts();
showCart();

setInterval(() => {
  fetchDeliveryRate();
  fetchProducts();
}, 20000);
</script>
</body>
</html>