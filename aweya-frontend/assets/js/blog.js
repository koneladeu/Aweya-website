/* ==========================================================================
   LOGIQUE ET AFFICHAGE DYNAMIQUE DU BLOG
   ========================================================================== */

   const STRAPI_BLOG_MEDIA = 'http://localhost:1337';

   document.addEventListener('DOMContentLoaded', () => {
       initBlog();
   });
   
   /**
    * Initialise la page en récupérant les articles du blog
    */
   async function initBlog() {
       const grid = document.getElementById('blog-articles-grid');
       if (!grid) return;
   
       // Appel de la fonction définie dans api.js
       const articles = await getBlogArticles();
   
       if (!articles || articles.length === 0) {
           grid.innerHTML = '<div style="text-align: center; grid-column: 1/-1; color: var(--texte-secondaire);">Aucun article publié pour le moment. Revenez très bientôt !</div>';
           return;
       }
   
       grid.innerHTML = '';
   
       articles.forEach(item => {
           const data = item.attributes || item;
   
           // 1. Gestion de l'image de couverture
           let imageUrl = 'assets/images/blog-placeholder.jpg'; // Image par défaut
           if (data.Image_Couverture && data.Image_Couverture.data) {
               imageUrl = `${STRAPI_BLOG_MEDIA}${data.Image_Couverture.data.attributes.url}`;
           } else if (data.Image_Couverture && data.Image_Couverture.url) {
               imageUrl = `${STRAPI_BLOG_MEDIA}${data.Image_Couverture.url}`;
           }
   
           // 2. Extraction du texte brut pour l'aperçu de l'article (Rich Text Blocks)
           const texteBrut = parseBlogBlocks(data.Contenu);
           
           // 3. Formatage de la date (ex: "15 juin 2026")
           const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
           const datePubliee = data.publishedAt || data.createdAt;
           const dateFormatee = datePubliee ? new Date(datePubliee).toLocaleDateString('fr-FR', dateOptions) : '';
   
           // 4. Génération de la carte HTML
           const articleCard = document.createElement('article');
           articleCard.className = 'blog-card';
           articleCard.innerHTML = `
               <img src="${imageUrl}" alt="${data.Titre}">
               <div class="blog-content">
                   <span class="blog-date">${dateFormatee}</span>
                   <h3 class="blog-title">${data.Titre}</h3>
                   <p class="blog-excerpt">${texteBrut || 'Découvrez la suite de cet article en ligne...'}</p>
                   <a href="article-detail.html?id=${item.documentId}" class="blog-link">Lire l'article</a>
               </div>
           `;
   
           grid.appendChild(articleCard);
       });
   }
   
   /**
    * Extrait le texte brut du contenu structuré de Strapi pour générer l'extrait
    */
   function parseBlogBlocks(blocks) {
       if (!blocks || !Array.isArray(blocks)) return '';
       return blocks.map(block => {
           if (block.children) {
               return block.children.map(child => child.text || '').join('');
           }
           return '';
       }).join(' ');
   }