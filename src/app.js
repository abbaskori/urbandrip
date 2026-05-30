import { supabase } from './config.js';
import './index.css';

const PHONE_1 = '919601413428'; // Abbas
const PHONE_2 = '916355421593'; // Support

// ─── Modal State ─────────────────────────────────────────────────────────────
let currentImages = [];
let currentIndex = 0;

const modal       = document.getElementById('product-modal');
const mediaViewer = document.getElementById('modal-media-viewer');
const indicators  = document.getElementById('slider-indicators');
const prevBtn     = document.getElementById('slider-prev');
const nextBtn     = document.getElementById('slider-next');
const closeBtn    = document.getElementById('close-modal');

function showSlide(index) {
  currentIndex = (index + currentImages.length) % currentImages.length;
  mediaViewer.innerHTML = `<img src="${currentImages[currentIndex]}" alt="Product image" style="width:100%;height:100%;object-fit:cover;">`;
  
  // Update dot indicators
  indicators.querySelectorAll('.indicator-dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === currentIndex);
  });

  // Hide nav buttons if only 1 image
  const showNav = currentImages.length > 1;
  prevBtn.style.display = showNav ? 'flex' : 'none';
  nextBtn.style.display = showNav ? 'flex' : 'none';
}

function openModal(product) {
  const images = (product.media_base64 && product.media_base64.length > 0)
    ? product.media_base64
    : ['https://placehold.co/600x600/0b0d17/d4af37?text=No+Image'];

  currentImages = images;
  currentIndex = 0;

  // Build indicator dots
  indicators.innerHTML = '';
  images.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'indicator-dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => showSlide(i));
    indicators.appendChild(dot);
  });

  showSlide(0);

  // Fill details
  document.getElementById('modal-category').textContent   = product.category || '';
  document.getElementById('modal-name').textContent       = product.name;
  document.getElementById('modal-price').textContent      = `₹${Number(product.price).toLocaleString('en-IN')}`;
  document.getElementById('modal-description').textContent = product.description || '';

  // Build WhatsApp links
  const waText = encodeURIComponent(`Hi, I'm interested in the *${product.name}* listed on Urban Drip.\nPrice: ₹${Number(product.price).toLocaleString('en-IN')}\nPlease let me know if it's available.`);
  document.getElementById('modal-wa-1').href = `https://wa.me/${PHONE_1}?text=${waText}`;
  document.getElementById('modal-wa-2').href = `https://wa.me/${PHONE_2}?text=${waText}`;

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modal.classList.remove('active');
  document.body.style.overflow = '';
}

// Nav button events
prevBtn.addEventListener('click', (e) => { e.stopPropagation(); showSlide(currentIndex - 1); });
nextBtn.addEventListener('click', (e) => { e.stopPropagation(); showSlide(currentIndex + 1); });
closeBtn.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
document.addEventListener('keydown', (e) => {
  if (!modal.classList.contains('active')) return;
  if (e.key === 'Escape') closeModal();
  if (e.key === 'ArrowLeft')  showSlide(currentIndex - 1);
  if (e.key === 'ArrowRight') showSlide(currentIndex + 1);
});

// ─── Products Grid ────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  const grid = document.getElementById('products-grid');
  if (!grid) return;

  try {
    grid.innerHTML = '<div class="loader"></div>';

    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    let allProducts = products || [];

    const renderProducts = (list) => {
      grid.innerHTML = '';
      if (!list || list.length === 0) {
        grid.innerHTML = '<p class="page-subtitle" style="grid-column:1/-1;text-align:center;">No products found.</p>';
        return;
      }

      list.forEach(product => {
        const card = document.createElement('div');
        card.className = 'glass-card product-card';
        card.style.cursor = 'pointer';

        const imageUrl = (product.media_base64 && product.media_base64.length > 0)
          ? product.media_base64[0]
          : 'https://placehold.co/600x400/0b0d17/d4af37?text=No+Image';

        card.innerHTML = `
          <div class="product-image-container product-media-wrapper">
            <img src="${imageUrl}" alt="${product.name}" class="product-image" loading="lazy">
            ${product.category ? `<span class="product-category product-category-tag">${product.category}</span>` : ''}
          </div>
          <div class="product-card-info">
            <h3 class="product-title product-card-title">${product.name}</h3>
            <p class="product-desc product-card-description">${product.description || ''}</p>
            <div class="product-footer product-card-footer">
              <span class="product-price product-card-price">₹${Number(product.price).toLocaleString('en-IN')}</span>
              <span class="view-details-indicator">
                View Details
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9,18 15,12 9,6"/></svg>
              </span>
            </div>
          </div>
        `;

        card.addEventListener('click', () => openModal(product));
        grid.appendChild(card);
      });
    };

    renderProducts(allProducts);

    // Category filter
    const filters = document.getElementById('category-filters');
    if (filters) {
      filters.addEventListener('click', (e) => {
        if (!e.target.classList.contains('filter-btn')) return;
        filters.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        const f = e.target.dataset.filter;
        renderProducts(f === 'all' ? allProducts : allProducts.filter(p => p.category === f));
      });
    }

  } catch (err) {
    console.error('Error fetching products:', err);
    grid.innerHTML = '<p class="page-subtitle" style="grid-column:1/-1;color:var(--danger);">Failed to load products.</p>';
  }
});
