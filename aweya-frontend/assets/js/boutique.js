/* ==========================================================================
   LOGIQUE ET FILTRES DE LA PAGE BOUTIQUE
   ========================================================================== */

// On s'assure d'avoir accès à la constante de l'URL de base définie dans main.js
const STRAPI_URL_MEDIA = 'http://localhost:1337';

// Variable globale pour stocker les produits chargés et éviter de refaire des requêtes API inutiles
let localCatalog = [];

document.addEventListener('DOMContentLoaded', () => {
    // 1. Charger tout le catalogue au démarrage
    initBoutique();

    // 2. Écouter les clics sur les boutons de filtrage
    setupFilterEvents();
});

/**
 * Initialise la boutique en récupérant tous les produits depuis Strapi
 */
async function initBoutique() {
    const grid = document.getElementById('shop-products-grid');
    if (!grid) return;

    // Appel à la fonction globale de api.js pour récupérer tous les produits
    const produits = await getFeaturedProducts(); 

    if (!produits || produits.length === 0) {
        grid.innerHTML = '<div class="shop-status">Aucun article n\'est disponible dans la boutique pour le moment.</div>';
        return;
    }

    // On stocke les produits dans notre variable globale
    localCatalog = produits;

    // Par défaut, on affiche tout le catalogue
    displayProducts(localCatalog);
}


/**
 * Génère le HTML et affiche les produits passés en paramètre
 * @param {Array} productsList - Liste des produits à afficher
 */
function displayProducts(productsList) {
    const grid = document.getElementById('shop-products-grid');
    if (!grid) return;

    if (productsList.length === 0) {
        grid.innerHTML = '<div class="shop-status">Aucun produit ne correspond à cette catégorie pour le moment.</div>';
        return;
    }

    grid.innerHTML = '';

    productsList.forEach(item => {
        const data = item.attributes || item;

        // Récupération de la photo
        let imageUrl = 'assets/images/product-placeholder.jpg';
        if (data.Photos && data.Photos.data && data.Photos.data.length > 0) {
            imageUrl = `${STRAPI_URL_MEDIA}${data.Photos.data[0].attributes.url}`;
        } else if (data.Photos && data.Photos[0] && data.Photos[0].url) {
            imageUrl = `${STRAPI_URL_MEDIA}${data.Photos[0].url}`;
        }

        // --- CORRECTION DES TYPES POUR LES PRIX ---
        const prixDeBase = Number(data.Prix);
        const prixPromo = data.Prix_Promo ? Number(data.Prix_Promo) : null;
        const estEnPromo = prixPromo !== null && prixPromo > 0 && prixPromo < prixDeBase;

        // Gestion des badges (Nouveauté ou Promotion)
        let badgeHTML = '';
        if (estEnPromo) {
            badgeHTML = `<div class="product-badge" style="background-color: var(--dore-leger); color: white;">Promo</div>`;
        } else if (data.Nouveaute) {
            badgeHTML = `<div class="product-badge">Nouveauté</div>`;
        }

        // Affichage du prix avec gestion de la promotion
        let priceHTML = `<p class="product-price">${prixDeBase.toLocaleString('fr-FR')} FCFA</p>`;
        if (estEnPromo) {
            priceHTML = `
                <p class="product-price">
                    <span style="text-decoration: line-through; color: var(--texte-secondaire); font-size: 0.9rem; margin-right: 0.5rem;">${prixDeBase.toLocaleString('fr-FR')} FCFA</span>
                    <span style="color: var(--texte-sombre); font-weight: 600;">${prixPromo.toLocaleString('fr-FR')} FCFA</span>
                </p>
            `;
        }

        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            ${badgeHTML}
            <img src="${imageUrl}" alt="${data.Titre}">
            <div class="product-info">
                <h3>${data.Titre}</h3>
                ${priceHTML}
                <a href="product-detail.html?id=${item.documentId}" class="btn-secondary">Voir le produit</a>
            </div>
        `;

        grid.appendChild(productCard);
    });
}

/**
 * Configure les écouteurs d'événements sur les onglets de filtrage
 */
function setupFilterEvents() {
    const filters = document.querySelectorAll('.filter-btn');
    
    filters.forEach(button => {
        button.addEventListener('click', (e) => {
            // 1. Gérer la classe active visuelle
            filters.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // 2. Récupérer le filtre sélectionné
            const filterValue = button.getAttribute('data-filter');

            // 3. Filtrer le catalogue local
            let filteredProducts = [];

            if (filterValue === 'tous') {
                filteredProducts = localCatalog;
            } else if (filterValue === 'nouveautes') {
                filteredProducts = localCatalog.filter(item => {
                    const data = item.attributes || item;
                    return data.Nouveaute === true;
                });
            } else if (filterValue === 'promotions') {
                filteredProducts = localCatalog.filter(item => {
                    const data = item.attributes || item;
                    
                    // 1. On vérifie que le champ existe et n'est pas vide/null
                    if (data.Prix_Promo === undefined || data.Prix_Promo === null || data.Prix_Promo === '') {
                        return false;
                    }
                    
                    // 2. On force la conversion en vrais nombres pour la comparaison
                    const prixDeBase = Number(data.Prix);
                    const prixPromo = Number(data.Prix_Promo);
                    
                    // 3. Le produit est en promo uniquement si le prix promo est strictement inférieur au prix de base
                    return prixPromo < prixDeBase;
                });
            } else {
                // Filtre par catégorie classique (Ensembles_Lingerie ou Homewear)
                filteredProducts = localCatalog.filter(item => {
                    const data = item.attributes || item;
                    return data.Categorie === filterValue;
                });
            }

            // 4. Réafficher la grille avec les produits filtrés
            displayProducts(filteredProducts);
        });
    });
}