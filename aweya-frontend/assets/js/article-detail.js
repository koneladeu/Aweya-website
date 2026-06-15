/* ==========================================================================
   LOGIQUE ET LECTURE DÉTAILLÉE D'UN ARTICLE DE BLOG
   ========================================================================== */

   const STRAPI_ARTICLE_SERVER = 'http://localhost:1337';

   document.addEventListener('DOMContentLoaded', () => {
       initArticleDetail();
   });
   
   async function initArticleDetail() {
       const container = document.getElementById('article-detail-content');
       if (!container) return;
   
       // 1. Extraction du documentId depuis l'URL
       const urlParams = new URLSearchParams(window.location.search);
       const articleId = urlParams.get('id');
   
       if (!articleId) {
           window.location.href = 'blog.html';
           return;
       }
   
       // 2. Récupération de l'article via l'API
       const article = await getSingleBlogArticle(articleId);
   
       if (!article) {
           container.innerHTML = `
               <div style="text-align: center; padding: 5rem 0;">
                   <p style="color: var(--texte-secondaire); margin-bottom: 1.5rem;">Cet article n'existe pas ou a été retiré.</p>
                   <a href="blog.html" class="btn-primary">Retourner au blog</a>
               </div>
           `;
           return;
       }
   
       const data = article.attributes || article;
   
       // Gestion de l'image
       let imageUrl = 'assets/images/blog-placeholder.jpg';
       if (data.Image_Couverture && data.Image_Couverture.data) {
           imageUrl = `${STRAPI_ARTICLE_SERVER}${data.Image_Couverture.data.attributes.url}`;
       } else if (data.Image_Couverture && data.Image_Couverture.url) {
           imageUrl = `${STRAPI_ARTICLE_SERVER}${data.Image_Couverture.url}`;
       }
   
       // Formatage de la date
       const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
       const datePubliee = data.publishedAt || data.createdAt;
       const dateFormatee = datePubliee ? new Date(datePubliee).toLocaleDateString('fr-FR', dateOptions) : '';
   
       // 3. Transformation des Blocs JSON Strapi en véritables paragraphes HTML (<p>)
       const corpsArticleHTML = renderContentToHTML(data.Contenu);
   
       // 4. Injection du contenu
       container.innerHTML = `
           <article>
               <div class="article-header">
                   <span class="article-meta">Publié le ${dateFormatee} — Conseils</span>
                   <h1 class="article-main-title">${data.Titre}</h1>
               </div>
   
               <div class="article-banner">
                   <img src="${imageUrl}" alt="${data.Titre}">
               </div>
   
               <div class="article-body">
                   ${corpsArticleHTML || '<p>Aucun contenu écrit pour cet article.</p>'}
               </div>
               
               <div style="text-align: center; margin-top: 4rem;">
                   <a href="blog.html" class="btn-secondary">← Retour aux articles</a>
               </div>
           </article>
       `;
   }
   
   /**
    * Convertit le Rich Text structuré de Strapi en paragraphes HTML propres
    */
   function renderContentToHTML(blocks) {
       if (!blocks || !Array.isArray(blocks)) return '';
       
       return blocks.map(block => {
           if (block.type === 'paragraph' && block.children) {
               const textContent = block.children.map(child => child.text || '').join('');
               // On encapsule chaque bloc de paragraphe dans une vraie balise HTML <p>
               return `<p>${textContent}</p>`;
           }
           return '';
       }).join('');
   }