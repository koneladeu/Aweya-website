/* ==========================================================================
   LOGIQUE ET AFFICHAGE DÉTAILLÉ DE LA FICHE PRODUIT
   ========================================================================== */

const STRAPI_MEDIA_SERVER = "http://localhost:1337";

document.addEventListener("DOMContentLoaded", () => {
  // Lancer la récupération du produit au chargement de la page
  initProductDetail();
});

/**
 * Récupère l'ID du produit dans l'URL et charge ses données depuis Strapi
 */
async function initProductDetail() {
  const container = document.getElementById("product-detail-content");
  if (!container) return;

  // 1. Extraction de l'ID depuis les paramètres de l'URL (ex: ?id=3)
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("id");

  // Sécurité : Si aucun ID n'est fourni, on redirige vers la boutique
  if (!productId) {
    window.location.href = "boutique.html";
    return;
  }

  // 2. Appel de l'API Strapi (via la fonction ajoutée dans api.js)
  const produit = await getSingleProduct(productId);

  if (!produit) {
    container.innerHTML = `
               <div style="text-align: center; width: 100%; padding: 5rem 0;">
                   <p style="color: var(--texte-secondaire); margin-bottom: 1.5rem;">Désolé, ce produit est introuvable ou n'est plus disponible.</p>
                   <a href="boutique.html" class="btn-primary">Retourner à la boutique</a>
               </div>
           `;
    return;
  }

  // 3. Extraction et normalisation des données selon la version de Strapi
  const data = produit.attributes || produit;

  // Gestion de la photo de l'article
  let imageUrl = "assets/images/product-placeholder.jpg";
  if (data.Photos && data.Photos.data && data.Photos.data.length > 0) {
    imageUrl = `${STRAPI_MEDIA_SERVER}${data.Photos.data[0].attributes.url}`;
  } else if (data.Photos && data.Photos[0] && data.Photos[0].url) {
    imageUrl = `${STRAPI_MEDIA_SERVER}${data.Photos[0].url}`;
  }

  // Analyse et conversion des types de prix
  const prixDeBase = Number(data.Prix);
  const prixPromo = data.Prix_Promo ? Number(data.Prix_Promo) : null;
  const estEnPromo =
    prixPromo !== null && prixPromo > 0 && prixPromo < prixDeBase;

  // Structuration de l'affichage du prix (Normal vs Promo)
  let priceHTML = `<div class="detail-price">${prixDeBase.toLocaleString("fr-FR")} FCFA</div>`;
  let prixFinalPourMessage = `${prixDeBase.toLocaleString("fr-FR")} FCFA`;

  if (estEnPromo) {
    prixFinalPourMessage = `${prixPromo.toLocaleString("fr-FR")} FCFA`;
    priceHTML = `
               <div class="detail-price">
                   <span style="text-decoration: line-through; color: var(--texte-secondaire); font-size: 1.1rem; margin-right: 0.8rem;">${prixDeBase.toLocaleString("fr-FR")} FCFA</span>
                   <span style="color: var(--texte-sombre); font-weight: 600;">${prixPromo.toLocaleString("fr-FR")} FCFA</span>
               </div>
           `;
  }

  // 4. Génération du message WhatsApp personnalisé pour ton amie
  const messageWhatsApp = encodeURIComponent(
    `Bonjour Aweya, je suis intéressée par l'article suivants :\n\n` +
      `- Modèle : ${data.Titre}\n` +
      `- Prix : ${prixFinalPourMessage}\n\n` +
      `Pouvez-vous m'indiquer les disponibilités pour commander ?`,
  );
  // Lien dynamique vers son WhatsApp Business (à configurer avec son vrai numéro à la place des zéros)
  const whatsappLink = `https://wa.me/2250000000000?text=${messageWhatsApp}`;

  // 5. Injection finale du code HTML dans la page (avec choix de taille et bouton panier)
  container.innerHTML = `
    <!-- Galerie photo -->
    <div class="detail-gallery">
        <img src="${imageUrl}" alt="${data.Titre}">
    </div>

    <!-- Informations textuelles -->
    <div class="detail-info">
        <h1 class="detail-title">${data.Titre}</h1>
        ${priceHTML}
        <div class="detail-description">${parseStrapiBlocks(data.Description) || "Aucune description disponible pour cette pièce."}</div>
        
        <!-- Sélecteur de Tailles -->
        <div style="margin-bottom: 2rem;">
            <label for="product-size" style="display: block; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.5rem; font-weight: 500;">Choisir une taille :</label>
            <select id="product-size" style="width: 100%; max-width: 200px; padding: 0.75rem; border: 1px solid var(--rose-poudre); background: var(--blanc); font-family: var(--police-corps); border-radius: var(--arrondi-doux); font-size: 0.95rem; cursor: pointer;">
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
            </select>
        </div>

        <!-- Actions d'achat -->
        <div class="detail-actions" style="display: flex; flex-direction: column; gap: 1rem;">
            <div style="display: flex; gap: 1rem;">
                <button id="add-to-cart-btn" class="btn-primary" style="flex: 1; padding: 1rem;">
                    Ajouter au panier
                </button>
                <!-- <button class="btn-secondary" id="add-to-wishlist" style="padding: 1rem 1.5rem;">育 Favoris</button> -->
            </div>
            
            <a href="${whatsappLink}" target="_blank" rel="noopener noreferrer" class="btn-primary" style="background-color: #25d366; border-color: #25d366; display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 1rem;">
                Commander directement via WhatsApp
            </a>
        </div>
    </div>
`;

  // 6. Écouteur d'événement pour le bouton "Ajouter au panier"
  setupAddToCartSelection(
    productId,
    data.Titre,
    estEnPromo ? prixPromo : prixDeBase,
    imageUrl,
  );
}

/**
 * Configure la logique du clic sur "Ajouter au panier"
 */
function setupAddToCartSelection(id, titre, prix, image) {
  const btn = document.getElementById("add-to-cart-btn");
  if (!btn) return;

  btn.addEventListener("click", () => {
    const sizeSelect = document.getElementById("product-size");
    const selectedSize = sizeSelect ? sizeSelect.value : "S";

    // Préparation de l'objet produit pour le panier local
    const productToBag = {
      id: id,
      titre: titre,
      prix: prix,
      image: image,
      taille: selectedSize,
    };

    // Appel de la fonction globale située dans cart.js
    addToCart(productToBag);

    // Petit effet visuel pour confirmer l'ajout
    const originalText = btn.textContent;
    btn.textContent = "Validé !!";
    btn.style.backgroundColor = "var(--texte-sombre)";
    btn.style.color = "var(--blanc)";

    setTimeout(() => {
      btn.textContent = originalText;
      btn.style.backgroundColor = "";
      btn.style.color = "";
    }, 2000);
  });
}

/**
 * Extrait le texte brut d'un champ Rich Text structuré en blocs de Strapi
 * @param {Array} blocks - Le tableau de blocs renvoyé par Strapi
 * @returns {string} Le texte assemblé et propre
 */
function parseStrapiBlocks(blocks) {
  if (!blocks || !Array.isArray(blocks)) return "";

  return blocks
    .map((block) => {
      if (block.type === "paragraph" && block.children) {
        return block.children.map((child) => child.text || "").join("");
      }
      return "";
    })
    .join("\n");
}
