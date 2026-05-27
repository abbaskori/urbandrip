import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
import { SUPABASE_URL, SUPABASE_ANON_KEY, CONFIG } from "./config.js";
import staticProducts from "./products.js";

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// State Variables
let activeCategory = "all";
let searchFilterQuery = "";
let currentProduct = null;
let currentMediaIndex = 0;

// DOM Elements
const productGrid = document.getElementById("product-grid");
const filterGroup = document.getElementById("filter-group");
const searchInput = document.getElementById("search-input");
const productModal = document.getElementById("product-modal");
const closeModalBtn = document.getElementById("close-modal");

// Modal Details Elements
const modalCategory = document.getElementById("modal-category");
const modalTitle = document.getElementById("modal-title");
const modalPrice = document.getElementById("modal-price");
const modalDescription = document.getElementById("modal-description");
const modalSpecsBody = document.getElementById("modal-specs-body");
const modalWhatsappBtn = document.getElementById("modal-whatsapp-btn");
const mediaViewer = document.getElementById("media-viewer");
const sliderIndicators = document.getElementById("slider-indicators");
const sliderPrev = document.getElementById("slider-prev");
const sliderNext = document.getElementById("slider-next");

// General WhatsApp elements
const navWhatsappLinks = document.querySelectorAll('.whatsapp-contact-link');
const floatingWhatsappWidgets = document.querySelectorAll('.floating-whatsapp-widget');

/**
 * Initialize Application
 */
function init() {
  setupGeneralWhatsAppLinks();
  renderProducts();
  setupEventListeners();
}

/**
 * Load and merge products from products.js (window.products) and custom items (localStorage)
 */
async function getMergedProducts() {
  let supabaseProducts = [];

  // Try fetching products from Supabase Database
  try {
    const { data, error } = await supabase.from('products').select('*');
    if (error) {
      console.warn('Supabase fetch error (Table might not exist yet):', error.message);
    } else if (data) {
      supabaseProducts = data;
    }
  } catch (err) {
    console.error("Failed to connect to Supabase:", err);
  }

  // Include any custom products stored in localStorage (optional)
  let customProducts = [];
  const stored = localStorage.getItem("ud_custom_products");
  if (stored) {
    try {
      customProducts = JSON.parse(stored);
    } catch (e) {
      console.error("Failed to parse custom products", e);
    }
  }

  // Merge Static Data + Supabase Data + Local Uploaded Data
  return [...staticProducts, ...supabaseProducts, ...customProducts];
}

/**
 * Setup global links for general inquiries
 */
function setupGeneralWhatsAppLinks() {
  const encodedGeneralMsg = encodeURIComponent(CONFIG.generalInquiryMsg);
  const primaryUrl = `https://wa.me/${CONFIG.whatsappPhone}?text=${encodedGeneralMsg}`;
  const secondaryUrl = CONFIG.whatsappPhone2 ? `https://wa.me/${CONFIG.whatsappPhone2}?text=${encodedGeneralMsg}` : primaryUrl;
  // Assign URLs to navigation links (first link primary, second link secondary if exists)
  navWhatsappLinks.forEach((link, idx) => {
    link.href = idx === 1 && CONFIG.whatsappPhone2 ? secondaryUrl : primaryUrl;
  });
  // Assign URLs to floating widgets similarly
  floatingWhatsappWidgets.forEach((widget, idx) => {
    widget.href = idx === 1 && CONFIG.whatsappPhone2 ? secondaryUrl : primaryUrl;
  });
}

/**
 * Render Product Grid based on active category, search filter, and merged localStorage inventory
 */
async function renderProducts() {
  const allProducts = await getMergedProducts();

  // Apply filters
  const filteredProducts = allProducts.filter(product => {
    const matchesCategory = activeCategory === "all" || product.category === activeCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchFilterQuery) ||
                          product.description.toLowerCase().includes(searchFilterQuery);
    return matchesCategory && matchesSearch;
  });

  // Clear existing items
  productGrid.innerHTML = "";

  if (filteredProducts.length === 0) {
    productGrid.innerHTML = `
      <div class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="8" y1="12" x2="16" y2="12"/>
        </svg>
        <h3>No matching items found</h3>
        <p>Try refining your search or choosing a different category.</p>
      </div>
    `;
    return;
  }

  // Generate cards
  filteredProducts.forEach(product => {
    const firstMedia = product.media?.[0] || { type: "image", url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80" };
    const hasVideo = product.media?.some(m => m.type === "video");
    const videoBadgeHTML = hasVideo ? `<span class="product-category-tag" style="left: auto; right: 1rem; background: rgba(37, 211, 102, 0.95); color: #fff; font-size: 0.7rem;">▶ Video</span>` : "";
    const card = document.createElement("div");
    card.className = "product-card";
    card.setAttribute("data-id", product.id);
    card.innerHTML = `
      <div class="product-media-wrapper">
        <img src="${firstMedia.url}" alt="${product.name}" loading="lazy">
        <span class="product-category-tag">${product.category}</span>
        ${videoBadgeHTML}
      </div>
      <div class="product-card-info">
        <h3 class="product-card-title">${product.name}</h3>
        <p class="product-card-description">${product.description}</p>
        <div class="product-card-footer">
          <span class="product-card-price">${product.price}</span>
          <div class="view-details-indicator">
            <span>Details</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="14" height="14">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </div>
        </div>
      </div>
    `;
    card.addEventListener("click", () => openProductModal(product));
    productGrid.appendChild(card);
  });
}

/**
 * Handle Search Input
 */
searchInput.addEventListener("input", (e) => {
  searchFilterQuery = e.target.value.toLowerCase().trim();
  
  // Smooth filter visual effect
  productGrid.classList.add("filtering");
  setTimeout(() => {
    renderProducts();
    productGrid.classList.remove("filtering");
  }, 150);
});

/**
 * Handle Category Filter Clicks
 */
filterGroup.addEventListener("click", (e) => {
  const clickedBtn = e.target.closest(".filter-btn");
  if (!clickedBtn) return;

  // Update active state in UI
  document.querySelectorAll(".filter-btn").forEach(btn => btn.classList.remove("active"));
  clickedBtn.classList.add("active");

  // Update category and render
  activeCategory = clickedBtn.getAttribute("data-category");
  
  productGrid.classList.add("filtering");
  setTimeout(() => {
    renderProducts();
    productGrid.classList.remove("filtering");
  }, 150);
});

/**
 * Product Details Modal Logic
 */
function openProductModal(product) {
  currentProduct = product;
  currentMediaIndex = 0;

  // Set modal text
  modalCategory.textContent = product.category;
  modalTitle.textContent = product.name;
  modalPrice.textContent = product.price;
  modalDescription.textContent = product.description;

  // Generate Specs Table Rows
  modalSpecsBody.innerHTML = "";
  if (product.specs) {
    Object.entries(product.specs).forEach(([label, value]) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td class="specs-label">${label}</td>
        <td class="specs-value">${value}</td>
      `;
      modalSpecsBody.appendChild(row);
    });
  }

  // Construct WhatsApp Link
  const message = CONFIG.buildProductMessage(product);
  const encodedMsg = encodeURIComponent(message);
  modalWhatsappBtn.href = `https://wa.me/${CONFIG.whatsappPhone}?text=${encodedMsg}`;

  // Render media slides
  renderModalMedia();

  // Show Modal Overlay
  productModal.classList.add("active");
  document.body.style.overflow = "hidden"; // Disable background scrolling
}

function closeProductModal() {
  productModal.classList.remove("active");
  document.body.style.overflow = ""; // Re-enable background scrolling
  
  // Pause any playing videos inside the modal media viewer
  const videos = mediaViewer.querySelectorAll("video");
  videos.forEach(video => video.pause());
  
  currentProduct = null;
}

/**
 * Render Carousel Media Slider in Modal
 */
function renderModalMedia() {
  if (!currentProduct || !currentProduct.media || currentProduct.media.length === 0) return;

  const currentMedia = currentProduct.media[currentMediaIndex];
  mediaViewer.innerHTML = "";

  if (currentMedia.type === "video") {
    mediaViewer.innerHTML = `
      <video src="${currentMedia.url}" autoplay loop muted playsinline controls style="width: 100%; height: 100%; object-fit: cover;"></video>
    `;
  } else {
    mediaViewer.innerHTML = `
      <img src="${currentMedia.url}" alt="${currentProduct.name}" style="width: 100%; height: 100%; object-fit: cover;">
    `;
  }

  // Toggle nav buttons based on list length
  if (currentProduct.media.length <= 1) {
    sliderPrev.style.display = "none";
    sliderNext.style.display = "none";
    sliderIndicators.style.display = "none";
  } else {
    sliderPrev.style.display = "flex";
    sliderNext.style.display = "flex";
    sliderIndicators.style.display = "flex";
    
    // Render Dot Indicators
    sliderIndicators.innerHTML = "";
    currentProduct.media.forEach((_, idx) => {
      const dot = document.createElement("span");
      dot.className = `indicator-dot ${idx === currentMediaIndex ? "active" : ""}`;
      dot.addEventListener("click", () => {
        currentMediaIndex = idx;
        renderModalMedia();
      });
      sliderIndicators.appendChild(dot);
    });
  }
}

/**
 * Media Slider Navigation Controls
 */
sliderPrev.addEventListener("click", () => {
  if (!currentProduct) return;
  const count = currentProduct.media.length;
  currentMediaIndex = (currentMediaIndex - 1 + count) % count;
  renderModalMedia();
});

sliderNext.addEventListener("click", () => {
  if (!currentProduct) return;
  const count = currentProduct.media.length;
  currentMediaIndex = (currentMediaIndex + 1) % count;
  renderModalMedia();
});

/**
 * Event Listeners & General Handling
 */
function setupEventListeners() {
  // Close Modal trigger
  closeModalBtn.addEventListener("click", closeProductModal);

  // Close Modal on overlay backdrop click
  productModal.addEventListener("click", (e) => {
    if (e.target === productModal) {
      closeProductModal();
    }
  });

  // Escape key close
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && productModal.classList.contains("active")) {
      closeProductModal();
    }
  });
}

// Run Initialization
document.addEventListener("DOMContentLoaded", init);
