/* =========================================
   Sphere Football Academy — Shop
   Static-site cart, no backend.
   Cart persists in localStorage.
   Orders are sent via EmailJS.
   ========================================= */

// ---- Product catalog ----
// Edit this list to add/remove/update products. Drop real photos into
// images/ and update the `image` field. Until then we render a styled
// gradient placeholder per product (works offline, no broken images).

const PRODUCTS = [
  {
    id: 'home-jersey',
    name: 'Home Jersey 25/26',
    price: 95,
    category: 'Jerseys',
    image: 'images/shop/home-jersey.png',
    sizes: ['Kids 8', 'Kids 10', 'Kids 12', 'Kids 14', 'Adult S', 'Adult M', 'Adult L', 'Adult XL', 'Adult XXL'],
    short: 'Match-grade home jersey. Lightweight, breathable, built for the pitch.',
    material: '100% recycled polyester. Moisture-wicking mesh panels.',
    fit: 'Athletic fit. Size up if you prefer relaxed.',
  },
  {
    id: 'training-hoodie',
    name: 'Training Hoodie',
    price: 120,
    category: 'Outerwear',
    image: 'images/shop/training-hoodie.png',
    sizes: ['Adult S', 'Adult M', 'Adult L', 'Adult XL', 'Adult XXL'],
    short: 'Heavyweight hoodie for cold mornings on the training ground.',
    material: '80% cotton / 20% polyester brushed fleece. Embroidered Sphere logo.',
    fit: 'Regular fit. True to size.',
  },
  {
    id: 'match-jacket',
    name: 'Match Day Jacket',
    price: 180,
    category: 'Outerwear',
    image: 'images/shop/match-jacket.png',
    sizes: ['Adult S', 'Adult M', 'Adult L', 'Adult XL', 'Adult XXL'],
    short: 'Insulated puffer jacket. Sideline ready.',
    material: 'Water-resistant ripstop shell, recycled poly fill, YKK zips.',
    fit: 'Regular fit with room for layering.',
  },
  {
    id: 'training-tee',
    name: 'Training Tee',
    price: 55,
    category: 'Apparel',
    image: 'images/shop/training-tee.png',
    sizes: ['Kids 8', 'Kids 10', 'Kids 12', 'Kids 14', 'Adult S', 'Adult M', 'Adult L', 'Adult XL', 'Adult XXL'],
    short: 'Performance training tee. Sweat through it, dry fast.',
    material: 'Recycled polyester with mesh ventilation panels.',
    fit: 'Athletic fit.',
  },
  {
    id: 'training-pants',
    name: 'Training Pants',
    price: 85,
    category: 'Apparel',
    image: 'images/shop/training-pants.png',
    sizes: ['Kids 10', 'Kids 12', 'Kids 14', 'Adult S', 'Adult M', 'Adult L', 'Adult XL'],
    short: 'Tapered training pants with zip cuffs.',
    material: 'Stretch poly-elastane blend. Side and back pockets.',
    fit: 'Slim tapered fit.',
  },
  {
    id: 'match-shorts',
    name: 'Match Shorts',
    price: 50,
    category: 'Apparel',
    image: 'images/shop/match-shorts.png',
    sizes: ['Kids 8', 'Kids 10', 'Kids 12', 'Kids 14', 'Adult S', 'Adult M', 'Adult L', 'Adult XL'],
    short: 'Match shorts with side stripe detail.',
    material: 'Recycled polyester. Internal drawcord.',
    fit: 'Athletic fit.',
  },
  {
    id: 'match-socks',
    name: 'Match Socks',
    price: 20,
    category: 'Accessories',
    image: 'images/shop/match-socks.png',
    sizes: ['Kids', 'Adult S/M', 'Adult L/XL'],
    short: 'Crew-length match socks with arch support.',
    material: 'Cushioned poly-cotton blend. Reinforced heel and toe.',
    fit: 'Stretch-fit.',
  },
  {
    id: 'cap',
    name: 'Sphere Cap',
    price: 40,
    category: 'Headwear',
    image: 'images/shop/cap.png',
    sizes: ['One Size'],
    short: 'Six-panel cap with adjustable strap.',
    material: 'Brushed cotton twill. Embroidered Sphere logo.',
    fit: 'Adjustable. One size fits most.',
  },
  {
    id: 'beanie',
    name: 'Winter Beanie',
    price: 35,
    category: 'Headwear',
    image: 'images/shop/beanie.png',
    sizes: ['One Size'],
    short: 'Cuffed beanie. Warm enough for winter sessions.',
    material: 'Acrylic knit, fleece-lined band.',
    fit: 'One size.',
  },
  {
    id: 'match-ball',
    name: 'Match Ball',
    price: 60,
    category: 'Equipment',
    image: 'images/shop/match-ball.png',
    sizes: ['Size 4', 'Size 5'],
    short: 'Match-quality football. Custom Sphere panel print.',
    material: 'Hand-stitched 32-panel construction. Latex bladder.',
    fit: 'Size 4 for U10 and under, Size 5 for U11+.',
  },
  {
    id: 'gear-bag',
    name: 'Gear Backpack',
    price: 90,
    category: 'Equipment',
    image: 'images/shop/gear-bag.png',
    sizes: ['One Size'],
    short: 'Daily training backpack with separate boot compartment.',
    material: 'Water-resistant 600D ripstop. Padded laptop sleeve.',
    fit: '28L capacity.',
  },
];

const PRODUCT_INDEX = Object.fromEntries(PRODUCTS.map(p => [p.id, p]));

const SHOP_EMAIL_CONFIG = {
  serviceId: 'service_sq13t1l',
  orderTemplateId: 'template_qrwryl9',
  storeEmail: 'spherefootball2@gmail.com',
};

const PUBLIC_SITE_ORIGIN = (() => {
  try {
    const canonical = document.querySelector('link[rel="canonical"]')?.href;
    return canonical ? new URL(canonical).origin : window.location.origin;
  } catch {
    return window.location.origin;
  }
})();

// ---- Cart state (persisted to localStorage) ----

const CART_KEY = 'sphere_cart_v1';

function loadCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Drop any lines whose product no longer exists in the catalog
    // (otherwise the count badge counts ghosts that won't render).
    return parsed.filter(line => line && PRODUCT_INDEX[line.id] && line.qty > 0);
  } catch {
    return [];
  }
}

function saveCart(cart) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch {
    // localStorage full or disabled, fail silently
  }
}

let cart = loadCart();
// Persist the pruned state so localStorage reflects the cleaned cart.
saveCart(cart);

function cartCount() {
  return cart.reduce((n, line) => n + line.qty, 0);
}

function cartSubtotal() {
  return cart.reduce((sum, line) => {
    const p = PRODUCT_INDEX[line.id];
    return sum + (p ? p.price * line.qty : 0);
  }, 0);
}

function formatMoney(value) {
  return Number(value || 0).toFixed(2);
}

function createOrderId() {
  const now = new Date();
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
    String(now.getHours()).padStart(2, '0'),
    String(now.getMinutes()).padStart(2, '0'),
    String(now.getSeconds()).padStart(2, '0'),
  ].join('');
}

function publicAssetUrl(path) {
  return new URL(path.replace(/^\//, ''), `${PUBLIC_SITE_ORIGIN}/`).toString();
}

function orderImageUrl(product) {
  if (!product.image || product.image.startsWith('data:')) return '';
  return publicAssetUrl(product.image);
}

function cartLineKey(productId, size) {
  return `${productId}::${size}`;
}

function addToCart(productId, size, qty = 1) {
  const key = cartLineKey(productId, size);
  const existing = cart.find(line => cartLineKey(line.id, line.size) === key);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ id: productId, size, qty });
  }
  saveCart(cart);
  renderCart();
  flashCartButton();
}

function updateQty(productId, size, delta) {
  const key = cartLineKey(productId, size);
  const line = cart.find(l => cartLineKey(l.id, l.size) === key);
  if (!line) return;
  line.qty += delta;
  if (line.qty <= 0) {
    cart = cart.filter(l => cartLineKey(l.id, l.size) !== key);
  }
  saveCart(cart);
  renderCart();
}

function removeLine(productId, size) {
  const key = cartLineKey(productId, size);
  cart = cart.filter(l => cartLineKey(l.id, l.size) !== key);
  saveCart(cart);
  renderCart();
}

function clearCart() {
  cart = [];
  saveCart(cart);
  renderCart();
}

// ---- Rendering ----

function placeholderArt(product) {
  // Inline SVG placeholder so we don't need image files yet.
  // Charcoal gradient with product initials. Category label is rendered
  // by the card body, no need to repeat it inside the image.
  const initials = product.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const svg = `
    <svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="g-${product.id}" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#1a1a1a"/>
          <stop offset="100%" stop-color="#0a0a0a"/>
        </linearGradient>
      </defs>
      <rect width="400" height="400" fill="url(#g-${product.id})"/>
      <circle cx="200" cy="200" r="64" fill="none" stroke="#1a75d2" stroke-width="3" opacity="0.55"/>
      <text x="200" y="218" font-family="Montserrat, sans-serif" font-weight="900" font-size="60" fill="#f5f5f5" text-anchor="middle">${initials}</text>
    </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function productImage(product) {
  return product.image || placeholderArt(product);
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// First three products get the hero treatment, the rest go into the
// compact grid. Order in PRODUCTS controls what's featured.
const FEATURED_COUNT = 3;

function featuredCardHTML(p) {
  return `
    <a href="#product=${p.id}" class="shop-card shop-card--featured" data-product-id="${p.id}">
      <div class="shop-card-media">
        <img src="${productImage(p)}" alt="${escapeHtml(p.name)}" loading="lazy" decoding="async">
      </div>
      <div class="shop-card-body">
        <h3 class="shop-card-title">${escapeHtml(p.name)}</h3>
        <span class="shop-card-price">TBC</span>
        <span class="shop-card-cta">Buy Now <span aria-hidden="true">→</span></span>
      </div>
    </a>
  `;
}

function compactCardHTML(p) {
  return `
    <a href="#product=${p.id}" class="shop-card shop-card--compact" data-product-id="${p.id}">
      <div class="shop-card-media">
        <img src="${productImage(p)}" alt="${escapeHtml(p.name)}" loading="lazy" decoding="async">
      </div>
      <div class="shop-card-body">
        <div class="shop-card-info">
          <h3 class="shop-card-title">${escapeHtml(p.name)}</h3>
          <span class="shop-card-price">TBC</span>
        </div>
        <span class="shop-card-link">Buy Now <span aria-hidden="true">→</span></span>
      </div>
    </a>
  `;
}

function renderGrid() {
  const grid = document.getElementById('shop-grid');
  if (!grid) return;

  const featured = PRODUCTS.slice(0, FEATURED_COUNT);
  const rest = PRODUCTS.slice(FEATURED_COUNT);

  grid.innerHTML = `
    <div class="shop-featured">
      ${featured.map(featuredCardHTML).join('')}
    </div>
    <div class="shop-compact">
      ${rest.map(compactCardHTML).join('')}
    </div>
  `;
}

function renderDetail(productId) {
  const detail = document.getElementById('shop-detail');
  if (!detail) return;
  const p = PRODUCT_INDEX[productId];
  if (!p) {
    detail.innerHTML = `
      <div class="container shop-detail-missing">
        <p>Product not found.</p>
        <a href="#" class="btn btn-outline">Back to shop</a>
      </div>`;
    return;
  }

  detail.innerHTML = `
    <div class="container shop-detail">
      <a href="#" class="page-back">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        Back to Shop
      </a>
      <div class="shop-detail-grid">
        <div class="shop-detail-media">
          <img src="${productImage(p)}" alt="${escapeHtml(p.name)}" decoding="async">
        </div>
        <div class="shop-detail-info">
          <span class="label-tag">${escapeHtml(p.category)}</span>
          <h1 class="shop-detail-title">${escapeHtml(p.name)}</h1>
          <div class="shop-detail-price">TBC</div>
          <p class="shop-detail-short">${escapeHtml(p.short)}</p>

          <form class="shop-detail-form" id="add-form" data-product-id="${p.id}">
            <div class="form-group">
              <label for="size">Size</label>
              <select id="size" name="size" required>
                ${p.sizes.map(s => `<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`).join('')}
              </select>
            </div>
            <div class="form-group shop-qty-group">
              <label>Quantity</label>
              <div class="shop-qty">
                <button type="button" class="shop-qty-btn" data-delta="-1" aria-label="Decrease">−</button>
                <input type="number" id="qty" value="1" min="1" max="20" inputmode="numeric">
                <button type="button" class="shop-qty-btn" data-delta="1" aria-label="Increase">+</button>
              </div>
            </div>
            <button type="submit" class="btn btn-primary btn-full">Add to Cart</button>
          </form>

          <div class="shop-detail-meta">
            <div>
              <h4>Material</h4>
              <p>${escapeHtml(p.material)}</p>
            </div>
            <div>
              <h4>Fit</h4>
              <p>${escapeHtml(p.fit)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  const form = document.getElementById('add-form');
  const qtyInput = form.querySelector('#qty');
  form.querySelectorAll('.shop-qty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const delta = parseInt(btn.dataset.delta, 10);
      const next = Math.max(1, Math.min(20, parseInt(qtyInput.value, 10) + delta));
      qtyInput.value = next;
    });
  });
  form.addEventListener('submit', e => {
    e.preventDefault();
    const size = form.querySelector('#size').value;
    const qty = Math.max(1, parseInt(qtyInput.value, 10) || 1);
    addToCart(p.id, size, qty);
    openCart();
  });
}

function renderCart() {
  const list = document.getElementById('cart-list');
  const subtotalEl = document.getElementById('cart-subtotal');
  const countEls = document.querySelectorAll('.cart-count');
  const cartEmpty = document.getElementById('cart-empty');
  const cartFoot = document.getElementById('cart-foot');

  if (!list) return;

  if (cart.length === 0) {
    list.innerHTML = '';
    if (cartEmpty) cartEmpty.hidden = false;
    if (cartFoot) cartFoot.hidden = true;
  } else {
    if (cartEmpty) cartEmpty.hidden = true;
    if (cartFoot) cartFoot.hidden = false;
    list.innerHTML = cart.map(line => {
      const p = PRODUCT_INDEX[line.id];
      if (!p) return '';
      return `
        <li class="cart-line" data-product-id="${p.id}" data-size="${escapeHtml(line.size)}">
          <img class="cart-line-img" src="${productImage(p)}" alt="${escapeHtml(p.name)}">
          <div class="cart-line-body">
            <h4 class="cart-line-title">${escapeHtml(p.name)}</h4>
            <p class="cart-line-meta">${escapeHtml(line.size)}</p>
            <div class="cart-line-controls">
              <button class="cart-qty-btn" data-action="dec" aria-label="Decrease">−</button>
              <span class="cart-qty-val">${line.qty}</span>
              <button class="cart-qty-btn" data-action="inc" aria-label="Increase">+</button>
              <button class="cart-line-remove" data-action="remove" aria-label="Remove">Remove</button>
            </div>
          </div>
          <div class="cart-line-price">$${p.price * line.qty}</div>
        </li>
      `;
    }).join('');
  }

  if (subtotalEl) subtotalEl.textContent = `$${cartSubtotal()} AUD`;

  const count = cartCount();
  countEls.forEach(el => {
    el.textContent = count;
    el.hidden = count === 0;
  });
}

// ---- Cart drawer open/close ----

function openCart() {
  document.body.classList.add('cart-open');
  document.getElementById('cart-drawer')?.setAttribute('aria-hidden', 'false');
}
function closeCart() {
  document.body.classList.remove('cart-open');
  document.getElementById('cart-drawer')?.setAttribute('aria-hidden', 'true');
  document.getElementById('checkout-view')?.setAttribute('hidden', '');
  document.getElementById('thanks-view')?.setAttribute('hidden', '');
  document.getElementById('cart-view')?.removeAttribute('hidden');
}
function flashCartButton() {
  document.querySelectorAll('.cart-toggle').forEach(btn => {
    btn.classList.remove('flash');
    void btn.offsetWidth;
    btn.classList.add('flash');
  });
}

// ---- Hash routing ----

function applyRoute() {
  const hash = window.location.hash;
  const grid = document.getElementById('shop-grid-section');
  const detail = document.getElementById('shop-detail-section');
  const hero = document.querySelector('.shop-hero');

  const m = hash.match(/^#product=(.+)$/);
  if (m) {
    if (grid) grid.hidden = true;
    if (hero) hero.hidden = true;
    if (detail) {
      detail.hidden = false;
      renderDetail(decodeURIComponent(m[1]));
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  } else {
    if (detail) detail.hidden = true;
    if (grid) grid.hidden = false;
    if (hero) hero.hidden = false;
  }
}

// ---- Checkout ----

function showCheckout() {
  document.getElementById('cart-view')?.setAttribute('hidden', '');
  document.getElementById('checkout-view')?.removeAttribute('hidden');
}
function showCart() {
  document.getElementById('checkout-view')?.setAttribute('hidden', '');
  document.getElementById('cart-view')?.removeAttribute('hidden');
}

function buildOrderSummary(form) {
  const delivery = form.delivery.value;
  const isPickup = delivery === 'pickup';

  const orders = cart.map(line => {
    const p = PRODUCT_INDEX[line.id];
    if (!p) return null;

    return {
      name: p.name,
      size: line.size,
      units: String(line.qty),
      price: formatMoney(p.price),
      line_total: formatMoney(p.price * line.qty),
      image_url: orderImageUrl(p),
    };
  }).filter(Boolean);

  const subtotal = formatMoney(cartSubtotal());

  return {
    orderId: createOrderId(),
    isPickup,
    orders,
    cost: {
      subtotal,
      shipping: isPickup ? '0.00' : 'Quoted separately',
      tax: '0.00',
      total: subtotal,
    },
    deliveryLabel: isPickup ? 'Pickup from Sphere HQ (1/3 Wood St, Tempe)' : 'Ship to address',
    deliveryNote: isPickup
      ? 'Pickup is free. We will email you to lock in a pickup time once payment is confirmed.'
      : 'Shipping is quoted separately after checkout and will be added to your invoice email.',
  };
}

function buildOrderMessage(form, summary) {
  const lines = summary.orders.map(item => {
    return `• ${item.name} — ${item.size} — qty ${item.units} — $${item.line_total}`;
  });

  const out = [
    'NEW SHOP ORDER',
    `Order ID: ${summary.orderId}`,
    '',
    'Items:',
    ...lines,
    '',
    `Subtotal: $${summary.cost.subtotal} AUD`,
    summary.isPickup ? '(Pickup from Sphere HQ — no shipping)' : '(Shipping quoted separately after checkout)',
    '',
    '— Customer —',
    `Name: ${form.name.value}`,
    `Email: ${form.email.value}`,
    `Phone: ${form.phone.value}`,
    '',
    `Delivery: ${summary.deliveryLabel}`,
  ];

  if (!summary.isPickup) {
    out.push('Shipping address:', form.address.value);
  }

  if (form.notes.value) {
    out.push('', `Notes: ${form.notes.value}`);
  }

  return out.join('\n');
}

function buildAdminTemplateParams(form, summary) {
  return {
    to_email: SHOP_EMAIL_CONFIG.storeEmail,
    email: SHOP_EMAIL_CONFIG.storeEmail,
    subject: `Shop Order #${summary.orderId}`,
    title: 'Shop Order',
    reply_to: form.email.value,
    is_store: true,
    is_customer: false,
    from_name: form.name.value,
    from_email: form.email.value,
    customer_name: form.name.value,
    customer_email: form.email.value,
    phone: form.phone.value,
    session_type: 'Shop Order',
    order_id: summary.orderId,
    order_total_label: summary.isPickup ? 'Order Total' : 'Order Subtotal',
    delivery_method: summary.deliveryLabel,
    delivery_note: summary.deliveryNote,
    shipping_address: summary.isPickup ? '' : form.address.value,
    has_shipping_address: !summary.isPickup,
    notes: form.notes.value,
    has_notes: Boolean(form.notes.value),
    orders: summary.orders,
    cost: summary.cost,
    message: buildOrderMessage(form, summary),
  };
}

function buildCustomerTemplateParams(form, summary) {
  return {
    email: form.email.value,
    to_email: form.email.value,
    subject: `Order Confirmed #${summary.orderId}!`,
    title: 'Thank You for Your Order',
    reply_to: SHOP_EMAIL_CONFIG.storeEmail,
    is_store: false,
    is_customer: true,
    customer_name: form.name.value,
    customer_email: form.email.value,
    phone: form.phone.value,
    order_id: summary.orderId,
    order_total_label: summary.isPickup ? 'Order Total' : 'Order Subtotal',
    delivery_method: summary.deliveryLabel,
    delivery_note: summary.deliveryNote,
    shipping_address: summary.isPickup ? '' : form.address.value,
    has_shipping_address: !summary.isPickup,
    notes: form.notes.value,
    has_notes: Boolean(form.notes.value),
    orders: summary.orders,
    cost: summary.cost,
  };
}

function wireCheckoutForm() {
  const form = document.getElementById('checkout-form');
  if (!form) return;

  // Delivery toggle: pickup hides address (and clears required), ship shows it.
  const addressGroup = document.getElementById('co-address-group');
  const addressInput = document.getElementById('co-address');
  const pickupNote = document.getElementById('co-pickup-note');

  function applyDelivery() {
    const isPickup = form.delivery.value === 'pickup';
    if (addressGroup) addressGroup.hidden = isPickup;
    if (addressInput) addressInput.required = !isPickup;
    if (pickupNote) pickupNote.hidden = !isPickup;
  }
  form.querySelectorAll('input[name="delivery"]').forEach(radio => {
    radio.addEventListener('change', applyDelivery);
  });
  applyDelivery();

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const honey = form.querySelector('#co-website');
    if (honey && honey.value) {
      form.reset();
      applyDelivery();
      return;
    }

    if (cart.length === 0) return;

    const btn = form.querySelector('button[type="submit"]');
    const original = btn.textContent;

    if (typeof emailjs === 'undefined') {
      btn.textContent = 'Email unavailable - try again';
      btn.disabled = true;
      setTimeout(() => {
        btn.textContent = original;
        btn.disabled = false;
      }, 3000);
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Sending...';

    const summary = buildOrderSummary(form);
    const adminTemplateParams = buildAdminTemplateParams(form, summary);
    const customerTemplateParams = buildCustomerTemplateParams(form, summary);

    try {
      await emailjs.send(
        SHOP_EMAIL_CONFIG.serviceId,
        SHOP_EMAIL_CONFIG.orderTemplateId,
        adminTemplateParams,
      );

      try {
        await emailjs.send(
          SHOP_EMAIL_CONFIG.serviceId,
          SHOP_EMAIL_CONFIG.orderTemplateId,
          customerTemplateParams,
        );
      } catch (error) {
        console.error('EmailJS customer confirmation error:', error);
      }

      btn.disabled = false;
      btn.textContent = original;
      // Clear cart, show success view
      clearCart();
      form.reset();
      applyDelivery();
      document.getElementById('checkout-view').setAttribute('hidden', '');
      document.getElementById('thanks-view').removeAttribute('hidden');
    } catch (error) {
      console.error('EmailJS error:', error);
      btn.textContent = 'Error - Try Again';
      btn.disabled = false;
      setTimeout(() => {
        btn.textContent = original;
      }, 3000);
    }
  });
}

// ---- Wire up everything once DOM is ready ----

document.addEventListener('DOMContentLoaded', () => {
  renderGrid();
  renderCart();
  applyRoute();

  window.addEventListener('hashchange', applyRoute);

  // Cart toggle
  document.querySelectorAll('.cart-toggle').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      openCart();
    });
  });

  document.getElementById('cart-close')?.addEventListener('click', closeCart);
  document.getElementById('cart-backdrop')?.addEventListener('click', closeCart);

  // Cart line interactions (event delegation)
  document.getElementById('cart-list')?.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const line = btn.closest('.cart-line');
    if (!line) return;
    const id = line.dataset.productId;
    const size = line.dataset.size;
    const action = btn.dataset.action;
    if (action === 'inc') updateQty(id, size, 1);
    else if (action === 'dec') updateQty(id, size, -1);
    else if (action === 'remove') removeLine(id, size);
  });

  // Cart → checkout
  document.getElementById('cart-checkout-btn')?.addEventListener('click', showCheckout);
  document.getElementById('checkout-back')?.addEventListener('click', showCart);
  document.getElementById('thanks-close')?.addEventListener('click', () => {
    document.getElementById('thanks-view').setAttribute('hidden', '');
    document.getElementById('cart-view').removeAttribute('hidden');
    closeCart();
  });

  wireCheckoutForm();

  // Esc to close cart
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.body.classList.contains('cart-open')) {
      closeCart();
    }
  });
});
