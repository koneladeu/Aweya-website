/* ==========================================================================
   CONFIGURATION & CONVERSIONS API STRAPI
   ========================================================================== */

// L'URL du serveur Strapi local
const API_URL = "http://localhost:1337/api";

/**
 * Fonction générique pour effectuer des requêtes GET vers Strapi
 * @param {string} endpoint - Le point d'accès (ex: '/produits' ou '/articles-blogs')
 * @returns {Promise<any>} Les données JSON renvoyées par le serveur
 */

async function fetchFromAPI(endpoint) {
  try {
    const response = await fetch(`${API_URL}${endpoint}`);
    if (!response.ok) {
      throw new Error(`Erreur HTTP! Statut: ${response.status}`);
    }
    const json = await response.json();
    // Strapi v4/v5 renvoie généralement les données dans un objet 'data'
    return json.data;
  } catch (error) {
    console.error(
      `Impossible de récupérer les données sur l'endpoint ${endpoint}:`,
      error,
    );
    return null;
  }
}

/**
 * Récupère les produits configurés comme "Nouveauté" ou mis en avant
 * Requête filtrée ou complète selon tes besoins
 */

async function getFeaturedProducts() {
  // On demande à Strapi les produits en incluant les photos (populate=Photos)
  // Si tu veux filtrer uniquement les nouveautés, l'URL ressemblera à : /produits?filters[Nouveaute][$eq]=true&populate=Photos
  return await fetchFromAPI('/produits?populate=Photos');
}

/**
 * Récupère la liste des avis clients pour la réassurance
 */
async function getClientReviews() {
    return await fetchFromAPI('/aviss');
}

/**
 * Récupère les articles du blog pour la page Conseils
 */
async function getBlogArticles() {
    return await fetchFromAPI('/article-blogs?populate=Image_Couverture');
}   

/**
 * Récupère un seul produit spécifique grâce à son ID
 * @param {string|number} id - L'identifiant du produit
 */
async function getSingleProduct(id) {
  return await fetchFromAPI(`/produits/${id}?populate=Photos`);
}

/**
 * Récupère un seul article de blog spécifique grâce à son documentId
 */
async function getSingleBlogArticle(id) {
  return await fetchFromAPI(`/article-blogs/${id}?populate=Image_Couverture`);
}