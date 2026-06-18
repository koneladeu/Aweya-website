/* ==========================================================================
   LOGIQUE ET AFFICHAGE DYNAMIQUE DE LA PAGE D'ACCUEIL
   ========================================================================== */

// URL de base pour les médias Strapi (indispensable pour afficher les images locales du backend)
const STRAPI_BASE_URL = 'http://localhost:1337';

document.addEventListener('DOMContentLoaded', () => {
    // Charger les composants communs
    includeHeaderAndFooter();
});

async function includeHeaderAndFooter() {
    // 1. Injection du Header
    const headerElement = document.querySelector('.main-header');
    if (headerElement) {
        try {
            const response = await fetch('components/header.html');
            if (response.ok) {
                headerElement.innerHTML = await response.text();
                // Activer le lien de la page courante
                highlightCurrentPage();
                if (typeof updateCartCounters === 'function') updateCartCounters();
            }
        } catch (error) {
            console.error("Erreur lors du chargement du header :", error);
        }
    }

    // 2. Injection du Footer
    const footerElement = document.querySelector('.main-footer');
    if (footerElement) {
        try {
            const response = await fetch('components/footer.html');
            if (response.ok) {
                footerElement.innerHTML = await response.text();
            }
        } catch (error) {
            console.error("Erreur lors du chargement du footer :", error);
        }
    }
}

/**
 * Détecte la page actuelle et applique la classe "active" sur le bon lien du menu
 */
function highlightCurrentPage() {
    const path = window.location.pathname;
    const page = path.split("/").pop();

    // On retire d'abord toutes les classes actives par sécurité
    document.querySelectorAll('.nav-menu a').forEach(link => link.classList.remove('active'));

    // On applique la classe selon le fichier HTML ouvert
    if (page === 'index.html' || page === '') {
        document.getElementById('nav-index')?.classList.add('active');
    } else if (page === 'boutique.html') {
        document.getElementById('nav-boutique')?.classList.add('active');
    } else if (page === 'a-propos.html') {
        document.getElementById('nav-a-propos')?.classList.add('active');
    } else if (page === 'guide-tailles.html') {
        document.getElementById('nav-guide-tailles')?.classList.add('active');
    } else if (page === 'blog.html') {
        document.getElementById('nav-blog')?.classList.add('active');
    }
}


document.addEventListener('DOMContentLoaded', () =>{
    // 1. Initialisation des affichages dynamiques
    renderFeaturedProducts();
    renderClientReviews();
});

/**
 * Récupère et injecte les produits mis en avant dans la grille HTML
 */
async function renderFeaturedProducts() {
    const productsGrid = document.getElementById('featured-products');
    if(!productsGrid) return;

    // Appel à la fonction définie dans api.js
    const produits = await getFeaturedProducts();

    if (!produits || produits.length === 0) {
        productsGrid.innerHTML = '<p class="no-data">Aucun produit disponible pour le moment.</p>';
        return;
    }

    // On vide le contenu de test statique avant d'injecter les vraies données
    productsGrid.innerHTML = '';

    produits.forEach(item => {
        // En Strapi v4/v5, les champs sont souvent dans item.attributes ou directement dans item
        const data = item.attributes || item;

        // Gestion de l'image de couverture
        let imageUrl = 'assets/images/product-placeholder.jpg'; // Image par défaut
        if (data.Photos && data.Photos.data && data.Photos.data.length > 0) {
            imageUrl = `${STRAPI_BASE_URL}${data.Photos.data[0].attributes.url}`;
        } else if (data.Photos && data.Photos[0] && data.Photos[0].url) {
            imageUrl = `${STRAPI_BASE_URL}${data.Photos[0].url}`;
        }

        // Création du badge si c'est une nouveauté
        const badgeHTML = data.Nouveaute ? `<div class="product-badge">Nouveauté</div>` : '';

        // Structuration de la carte produit
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            ${badgeHTML}
            <img src="${imageUrl}" alt="${data.Titre}">
            <div class="product-info">
                <h3>${data.Titre}</h3>
                <p class="product-price">${Number(data.Prix).toLocaleString('fr-FR')} FCFA</p>
                <a href="boutique.html?id=${item.id}" class="btn-secondary">Voir le produit</a>
            </div>
        `;

        productsGrid.appendChild(productCard);
    });    
}

/**
 * Récupère et injecte les avis clients dans le conteneur HTML
 */
async function renderClientReviews() {
    const reviewsContainer = document.getElementById('reviews-list');
    if (!reviewsContainer) return;

    // Appel à la fonction définie dans api.js
    const avisList = await getClientReviews();

    if (!avisList || avisList.length === 0) {
        reviewsContainer.innerHTML = '<p class="no-data">Découvrez bientôt les retours de nos clientes.</p>';
        return;
    }

    reviewsContainer.innerHTML = '';

    // On affiche par exemple les 3 derniers avis max sur l'accueil
    avisList.slice(0, 3).forEach(item => {
        const data = item.attributes || item;
        
        // Génération des étoiles dorées en fonction de la note
        const starsHTML = '★'.repeat(data.Note) + '☆'.repeat(5 - data.Note);

        const reviewCard = document.createElement('div');
        reviewCard.className = 'review-card';
        reviewCard.innerHTML = `
            <div class="stars">${starsHTML}</div>
            <p class="review-text">"${data.Commentaire}"</p>
            <span class="review-author">— ${data.Nom_cliente}</span>
        `;

        reviewsContainer.appendChild(reviewCard);
    });
}