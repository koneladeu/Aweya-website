/* ==========================================================================
   AFFICHAGE ET INTERACTIONS DE LA PAGE PANIER
   ========================================================================== */

   document.addEventListener('DOMContentLoaded', () => {
    renderPanierView();
});

/**
 * Génère le rendu visuel complet du panier
 */
function renderPanierView() {
    const wrapper = document.getElementById('cart-content-wrapper');
    if (!wrapper) return;

    // Appel direct de ta fonction de cart.js
    const cart = getLocalCart();

    // Cas où le panier est vide
    if (cart.length === 0) {
        wrapper.innerHTML = `
            <div style="text-align: center; padding: 4rem 0;">
                <p style="color: var(--texte-secondaire); margin-bottom: 2rem;">Votre panier est actuellement vide.</p>
                <a href="boutique.html" class="btn-primary">Découvrir la boutique</a>
            </div>
        `;
        return;
    }

    // Base du tableau
    let tableHTML = `
        <table class="cart-table">
            <thead>
                <tr>
                    <th>Article</th>
                    <th>Prix</th>
                    <th>Quantité</th>
                    <th style="text-align: right;">Total</th>
                </tr>
            </thead>
            <tbody>
    `;

    let sousTotalGlobal = 0;

    // Construction des lignes du tableau
    cart.forEach((item, index) => {
        const itemTotal = Number(item.prix) * Number(item.quantite);
        sousTotalGlobal += itemTotal;

        tableHTML += `
            <tr class="cart-item">
                <td class="cart-product-info">
                    <img src="${item.image}" alt="${item.titre}">
                    <div class="cart-product-details">
                        <h3>${item.titre}</h3>
                        <p>Taille : <strong>${item.taille}</strong></p>
                        <button class="delete-btn" onclick="handleRemoveItem(${index})">Supprimer</button>
                    </div>
                </td>
                <td>${Number(item.prix).toLocaleString('fr-FR')} FCFA</td>
                <td>
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="handleChangeQty(${index}, -1)">-</button>
                        <span style="font-weight: 500; min-width: 20px; text-align: center;">${item.quantite}</span>
                        <button class="quantity-btn" onclick="handleChangeQty(${index}, 1)">+</button>
                    </div>
                </td>
                <td style="text-align: right; font-weight: 500;">
                    ${itemTotal.toLocaleString('fr-FR')} FCFA
                </td>
            </tr>
        `;
    });

    tableHTML += `</tbody></table>`;

    // Lien WhatsApp de validation
    let messageWhatsApp = `Bonjour Aweya, je souhaite valider mon panier suivant :\n\n`;
    cart.forEach(item => {
        messageWhatsApp += `• ${item.titre} (Taille : ${item.taille}) x${item.quantite} — ${(Number(item.prix) * item.quantite).toLocaleString('fr-FR')} FCFA\n`;
    });
    messageWhatsApp += `\n💵 *Total Général : ${sousTotalGlobal.toLocaleString('fr-FR')} FCFA*\n\n`;
    messageWhatsApp += `Pouvez-vous valider ma commande et me donner les modalités de livraison ? ✨`;

    const whatsappLink = `https://wa.me/+2250798627388?text=${encodeURIComponent(messageWhatsApp)}`;

    const summaryHTML = `
        <div class="cart-summary">
            <div class="total-box">
                <span>Total :</span>
                <span style="color: var(--texte-sombre); font-weight: 600; margin-left: 0.5rem;">${sousTotalGlobal.toLocaleString('fr-FR')} FCFA</span>
            </div>
            <a href="${whatsappLink}" target="_blank" rel="noopener noreferrer" class="btn-primary" style="background-color: #25d366; border-color: #25d366; padding: 1.2rem 2.5rem; text-align: center; width: 100%; max-width: 350px;">
                Envoyer la commande via WhatsApp
            </a>
            <a href="boutique.html" style="font-size: 0.9rem; text-decoration: underline; color: var(--texte-secondaire);">Continuer mes achats</a>
        </div>
    `;

    wrapper.innerHTML = tableHTML + summaryHTML;
}

/**
 * Actions interactives exposées au navigateur pour les clics HTML (onclick)
 */
window.handleChangeQty = function(index, direction) {
    const cart = getLocalCart();
    if (!cart[index]) return;

    cart[index].quantite += direction;

    if (cart[index].quantite <= 0) {
        cart.splice(index, 1);
    }

    saveCart(cart);
    renderPanierView();
};

window.handleRemoveItem = function(index) {
    const cart = getLocalCart();
    if (!cart[index]) return;

    cart.splice(index, 1);

    saveCart(cart);
    renderPanierView();
};