import { supabase } from './config.js';
import './index.css';

document.addEventListener('DOMContentLoaded', async () => {
  const grid = document.getElementById('products-grid');
  
  if (!grid) return; // Not on the main page
  
  try {
    grid.innerHTML = '<div class="loader"></div>';
    
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    let allProducts = [];

    const renderProducts = (productsToRender) => {
      grid.innerHTML = '';
      if (!productsToRender || productsToRender.length === 0) {
        grid.innerHTML = '<p class="page-subtitle" style="grid-column: 1 / -1;">No products found.</p>';
        return;
      }
      
      productsToRender.forEach(product => {
        const card = document.createElement('div');
        card.className = 'glass-card product-card';
        
        let imageUrl = 'https://placehold.co/600x400/0b0d17/d4af37?text=No+Image';
        if (product.media_base64 && product.media_base64.length > 0) {
          imageUrl = product.media_base64[0];
        }
        
        const waMessage = encodeURIComponent(`Hi, I'm interested in the ${product.name} listed in the Luxury Showroom. Price: $${product.price}`);
        const phoneNumbers = ['919601413428', '916355421593'];
        const randomPhone = phoneNumbers[Math.floor(Math.random() * phoneNumbers.length)];
        
        card.innerHTML = `
          <div class="product-image-container product-media-wrapper">
            <img src="${imageUrl}" alt="${product.name}" class="product-image" loading="lazy">
            ${product.category ? `<span class="product-category product-category-tag">${product.category}</span>` : ''}
          </div>
          <div class="product-card-info">
            <h3 class="product-title product-card-title">${product.name}</h3>
            <p class="product-desc product-card-description">${product.description || ''}</p>
            <div class="product-footer product-card-footer">
              <span class="product-price product-card-price">$${Number(product.price).toLocaleString()}</span>
              <a href="https://wa.me/${randomPhone}?text=${waMessage}" target="_blank" class="btn btn-whatsapp inquiry-btn" style="padding: 0.5rem 1rem; width: auto; font-size: 0.9rem;">
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
                Inquire
              </a>
            </div>
          </div>
        `;
        
        grid.appendChild(card);
      });
    };

    allProducts = products || [];
    renderProducts(allProducts);

    // Setup filtering
    const filters = document.getElementById('category-filters');
    if (filters) {
      filters.addEventListener('click', (e) => {
        if (e.target.classList.contains('filter-btn')) {
          filters.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
          e.target.classList.add('active');
          
          const filter = e.target.dataset.filter;
          if (filter === 'all') {
            renderProducts(allProducts);
          } else {
            renderProducts(allProducts.filter(p => p.category === filter));
          }
        }
      });
    }
    
  } catch (err) {
    console.error('Error fetching products:', err);
    grid.innerHTML = '<p class="page-subtitle" style="grid-column: 1 / -1; color: var(--danger);">Failed to load products. Please check console for details.</p>';
  }
});
