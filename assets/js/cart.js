/* ==========================================================================
   GESTION DU PANIER LOCAL (LOCALSTORAGE)
   ========================================================================== */

/**
 * Récupère le panier depuis le LocalStorage
 */
function getLocalCart() {
    const cart = localStorage.getItem('aweya_cart');
    return cart ? JSON.parse(cart) : [];
}

/**
 * Sauvegarde le panier et met à jour les compteurs
 */
function saveCart(cart) {
    localStorage.setItem('aweya_cart', JSON.stringify(cart));
    updateCartCounters();
}

/**
 * Ajoute un produit au panier
 */
function addToCart(productData) {
    const cart = getLocalCart();
    
    // Vérifie si l'article existe déjà avec la même taille
    const existingItem = cart.find(item => item.id === productData.id && item.taille === productData.taille);

    if (existingItem) {
        existingItem.quantite += 1;
    } else {
        cart.push({
            id: productData.id,
            titre: productData.titre,
            prix: productData.prix,
            image: productData.image,
            taille: productData.taille,
            quantite: 1
        });
    }

    saveCart(cart);
}

/**
 * Met à jour le nombre total d'articles affiché dans le Header
 */
function updateCartCounters() {
    const cart = getLocalCart();
    const totalArticles = cart.reduce((total, item) => total + item.quantite, 0);
    
    const cartBtn = document.getElementById('cart-btn');
    if (cartBtn) {
        cartBtn.textContent = `Panier (${totalArticles})`;
    }
}