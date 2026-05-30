import { supabase } from './config.js';
import './index.css';

const PHONE_1 = '919601413428';
const PHONE_2 = '916355421593';

// ── Navbar scroll effect ────────────────────────────────────────────────────
// Theme Manager for dark mode
const themeToggle = document.getElementById('theme-toggle');
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
}
function initTheme() {
  const saved = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = saved || (prefersDark ? 'dark' : 'light');
  applyTheme(theme);
}
themeToggle?.addEventListener('click', () => {
  const current = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  applyTheme(current);
  localStorage.setItem('theme', current);
});
initTheme();
const navbar = document.getElementById('navbar');
// duplicate navbar declaration removed
window.addEventListener('scroll', () => {
  navbar?.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

// ── Modal elements ──────────────────────────────────────────────────────────
const modal       = document.getElementById('product-modal');
const mediaViewer = document.getElementById('modal-media-viewer');
const dotsWrap    = document.getElementById('slider-indicators');
const prevBtn     = document.getElementById('slider-prev');
const nextBtn     = document.getElementById('slider-next');
const closeBtn    = document.getElementById('close-modal');

let currentImages = [];
let currentIndex  = 0;

function goSlide(index) {
  currentIndex = (index + currentImages.length) % currentImages.length;

  // Smooth swap
  const img = mediaViewer.querySelector('img');
  if (img) {
    img.style.opacity = '0';
    setTimeout(() => {
      img.src = currentImages[currentIndex];
      img.style.opacity = '1';
    }, 150);
  }

  dotsWrap.querySelectorAll('.slide-dot').forEach((d, i) =>
    d.classList.toggle('active', i === currentIndex)
  );
}

function openModal(product) {
  const images = (product.media_base64?.length > 0)
    ? product.media_base64
    : ['https://placehold.co/600x600/0e1017/c4a163?text=No+Image'];

  currentImages = images;
  currentIndex  = 0;

  // Build slider
  mediaViewer.innerHTML = `<img src="${images[0]}" alt="${product.name}" style="width:100%;height:100%;object-fit:cover;transition:opacity 0.15s ease;">`;

  dotsWrap.innerHTML = '';
  if (images.length > 1) {
    images.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'slide-dot' + (i === 0 ? ' active' : '');
      dot.addEventListener('click', () => goSlide(i));
      dotsWrap.appendChild(dot);
    });
    prevBtn.style.display = 'flex';
    nextBtn.style.display = 'flex';
  } else {
    prevBtn.style.display = 'none';
    nextBtn.style.display = 'none';
  }

  // Fill info
  document.getElementById('modal-category').textContent    = product.category || '';
  document.getElementById('modal-name').textContent        = product.name;
  document.getElementById('modal-price').textContent       = `₹${Number(product.price).toLocaleString('en-IN')}`;
  document.getElementById('modal-description').textContent = product.description || 'No description provided.';

  // WhatsApp links
  const waText = encodeURIComponent(
    `Hi! I'm interested in the *${product.name}* from Urban Drip.\nPrice: ₹${Number(product.price).toLocaleString('en-IN')}\nPlease let me know if it's available. 🙏`
  );
  document.getElementById('modal-wa-1').href = `https://wa.me/${PHONE_1}?text=${waText}`;
  document.getElementById('modal-wa-2').href = `https://wa.me/${PHONE_2}?text=${waText}`;

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modal.classList.remove('active');
  document.body.style.overflow = '';
}

prevBtn?.addEventListener('click', (e) => { e.stopPropagation(); goSlide(currentIndex - 1); });
nextBtn?.addEventListener('click', (e) => { e.stopPropagation(); goSlide(currentIndex + 1); });
closeBtn?.addEventListener('click', closeModal);
modal?.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
document.addEventListener('keydown', (e) => {
  if (!modal?.classList.contains('active')) return;
  if (e.key === 'Escape')      closeModal();
  if (e.key === 'ArrowLeft')   goSlide(currentIndex - 1);
  if (e.key === 'ArrowRight')  goSlide(currentIndex + 1);
});

// ── Products ────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  const grid  = document.getElementById('products-grid');
  const count = document.getElementById('product-count');
  if (!grid) return;

  // Loading state
  grid.innerHTML = `
    <div class="loader-wrap">
      <div class="spinner"></div>
    </div>`;

  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    let all = products || [];

    const render = (list) => {
      grid.innerHTML = '';
      if (count) count.textContent = list.length > 0 ? `${list.length} item${list.length !== 1 ? 's' : ''}` : '';

      if (list.length === 0) {
        grid.innerHTML = `<div class="empty-state">
          <p style="font-size:2.5rem;margin-bottom:0.5rem;">🏷️</p>
          <p>No products in this category yet.</p>
        </div>`;
        return;
      }

      list.forEach((product, i) => {
        const card = document.createElement('div');
        card.className = 'p-card';
        card.style.animationDelay = `${i * 0.05}s`;

        const imgSrc = (product.media_base64?.length > 0)
          ? product.media_base64[0]
          : 'https://placehold.co/400x500/0e1017/c4a163?text=No+Image';

        card.innerHTML = `
          <div class="p-card-img-wrap">
            <img src="${imgSrc}" alt="${product.name}" class="p-card-img" loading="lazy">
            ${product.category ? `<span class="p-card-cat">${product.category}</span>` : ''}
            <div class="p-card-overlay">
              <span class="p-card-cta">
                View Details
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9,18 15,12 9,6"/></svg>
              </span>
            </div>
          </div>
          <div class="p-card-body">
            <h3 class="p-card-name">${product.name}</h3>
            <p class="p-card-desc">${product.description || ''}</p>
            <div class="p-card-footer">
              <span class="p-card-price">₹${Number(product.price).toLocaleString('en-IN')}</span>
              <span class="p-card-arrow">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9,18 15,12 9,6"/></svg>
              </span>
            </div>
          </div>
        `;

        card.addEventListener('click', () => openModal(product));
        grid.appendChild(card);
      });
    };

    render(all);

    // ── Filtering (nav + filter bar both work) ──
    const allFilterBtns = document.querySelectorAll('.nav-filter-btn, .filter-pill');

    allFilterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        // sync active state on all filter buttons
        document.querySelectorAll('[data-filter]').forEach(b => b.classList.remove('active'));
        document.querySelectorAll(`[data-filter="${btn.dataset.filter}"]`).forEach(b => b.classList.add('active'));

        const f = btn.dataset.filter;
        render(f === 'all' ? all : all.filter(p => p.category === f));
      });
    });

  } catch (err) {
    console.error('Error:', err);
    grid.innerHTML = `<div class="empty-state" style="color:#f87171;">Failed to load products. Check your Supabase connection.</div>`;
  }
});
