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
    
    if (!products || products.length === 0) {
      grid.innerHTML = '<p class="page-subtitle" style="grid-column: 1 / -1;">No products found in the showroom yet.</p>';
      return;
    }
    
    grid.innerHTML = ''; // Clear loader
    
    products.forEach(product => {
      const card = document.createElement('div');
      card.className = 'glass-card';
      
      // Handle Base64 media
      let imageUrl = 'https://placehold.co/600x400/0b0d17/d4af37?text=No+Image';
      if (product.media_base64 && product.media_base64.length > 0) {
        imageUrl = product.media_base64[0];
      }
      
      // WhatsApp message formatting
      const waMessage = encodeURIComponent(`Hi, I'm interested in the ${product.name} listed in the Luxury Showroom. Price: $${product.price}`);
      // Rotate between the two phone numbers
      const phoneNumbers = ['919601413428', '916355421593'];
      const randomPhone = phoneNumbers[Math.floor(Math.random() * phoneNumbers.length)];
      
      card.innerHTML = `
        <div class="product-image-container">
          <img src="${imageUrl}" alt="${product.name}" class="product-image" loading="lazy">
          ${product.category ? `<span class="product-category">${product.category}</span>` : ''}
        </div>
        <h3 class="product-title">${product.name}</h3>
        <p class="product-desc">${product.description || ''}</p>
        <div class="product-footer">
          <span class="product-price">$${Number(product.price).toLocaleString()}</span>
          <a href="https://wa.me/${randomPhone}?text=${waMessage}" target="_blank" class="btn btn-whatsapp">
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>
            Inquire
          </a>
        </div>
      `;
      
      grid.appendChild(card);
    });
    
  } catch (err) {
    console.error('Error fetching products:', err);
    grid.innerHTML = '<p class="page-subtitle" style="grid-column: 1 / -1; color: var(--danger);">Failed to load products. Please check console for details.</p>';
  }
});
