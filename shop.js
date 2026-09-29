/* =========================================
   Sphere Football Academy — Shop
   Static-site cart, no backend.
   Cart persists in localStorage.
   Orders are sent via Google Apps Script.
   ========================================= */

// ---- Product catalog ----

const HAS_PRODUCT_CATALOG = Array.isArray(window.SPHERE_PRODUCTS);
const PRODUCTS = HAS_PRODUCT_CATALOG ? window.SPHERE_PRODUCTS : [];
const SHOP_CATEGORIES = ["Apparel", "Headwear", "Equipment"];
let activeCategory = "All";

const PRODUCT_INDEX = Object.fromEntries(PRODUCTS.map((p) => [p.id, p]));

const ORDER_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbxlCzPb4RmG5gtztQBbnixI80wvDpA2WBN-zELFApM4_l7tTp7e8cDNeSxF1lpBi9T6/exec";

const PUBLIC_SITE_ORIGIN = (() => {
  try {
    const canonical = document.querySelector('link[rel="canonical"]')?.href;
    return canonical ? new URL(canonical).origin : window.location.origin;
  } catch {
    return window.location.origin;
  }
})();

// ---- Cart state (persisted to localStorage) ----

const CART_KEY = "sphere_cart_v1";

function loadCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Drop any lines whose product no longer exists in the catalog
    // (otherwise the count badge counts ghosts that won't render).
    return parsed.filter(
      (line) => line && PRODUCT_INDEX[line.id] && line.qty > 0,
    );
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

function displayPrice(value) {
  return `$${formatMoney(value)} AUD`;
}

function createOrderId() {
  const now = new Date();
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
    String(now.getHours()).padStart(2, "0"),
    String(now.getMinutes()).padStart(2, "0"),
    String(now.getSeconds()).padStart(2, "0"),
  ].join("");
}

function publicAssetUrl(path) {
  return new URL(path.replace(/^\//, ""), `${PUBLIC_SITE_ORIGIN}/`).toString();
}

function orderLineImageUrl(product, color) {
  const image = cartLineImage(product, color);
  if (!image || image.startsWith("data:")) return "";
  return publicAssetUrl(image);
}

function cartLineKey(productId, size, color = "") {
  return `${productId}::${size}::${color}`;
}

function addToCart(productId, size, color = "", qty = 1) {
  const key = cartLineKey(productId, size, color);
  const existing = cart.find(
    (line) => cartLineKey(line.id, line.size, line.color || "") === key,
  );
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ id: productId, size, color, qty });
  }
  saveCart(cart);
  renderCart();
  flashCartButton();
}

function updateQty(productId, size, color, delta) {
  const key = cartLineKey(productId, size, color || "");
  const line = cart.find(
    (l) => cartLineKey(l.id, l.size, l.color || "") === key,
  );
  if (!line) return;
  line.qty += delta;
  if (line.qty <= 0) {
    cart = cart.filter(
      (l) => cartLineKey(l.id, l.size, l.color || "") !== key,
    );
  }
  saveCart(cart);
  renderCart();
}

function removeLine(productId, size, color) {
  const key = cartLineKey(productId, size, color || "");
  cart = cart.filter((l) => cartLineKey(l.id, l.size, l.color || "") !== key);
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
  const initials = product.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
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

function productImages(product) {
  if (Array.isArray(product.images) && product.images.length) {
    const images = product.images
      .filter((image) => image && image.src)
      .map((image, index) => ({
        src: image.src,
        alt: image.alt || `${product.name} view ${index + 1}`,
        label: image.label || `View ${index + 1}`,
      }));

    if (images.length) return images;
  }

  return [
    {
      src: productImage(product),
      alt: product.name,
      label: "Main",
    },
  ];
}

function productColorOptions(product) {
  const images = productImages(product);
  if (!Array.isArray(product.colors) || product.colors.length <= 1) return [];

  return product.colors
    .map((_, index) => {
      const image = images[index];
      if (!image) return null;
      return {
        name: image.label || `Colour ${index + 1}`,
        imageIndex: index,
      };
    })
    .filter(Boolean);
}

function productColorFieldHTML(product) {
  const colors = productColorOptions(product);
  if (!colors.length) return "";

  return `
    <div class="form-group">
      <label for="colour">Colour</label>
      <select id="colour" name="colour" required>
        ${colors.map((color) => `<option value="${escapeHtml(color.name)}" data-image-index="${color.imageIndex}">${escapeHtml(color.name)}</option>`).join("")}
      </select>
    </div>
  `;
}

function cartLineMeta(line) {
  return [line.size, line.color].filter(Boolean).join(" · ");
}

function cartLineOrderVariant(line) {
  return [line.size, line.color].filter(Boolean).join(" / ");
}

function cartLineImage(product, color) {
  if (!color) return productImage(product);

  const colorOption = productColorOptions(product).find(
    (option) => option.name === color,
  );
  const image = productImages(product)[colorOption?.imageIndex];
  return image?.src || productImage(product);
}

function productMainImageHTML(product) {
  const images = productImages(product);
  const primaryImage = images[0];
  const controls =
    images.length > 1
      ? `
    <button type="button" class="shop-detail-arrow shop-detail-arrow--prev" data-gallery-direction="-1" aria-label="Show previous product image">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>
    </button>
    <button type="button" class="shop-detail-arrow shop-detail-arrow--next" data-gallery-direction="1" aria-label="Show next product image">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>
    </button>
  `
      : "";

  return `
    <div class="shop-detail-main-image" data-gallery-index="0">
      <img id="shop-detail-image" ${imageSourceAttrs(primaryImage.src, DETAIL_IMAGE_SIZES)} alt="${escapeHtml(primaryImage.alt)}" width="${PRODUCT_IMAGE_BOX}" height="${PRODUCT_IMAGE_BOX}" decoding="async" fetchpriority="high">
      ${controls}
    </div>
  `;
}

function productThumbsHTML(product) {
  const images = productImages(product);
  if (images.length <= 1) return "";
  const primaryImage = images[0];
  const count = `<span class="shop-detail-image-count" aria-live="polite">${escapeHtml(primaryImage.label.toUpperCase())} VIEW · <span class="shop-detail-image-num">1 / ${images.length}</span></span>`;
  const thumbs = `<div class="shop-detail-thumbs" role="tablist" aria-label="Product images">
    ${images
      .map(
        (img, i) => `
      <button type="button" class="shop-detail-thumb${i === 0 ? " is-active" : ""}" data-gallery-thumb="${i}" role="tab" aria-selected="${i === 0 ? "true" : "false"}" aria-label="Show ${escapeHtml(img.label)} view">
        <img ${imageSourceAttrs(img.src, "72px")} alt="" width="72" height="72" loading="lazy" decoding="async">
      </button>`,
      )
      .join("")}
  </div>`;

  return `
    <div class="shop-detail-thumbs-wrap">
      ${count}
      ${thumbs}
    </div>
  `;
}

function productDetailMetaHTML(product) {
  const material = product.material;
  const fit = product.fit;
  if (!material && !fit) return "";

  const materialHTML = Array.isArray(material)
    ? `<ul class="shop-detail-feature-list">${material.map((m) => `<li>${escapeHtml(m)}</li>`).join("")}</ul>`
    : material
      ? `<p>${escapeHtml(material)}</p>`
      : "";

  const fitHTML = Array.isArray(fit)
    ? `<ul class="shop-detail-feature-list">${fit.map((f) => `<li>${escapeHtml(f)}</li>`).join("")}${product.fitNote ? `<li class="shop-detail-fit-note">${escapeHtml(product.fitNote)}</li>` : ""}</ul>`
    : fit
      ? `<p>${escapeHtml(fit)}</p>${product.fitNote ? `<p class="shop-detail-fit-note">${escapeHtml(product.fitNote)}</p>` : ""}`
      : "";

  return `
    <div class="shop-detail-meta">
      ${materialHTML ? `<div><h4>Material</h4>${materialHTML}</div>` : ""}
      ${fitHTML ? `<div><h4>Fit</h4>${fitHTML}</div>` : ""}
    </div>
  `;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// WebP variant widths generated at build time (see scripts/build-site.py).
const SHOP_IMAGE_WIDTHS = [150, 600, 1200];

// Product imagery renders inside a CSS-enforced square box (aspect-ratio: 1/1,
// object-fit: contain). Equal width/height attributes lock that 1:1 box so the
// layout doesn't shift before the stylesheet or image lands.
const PRODUCT_IMAGE_BOX = 600;

// `sizes` hints matched to the rendered display widths in style.css.
const CARD_IMAGE_SIZES = "(max-width: 980px) 45vw, 30vw";
const DETAIL_IMAGE_SIZES = "(max-width: 900px) 90vw, 560px";

function webpSrcset(src) {
  // Only raster shop images get generated variants; skip data URIs and SVGs.
  if (!src || src.startsWith("data:")) return "";
  const m = src.match(/^(.*)\.(?:png|jpe?g)$/i);
  if (!m) return "";
  return SHOP_IMAGE_WIDTHS.map((w) => `${m[1]}-${w}.webp ${w}w`).join(", ");
}

function imageSourceAttrs(src, sizes) {
  const srcset = webpSrcset(src);
  let attrs = `src="${escapeHtml(src)}"`;
  if (srcset) {
    attrs += ` srcset="${escapeHtml(srcset)}"`;
    if (sizes) attrs += ` sizes="${escapeHtml(sizes)}"`;
  }
  return attrs;
}

function setImageSource(imgEl, src, sizes) {
  imgEl.src = src;
  const srcset = webpSrcset(src);
  if (srcset) {
    imgEl.srcset = srcset;
    if (sizes) imgEl.sizes = sizes;
  } else {
    imgEl.removeAttribute("srcset");
    imgEl.removeAttribute("sizes");
  }
}

function colorSwatchesHTML(p) {
  if (!p.colors || !p.colors.length || !p.images) return "";
  const images = productImages(p);
  const dots = p.colors
    .map((c, i) => {
      const label = (images[i] && images[i].label) || `Colour ${i + 1}`;
      const isActive = i === 0;
      return `<button type="button" class="shop-swatch${isActive ? " is-active" : ""}" data-idx="${i}" style="background:${c}" aria-label="Show ${escapeHtml(p.name)} in ${escapeHtml(label)}"${isActive ? ' aria-pressed="true"' : ' aria-pressed="false"'}></button>`;
    })
    .join("");
  return `<div class="shop-swatches">${dots}</div>`;
}

function cardImageControlsHTML(product) {
  const images = productImages(product);
  if (images.length <= 1) return "";

  return `
    <div class="shop-card-image-controls" role="group" aria-label="Choose ${escapeHtml(product.name)} image">
      <button type="button" class="shop-card-image-control shop-card-image-control--prev" data-card-image-direction="-1" aria-label="Show previous ${escapeHtml(product.name)} image">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <button type="button" class="shop-card-image-control shop-card-image-control--next" data-card-image-direction="1" aria-label="Show next ${escapeHtml(product.name)} image">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>
      </button>
    </div>
  `;
}

function productNoteHTML(product, className) {
  if (!product.note) return "";
  return `<p class="${className}"><span>Note</span>${escapeHtml(product.note)}</p>`;
}

function shopCardHTML(p) {
  const detailsHref = `#product=${encodeURIComponent(p.id)}`;
  const unavailableRibbon =
    p.available === false
      ? '<div class="shop-ribbon-unavailable"><span>COMING SOON</span></div>'
      : "";
  return `
    <article class="shop-card" data-product-id="${escapeHtml(p.id)}" data-card-image-index="0">
      <div class="shop-card-media" aria-live="polite">
        <a href="${detailsHref}" class="shop-card-media-link" aria-label="View ${escapeHtml(p.name)} details">
          <img ${imageSourceAttrs(productImage(p), CARD_IMAGE_SIZES)} alt="${escapeHtml(p.name)}" width="${PRODUCT_IMAGE_BOX}" height="${PRODUCT_IMAGE_BOX}" loading="lazy" decoding="async">
        </a>
        ${cardImageControlsHTML(p)}
        ${colorSwatchesHTML(p)}
        ${unavailableRibbon}
      </div>
      <a href="${detailsHref}" class="shop-card-body">
        <div class="shop-card-info">
          <h3 class="shop-card-title">${escapeHtml(p.name)}</h3>
          <span class="shop-card-price">${displayPrice(p.price)}</span>
        </div>
        <span class="shop-card-link">Buy Now <span aria-hidden="true">→</span></span>
      </a>
    </article>
  `;
}

function renderGrid() {
  const grid = document.getElementById("shop-grid");
  if (!grid) return;

  if (!HAS_PRODUCT_CATALOG) {
    grid.innerHTML =
      '<p class="shop-detail-missing">Shop catalog unavailable. Please refresh the page or contact Sphere Football Academy.</p>';
    return;
  }

  const products =
    activeCategory === "All"
      ? PRODUCTS
      : PRODUCTS.filter((product) => product.category === activeCategory);

  grid.innerHTML = products.map(shopCardHTML).join("");
}

function renderCategoryTabs() {
  const tabs = document.getElementById("shop-category-tabs");
  if (!tabs || !HAS_PRODUCT_CATALOG) return;

  const categories = ["All", ...SHOP_CATEGORIES];
  tabs.innerHTML = categories
    .map((category) => {
      const isActive = category === activeCategory;
      return `<button type="button" class="shop-category-tab${isActive ? " is-active" : ""}" data-category="${escapeHtml(category)}" role="tab" aria-selected="${isActive}">${escapeHtml(category)}</button>`;
    })
    .join("");
}

function updateCardImage(card, product, index) {
  const images = productImages(product);
  if (!images.length) return;

  const nextIndex = (index + images.length) % images.length;
  const nextImage = images[nextIndex];
  const img = card.querySelector(".shop-card-media img");
  if (!img) return;

  card.dataset.cardImageIndex = String(nextIndex);
  setImageSource(img, nextImage.src, CARD_IMAGE_SIZES);
  img.alt = nextImage.alt;

  const swatches = card.querySelectorAll(".shop-swatch");
  swatches.forEach((swatch, swatchIndex) => {
    const isActive = swatchIndex === nextIndex;
    swatch.classList.toggle("is-active", isActive);
    swatch.setAttribute("aria-pressed", isActive ? "true" : "false");
  });
}

function updateDetailGallery(detail, galleryImages, index) {
  const frame = detail.querySelector(".shop-detail-main-image");
  const image = detail.querySelector("#shop-detail-image");
  const count = detail.querySelector(".shop-detail-image-count");
  const colourSelect = detail.querySelector("#colour");
  if (!frame || !image || !galleryImages.length) return;

  const nextIndex = (index + galleryImages.length) % galleryImages.length;
  const nextImage = galleryImages[nextIndex];

  frame.dataset.galleryIndex = String(nextIndex);
  setImageSource(image, nextImage.src, DETAIL_IMAGE_SIZES);
  image.alt = nextImage.alt;
  if (count)
    count.innerHTML = `${escapeHtml(nextImage.label.toUpperCase())} VIEW &middot; <span class="shop-detail-image-num">${nextIndex + 1} / ${galleryImages.length}</span>`;
  detail.querySelectorAll(".shop-detail-thumb").forEach((thumb, idx) => {
    const active = idx === nextIndex;
    thumb.classList.toggle("is-active", active);
    thumb.setAttribute("aria-selected", active ? "true" : "false");
  });
  if (colourSelect) {
    const option = colourSelect.querySelector(
      `option[data-image-index="${nextIndex}"]`,
    );
    if (option) colourSelect.value = option.value;
  }
}

function renderDetail(productId) {
  const detail = document.getElementById("shop-detail");
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
        ${productMainImageHTML(p)}
        <div class="shop-detail-info">
          <h1 class="shop-detail-title">${escapeHtml(p.name)}</h1>
          <div class="shop-detail-price">${displayPrice(p.price)}</div>
          <p class="shop-detail-short">${escapeHtml(p.short)}</p>
          ${productNoteHTML(p, "shop-detail-note")}

          <form class="shop-detail-form" id="add-form" data-product-id="${escapeHtml(p.id)}">
            <div class="form-group">
              <label for="size">Size</label>
              <select id="size" name="size" required>
                ${p.sizes.map((s) => `<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`).join("")}
              </select>
            </div>
            ${productColorFieldHTML(p)}
            <div class="form-group shop-qty-group">
              <label>Quantity</label>
              <div class="shop-qty">
                <button type="button" class="shop-qty-btn" data-delta="-1" aria-label="Decrease">−</button>
                <input type="number" id="qty" value="1" min="1" max="20" inputmode="numeric">
                <button type="button" class="shop-qty-btn" data-delta="1" aria-label="Increase">+</button>
              </div>
            </div>
            <button type="submit" class="btn btn-primary btn-full"${p.available === false ? " disabled" : ""}>
              ${p.available === false ? "Coming Soon" : "Add to Cart"}
            </button>
          </form>

          ${productDetailMetaHTML(p)}
        </div>
        ${productThumbsHTML(p)}
      </div>
    </div>
  `;

  const galleryImages = productImages(p);
  detail.querySelectorAll(".shop-detail-arrow").forEach((btn) => {
    btn.addEventListener("click", () => {
      const frame = detail.querySelector(".shop-detail-main-image");
      if (!frame) return;

      const direction = parseInt(btn.dataset.galleryDirection, 10);
      const currentIndex = parseInt(frame.dataset.galleryIndex, 10) || 0;
      updateDetailGallery(detail, galleryImages, currentIndex + direction);
    });
  });
  detail.querySelectorAll(".shop-detail-thumb").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.dataset.galleryThumb, 10);
      if (Number.isNaN(idx)) return;
      updateDetailGallery(detail, galleryImages, idx);
    });
  });

  const form = document.getElementById("add-form");
  const qtyInput = form.querySelector("#qty");
  const colourSelect = form.querySelector("#colour");
  colourSelect?.addEventListener("change", () => {
    const selectedOption = colourSelect.selectedOptions[0];
    const imageIndex = parseInt(selectedOption?.dataset.imageIndex, 10);
    if (!Number.isNaN(imageIndex)) updateDetailGallery(detail, galleryImages, imageIndex);
  });
  form.querySelectorAll(".shop-qty-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const delta = parseInt(btn.dataset.delta, 10);
      const current = parseInt(qtyInput.value, 10) || 1;
      const next = Math.max(1, Math.min(20, current + delta));
      qtyInput.value = next;
    });
  });
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const size = form.querySelector("#size").value;
    const color = colourSelect?.value || "";
    const qty = Math.max(1, Math.min(20, parseInt(qtyInput.value, 10) || 1));
    addToCart(p.id, size, color, qty);
    openCart();
  });
}

function renderCart() {
  const list = document.getElementById("cart-list");
  const subtotalEl = document.getElementById("cart-subtotal");
  const countEls = document.querySelectorAll(".cart-count");
  const cartEmpty = document.getElementById("cart-empty");
  const cartFoot = document.getElementById("cart-foot");

  if (!list) return;

  if (cart.length === 0) {
    list.innerHTML = "";
    if (cartEmpty) cartEmpty.hidden = false;
    if (cartFoot) cartFoot.hidden = true;
  } else {
    if (cartEmpty) cartEmpty.hidden = true;
    if (cartFoot) cartFoot.hidden = false;
    list.innerHTML = cart
      .map((line) => {
        const p = PRODUCT_INDEX[line.id];
        if (!p) return "";
        return `
        <li class="cart-line" data-product-id="${escapeHtml(p.id)}" data-size="${escapeHtml(line.size)}" data-colour="${escapeHtml(line.color || "")}">
          <img class="cart-line-img" ${imageSourceAttrs(cartLineImage(p, line.color), "64px")} alt="${escapeHtml(p.name)}" width="64" height="64" loading="lazy" decoding="async">
          <div class="cart-line-body">
            <h4 class="cart-line-title">${escapeHtml(p.name)}</h4>
            <p class="cart-line-meta">${escapeHtml(cartLineMeta(line))}</p>
            <div class="cart-line-controls">
              <button class="cart-qty-btn" data-action="dec" aria-label="Decrease">−</button>
              <span class="cart-qty-val">${line.qty}</span>
              <button class="cart-qty-btn" data-action="inc" aria-label="Increase">+</button>
              <button class="cart-line-remove" data-action="remove" aria-label="Remove">Remove</button>
            </div>
          </div>
          <div class="cart-line-price">${displayPrice(p.price * line.qty)}</div>
        </li>
      `;
      })
      .join("");
  }

  if (subtotalEl) subtotalEl.textContent = displayPrice(cartSubtotal());

  const count = cartCount();
  countEls.forEach((el) => {
    el.textContent = count;
    el.hidden = count === 0;
  });
}

// ---- Cart drawer open/close ----

let cartReturnFocus = null;

function openCart() {
  const drawer = document.getElementById("cart-drawer");
  cartReturnFocus =
    document.activeElement instanceof HTMLElement ? document.activeElement : null;
  document.body.classList.add("cart-open");
  if (drawer) {
    drawer.removeAttribute("inert");
    drawer.setAttribute("aria-hidden", "false");
    document.getElementById("cart-close")?.focus();
  }
}
function closeCart() {
  const drawer = document.getElementById("cart-drawer");
  document.body.classList.remove("cart-open");
  if (drawer) {
    // Move focus out before making the subtree inert, or focus would be lost.
    if (drawer.contains(document.activeElement)) {
      cartReturnFocus?.focus();
    }
    drawer.setAttribute("aria-hidden", "true");
    drawer.setAttribute("inert", "");
  }
  cartReturnFocus = null;
  document.getElementById("checkout-view")?.setAttribute("hidden", "");
  document.getElementById("thanks-view")?.setAttribute("hidden", "");
  document.getElementById("cart-view")?.removeAttribute("hidden");
}
function flashCartButton() {
  document.querySelectorAll(".cart-toggle").forEach((btn) => {
    btn.classList.remove("flash");
    void btn.offsetWidth;
    btn.classList.add("flash");
  });
}

// ---- Hash routing ----

let gridScrollY = 0;
let onDetailRoute = false;
const SHOP_TITLE = document.title;

function applyRoute() {
  const hash = window.location.hash;
  const grid = document.getElementById("shop-grid-section");
  const detail = document.getElementById("shop-detail-section");
  const hero = document.querySelector(".shop-hero");

  const m = hash.match(/^#product=(.+)$/);
  if (m) {
    // Remember where the shopper was in the grid before opening a product.
    if (!onDetailRoute) gridScrollY = window.scrollY;
    onDetailRoute = true;
    if (grid) grid.hidden = true;
    if (hero) hero.hidden = true;
    if (detail) {
      detail.hidden = false;
      const productId = decodeURIComponent(m[1]);
      renderDetail(productId);
      const product = PRODUCT_INDEX[productId];
      document.title = product
        ? `${product.name} | Sphere Football Academy`
        : SHOP_TITLE;
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  } else {
    if (detail) detail.hidden = true;
    if (grid) grid.hidden = false;
    if (hero) hero.hidden = false;
    document.title = SHOP_TITLE;
    // Restore the grid position when coming back from a product detail.
    if (onDetailRoute) {
      window.scrollTo({ top: gridScrollY, behavior: "instant" });
    }
    onDetailRoute = false;
  }
}

// ---- Checkout ----

function renderCheckoutSummary() {
  const summaryEl = document.getElementById("checkout-summary");
  if (!summaryEl) return;

  const rows = cart
    .map((line) => {
      const p = PRODUCT_INDEX[line.id];
      if (!p) return "";
      const meta = cartLineMeta(line);
      return `
        <li class="checkout-summary-line">
          <span class="checkout-summary-name">
            ${line.qty} × ${escapeHtml(p.name)}${meta ? `<span class="checkout-summary-meta">${escapeHtml(meta)}</span>` : ""}
          </span>
          <span class="checkout-summary-price">${displayPrice(p.price * line.qty)}</span>
        </li>
      `;
    })
    .join("");

  summaryEl.innerHTML = `
    <h3 class="checkout-summary-title">Order Summary</h3>
    <ul class="checkout-summary-list">${rows}</ul>
    <div class="checkout-summary-total">
      <span>Total</span>
      <span>${displayPrice(cartSubtotal())}</span>
    </div>
  `;
}

function showCheckout() {
  renderCheckoutSummary();
  document.getElementById("cart-view")?.setAttribute("hidden", "");
  document.getElementById("checkout-view")?.removeAttribute("hidden");
}
function showCart() {
  document.getElementById("checkout-view")?.setAttribute("hidden", "");
  document.getElementById("cart-view")?.removeAttribute("hidden");
}

function buildOrderSummary() {
  const orders = cart
    .map((line) => {
      const p = PRODUCT_INDEX[line.id];
      if (!p) return null;

      return {
        name: p.name,
        size: cartLineOrderVariant(line),
        units: String(line.qty),
        price: formatMoney(p.price),
        line_total: formatMoney(p.price * line.qty),
        image_url: orderLineImageUrl(p, line.color),
      };
    })
    .filter(Boolean);

  const subtotal = formatMoney(cartSubtotal());

  return {
    orderId: createOrderId(),
    orders,
    cost: {
      subtotal,
      shipping: "0.00",
      tax: "0.00",
      total: subtotal,
    },
    pickupLabel: "Pickup from Sphere HQ (1/3 Wood St, Tempe)",
    pickupNote:
      "Pickup is free. We will email you to lock in a pickup time once payment is confirmed.",
  };
}

function wireCheckoutForm() {
  const form = document.getElementById("checkout-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const honey = form.querySelector("#co-website");
    if (honey && honey.value) {
      form.reset();
      return;
    }

    if (cart.length === 0) return;

    const btn = form.querySelector('button[type="submit"]');
    const original = btn.textContent;

    btn.disabled = true;
    btn.textContent = "Sending...";

    const summary = buildOrderSummary();

    const payload = {
      type: "order",
      name: form.name.value,
      email: form.email.value,
      phone: form.phone.value,
      notes: form.notes.value,
      order_id: summary.orderId,
      orders: summary.orders,
      cost: summary.cost,
      delivery_method: summary.pickupLabel,
      delivery_note: summary.pickupNote,
    };

    try {
      const res = await fetch(ORDER_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (result.status !== "ok")
        throw new Error(result.message || "Order failed");

      btn.disabled = false;
      btn.textContent = original;
      // Clear cart, show success view
      clearCart();
      form.reset();
      document.getElementById("checkout-view").setAttribute("hidden", "");
      document.getElementById("thanks-view").removeAttribute("hidden");
    } catch (error) {
      console.error("Order error:", error);
      btn.textContent = "Error - Try Again";
      btn.disabled = false;
      setTimeout(() => {
        btn.textContent = original;
      }, 3000);
    }
  });
}

// ---- Wire up everything once DOM is ready ----

document.addEventListener("DOMContentLoaded", () => {
  renderCategoryTabs();
  renderGrid();
  renderCart();
  applyRoute();

  window.addEventListener("hashchange", applyRoute);

  document.getElementById("shop-category-tabs")?.addEventListener("click", (e) => {
    const tab = e.target.closest(".shop-category-tab");
    if (!tab) return;

    activeCategory = tab.dataset.category || "All";
    renderCategoryTabs();
    renderGrid();
  });

  // Product card image controls: swap image without opening the product.
  document.getElementById("shop-grid")?.addEventListener("click", (e) => {
    const imageControl = e.target.closest(".shop-card-image-control");
    if (imageControl) {
      e.preventDefault();
      e.stopPropagation();

      const card = imageControl.closest(".shop-card");
      if (!card) return;
      const product = PRODUCT_INDEX[card.dataset.productId];
      if (!product) return;

      const direction = parseInt(imageControl.dataset.cardImageDirection, 10);
      const currentIndex = parseInt(card.dataset.cardImageIndex, 10) || 0;
      updateCardImage(card, product, currentIndex + direction);
      return;
    }

    const swatch = e.target.closest(".shop-swatch");
    if (!swatch) return;
    e.preventDefault();
    e.stopPropagation();

    const card = swatch.closest(".shop-card");
    if (!card) return;
    const p = PRODUCT_INDEX[card.dataset.productId];
    if (!p) return;

    const idx = parseInt(swatch.dataset.idx, 10);
    updateCardImage(card, p, idx);
  });

  // Cart toggle
  document.querySelectorAll(".cart-toggle").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      openCart();
    });
  });

  document.getElementById("cart-close")?.addEventListener("click", closeCart);
  document
    .getElementById("cart-backdrop")
    ?.addEventListener("click", closeCart);
  document
    .getElementById("cart-keep-shopping")
    ?.addEventListener("click", (e) => {
      e.preventDefault();
      closeCart();
    });
  document
    .getElementById("checkout-close")
    ?.addEventListener("click", closeCart);

  // Cart line interactions (event delegation)
  document.getElementById("cart-list")?.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;
    const line = btn.closest(".cart-line");
    if (!line) return;
    const id = line.dataset.productId;
    const size = line.dataset.size;
    const color = line.dataset.colour || "";
    const action = btn.dataset.action;
    if (action === "inc") updateQty(id, size, color, 1);
    else if (action === "dec") updateQty(id, size, color, -1);
    else if (action === "remove") removeLine(id, size, color);
  });

  // Cart → checkout
  document
    .getElementById("cart-checkout-btn")
    ?.addEventListener("click", showCheckout);
  document.getElementById("checkout-back")?.addEventListener("click", showCart);
  document.getElementById("thanks-close")?.addEventListener("click", () => {
    document.getElementById("thanks-view").setAttribute("hidden", "");
    document.getElementById("cart-view").removeAttribute("hidden");
    closeCart();
  });

  wireCheckoutForm();

  // Esc to close cart
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && document.body.classList.contains("cart-open")) {
      closeCart();
    }
  });
});
