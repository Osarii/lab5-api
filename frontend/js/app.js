document.addEventListener('DOMContentLoaded', () => {
  // Render inicial
  VapeKing.renderBrands();
  VapeKing.renderNewProducts();
  VapeKing.renderWaxProducts();
  VapeKing.renderBotanicalProducts();
  VapeKing.renderProducts();
  VapeKing.renderCart();

  // Sincronizar catálogo en vivo desde el Backend
  fetch('/api/vapes')
    .then((res) => (res.ok ? res.json() : null))
    .then((data) => {
      if (data && Array.isArray(data.productos) && data.productos.length > 0) {
        VapeKing.products = data.productos;
        VapeKing.renderProducts();
        VapeKing.renderNewProducts();
        VapeKing.renderWaxProducts();
        VapeKing.renderBotanicalProducts();
      }
    })
    .catch(() => {
      // Si falla la red, el catálogo local cargado desde data.js sigue funcionando 100%
    });

  // Modal Helpers
  const openModal = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.add('is-open');
    el.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
  };

  const closeModal = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('is-open');
    el.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
  };

  // Carrito y Búsqueda
  const openCart = () => openModal('cart-drawer');
  const closeCart = () => closeModal('cart-drawer');
  const openSearch = () => {
    openModal('search-modal');
    document.getElementById('search-input').focus();
  };
  const closeSearch = () => closeModal('search-modal');

  document.getElementById('cart-open').addEventListener('click', openCart);
  document.querySelectorAll('[data-close-cart]').forEach((item) => item.addEventListener('click', closeCart));
  document.getElementById('search-open').addEventListener('click', openSearch);
  document.querySelectorAll('[data-close-search]').forEach((item) => item.addEventListener('click', closeSearch));

  // Menú Responsive
  document.getElementById('menu-toggle').addEventListener('click', () => {
    const nav = document.getElementById('main-nav');
    const isOpen = nav.classList.toggle('is-open');
    document.getElementById('menu-toggle').setAttribute('aria-expanded', String(isOpen));
    document.body.classList.toggle('no-scroll', isOpen);
  });
  document.querySelectorAll('#main-nav a').forEach((link) => link.addEventListener('click', () => {
    document.getElementById('main-nav').classList.remove('is-open');
    document.body.classList.remove('no-scroll');
  }));

  // Búsqueda en vivo
  document.getElementById('search-input').addEventListener('input', (event) => {
    const query = event.target.value.trim().toLowerCase();
    const results = VapeKing.products.filter((product) => `${product.name} ${product.brand}`.toLowerCase().includes(query)).slice(0, 6);
    document.getElementById('search-results').innerHTML = query
      ? results.length
        ? results.map((product) => `<button class="search-result" data-search-product="${product.id}"><img src="${product.image}" alt=""><span><strong>${product.name}</strong><small>${product.brand} · ${money(product.price)}</small></span><b>→</b></button>`).join('')
        : '<p class="search-empty">No encontramos coincidencias.</p>'
      : '';
    document.querySelectorAll('[data-search-product]').forEach((button) => button.addEventListener('click', () => {
      closeSearch();
      document.getElementById('tienda').scrollIntoView({ behavior: 'smooth' });
      VapeKing.state.search = VapeKing.getProduct(Number(button.dataset.searchProduct)).name;
      VapeKing.renderProducts();
    }));
  });

  // Filtros de Categoría y Ordenamiento
  document.querySelectorAll('[data-category]').forEach((button) => button.addEventListener('click', () => {
    VapeKing.state.category = button.dataset.category;
    VapeKing.state.brand = '';
    document.querySelectorAll('.filter-button').forEach((item) => item.classList.toggle('is-active', item === button));
    VapeKing.renderProducts();
  }));

  document.getElementById('sort-products').addEventListener('change', (event) => {
    VapeKing.state.sort = event.target.value;
    VapeKing.renderProducts();
  });

  document.getElementById('clear-filters').addEventListener('click', () => {
    VapeKing.state = { category: 'todos', brand: '', search: '', sort: 'featured' };
    document.querySelectorAll('.filter-button').forEach((item) => item.classList.toggle('is-active', item.dataset.category === 'todos'));
    document.getElementById('sort-products').value = 'featured';
    VapeKing.renderProducts();
  });

  document.getElementById('filter-toggle').addEventListener('click', () => document.getElementById('shop-controls').classList.toggle('is-open'));

  document.querySelectorAll('[data-category-link]').forEach((link) => link.addEventListener('click', () => {
    VapeKing.state.category = link.dataset.categoryLink;
    document.querySelectorAll('.filter-button').forEach((item) => item.classList.toggle('is-active', item.dataset.category === VapeKing.state.category));
    VapeKing.renderProducts();
  }));

  document.getElementById('new-prev').addEventListener('click', () => document.getElementById('new-products').scrollBy({ left: -310, behavior: 'smooth' }));
  document.getElementById('new-next').addEventListener('click', () => document.getElementById('new-products').scrollBy({ left: 310, behavior: 'smooth' }));

  // Newsletter integrado con Backend (POST /api/newsletter)
  document.getElementById('newsletter-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const message = document.getElementById('newsletter-message');
    const input = document.getElementById('newsletter-email');
    const email = input.value.trim();

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        message.textContent = `¡Gracias por unirte! Usá el cupón ${data.cuponDescuento || 'VAPEKING10'} para 10% OFF en tu compra.`;
        message.className = 'form-message is-success';
        event.target.reset();
        VapeKing.showToast('¡Suscripción exitosa a la lista VIP!');
      } else {
        message.textContent = data.error || 'Error al procesar la suscripción.';
        message.className = 'form-message';
      }
    } catch {
      message.textContent = '¡Gracias por unirte! Usá el cupón VAPEKING10 para 10% OFF.';
      message.className = 'form-message is-success';
      event.target.reset();
    }
  });

  document.querySelectorAll('[data-scroll-newsletter]').forEach((button) => button.addEventListener('click', () => document.getElementById('newsletter').scrollIntoView({ behavior: 'smooth' })));

  // CHECKOUT MODAL Y ORDENES (POST /api/pedidos)
  const openCheckout = () => {
    if (!VapeKing.cart.length) {
      VapeKing.showToast('Agregá un producto al carrito antes de continuar.');
      return;
    }

    closeCart();
    const subtotal = VapeKing.cartTotal();
    const shipping = subtotal >= 10000 ? 0 : 2500;
    const total = subtotal + shipping;

    document.getElementById('summary-items-count').textContent = VapeKing.cartCount();
    document.getElementById('summary-subtotal').textContent = money(subtotal);
    document.getElementById('summary-shipping').textContent = shipping === 0 ? '¡Gratis! 🎉' : money(shipping);
    document.getElementById('summary-total').textContent = money(total);

    document.getElementById('checkout-form-container').hidden = false;
    document.getElementById('checkout-success-container').hidden = true;
    openModal('checkout-modal');
  };

  const closeCheckout = () => closeModal('checkout-modal');

  document.getElementById('checkout-button').addEventListener('click', openCheckout);
  document.querySelectorAll('[data-close-checkout]').forEach((item) => item.addEventListener('click', closeCheckout));

  // Procesar Formulario de Checkout
  const checkoutForm = document.getElementById('checkout-form');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const submitBtn = document.getElementById('order-submit-btn');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Procesando tu pedido...';

      const pedidoPayload = {
        cliente: {
          nombre: document.getElementById('order-nombre').value.trim(),
          telefono: document.getElementById('order-telefono').value.trim(),
          email: document.getElementById('order-email').value.trim(),
          direccion: document.getElementById('order-direccion').value.trim(),
          provincia: document.getElementById('order-provincia').value,
        },
        items: VapeKing.cart.map((item) => ({ id: item.id, cantidad: item.quantity })),
        metodoPago: document.getElementById('order-metodo').value,
        notas: document.getElementById('order-notas').value.trim(),
      };

      try {
        const res = await fetch('/api/pedidos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(pedidoPayload),
        });

        const data = await res.json();
        if (res.ok) {
          // Mostrar confirmación
          document.getElementById('confirmed-order-code').textContent = data.codigo;
          document.getElementById('confirmed-order-total').textContent = money(data.total);
          document.getElementById('confirmed-order-detail').textContent = data.codigo;

          const sinpeBox = document.getElementById('confirmed-payment-box');
          if (data.metodoPago === 'SINPE') {
            sinpeBox.hidden = false;
          } else {
            sinpeBox.innerHTML = `<h4>📦 Método: ${data.metodoPago}</h4><p>${data.instruccionesPago}</p>`;
          }

          // Vaciar carrito
          VapeKing.cart = [];
          VapeKing.saveCart();
          VapeKing.renderCart();

          document.getElementById('checkout-form-container').hidden = true;
          document.getElementById('checkout-success-container').hidden = false;
          VapeKing.showToast(`¡Pedido ${data.codigo} registrado!`);
        } else {
          alert(`Error al procesar el pedido: ${data.error || 'Verifica los datos'}`);
        }
      } catch (err) {
        alert('Ocurrió un error de conexión al procesar el pedido.');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Confirmar y Enviar Pedido <span>→</span>';
      }
    });
  }

  // SOMMELIER IA VIRTUAL (VapeBot CR con DeepSeek)
  const openSommelier = () => openModal('sommelier-modal');
  const closeSommelier = () => closeModal('sommelier-modal');

  const sommelierTrigger = document.getElementById('sommelier-open');
  if (sommelierTrigger) sommelierTrigger.addEventListener('click', openSommelier);

  const navSommelier = document.getElementById('nav-sommelier-open');
  if (navSommelier) navSommelier.addEventListener('click', openSommelier);

  document.querySelectorAll('[data-close-sommelier]').forEach((item) => item.addEventListener('click', closeSommelier));

  // Enviar consulta al Sommelier
  const handleAiQuery = async (queryText) => {
    if (!queryText || queryText.trim().length < 3) return;

    const chatBox = document.getElementById('ai-chat-box');
    const input = document.getElementById('ai-user-query');
    const submitBtn = document.getElementById('ai-submit-btn');

    // Mensaje del usuario
    const userMsg = document.createElement('div');
    userMsg.className = 'ai-msg ai-msg--user';
    userMsg.textContent = queryText;
    chatBox.appendChild(userMsg);

    // Mensaje de carga del bot
    const botMsg = document.createElement('div');
    botMsg.className = 'ai-msg ai-msg--bot';
    botMsg.innerHTML = '<span class="ai-sparkle">✨</span> <em>Consultando a DeepSeek V3...</em>';
    chatBox.appendChild(botMsg);
    chatBox.scrollTop = chatBox.scrollHeight;

    input.value = '';
    submitBtn.disabled = true;

    try {
      const res = await fetch('/api/ia/recomendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consulta: queryText }),
      });

      const data = await res.json();
      if (res.ok && data.recomendacion) {
        botMsg.textContent = data.recomendacion;
      } else {
        botMsg.innerHTML = '¡Excelente consulta! Para esa preferencia te sugiero explorar nuestros dispositivos <strong>Geek Pulse X</strong> o un desechable <strong>Vapo Ultra 5000</strong>. Además, recordá que en compras mayores a ₡10.000 el envío es gratis.';
      }
    } catch {
      botMsg.innerHTML = 'Te recomendamos echar un vistazo a los más vendidos de la tienda: <strong>Geek Pulse X</strong> para pods o <strong>Vapo Ultra 5000</strong> para desechables con excelente sabor.';
    } finally {
      submitBtn.disabled = false;
      chatBox.scrollTop = chatBox.scrollHeight;
    }
  };

  const aiForm = document.getElementById('ai-input-form');
  if (aiForm) {
    aiForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const text = document.getElementById('ai-user-query').value.trim();
      handleAiQuery(text);
    });
  }

  // Chips de preguntas sugeridas
  document.querySelectorAll('[data-ai-prompt]').forEach((chip) => {
    chip.addEventListener('click', () => {
      const prompt = chip.dataset.aiPrompt;
      document.getElementById('ai-user-query').value = prompt;
      handleAiQuery(prompt);
    });
  });

  // Modal Resumen Técnico IA
  document.querySelectorAll('[data-close-resumen]').forEach((item) => item.addEventListener('click', () => closeModal('resumen-modal')));

  // Age Gate (+18)
  const ageGate = document.getElementById('age-gate');
  if (localStorage.getItem('vapeking_age_verified') === 'true') {
    ageGate.remove();
  } else {
    document.getElementById('age-yes').addEventListener('click', () => {
      localStorage.setItem('vapeking_age_verified', 'true');
      ageGate.remove();
    });
    document.getElementById('age-no').addEventListener('click', () => {
      ageGate.querySelector('h2').textContent = 'No podés continuar';
      ageGate.querySelector('p').textContent = 'Este sitio es únicamente para personas mayores de edad (+18).';
      document.getElementById('age-yes').remove();
    });
  }

  // Scroll de encabezado
  window.addEventListener('scroll', () => {
    document.getElementById('site-header').classList.toggle('is-scrolled', window.scrollY > 50);
  });

  // Tecla Escape para cerrar modales
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeCart();
      closeSearch();
      closeCheckout();
      closeSommelier();
      closeModal('resumen-modal');
    }
  });
});
