// ══ CART PAGE ════════════════════════════════════════════
import { cartItems, savedAddress, addressModalSource,
         editingCartIndex, setAddressModalSource, setEditingCartIndex,
         loggedInUser } from '../state.js';
import { toast, getColorName, updateCartBadge } from '../ui.js';
import { colorSwatches, sizes } from '../state.js';

export function renderCart() {
  const wrap = document.getElementById('cart-wrap');
  if (!cartItems.length) {
    wrap.innerHTML = `
      <div class="cart-empty">
        <div class="big-ic">🛒</div>
        <h3>Your cart is empty</h3>
        <p>Browse our feed and add shoes you love.</p>
      </div>`;
    return;
  }
  let html = '';
  cartItems.forEach((item, idx) => {
    html += `
      <div class="cart-item">
        <img class="cart-item-img" src="${item.img}" alt="${item.name}"
          onerror="this.src='https://placehold.co/72x72?text=?'">
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-meta-row">
            <div class="cart-item-store">${item.storeName}</div>
            <button class="mini-edit-btn" onclick="window._openCartEdit(${idx})">Edit</button>
          </div>
          <div class="cart-item-meta-row">
            <span class="cart-color-chip">
              <span class="cart-color-dot" style="background:${item.color}"></span>
              ${getColorName(item.color)}
            </span>
            <span class="cart-color-chip">Size ${item.size}</span>
          </div>
          <div class="cart-item-price">${item.price * item.qty} TND</div>
          <div class="cart-qty">
            <button class="qty-btn" onclick="window._changeQty(${idx},-1)">−</button>
            <span class="qty-val">${item.qty}</span>
            <button class="qty-btn" onclick="window._changeQty(${idx},1)">+</button>
          </div>
        </div>
        <button class="cart-del" onclick="window._removeCartItem(${idx})">🗑️</button>
      </div>`;
  });
  const subtotal = cartItems.reduce((s, i) => s + i.price * i.qty, 0);
  const deliveryStores = new Set(cartItems.map(i => i.storeId || i.storeName));
  const delivery = deliveryStores.size * 7;
  html += `
    <div class="cart-footer">
      <div class="cart-row"><span>Subtotal</span><span>${subtotal} TND</span></div>
      <div class="cart-row"><span>Delivery</span><span>${delivery} TND</span></div>
      <div class="delivery-note">7 TND delivery per store in your cart.</div>
      <div class="cart-row total"><span>Total</span><span>${subtotal + delivery} TND</span></div>
      <button class="checkout-btn" onclick="window._checkout()">Checkout →</button>
      <button class="secondary-btn" onclick="window._openAddressModal('cart')">📍 Address</button>
      <div class="address-note">
        ${savedAddress ? `Deliver to: ${savedAddress}` : 'No delivery address saved yet.'}
      </div>
    </div>`;
  wrap.innerHTML = html;
}

export function changeQty(idx, delta) {
  const item = cartItems[idx];
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    if (loggedInUser && item.dbId) window._db?.deleteCartItem(item.dbId).catch(() => {});
    cartItems.splice(idx, 1);
  } else if (loggedInUser && item.productId) {
    window._db?.upsertCartItem(loggedInUser.id, item.productId, item.size, item.color, item.qty).catch(() => {});
  }
  updateCartBadge(cartItems);
  renderCart();
}

export function removeCartItem(idx) {
  const item = cartItems[idx];
  if (!item) return;
  if (loggedInUser && item.dbId) window._db?.deleteCartItem(item.dbId).catch(() => {});
  cartItems.splice(idx, 1);
  updateCartBadge(cartItems);
  renderCart();
}

export async function checkout() {
  if (!savedAddress) {
    // Allow checkout but warn
  }

  // Create order rows in DB for each cart item (so store owners see them)
  if (cartItems.length > 0) {
    const orderRows = cartItems.map(item => ({
      store_id:      item.storeId,
      product_id:    item.productId || item.id,
      product_name:  item.name,
      size:          item.size,
      color:         item.color,
      qty:           item.qty,
      price:         item.price * item.qty,
      status:        'pending',
      buyer_id:      loggedInUser?.id || null,
      buyer_name:    loggedInUser?.name || 'Guest',
      buyer_phone:   '',
      buyer_address: savedAddress || '',
    }));

    try {
      await window._db?.insertOrders(orderRows);
    } catch (e) {
      // Non-fatal — order creation failed but we still clear cart
      console.error('Order creation failed:', e);
    }
  }

  // Clear cart from DB
  if (loggedInUser) {
    window._db?.clearCart(loggedInUser.id).catch(() => {});
  }

  toast(savedAddress
    ? 'Order placed! 🎉 Delivery in 2-3 days'
    : 'Order placed! 🎉 Add an address next time for delivery tracking.');
  cartItems.length = 0;
  updateCartBadge(cartItems);
  renderCart();
}

export function addToCartFromPanel(id, name, price, img, storeName, storeId) {
  const sel   = document.querySelector('.size-btn.selected');
  if (!sel) { toast('Please select a size first'); return; }
  const colEl = document.querySelector('.color-swatch.selected');
  const color = colEl ? colEl.getAttribute('title') || colEl.style.background : '#1a1a1a';
  const size  = sel.textContent;
  const existing = cartItems.find(i =>
    i.id === id && i.size === size && i.color === color && String(i.storeId) === String(storeId));
  if (existing) {
    existing.qty++;
    if (loggedInUser && existing.productId) {
      window._db?.upsertCartItem(loggedInUser.id, existing.productId, size, color, existing.qty).catch(() => {});
    }
  } else {
    const item = { id, name, price, img, storeName, storeId, size, color, qty: 1, productId: id };
    cartItems.push(item);
    if (loggedInUser) {
      window._db?.upsertCartItem(loggedInUser.id, id, size, color, 1).catch(() => {});
    }
  }
  updateCartBadge(cartItems);
  toast('Added to cart 🛒');
  document.getElementById('prod-panel').classList.remove('open');
}

export function openCartEdit(idx) {
  const item = cartItems[idx];
  if (!item) return;
  setEditingCartIndex(idx);
  document.getElementById('cart-edit-content').innerHTML = `
    <div class="option-modal-title">Edit ${item.name}</div>
    <div class="option-modal-sub">Change size or color directly from your cart.</div>
    <div class="pd-option-group">
      <div class="pd-colors-label">Color</div>
      <div class="pd-colors">
        ${colorSwatches.map(c => `
          <div class="color-swatch ${c === item.color ? 'selected' : ''}"
            style="background:${c};${c === '#ffffff' ? 'border:1.5px solid #ddd;' : ''}"
            onclick="window._selectCartEditColor(this,'${c}')" title="${c}"></div>`).join('')}
      </div>
    </div>
    <div class="pd-option-group" style="margin-top:14px;">
      <div class="pd-sizes-label">Size (EU)</div>
      <div class="pd-sizes">
        ${sizes.map(s => `
          <button class="size-btn ${String(s) === String(item.size) ? 'selected' : ''}"
            onclick="window._selectCartEditSize(this)">${s}</button>`).join('')}
      </div>
    </div>
    <button class="option-save-btn" onclick="window._saveCartEdit()">Save Changes</button>`;
  document.getElementById('cart-edit-modal').classList.add('open');
}

export function selectCartEditColor(el) {
  document.querySelectorAll('#cart-edit-content .color-swatch').forEach(s => s.classList.remove('selected'));
  el.classList.add('selected');
}

export function selectCartEditSize(btn) {
  document.querySelectorAll('#cart-edit-content .size-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
}

export function saveCartEdit() {
  const { editingCartIndex: idx } = window._cartState();
  if (idx === null) return;
  const item     = cartItems[idx];
  const size     = document.querySelector('#cart-edit-content .size-btn.selected')?.textContent;
  const color    = document.querySelector('#cart-edit-content .color-swatch.selected')?.getAttribute('title') || item.color;
  const nextSize  = size  || item.size;
  const nextColor = color || item.color;
  const dupIdx = cartItems.findIndex((it, i) =>
    i !== idx && it.id === item.id &&
    String(it.storeId) === String(item.storeId) &&
    String(it.size)    === String(nextSize) &&
    String(it.color)   === String(nextColor));
  if (dupIdx > -1) {
    cartItems[dupIdx].qty += item.qty;
    if (loggedInUser && item.dbId) window._db?.deleteCartItem(item.dbId).catch(() => {});
    cartItems.splice(idx, 1);
  } else {
    item.size  = nextSize;
    item.color = nextColor;
    if (loggedInUser && item.productId) {
      window._db?.upsertCartItem(loggedInUser.id, item.productId, nextSize, nextColor, item.qty).catch(() => {});
    }
  }
  document.getElementById('cart-edit-modal').classList.remove('open');
  setEditingCartIndex(null);
  renderCart();
  updateCartBadge(cartItems);
  toast('Cart item updated ✓');
}

export function closeCartEdit(e) {
  if (e.target === document.getElementById('cart-edit-modal'))
    document.getElementById('cart-edit-modal').classList.remove('open');
}
