window.VapeKing = window.VapeKing || {};
VapeKing.favorites = JSON.parse(localStorage.getItem('vapeking_favorites') || '[]');
VapeKing.saveFavorites = () => localStorage.setItem('vapeking_favorites', JSON.stringify(VapeKing.favorites));
VapeKing.isFavorite = (id) => VapeKing.favorites.includes(id);
VapeKing.toggleFavorite = (id) => { VapeKing.favorites = VapeKing.isFavorite(id) ? VapeKing.favorites.filter((favorite) => favorite !== id) : [...VapeKing.favorites, id]; VapeKing.saveFavorites(); VapeKing.renderProducts(); VapeKing.updateHeaderCounters(); };
