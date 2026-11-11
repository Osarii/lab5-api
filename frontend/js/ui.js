window.VapeKing = window.VapeKing || {};
const money = (value) => `₡${value.toLocaleString('es-CR')}`;
const stars = (rating) => '★'.repeat(rating) + '☆'.repeat(5 - rating);

VapeKing.productCard = (product) => `<article class="product-card" data-product-id="${product.id}">
  <div class="product-image">
    <img src="${product.image}" alt="${product.name}" loading="lazy">
    <span class="product-badge ${product.badge ? '' : 'is-empty'}">${product.badge || '•'}</span>
    <button class="favorite-button ${VapeKing.isFavorite(product.id) ? 'is-favorite' : ''}" data-favorite="${product.id}" aria-label="${VapeKing.isFavorite(product.id) ? 'Quitar de favoritos' : 'Agregar a favoritos'}">♡</button>
  </div>
  <div class="product-info">
    <span class="product-brand">${product.brand}</span>
    <h3>${product.name}</h3>
    <div class="product-rating"><span>${stars(product.rating)}</span><small>(${product.rating}.0)</small></div>
    <div class="product-price"><strong>${money(product.price)}</strong>${product.oldPrice ? `<del>${money(product.oldPrice)}</del>` : ''}</div>
    <div class="product-actions-row">
      <button class="add-button" data-add-cart="${product.id}">Agregar al carrito <span>+</span></button>
      <button class="ai-summary-btn" data-ai-summary="${product.id}" title="Ficha Técnica IA (DeepSeek)" aria-label="Ficha Técnica IA">✨</button>
    </div>
  </div>
</article>`;

VapeKing.bindProductActions = (container) => {
  container.querySelectorAll('[data-add-cart]').forEach((button) => {
    button.addEventListener('click', () => VapeKing.addToCart(Number(button.dataset.addCart)));
  });
  container.querySelectorAll('[data-favorite]').forEach((button) => {
    button.addEventListener('click', () => VapeKing.toggleFavorite(Number(button.dataset.favorite)));
  });
  container.querySelectorAll('[data-ai-summary]').forEach((button) => {
    button.addEventListener('click', () => VapeKing.showAiSummary(Number(button.dataset.aiSummary)));
  });
};

VapeKing.renderProducts = () => {
  const grid = document.getElementById('products-grid');
  const results = VapeKing.filteredProducts();
  grid.innerHTML = results.map(VapeKing.productCard).join('');
  document.getElementById('no-results').hidden = results.length > 0;
  VapeKing.bindProductActions(grid);
};

VapeKing.renderNewProducts = () => {
  const container = document.getElementById('new-products');
  if (!container) return;
  container.innerHTML = VapeKing.products.filter((product) => product.isNew).map(VapeKing.productCard).join('');
  VapeKing.bindProductActions(container);
};

VapeKing.renderWaxProducts = () => {
  const container = document.getElementById('wax-products');
  if (!container) return;
  container.innerHTML = VapeKing.products.filter((product) => product.category === 'wax').map(VapeKing.productCard).join('');
  VapeKing.bindProductActions(container);
};

VapeKing.renderBotanicalProducts = () => {
  const container = document.getElementById('botanical-products');
  if (!container) return;
  container.innerHTML = VapeKing.products.filter((product) => product.category === 'cannabis').map(VapeKing.productCard).join('');
  VapeKing.bindProductActions(container);
};

VapeKing.renderBrands = () => {
  document.getElementById('brands-grid').innerHTML = VapeKing.brands.map((brand) => `<button class="brand-chip" data-brand="${brand}">${brand}</button>`).join('');
  document.querySelectorAll('[data-brand]').forEach((button) => button.addEventListener('click', () => {
    VapeKing.state.brand = VapeKing.state.brand === button.dataset.brand ? '' : button.dataset.brand;
    document.querySelectorAll('[data-brand]').forEach((item) => item.classList.toggle('is-active', item === button));
    VapeKing.renderProducts();
    document.getElementById('tienda').scrollIntoView({ behavior: 'smooth' });
  }));
};

VapeKing.renderCart = () => {
  const items = document.getElementById('cart-items');
  const total = VapeKing.cartTotal();
  document.getElementById('cart-count').textContent = VapeKing.cartCount();
  document.getElementById('cart-title-count').textContent = `(${VapeKing.cartCount()})`;
  document.getElementById('favorites-count').textContent = VapeKing.favorites.length;
  document.getElementById('cart-subtotal').textContent = money(total);
  document.getElementById('shipping-message').textContent = total > 0 && total < 10000 ? `Te faltan ${money(10000 - total)} para envío gratis` : 'Envío gratis en compras mayores a ₡10.000';
  if (!VapeKing.cart.length) {
    items.innerHTML = '<div class="cart-empty"><span>🛒</span><strong>Tu carrito está vacío</strong><p>Agregá productos para comenzar.</p><a href="#tienda" data-close-cart>Ir a la tienda →</a></div>';
    return;
  }
  items.innerHTML = VapeKing.cart.map((item) => {
    const product = VapeKing.getProduct(item.id);
    return `<div class="cart-item"><img src="${product.image}" alt=""><div><strong>${product.name}</strong><small>${money(product.price)}</small><div class="quantity"><button data-quantity="${product.id}" data-delta="-1" aria-label="Reducir cantidad">−</button><span>${item.quantity}</span><button data-quantity="${product.id}" data-delta="1" aria-label="Aumentar cantidad">+</button></div></div><button class="cart-remove" data-remove="${product.id}" aria-label="Eliminar producto">×</button></div>`;
  }).join('');
  document.querySelectorAll('[data-quantity]').forEach((button) => button.addEventListener('click', () => VapeKing.updateQuantity(Number(button.dataset.quantity), Number(button.dataset.delta))));
  document.querySelectorAll('[data-remove]').forEach((button) => button.addEventListener('click', () => VapeKing.removeFromCart(Number(button.dataset.remove))));
};

VapeKing.updateHeaderCounters = () => {
  document.getElementById('cart-count').textContent = VapeKing.cartCount();
  document.getElementById('favorites-count').textContent = VapeKing.favorites.length;
};

VapeKing.showToast = (message) => {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('is-visible');
  setTimeout(() => toast.classList.remove('is-visible'), 2400);
};

/* Modal Resumen Técnico IA con DeepSeek */
VapeKing.showAiSummary = async (productId) => {
  const product = VapeKing.getProduct(productId);
  if (!product) return;

  const modal = document.getElementById('resumen-modal');
  const title = document.getElementById('resumen-title');
  const subtitle = document.getElementById('resumen-subtitle');
  const content = document.getElementById('resumen-content');
  const addBtn = document.getElementById('resumen-add-cart');

  title.textContent = product.name;
  subtitle.textContent = `${product.brand} · ${product.category.toUpperCase()} · ${money(product.price)}`;
  content.innerHTML = '<div style="display:flex; align-items:center; gap:10px;"><span class="ai-sparkle">✨</span><span>Consultando a DeepSeek V3 para generar ficha técnica...</span></div>';

  addBtn.onclick = () => {
    VapeKing.addToCart(product.id);
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
  };

  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('no-scroll');

  try {
    const res = await fetch(`/api/ia/producto/${product.id}/resumen`, { method: 'POST' });
    if (!res.ok) {
      throw new Error('Servicio de IA no disponible temporalmente');
    }
    const data = await res.json();
    content.textContent = data.resumen || 'Resumen no disponible.';
  } catch (err) {
    content.innerHTML = `<strong>Especificaciones principales:</strong>\n• Categoría: ${product.category} con terminación premium.\n• Valoración de la comunidad: ${product.rating}/5 estrellas.\n• Disponibilidad inmediata con envío gratis en Costa Rica a partir de ₡10.000.`;
  }
};
