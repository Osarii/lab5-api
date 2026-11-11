window.VapeKing = window.VapeKing || {};
VapeKing.cart = JSON.parse(localStorage.getItem('vapeking_cart') || '[]');
VapeKing.getProduct = (id) => VapeKing.products.find((product) => product.id === id);
VapeKing.saveCart = () => localStorage.setItem('vapeking_cart', JSON.stringify(VapeKing.cart));
VapeKing.addToCart = (id) => { const existing = VapeKing.cart.find((item) => item.id === id); existing ? existing.quantity++ : VapeKing.cart.push({ id, quantity: 1 }); VapeKing.saveCart(); VapeKing.renderCart(); VapeKing.showToast('Producto agregado al carrito'); };
VapeKing.removeFromCart = (id) => { VapeKing.cart = VapeKing.cart.filter((item) => item.id !== id); VapeKing.saveCart(); VapeKing.renderCart(); };
VapeKing.updateQuantity = (id, delta) => { const item = VapeKing.cart.find((entry) => entry.id === id); if (!item) return; item.quantity = Math.max(1, item.quantity + delta); VapeKing.saveCart(); VapeKing.renderCart(); };
VapeKing.cartCount = () => VapeKing.cart.reduce((sum, item) => sum + item.quantity, 0);
VapeKing.cartTotal = () => VapeKing.cart.reduce((sum, item) => { const product = VapeKing.getProduct(item.id); return sum + (product ? product.price * item.quantity : 0); }, 0);
